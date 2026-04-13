import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

interface Params {
  params: Promise<{ pageId: string }>
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { pageId } = await params

  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const page = await prisma.aiSeoPage.findUnique({
    where: { id: pageId },
    include: { site: { select: { ownerEmail: true } } },
  })
  if (!page) {
    return NextResponse.json({ error: 'ページが見つかりません' }, { status: 404 })
  }
  if (session.email !== page.site.ownerEmail) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'リクエストの形式が不正です' }, { status: 400 })
  }

  const { status } = body as { status?: string }
  if (status !== 'published' && status !== 'draft') {
    return NextResponse.json({ error: 'statusは published または draft を指定してください' }, { status: 400 })
  }

  await prisma.aiSeoPage.update({
    where: { id: pageId },
    data: { status },
  })

  return NextResponse.json({ success: true })
}
