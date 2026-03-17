import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import type { SiteContent } from '@/lib/ai-site/types'

export const maxDuration = 30

interface Params {
  params: Promise<{ slug: string }>
}

export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params
  const { message } = await req.json() as { message: string }

  const site = await prisma.aiSite.findUnique({
    where: { slug },
    select: { firmName: true, services: true, siteContent: true },
  })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const sc = site.siteContent as unknown as SiteContent

  const anthropic = new Anthropic()

  const reply = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system: `あなたは「せいせいくん」という行政書士事務所サイトの編集アシスタントです。

【現在のサイト情報】
事務所名: ${site.firmName}
対応業務: ${site.services.join('、')}
キャッチコピー（1行目）: ${sc.hero.headline.split('\n')[0] ?? ''}
キャッチコピー（2行目）: ${sc.hero.headline.split('\n')[1] ?? ''}
サブコピー: ${sc.hero.subheadline}
事務所紹介文（冒頭）: ${sc.profile.body.slice(0, 150)}
強み: ${sc.profile.strengths.join('、')}

【回答ルール】
- 「○○を改善して」「○○を書き直して」と言われたら、上記の現在の内容を踏まえて即座に改善案を2〜3案提示する。「どんな内容ですか？」などの確認はしない。
- 提案はそのままサイトに貼れる完成形テキストで出す。
- サイトに貼り付けるテキストの提案（キャッチコピー・紹介文・FAQ・料金説明など）の主語は、必ず事務所（${site.firmName}）または代表者にする。あなた自身の名前「せいせいくん」をサイト文章の中に入れない。
- よくある質問の追加を求められたら、この事務所の業務と客層に合った具体的なQ&Aを作成する。
- マークダウン見出し（# や ##）は使わない。
- 口調はですます調で、簡潔・親しみやすく。絵文字は1回答に1〜2個まで。
- 1回答は400字以内。複数案は「① ② ③」で区切る。`,
    messages: [{ role: 'user', content: message }],
  })

  const text = reply.content[0].type === 'text' ? reply.content[0].text : ''
  return NextResponse.json({ reply: text })
}
