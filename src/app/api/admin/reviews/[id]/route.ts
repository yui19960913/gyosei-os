import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status, note, reviewerId } = await req.json() as { status: string; note?: string; reviewerId?: string | null }

  const reviewer = reviewerId ? await prisma.reviewer.findUnique({ where: { id: reviewerId } }) : null

  await prisma.reviewRequest.update({
    where: { id },
    data: {
      status,
      note: note ?? null,
      reviewerId: reviewerId ?? null,
      approvedByName: status === 'approved' && reviewer ? reviewer.name : undefined,
      approvedByTitle: status === 'approved' && reviewer ? `${reviewer.title}・${reviewer.company}` : undefined,
      approvedAt: status === 'approved' ? new Date() : undefined,
    },
  })

  return NextResponse.json({ success: true })
}
