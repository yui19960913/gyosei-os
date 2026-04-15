import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSessionToken, sessionCookieOptions } from '@/lib/session'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  try {
    const { slug, name, email, plan, reviewer } = await req.json() as { slug: string; name: string; email: string; plan?: string; reviewer?: string }
    const resend = new Resend(process.env.RESEND_API_KEY)

    if (!slug || !name || !email) {
      return NextResponse.json({ error: '入力内容を確認してください' }, { status: 400 })
    }

    const site = await prisma.aiSite.findUnique({ where: { slug } })
    if (!site) {
      return NextResponse.json({ error: 'サイトが見つかりません' }, { status: 404 })
    }

    // サイトにオーナー情報を保存して公開
    await prisma.aiSite.update({
      where: { slug },
      data: { ownerEmail: email, ownerName: name, status: 'published', plan: plan ?? null },
    })

    // セッション作成（自動ログイン）
    const sessionToken = await createSessionToken(email, 'user')
    const { name: cookieName, value, options } = sessionCookieOptions(sessionToken)

    // ウェルカムメール送信
    const appUrl = process.env.NODE_ENV === 'production'
      ? 'https://app.webseisei.com'
      : 'http://localhost:3000'

    // レビュー依頼の作成
    if (plan && plan !== 'free' && site) {
      const amountJpy = 100000 // プロ確認プラン固定価格
      await prisma.reviewRequest.create({
        data: {
          siteId: site.id,
          plan,
          reviewerType: reviewer ?? 'single',
          status: 'pending',
          amountJpy,
          clientName: name,
          clientEmail: email,
        },
      })

      // 管理者へ通知メール
      await resend.emails.send({
        from: process.env.RESEND_FROM ?? 'noreply@webseisei.com',
        to: process.env.ADMIN_EMAIL ?? 'admin@webseisei.com',
        subject: '【noren】新規レビュー依頼が届きました',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="font-size: 20px; color: #111;">新規レビュー依頼</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #555;">依頼者</td><td style="color: #111; font-weight: 600;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #555;">メール</td><td style="color: #111;">${email}</td></tr>
              <tr><td style="padding: 8px 0; color: #555;">事務所</td><td style="color: #111;">${site.firmName}</td></tr>
              <tr><td style="padding: 8px 0; color: #555;">プラン</td><td style="color: #111;">プロ確認 ¥100,000</td></tr>
              <tr><td style="padding: 8px 0; color: #555;">レビュアー</td><td style="color: #111;">${reviewer ?? '未選択'}</td></tr>
            </table>
            <a href="${appUrl}/admin/reviews" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px;">
              管理画面で確認する
            </a>
          </div>
        `,
      })
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM ?? 'noreply@webseisei.com',
      to: email,
      subject: '【noren】サイトが公開されました',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="font-size: 20px; color: #111;">${name} さん、サイトが公開されました！</h2>
          <p style="color: #555; line-height: 1.7;">
            ${site.firmName}のサイトが公開されました。<br>
            次回以降は以下のリンクからログインして管理できます。
          </p>
          <a href="${appUrl}/login" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-size: 15px;">
            ダッシュボードにログイン
          </a>
          <p style="color: #999; font-size: 13px;">ログインはメールアドレスのみで行えます（パスワード不要）。</p>
        </div>
      `,
    })

    const res = NextResponse.json({ success: true })
    res.cookies.set(cookieName, value, options)
    return res
  } catch (err) {
    console.error('[register] error:', err)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
