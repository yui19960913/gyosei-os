import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function AdsPage({ params }: Props) {
  const { slug } = await params

  const site = await prisma.aiSite.findUnique({
    where: { slug },
    select: { firmName: true, services: true },
  })
  if (!site) notFound()

  // サンプル広告データ（Phase2でDB実装）
  const sampleAds = [
    {
      name: '建設業許可 東京 | Google広告',
      service: '建設業許可',
      status: 'active',
      budget: '¥30,000/月',
      clicks: 142,
      leads: 8,
      cvr: '5.6%',
    },
    {
      name: '飲食店営業許可 渋谷 | Google広告',
      service: '飲食店営業許可',
      status: 'paused',
      budget: '¥20,000/月',
      clicks: 78,
      leads: 3,
      cvr: '3.8%',
    },
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">広告管理</h1>
          <p className="text-sm text-gray-500 mt-1">Google広告キャンペーンの管理・分析</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
          + 新しい広告を作成
        </button>
      </div>

      {/* 広告一覧（デモ） */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900">キャンペーン一覧</h2>
          <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">デモデータ</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">広告名</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">対象業務</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">状態</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">予算</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">クリック</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">問い合わせ</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">CVR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sampleAds.map((ad, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-medium text-gray-900 max-w-48">
                  <p className="truncate">{ad.name}</p>
                </td>
                <td className="px-5 py-4 text-gray-500">{ad.service}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    ad.status === 'active'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {ad.status === 'active' ? '配信中' : '停止中'}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-700">{ad.budget}</td>
                <td className="px-5 py-4 text-gray-700 font-medium">{ad.clicks}</td>
                <td className="px-5 py-4 text-gray-700 font-medium">{ad.leads}</td>
                <td className="px-5 py-4 text-blue-700 font-semibold">{ad.cvr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI広告コピー提案 */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="text-sm font-semibold text-purple-900 mb-2">AI広告コピー提案</p>
            <div className="space-y-3">
              {site.services.slice(0, 2).map((service, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-400 mb-1">{service}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    「{service}を最短で取得」
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    行政書士が{service}申請を全力サポート。無料相談受付中。
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-purple-500 mt-3">
              ※ Google広告API連携は Phase 2 で実装予定です
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
