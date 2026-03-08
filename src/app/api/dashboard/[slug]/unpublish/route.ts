import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: Promise<{ slug: string }>
}

export async function POST(_req: NextRequest, { params }: Params) {
  const { slug } = await params

  const site = await prisma.aiSite.findUnique({ where: { slug } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.aiSite.update({
    where: { slug },
    data: { status: 'draft' },
  })

  return NextResponse.json({ success: true })
}
