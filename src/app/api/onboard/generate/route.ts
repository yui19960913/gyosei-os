import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSiteContent, generateSeoKeywords, buildSlug } from '@/lib/ai-site/generator'
import { buildSitePromptHash } from '@/lib/ai-site/hash'
import type { GenerateInput } from '@/lib/ai-site/types'

// Vercel: 最大60秒まで許容（長時間のAI生成のため）
export const maxDuration = 60

/**
 * POST /api/onboard/generate
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

  const input = body as Partial<GenerateInput>

  if (!input.firmName?.trim()) {
    return NextResponse.json({ error: '事務所名は必須です' }, { status: 400 })
  }
  if (!input.prefecture) {
    return NextResponse.json({ error: '所在地は必須です' }, { status: 400 })
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

  const validInput: GenerateInput = {
    firmName:      input.firmName.trim(),
    ownerName:     input.ownerName.trim(),
    ownerBio:      input.ownerBio?.trim() || undefined,
    prefecture:    input.prefecture,
    services:      input.services,
    strengths:     input.strengths.trim(),
    targetClients: input.targetClients?.trim() || undefined,
    styles:        input.styles ?? [],
  }

  // ---- ① キャッシュチェック（同一入力の重複AI呼び出しを防ぐ） ----
  // 入力をハッシュ化し、既存の生成結果がDBにあればAI呼び出しをスキップする。

  const promptHash = buildSitePromptHash(validInput)

  const cached = await prisma.aiSite.findFirst({
    where: { promptHash },
    select: { id: true, slug: true },
  })

  if (cached) {
    console.log(`[generate] キャッシュヒット: hash=${promptHash.slice(0, 8)}... → slug=${cached.slug}`)
    return NextResponse.json({ slug: cached.slug, siteId: cached.id, cached: true })
  }

  // ---- ② スラッグ生成（衝突回避） ----

  let slug = buildSlug(validInput.prefecture)
  for (let i = 0; i < 5; i++) {
    const existing = await prisma.aiSite.findUnique({ where: { slug } })
    if (!existing) break
    slug = buildSlug(validInput.prefecture)
  }

  // ---- ③ AI生成（Claude API呼び出し: ここのみ） ----
  // キャッシュミス時のみ実行される。生成結果は次のステップでDBに保存し、
  // 以降の表示はすべてDBから読む。AIの再呼び出しは発生しない。

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

  // ---- ④ DB保存（以降の表示はここから読む） ----

  let site: { id: string; slug: string }
  try {
    site = await prisma.aiSite.create({
      data: {
        slug,
        firmName:      validInput.firmName,
        prefecture:    validInput.prefecture,
        services:      validInput.services,
        strengths:     validInput.strengths,
        targetClients: validInput.targetClients ?? null,
        styles:        validInput.styles,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        siteContent:   siteContent as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        seoKeywords:   seoKeywords as any,
        status:        'draft',
        autoReply:     true,
        promptHash,          // キャッシュキー保存
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
