import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function LeadsPage({ params }: Props) {
  const { slug } = await params

  const site = await prisma.aiSite.findUnique({ where: { slug } })
  if (!site) notFound()

  const leads = await prisma.aiSiteLead.findMany({
    where: { siteId: site.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">問い合わせ管理</h1>
          <p className="text-sm text-gray-500 mt-1">合計 {leads.length} 件</p>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-gray-500">まだ問い合わせがありません</p>
          <p className="text-sm text-gray-400 mt-2">サイトを公開すると問い合わせが届きます</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">名前</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">連絡先</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">内容</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">AI返信</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">状態</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">日時</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium text-gray-900">
                    {lead.name ?? '（未記入）'}
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {lead.email && <p>{lead.email}</p>}
                    {lead.phone && <p>{lead.phone}</p>}
                  </td>
                  <td className="px-5 py-4 text-gray-600 max-w-48">
                    <p className="truncate">{lead.message ?? '—'}</p>
                  </td>
                  <td className="px-5 py-4">
                    {lead.autoReplySent ? (
                      <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                        送信済
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      lead.status === 'new'
                        ? 'bg-blue-50 text-blue-700'
                        : lead.status === 'converted'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {lead.status === 'new' ? '新規' : lead.status === 'converted' ? '受任' : lead.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(lead.createdAt).toLocaleString('ja-JP', {
                      month: '2-digit', day: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI返信の例（最初のリードに autoReplyText がある場合） */}
      {leads[0]?.autoReplyText && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-blue-700 mb-2">🤖 最新AI返信の内容</p>
          <p className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">
            {leads[0].autoReplyText}
          </p>
        </div>
      )}
    </div>
  )
}
