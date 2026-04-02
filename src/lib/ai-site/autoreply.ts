import { Resend } from 'resend'

/** 定型文の受付確認メールを生成する */
export function buildAutoReplyText({ firmName, name }: { firmName: string; name: string | null }): string {
  const displayName = name ?? 'お客'
  return [
    `${displayName} 様`,
    '',
    'この度はお問い合わせいただきありがとうございます。',
    '内容を確認のうえ、担当よりご連絡いたしますので',
    '今しばらくお待ちください。',
    '',
    '──',
    firmName,
  ].join('\n')
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
    from: `noren <${fromAddress}>`,
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
  const fromAddress = process.env.RESEND_FROM ?? 'onboarding@resend.dev'

  const { data, error } = await resend.emails.send({
    from: `${firmName} <${fromAddress}>`,
    to,
    subject: `【${firmName}】お問い合わせを受け付けました`,
    text: replyText,
  })

  if (error) {
    console.error('[AutoReply] メール送信エラー:', JSON.stringify(error))
    return false
  }
  console.log(`[AutoReply] 送信成功: id=${data?.id}`)
  return true
}
