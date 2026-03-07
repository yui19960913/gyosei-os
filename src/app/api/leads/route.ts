import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    landingPageId,
    name,
    email,
    phone,
    message,
    userKeyword,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    referrerUrl,
  } = body

  if (!landingPageId) {
    return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 })
  }

  // LPからclientIdとpracticeAreaIdを取得（フロントから受け取らない）
  const lp = await prisma.landingPage.findUnique({
    where: { id: landingPageId },
    select: { id: true, clientId: true, practiceAreaId: true, status: true },
  })

  if (!lp || lp.status !== 'published') {
    return NextResponse.json({ error: 'LPが見つかりません' }, { status: 404 })
  }

  try {
    // ⚠️ Lead INSERT時はトランザクション内で totalLeads +1 すること（schema.prisma ルール）
    await prisma.$transaction([
      prisma.lead.create({
        data: {
          clientId:       lp.clientId,
          practiceAreaId: lp.practiceAreaId, // ⚠️ 必ず landingPage.practiceAreaId と同値
          landingPageId:  lp.id,
          name:           name    || null,
          email:          email   || null,
          phone:          phone   || null,
          message:        message || null,
          // ⚠️ 保存前に trim() で正規化（docs/jsonb-schema.md ルール）
          userKeyword:    userKeyword ? String(userKeyword).trim() : null,
          utmSource:      utmSource   || null,
          utmMedium:      utmMedium   || null,
          utmCampaign:    utmCampaign || null,
          utmTerm:        utmTerm     || null,
          referrerUrl:    referrerUrl || null,
        },
      }),
      prisma.landingPage.update({
        where: { id: lp.id },
        data:  { totalLeads: { increment: 1 } },
      }),
    ])

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '送信に失敗しました' }, { status: 500 })
  }
}
