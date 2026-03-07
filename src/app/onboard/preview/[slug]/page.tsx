import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PreviewClient } from './PreviewClient'
import type { SiteContent } from '@/lib/ai-site/types'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PreviewPage({ params }: Props) {
  const { slug } = await params

  const site = await prisma.aiSite.findUnique({ where: { slug } })
  if (!site) notFound()

  const content = site.siteContent as unknown as SiteContent

  return (
    <PreviewClient
      slug={slug}
      firmName={site.firmName}
      prefecture={site.prefecture}
      initialContent={content}
    />
  )
}
