import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

// オンボーディング用マジックリンク（サイト未登録でも送信）
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email: string }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: '正しいメールアドレスを入力してください' }, { status: 400 })
    }

    // 古いトークンを無効化
    await prisma.magicToken.deleteMany({
      where: { email, usedAt: null, expiresAt: { gt: new Date() } },
    })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15分

    await prisma.magicToken.create({
      data: { email, token, expiresAt },
    })

    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://webseisei.com'
      : 'http://localhost:3000'

    const verifyUrl = `${baseUrl}/api/auth/verify?token=${token}&next=/onboard/questions`

    await resend.emails.send({
      from: process.env.RESEND_FROM ?? 'noreply@webseisei.com',
      to: email,
      subject: '【webseisei】サイト作成を始める',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="font-size: 20px; color: #111;">サイト作成を始めましょう</h2>
          <p style="color: #555;">以下のボタンをクリックして、AIサイト作成を開始してください。リンクは15分間有効です。</p>
          <a href="${verifyUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-size: 15px;">
            サイト作成を始める →
          </a>
          <p style="color: #999; font-size: 13px;">このメールに心当たりがない場合は無視してください。</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[onboard/magic] error:', err)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
