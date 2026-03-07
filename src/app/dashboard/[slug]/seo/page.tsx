import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SeoGenerateButton } from '@/components/dashboard/SeoGenerateButton'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function SeoPage({ params }: Props) {
  const { slug } = await params

  const site = await prisma.aiSite.findUnique({ where: { slug } })
  if (!site) notFound()

  const seoPages = await prisma.aiSeoPage.findMany({
    where: { siteId: site.id },
    orderBy: { createdAt: 'desc' },
  })

  const keywords = site.seoKeywords as string[]

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SEOページ管理</h1>
        <p className="text-sm text-gray-500 mt-1">業務×地域のSEOページを生成して検索流入を増やしましょう</p>
      </div>

      {/* 生成済みページ */}
      {seoPages.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">生成済みページ（{seoPages.length}件）</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">キーワード</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">タイトル</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">状態</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {seoPages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-gray-700 font-medium">{page.keyword}</td>
                  <td className="px-5 py-4 text-gray-500">{page.title}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      page.status === 'published'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {page.status === 'published' ? '公開中' : '下書き'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <a
                      href={`/seo/${encodeURIComponent(page.slug)}`}
                      target="_blank"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      確認 →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* キーワード候補から生成 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">AIキーワード候補</h2>
        <p className="text-xs text-gray-500 mb-5">
          クリックするとAIがSEOページを自動生成します（1ページ約20秒）
        </p>
        {keywords.length === 0 ? (
          <p className="text-sm text-gray-400">キーワード候補がありません</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {keywords.map((kw, i) => (
              <SeoGenerateButton key={i} keyword={kw} siteId={site.id} siteSlug={slug} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
