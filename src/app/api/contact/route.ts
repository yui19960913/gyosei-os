import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json() as { name: string; email: string; message?: string }

    if (!name || !email) {
      return NextResponse.json({ error: '名前とメールアドレスは必須です' }, { status: 400 })
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM ?? 'noreply@webseisei.com',
      to: process.env.ADMIN_EMAIL ?? 'noreply@webseisei.com',
      subject: '【webseisei】既存サイト相談の問い合わせ',
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
          <h2 style="font-size: 18px; color: #111; margin-bottom: 24px;">既存サイト相談の問い合わせが届きました</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0; font-weight: 600; color: #374151; width: 100px;">お名前</td>
              <td style="padding: 12px 0; color: #4b5563;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0; font-weight: 600; color: #374151;">メール</td>
              <td style="padding: 12px 0; color: #4b5563;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: 600; color: #374151;">内容</td>
              <td style="padding: 12px 0; color: #4b5563; white-space: pre-wrap;">${message ?? '（未記入）'}</td>
            </tr>
          </table>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] error:', err)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
