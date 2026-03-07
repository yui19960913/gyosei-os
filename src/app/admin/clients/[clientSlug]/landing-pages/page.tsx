import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

const STATUS_LABEL: Record<string, string> = {
  published: '公開中',
  draft:     '下書き',
  archived:  'アーカイブ',
}
const STATUS_COLOR: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft:     'bg-gray-100  text-gray-500',
  archived:  'bg-yellow-100 text-yellow-700',
}

export default async function ClientLandingPagesPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>
}) {
  const { clientSlug } = await params

  const client = await prisma.client.findUnique({
    where:  { slug: clientSlug },
    select: { id: true, slug: true },
  })
  if (!client) notFound()

  // ⚠️ clientId でスコープ
  const landingPages = await prisma.landingPage.findMany({
    where:   { clientId: client.id },
    include: { practiceArea: { select: { name: true, slug: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">LP一覧</h2>
      </div>

      {landingPages.length === 0 ? (
        <p className="text-sm text-gray-400">LPがまだ登録されていません。</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">タイトル</th>
                <th className="px-4 py-3">業務</th>
                <th className="px-4 py-3">状態</th>
                <th className="px-4 py-3 text-right">総リード</th>
                <th className="px-4 py-3">公開URL</th>
                <th className="px-4 py-3">公開日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {landingPages.map((lp) => (
                <tr key={lp.id} className="hover:bg-gray-50">
                  <td className="max-w-[240px] truncate px-4 py-3 font-medium text-gray-900">
                    {lp.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lp.practiceArea.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[lp.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {STATUS_LABEL[lp.status] ?? lp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                    {lp.totalLeads}
                  </td>
                  <td className="px-4 py-3">
                    {lp.status === 'published' && (
                      <a
                        href={`/lp/${client.slug}/${lp.practiceArea.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        LPを見る ↗
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {lp.publishedAt
                      ? lp.publishedAt.toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
