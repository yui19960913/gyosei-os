import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAutoReply, sendAutoReplyEmail, sendLeadNotificationEmail } from '@/lib/ai-site/autoreply'

interface Params {
  params: Promise<{ slug: string }>
}

export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params

  // サイト取得
  const site = await prisma.aiSite.findUnique({ where: { slug } })
  if (!site) {
    return NextResponse.json({ error: 'サイトが見つかりません' }, { status: 404 })
  }

  // リクエストボディ
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'リクエストの形式が不正です' }, { status: 400 })
  }

  const { name, email, phone, message } = body as {
    name?: string
    email?: string
    phone?: string
    message?: string
  }

  // 最低限メールか電話のどちらかが必要
  if (!email && !phone) {
    return NextResponse.json(
      { error: 'メールアドレスまたは電話番号を入力してください' },
      { status: 400 }
    )
  }

  // UTMパラメータ（referer から取得）
  const referer = req.headers.get('referer') ?? undefined

  // リード保存
  const lead = await prisma.aiSiteLead.create({
    data: {
      siteId:      site.id,
      name:        name ?? null,
      email:       email ?? null,
      phone:       phone ?? null,
      message:     message ?? null,
      referrerUrl: referer ?? null,
      status:      'new',
    },
  })

  // ── メール送信（await で確実に実行） ──────────────────────
  // Vercel Serverless はレスポンス返却後に関数が終了するため
  // fire-and-forget ではメール送信がキャンセルされる。必ず await する。

  const emailTasks: Promise<unknown>[] = []

  // オーナーへの通知
  if (site.ownerEmail) {
    emailTasks.push(
      sendLeadNotificationEmail({
        ownerEmail: site.ownerEmail,
        firmName: site.firmName,
        lead: { name, email, phone, message },
      }).catch(err => console.error('[LeadNotify] 通知失敗:', err))
    )
  }

  // 問い合わせ者への AI 自動返信
  if (site.autoReply && email) {
    emailTasks.push(
      (async () => {
        try {
          const replyText = await generateAutoReply({
            firmName: site.firmName,
            services: site.services,
            lead: { name: name ?? null, email, phone: phone ?? null, message: message ?? null },
          })

          const sent = await sendAutoReplyEmail({
            to: email,
            firmName: site.firmName,
            replyText,
          })

          if (sent) {
            await prisma.aiSiteLead.update({
              where: { id: lead.id },
              data: {
                autoReplySent: true,
                autoReplyAt:   new Date(),
                autoReplyText: replyText,
              },
            })
          }
        } catch (err) {
          console.error('[AutoReply] エラー:', err)
        }
      })()
    )
  }

  await Promise.all(emailTasks)

  return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 })
}
