import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params { params: Promise<{ slug: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params
  const site = await prisma.aiSite.findUnique({ where: { slug } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(site)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { slug } = await params
  const body = await req.json()
  const { siteContent, editorOverlay } = body

  const site = await prisma.aiSite.findUnique({ where: { slug } })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.aiSite.update({
    where: { slug },
    data: {
      ...(siteContent !== undefined && { siteContent }),
      ...(editorOverlay !== undefined && { editorOverlay }),
    },
  })
  return NextResponse.json(updated)
}
