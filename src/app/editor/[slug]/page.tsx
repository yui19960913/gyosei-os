import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SiteEditor } from '@/components/editor/SiteEditor'
import type { SiteContent } from '@/lib/ai-site/types'
import type { CanvasElement } from '@/lib/marketing-os/canvas/types'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function EditorPage({ params }: Props) {
  const { slug } = await params
  const site = await prisma.aiSite.findUnique({ where: { slug } })
  if (!site) notFound()

  const siteContent = site.siteContent as unknown as SiteContent
  const editorOverlay = (site.editorOverlay as unknown as CanvasElement[]) ?? []

  return (
    <SiteEditor
      slug={slug}
      firmName={site.firmName}
      prefecture={site.prefecture}
      initialContent={siteContent}
      initialOverlay={editorOverlay}
    />
  )
}
