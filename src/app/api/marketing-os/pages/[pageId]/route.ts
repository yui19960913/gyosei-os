import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: Promise<{ pageId: string }>
}

/** GET /api/marketing-os/pages/[pageId] */
export async function GET(_req: NextRequest, { params }: Params) {
  const { pageId } = await params

  const page = await prisma.page.findUnique({ where: { id: pageId } })
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(page)
}

/** PATCH /api/marketing-os/pages/[pageId] */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { pageId } = await params
  const body = await req.json()

  const { title, slug, status, blocks } = body as {
    title?: string
    slug?: string
    status?: string
    blocks?: unknown
  }

  const page = await prisma.page.update({
    where: { id: pageId },
    data: {
      ...(title  !== undefined && { title }),
      ...(slug   !== undefined && { slug }),
      ...(status !== undefined && { status }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(blocks !== undefined && { blocks: blocks as any }),
    },
  })

  return NextResponse.json(page)
}

/** DELETE /api/marketing-os/pages/[pageId] */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { pageId } = await params

  await prisma.page.delete({ where: { id: pageId } })
  return new NextResponse(null, { status: 204 })
}
