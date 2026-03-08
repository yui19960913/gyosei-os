export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { SiteTemplate } from '@/components/editor/SiteTemplate'
import type { SiteContent } from '@/lib/ai-site/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const site = await prisma.aiSite.findUnique({
    where: { slug, status: 'published' },
    select: { firmName: true, prefecture: true, services: true },
  })
  if (!site) return {}

  return {
    title: `${site.firmName} | ${site.prefecture}の行政書士`,
    description: `${site.prefecture}の行政書士 ${site.firmName}。${site.services.slice(0, 3).join('・')}など各種許認可申請をサポートします。`,
  }
}

export default async function PublicSitePage({ params }: Props) {
  const { slug } = await params

  const site = await prisma.aiSite.findUnique({ where: { slug } })
  if (!site || site.status !== 'published') notFound()

  const content = site.siteContent as unknown as SiteContent

  return (
    <SiteTemplate
      firmName={site.firmName}
      prefecture={site.prefecture}
      content={content}
      siteSlug={slug}
      editable={false}
    />
  )
}
