export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PublishButton } from '@/components/dashboard/PublishButton'
import { UnpublishButton } from '@/components/dashboard/UnpublishButton'
import { SocialLinksEditor } from '@/components/dashboard/SocialLinksEditor'
import { WelcomeCard } from '@/components/dashboard/WelcomeCard'
import { CopyUrlButton } from '@/components/dashboard/CopyUrlButton'
import { siteUrl } from '@/lib/urls'
import type { SiteContent } from '@/lib/ai-site/types'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function DashboardPage({ params }: Props) {
  const { slug } = await params

  const site = await prisma.aiSite.findUnique({
    where: { slug },
  })
  if (!site) notFound()

  // 最近のリード（5件）
  const recentLeads = await prisma.aiSiteLead.findMany({
    where: { siteId: site.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, name: true, message: true, createdAt: true, status: true, autoReplySent: true },
  })

  const seoKeywords = site.seoKeywords as string[]
  const seoPageCount = await prisma.aiSeoPage.count({ where: { siteId: site.id } })
  const seoPublishedCount = await prisma.aiSeoPage.count({ where: { siteId: site.id, status: 'published' } })
  const siteContent = site.siteContent as unknown as SiteContent
  const isMonthly = site.plan === 'monthly' || site.plan === 'annual'

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

      {/* 初回ログイン案内 */}
      <WelcomeCard slug={slug} prefecture={site.prefecture} siteUrl={siteUrl(slug)} />

      {/* 公開URL */}
      {site.status === 'published' && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm">🌐</span>
            <span className="text-xs text-gray-500 shrink-0">公開中のホームページURL</span>
            <a href={siteUrl(slug)} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 font-medium hover:underline truncate">
              {siteUrl(slug).replace('https://', '')}
            </a>
            <CopyUrlButton url={siteUrl(slug)} />
          </div>
          <div className="mt-2 ml-7">
            <Link href={`/onboard/preview/${slug}`} className="text-xs text-gray-400 hover:text-gray-600">
              ✏️ ホームページを編集する
            </Link>
          </div>
        </div>
      )}


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

        {/* 業務別ページ */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">業務別ページ</h2>
            <Link href={`/dashboard/${slug}/seo`} className="text-xs text-blue-600 hover:underline">
              管理する →
            </Link>
          </div>
          {seoPageCount === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              まだ業務別ページを作成していません
            </div>
          ) : (
            <div className="p-5">
              <p className="text-sm text-gray-700 mb-1">
                {seoPageCount}ページ作成済み（公開中: {seoPublishedCount}件）
              </p>
              <p className="text-xs text-gray-400">
                管理画面から公開・非公開を切り替えられます
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SNSリンク設定（月額プランのみ） */}
      {isMonthly && (
        <div className="mt-6">
          <SocialLinksEditor slug={slug} initial={siteContent.social ?? {}} />
        </div>
      )}

      {/* AI改善提案（サンプル） */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">AI改善提案</p>
            <p className="text-sm text-blue-700">
              業務別ページを作成すると、Google検索からの流入が見込めます。
              まずは「{seoKeywords[0] ?? site.services[0] + ' ' + site.prefecture}」のページを生成してみましょう。
            </p>
            <Link
              href={`/dashboard/${slug}/seo`}
              className="inline-block mt-3 text-xs text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              業務別ページを生成 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

