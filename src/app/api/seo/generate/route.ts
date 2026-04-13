import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

// Vercel: 最大60秒まで許容
export const maxDuration = 60

/**
 * POST /api/seo/generate
 *
 * ── AIコスト制御 ──────────────────────────────────────────────
 * Claude APIはこのエンドポイント（ボタン押下時）のみ呼ぶ。
 * siteId + slug の UNIQUE 制約を利用したDB側キャッシュで重複生成を防ぐ。
 * SEOページ表示（/seo/[keyword]）ではAIを呼ばない。DBから読む。
 * ──────────────────────────────────────────────────────────────
 */
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { keyword, siteId } = body as { keyword?: string; siteId?: string }

  if (!keyword || !siteId) {
    return NextResponse.json({ error: 'keyword と siteId は必須です' }, { status: 400 })
  }

  const site = await prisma.aiSite.findUnique({ where: { id: siteId } })
  if (!site) return NextResponse.json({ error: 'サイトが見つかりません' }, { status: 404 })

  const slug = keyword.trim().replace(/\s+/g, '-').toLowerCase()

  // ---- ① キャッシュチェック（DB UNIQUE 制約を利用） ----
  // 同じ siteId + slug の組み合わせは @@unique([siteId, slug]) で保証されている。
  // 既存レコードがあれば AI を呼ばずに返す。

  const existing = await prisma.aiSeoPage.findUnique({
    where: { siteId_slug: { siteId, slug } },
    select: { id: true, slug: true },
  })

  if (existing) {
    console.log(`[seo/generate] キャッシュヒット: ${slug}`)
    return NextResponse.json({ pageId: existing.id, slug, cached: true })
  }

  // ---- ② AI生成（Claude API呼び出し: ここのみ） ----

  const anthropic = new Anthropic()
  const prompt = `
行政書士事務所（${site.firmName} / ${site.prefecture}）のSEOページを生成してください。
キーワード: ${keyword}

以下のJSON形式で出力してください（コードブロックなし）:
{
  "headline": "SEOページの見出し（30字以内）",
  "body": "本文（200〜300字）キーワードを自然に含め、地域の方向けに丁寧に書く",
  "faq": [
    { "question": "関連する質問", "answer": "回答（60字以内）" }
  ]
}
faqは3件。JSONのみ出力。`

  let content: unknown
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}'
    const match = rawText.match(/\{[\s\S]*\}/)
    content = match ? JSON.parse(match[0]) : {}
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[seo/generate] Claude APIエラー:', errMsg)
    return NextResponse.json({ error: 'AI生成に失敗しました' }, { status: 500 })
  }

  // ---- ③ DB保存（以降の表示はここから読む） ----

  const page = await prisma.aiSeoPage.create({
    data: {
      siteId,
      slug,
      keyword,
      title: `${keyword} | ${site.firmName}`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      content: content as any,
      status: 'draft',
    },
  })

  console.log(`[seo/generate] 新規生成完了: ${slug}`)
  return NextResponse.json({ pageId: page.id, slug, cached: false }, { status: 201 })
}
