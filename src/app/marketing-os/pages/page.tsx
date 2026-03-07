import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function PagesListPage() {
  // Phase1: 全ページを表示（後でサイトフィルタを追加）
  const pages = await prisma.page.findMany({
    orderBy: { createdAt: 'desc' },
    include: { site: { select: { name: true } } },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ページ管理</h1>
          <p className="text-sm text-gray-500 mt-1">サイトのページを作成・編集</p>
        </div>
      </div>

      {pages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <p className="text-4xl mb-4">🖥️</p>
          <p className="text-gray-600 font-medium mb-1">ページがまだありません</p>
          <p className="text-sm text-gray-400">
            まずDBにSiteとPageをシードするか、APIから作成してください。
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">タイトル</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">サイト</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">スラッグ</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">状態</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium text-gray-900">{page.title}</td>
                  <td className="px-5 py-4 text-gray-500">{page.site.name}</td>
                  <td className="px-5 py-4 text-gray-400 font-mono text-xs">{page.slug}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      page.status === 'published'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {page.status === 'published' ? '公開中' : '下書き'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/marketing-os/pages/${page.id}/edit`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      編集 →
                    </Link>
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
