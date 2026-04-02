import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildAutoReplyText, sendAutoReplyEmail, sendLeadNotificationEmail } from '@/lib/ai-site/autoreply'
import { sendLineLeadNotification } from '@/lib/line'

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

  // ── 通知（並列実行、すべてbest effort） ──────────────────────
  const tasks: Promise<unknown>[] = []

  // オーナーへのメール通知
  if (site.ownerEmail) {
    tasks.push(
      sendLeadNotificationEmail({
        ownerEmail: site.ownerEmail,
        firmName: site.firmName,
        lead: { name, email, phone, message },
      }).catch(err => console.error('[LeadNotify] 通知失敗:', err))
    )
  }

  // 問い合わせ者への定型文自動返信
  if (site.autoReply && email) {
    const replyText = buildAutoReplyText({ firmName: site.firmName, name: name ?? null })
    tasks.push(
      (async () => {
        try {
          const sent = await sendAutoReplyEmail({ to: email, firmName: site.firmName, replyText })
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

  // オーナーへのLINE通知
  if (site.lineUserId) {
    tasks.push(
      sendLineLeadNotification({
        lineUserId: site.lineUserId,
        name,
        email,
        message,
      }).catch(err => console.error('[LINE] 通知失敗:', err))
    )
  }

  await Promise.all(tasks)

  return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 })
}
