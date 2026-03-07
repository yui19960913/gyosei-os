import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ClientTabNav from './ClientTabNav'

export default async function ClientLayout({
  params,
  children,
}: {
  params: Promise<{ clientSlug: string }>
  children: React.ReactNode
}) {
  const { clientSlug } = await params

  const client = await prisma.client.findUnique({
    where:  { slug: clientSlug },
    select: { firmName: true, slug: true },
  })
  if (!client) notFound()

  return (
    <div>
      {/* パンくず */}
      <div className="mb-4 flex items-center gap-1.5 text-sm text-gray-500">
        <Link href="/admin" className="hover:text-gray-800">
          全クライアント
        </Link>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-gray-900">{client.firmName}</span>
      </div>

      {/* クライアント別タブ */}
      <ClientTabNav base={`/admin/clients/${clientSlug}`} />

      {children}
    </div>
  )
}
