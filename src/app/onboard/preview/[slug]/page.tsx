export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { PreviewClient } from './PreviewClient'
import type { SiteContent } from '@/lib/ai-site/types'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PreviewPage({ params }: Props) {
  const { slug } = await params

  const site = await prisma.aiSite.findUnique({ where: { slug } })
  if (!site) notFound()

  // 認証チェック: セッションがないか、ownerEmailが一致しなければログインへ
  const session = await getSession()
  if (!session || session.email !== site.ownerEmail) {
    redirect(`/login?next=/onboard/preview/${slug}`)
  }

  const content = site.siteContent as unknown as SiteContent

  return (
    <PreviewClient
      slug={slug}
      firmName={site.firmName}
      prefecture={site.prefecture}
      initialContent={content}
      initialTemplateId={site.templateId ?? undefined}
      isPublished={site.status === 'published'}
    />
  )
}
