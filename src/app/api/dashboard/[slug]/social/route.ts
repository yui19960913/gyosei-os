import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import type { SiteContent, SocialLinks } from '@/lib/ai-site/types'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const session = await getSession()

    const site = await prisma.aiSite.findUnique({ where: { slug } })
    if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!session || session.email !== site.ownerEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (site.plan !== 'monthly') {
      return NextResponse.json({ error: '月額プランのみ利用できます' }, { status: 403 })
    }

    const { social } = await req.json() as { social: SocialLinks }

    const current = site.siteContent as unknown as SiteContent
    const updated: SiteContent = { ...current, social }

    await prisma.aiSite.update({
      where: { slug },
      data: { siteContent: updated as object },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[social] error:', err)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
