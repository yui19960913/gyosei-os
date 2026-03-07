import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

function formatDateJst(d: Date): string {
  return d.toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    month:    '2-digit',
    day:      '2-digit',
    hour:     '2-digit',
    minute:   '2-digit',
  })
}

export default async function ClientLeadsPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>
}) {
  const { clientSlug } = await params

  const client = await prisma.client.findUnique({
    where:  { slug: clientSlug },
    select: { id: true },
  })
  if (!client) notFound()

  // ⚠️ clientId でスコープ（他クライアントのデータは絶対に混入させない）
  const leads = await prisma.lead.findMany({
    where:   { clientId: client.id },
    orderBy: { createdAt: 'desc' },
    take:    100,
    include: {
      practiceArea: { select: { name: true } },
      landingPage:  { select: { title: true } },
    },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">リード一覧</h2>
        <p className="text-xs text-gray-400">最新100件</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">日時（JST）</th>
              <th className="px-4 py-3">業務</th>
              <th className="px-4 py-3">LP</th>
              <th className="px-4 py-3">名前</th>
              <th className="px-4 py-3">メール</th>
              <th className="px-4 py-3">電話</th>
              <th className="px-4 py-3">流入元</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                  リードはまだありません
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-gray-500">
                    {formatDateJst(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{lead.practiceArea.name}</td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-gray-700">
                    {lead.landingPage.title}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{lead.name  ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {lead.utmSource ?? 'direct'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
