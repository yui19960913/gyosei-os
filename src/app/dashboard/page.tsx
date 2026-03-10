export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session?.email) redirect('/login')

  const site = await prisma.aiSite.findFirst({
    where: { ownerEmail: session.email },
    orderBy: { createdAt: 'desc' },
    select: { slug: true },
  })

  if (site) redirect(`/dashboard/${site.slug}`)
  redirect('/onboard')
}
