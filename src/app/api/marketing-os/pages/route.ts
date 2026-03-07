import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** GET /api/marketing-os/pages?siteId=xxx */
export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get('siteId')
  if (!siteId) {
    return NextResponse.json({ error: 'siteId is required' }, { status: 400 })
  }

  const pages = await prisma.page.findMany({
    where: { siteId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, slug: true, title: true, status: true, createdAt: true },
  })

  return NextResponse.json(pages)
}

/** POST /api/marketing-os/pages */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { siteId, slug, title } = body as {
    siteId?: string
    slug?: string
    title?: string
  }

  if (!siteId || !slug || !title) {
    return NextResponse.json(
      { error: 'siteId, slug, title are required' },
      { status: 400 }
    )
  }

  const page = await prisma.page.create({
    data: { siteId, slug, title, blocks: [], status: 'draft' },
  })

  return NextResponse.json(page, { status: 201 })
}
