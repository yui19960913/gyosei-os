import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email, next } = await req.json() as { email: string; next?: string }
    const resend = new Resend(process.env.RESEND_API_KEY)

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: '正しいメールアドレスを入力してください' }, { status: 400 })
    }

    // 古いトークンをすべて削除（期限切れ・使用済みも含む）
    await prisma.magicToken.deleteMany({
      where: { email },
    })

    // 新しいトークンを生成
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15分

    await prisma.magicToken.create({
      data: { email, token, expiresAt },
    })

    // メール送信
    const origin = req.headers.get('origin')
      || (process.env.NODE_ENV === 'production' ? 'https://app.webseisei.com' : 'http://localhost:3000')

    const verifyParams = new URLSearchParams({ token })
    if (next) verifyParams.set('next', next)
    const loginUrl = `${origin}/api/auth/verify?${verifyParams.toString()}`

    const { error: sendError } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? 'noreply@webseisei.com',
      to: email,
      subject: '【hanjyo】ログインリンク',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="font-size: 20px; color: #111;">ログインリンク</h2>
          <p style="color: #555;">以下のボタンをクリックしてログインしてください。リンクは15分間有効です。</p>
          <a href="${loginUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-size: 15px;">
            ログインする
          </a>
          <p style="color: #999; font-size: 13px;">このメールに心当たりがない場合は無視してください。</p>
        </div>
      `,
    })

    if (sendError) {
      console.error('[magic] Resend送信エラー:', sendError)
      return NextResponse.json({ error: 'メールの送信に失敗しました。しばらくしてから再試行してください。' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[magic] error:', err)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
