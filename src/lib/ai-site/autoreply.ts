import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'

const anthropic = new Anthropic()
const resend = new Resend(process.env.RESEND_API_KEY)

interface AutoReplyInput {
  firmName: string
  services: string[]
  lead: {
    name: string | null
    email: string | null
    phone: string | null
    message: string | null
  }
}

/** AI自動返信メッセージを生成する */
export async function generateAutoReply(input: AutoReplyInput): Promise<string> {
  const prompt = `
あなたは「${input.firmName}」の行政書士事務所のアシスタントです。
以下のお問い合わせに対して、丁寧で専門的な初回返信メールを書いてください。

【お問い合わせ内容】
お名前: ${input.lead.name ?? '未記入'}
メール: ${input.lead.email ?? '未記入'}
電話: ${input.lead.phone ?? '未記入'}
相談内容: ${input.lead.message ?? '（内容なし）'}

【対応業務】
${input.services.join('、')}

以下の形式で書いてください（150〜250字）:
1. 問い合わせへのお礼
2. 相談内容を確認した旨
3. 詳細確認のための2〜3の追加質問
4. 次のステップ（お電話 or 面談の案内）

署名は不要。本文のみ出力してください。`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })

  return message.content[0].type === 'text' ? message.content[0].text.trim() : ''
}

/** 自動返信メールを送信する */
export async function sendAutoReplyEmail({
  to,
  firmName,
  replyText,
}: {
  to: string
  firmName: string
  replyText: string
}): Promise<boolean> {
  // Resend の fromAddress は環境変数 or デフォルト
  // .env の RESEND_FROM または RESEND_FROM_EMAIL どちらでも動作する
  const fromAddress = process.env.RESEND_FROM ?? process.env.RESEND_FROM_EMAIL ?? 'noreply@example.com'

  const { error } = await resend.emails.send({
    from: `${firmName} <${fromAddress}>`,
    to,
    subject: `【${firmName}】お問い合わせありがとうございます`,
    text: replyText,
  })

  if (error) {
    console.error('[AutoReply] メール送信エラー:', error)
    return false
  }
  return true
}
