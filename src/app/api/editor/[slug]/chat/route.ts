import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import type { SiteContent } from '@/lib/ai-site/types'

export const maxDuration = 30

// サーバー側レート制限: slug単位で1分間に10回まで
const rateLimitMap = new Map<string, number[]>()

interface Params {
  params: Promise<{ slug: string }>
}

export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params

  // セッション認証
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  // 会話履歴を受け取る（なければ単発メッセージ）
  const { message, history: chatHistory } = await req.json() as {
    message: string
    history?: { role: 'user' | 'assistant'; content: string }[]
  }

  const site = await prisma.aiSite.findUnique({
    where: { slug },
    select: { firmName: true, services: true, siteContent: true, ownerEmail: true },
  })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (site.ownerEmail !== session.email) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  // レート制限: 1分間に10回まで（有料プランも同様）
  const now = Date.now()
  const timestamps = (rateLimitMap.get(slug) ?? []).filter(t => now - t < 60_000)
  if (timestamps.length >= 10) {
    return NextResponse.json({ error: '1分間に送れるのは10件までです。少し待ってから試してください。' }, { status: 429 })
  }
  rateLimitMap.set(slug, [...timestamps, now])

  const sc = site.siteContent as unknown as SiteContent

  const anthropic = new Anthropic()

  // 会話履歴がある場合は直近5往復のみ送る（トークン節約）
  const recentHistory = chatHistory && chatHistory.length > 0
    ? chatHistory.slice(-10)
    : []
  const conversationMessages = [
    ...recentHistory,
    { role: 'user' as const, content: message },
  ]

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
- 1回答は400字以内。複数案は「① ② ③」で区切る。

【キャッチコピー変更機能】
- ユーザーがキャッチコピーの変更・改善を求めたら、必ず2〜3案を「① ② ③」で提示し、最後に「気に入ったものがあれば番号で教えてください😊」と添える。
- キャッチコピーの各案は2行構成（1行目がメインコピー、2行目がサブコピー）にする。2行の区切りは改行で表す。
- ユーザーが「①」「1番」「1」「①にして」「1番目」などで候補を選んだら、選ばれたキャッチコピーのテキストを以下のJSON形式で回答の末尾に含める:
<<<ACTION>>>{"action":"update_headline","value":"選ばれた1行目\\n選ばれた2行目"}<<<END_ACTION>>>
- JSONの前に「サイトに反映しますね！」などの一言を添える。
- value内の改行は \\n で表す。
- この<<<ACTION>>>ブロックは必ず回答の最後に置く。`,
    messages: conversationMessages,
  })

  const text = reply.content[0].type === 'text' ? reply.content[0].text : ''
  return NextResponse.json({ reply: text })
}
