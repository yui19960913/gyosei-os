export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PublishButton } from '@/components/dashboard/PublishButton'
import { UnpublishButton } from '@/components/dashboard/UnpublishButton'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function DashboardPage({ params }: Props) {
  const { slug } = await params

  const site = await prisma.aiSite.findUnique({
    where: { slug },
    include: {
      _count: { select: { leads: true, seoPages: true } },
    },
  })
  if (!site) notFound()

  const totalLeads = site._count.leads
  const totalSeoPages = site._count.seoPages

  // 今月のリード数
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthlyLeads = await prisma.aiSiteLead.count({
    where: { siteId: site.id, createdAt: { gte: monthStart } },
  })

  // 最近のリード（5件）
  const recentLeads = await prisma.aiSiteLead.findMany({
    where: { siteId: site.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, name: true, message: true, createdAt: true, status: true, autoReplySent: true },
  })

  const seoKeywords = site.seoKeywords as string[]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-sm text-gray-500 mt-1">{site.firmName}</p>
        </div>
        <div className="flex items-center gap-3">
          {site.status === 'published' ? (
            <UnpublishButton slug={slug} />
          ) : (
            <PublishButton slug={slug} />
          )}
        </div>
      </div>

      {/* KPI カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '総問い合わせ数', value: totalLeads, icon: '👤', color: 'blue' },
          { label: '今月の問い合わせ', value: monthlyLeads, icon: '📅', color: 'green' },
          { label: 'SEOページ数', value: totalSeoPages, icon: '📄', color: 'purple' },
          { label: '広告LP数', value: 0, icon: '📣', color: 'orange' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-medium">{card.label}</span>
              <span className="text-xl">{card.icon}</span>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* 2カラムレイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近の問い合わせ */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">最近の問い合わせ</h2>
            <Link href={`/dashboard/${slug}/leads`} className="text-xs text-blue-600 hover:underline">
              すべて見る →
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              まだ問い合わせがありません
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">{lead.name ?? '（氏名なし）'}</p>
                    <div className="flex items-center gap-2">
                      {lead.autoReplySent && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          AI返信済
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        lead.status === 'new' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {lead.status === 'new' ? '新規' : lead.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{lead.message ?? '（内容なし）'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(lead.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEOキーワード候補 */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">SEOキーワード候補</h2>
            <Link href={`/dashboard/${slug}/seo`} className="text-xs text-blue-600 hover:underline">
              管理する →
            </Link>
          </div>
          {seoKeywords.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              キーワードがありません
            </div>
          ) : (
            <div className="p-5 flex flex-wrap gap-2">
              {seoKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI改善提案（サンプル） */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">AI改善提案</p>
            <p className="text-sm text-blue-700">
              SEOページを作成すると、Google検索からの流入が見込めます。
              まずは「{seoKeywords[0] ?? site.services[0] + ' ' + site.prefecture}」のページを生成してみましょう。
            </p>
            <Link
              href={`/dashboard/${slug}/seo`}
              className="inline-block mt-3 text-xs text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              SEOページを生成 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

