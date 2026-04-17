import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSiteContent, generateSeoKeywords, buildSlug } from '@/lib/ai-site/generator'
import { buildSitePromptHash } from '@/lib/ai-site/hash'
import { derivePrefecture } from '@/lib/ai-site/areas'
import type { GenerateInput } from '@/lib/ai-site/types'

// Vercel: 最大60秒まで許容（長時間のAI生成のため）
export const maxDuration = 60

/**
 * POST /api/onboard/generate
 *
 * ── 1メール1サイトの原則 ─────────────────────────────────────
 * 同一メールで既にAiSiteが存在する場合:
 *   - 決済済み → { existingPaid: true, slug } を返す
 *   - 同一入力 → 既存slugをそのまま返す
 *   - 別入力   → { existingDraft: true, slug } を返す（上書き確認用）
 *   - overwrite: true が送られたら既存サイトを上書き
 *
 * ── AIコスト制御 ──────────────────────────────────────────────
 * Claude APIはこのエンドポイント（初回生成）のみ呼ぶ。
 * 同一入力のハッシュが既にDBに存在する場合は AI を呼ばずキャッシュを返す。
 * 生成後の表示はすべて DB から読む。AI を再呼び出ししない。
 * ──────────────────────────────────────────────────────────────
 */
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'リクエストの形式が不正です' }, { status: 400 })
  }

  // ---- バリデーション ----

  const input = body as Partial<GenerateInput> & { overwrite?: boolean }

  if (!input.firmName?.trim()) {
    return NextResponse.json({ error: '事務所名は必須です' }, { status: 400 })
  }
  if (!input.serviceAreas || !Array.isArray(input.serviceAreas) || input.serviceAreas.length === 0) {
    return NextResponse.json({ error: '対応エリアを1つ以上選択してください' }, { status: 400 })
  }
  if (!input.services || input.services.length === 0) {
    return NextResponse.json({ error: '業務を1つ以上選択してください' }, { status: 400 })
  }
  if (!input.strengths?.trim()) {
    return NextResponse.json({ error: '強みは必須です' }, { status: 400 })
  }

  if (!input.ownerName?.trim()) {
    return NextResponse.json({ error: '代表者名は必須です' }, { status: 400 })
  }
  if (!input.ownerEmail?.trim()) {
    return NextResponse.json({ error: '通知先メールアドレスは必須です' }, { status: 400 })
  }

  const overwrite = input.overwrite === true

  const validInput: GenerateInput = {
    firmName:         input.firmName.trim(),
    ownerName:        input.ownerName.trim(),
    ownerEmail:       input.ownerEmail!.trim(),
    ownerBio:         input.ownerBio?.trim() || undefined,
    services:         input.services,
    serviceAreas:     Array.isArray(input.serviceAreas) ? input.serviceAreas : [],
    strengths:        input.strengths.trim(),
    styles:           input.styles ?? [],
    userTestimonials: (input.userTestimonials ?? []).filter(
      (t) => t.name?.trim() && t.content?.trim()
    ),
  }

  // ---- ① 1メール1サイトチェック ----

  const existingSite = await prisma.aiSite.findFirst({
    where: { ownerEmail: validInput.ownerEmail },
    select: { id: true, slug: true, plan: true, promptHash: true },
  })

  if (existingSite) {
    // 決済済みサイト → 編集画面へ誘導
    if (existingSite.plan) {
      return NextResponse.json({
        existingPaid: true,
        slug: existingSite.slug,
      })
    }

    const promptHash = buildSitePromptHash(validInput)

    // 同一入力 → 既存サイトをそのまま返す
    if (existingSite.promptHash === promptHash) {
      return NextResponse.json({ slug: existingSite.slug, siteId: existingSite.id, cached: true })
    }

    // 別入力 & 上書き未承認 → 確認を求める
    if (!overwrite) {
      return NextResponse.json({
        existingDraft: true,
        slug: existingSite.slug,
      })
    }

    // 別入力 & 上書き承認済み → 関連レコードを削除してから再生成
    await prisma.aiSeoPage.deleteMany({ where: { siteId: existingSite.id } })
    await prisma.aiSiteLead.deleteMany({ where: { siteId: existingSite.id } })
    await prisma.reviewRequest.deleteMany({ where: { siteId: existingSite.id } })
    await prisma.aiSite.delete({ where: { id: existingSite.id } })
    console.log(`[generate] 既存サイトを上書き削除: slug=${existingSite.slug}`)
  }

  // ---- ② キャッシュチェック（同一入力の重複AI呼び出しを防ぐ） ----

  const promptHash = buildSitePromptHash(validInput)

  const cached = await prisma.aiSite.findFirst({
    where: { promptHash },
    select: { id: true, slug: true },
  })

  if (cached) {
    console.log(`[generate] キャッシュヒット: hash=${promptHash.slice(0, 8)}... → slug=${cached.slug}`)
    return NextResponse.json({ slug: cached.slug, siteId: cached.id, cached: true })
  }

  // ---- ③ スラッグ生成（衝突回避） ----

  const prefecture = derivePrefecture(validInput.serviceAreas)
  let slug = buildSlug(prefecture)
  for (let i = 0; i < 5; i++) {
    const existing = await prisma.aiSite.findUnique({ where: { slug } })
    if (!existing) break
    slug = buildSlug(prefecture)
  }

  // ---- ④ AI生成（Claude API呼び出し: ここのみ） ----

  let siteContent: Awaited<ReturnType<typeof generateSiteContent>>
  let seoKeywords: string[]

  try {
    ;[siteContent, seoKeywords] = await Promise.all([
      generateSiteContent(validInput),
      generateSeoKeywords(validInput),
    ])
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[generate] Claude APIエラー:', errMsg)

    if (errMsg.includes('401') || errMsg.includes('authentication') || errMsg.includes('api-key')) {
      return NextResponse.json(
        { error: 'AIサービスの認証に失敗しました。ANTHROPIC_API_KEYを確認してください。' },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'AI生成に失敗しました。しばらく待ってから再試行してください。' },
      { status: 500 }
    )
  }

  // お客様の声はユーザー入力のみ使用。未入力時は空にする（AI生成の架空の声は使わない）
  siteContent.testimonials = (validInput.userTestimonials ?? []).map((t) => ({
    name: t.name,
    role: 'お客様',
    content: t.content,
  }))

  // SNSリンクをウィザード入力から設定
  const lineUrl = validInput.lineSns?.trim() || undefined
  const facebookUrl = validInput.facebookSns?.trim() || undefined
  if (lineUrl || facebookUrl) {
    siteContent.social = {
      ...(siteContent.social ?? {}),
      line: lineUrl,
      facebook: facebookUrl,
    }
  }

  // ---- ⑤ DB保存（以降の表示はここから読む） ----

  let site: { id: string; slug: string }
  try {
    site = await prisma.aiSite.create({
      data: {
        slug,
        firmName:      validInput.firmName,
        ownerEmail:    validInput.ownerEmail,
        ownerName:     validInput.ownerName,
        prefecture:    prefecture,
        services:      validInput.services,
        strengths:     validInput.strengths,
        styles:        validInput.styles,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        siteContent:   siteContent as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        seoKeywords:   seoKeywords as any,
        status:        'draft',
        autoReply:     true,
        promptHash,
      },
      select: { id: true, slug: true },
    })
  } catch (err) {
    console.error('[generate] DB保存エラー:', err)
    return NextResponse.json({ error: 'データの保存に失敗しました' }, { status: 500 })
  }

  console.log(`[generate] 新規生成完了: slug=${site.slug} hash=${promptHash.slice(0, 8)}...`)
  return NextResponse.json({ slug: site.slug, siteId: site.id, cached: false }, { status: 201 })
}
