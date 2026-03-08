import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'

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
  const anthropic = new Anthropic()
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

/** オーナーへの問い合わせ通知メールを送信する */
export async function sendLeadNotificationEmail({
  ownerEmail,
  firmName,
  lead,
}: {
  ownerEmail: string
  firmName: string
  lead: { name?: string | null; email?: string | null; phone?: string | null; message?: string | null }
}): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const fromAddress = process.env.RESEND_FROM ?? 'onboarding@resend.dev'

  const body = [
    `【${firmName}】に新しい問い合わせが届きました。`,
    '',
    `お名前: ${lead.name ?? '未記入'}`,
    `メール: ${lead.email ?? '未記入'}`,
    `電話番号: ${lead.phone ?? '未記入'}`,
    `相談内容:\n${lead.message ?? '（内容なし）'}`,
  ].join('\n')

  const { error } = await resend.emails.send({
    from: `AI集客OS <${fromAddress}>`,
    to: ownerEmail,
    subject: `【新規問い合わせ】${firmName}`,
    text: body,
  })

  if (error) {
    console.error('[LeadNotify] 通知メール送信エラー:', error)
  }
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
  const resend = new Resend(process.env.RESEND_API_KEY)
  // RESEND_FROM が未設定の場合は Resend 共有ドメインを使用
  const fromAddress = process.env.RESEND_FROM ?? 'onboarding@resend.dev'

  console.log(`[AutoReply] 送信開始: to=${to} from=${fromAddress}`)

  const { data, error } = await resend.emails.send({
    from: `${firmName} <${fromAddress}>`,
    to,
    subject: `【${firmName}】お問い合わせありがとうございます`,
    text: replyText,
  })

  if (error) {
    console.error('[AutoReply] メール送信エラー:', JSON.stringify(error))
    return false
  }
  console.log(`[AutoReply] 送信成功: id=${data?.id}`)
  return true
}
