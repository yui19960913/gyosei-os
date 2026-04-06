const LINE_API_URL = 'https://api.line.me/v2/bot/message/push'

interface LineLeadNotification {
  lineUserId: string
  name?: string | null
  email?: string | null
  message?: string | null
}

/** LINE Messaging API でオーナーにPush通知を送信する */
export async function sendLineLeadNotification(input: LineLeadNotification): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) {
    console.warn('[LINE] LINE_CHANNEL_ACCESS_TOKEN is not set, skipping')
    return
  }

  const text = [
    '【hanjyoより】新しい問い合わせが届きました',
    '',
    `お名前：${input.name ?? '未記入'}`,
    `メール：${input.email ?? '未記入'}`,
    `内容：${input.message ?? '（内容なし）'}`,
  ].join('\n')

  const res = await fetch(LINE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: input.lineUserId,
      messages: [{ type: 'text', text }],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error(`[LINE] Push failed (${res.status}):`, body)
  }
}
