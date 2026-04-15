import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { LogoutButton } from '@/components/dashboard/LogoutButton'
import { siteUrl } from '@/lib/urls'

const NAV = [
  { href: '',       label: 'ダッシュボード', icon: '📊' },
  { href: '/leads', label: '問い合わせ',     icon: '👤' },
  { href: '/seo',   label: '業務別ページ',    icon: '📄' },
]

interface Props {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function DashboardLayout({ children, params }: Props) {
  const { slug } = await params

  const site = await prisma.aiSite.findUnique({
    where: { slug },
    select: { firmName: true, status: true, ownerEmail: true },
  })
  if (!site) notFound()

  // 認証チェック: セッションがないか、ownerEmailが一致しなければログインへ
  const session = await getSession()
  if (!session || session.email !== site.ownerEmail) {
    redirect(`/login?next=/dashboard/${slug}`)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* サイドバー */}
      <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* ヘッダー */}
        <div className="px-5 py-5 border-b border-gray-200">
          <p className="text-xs text-gray-400 mb-1">AI集客OS</p>
          <p className="text-sm font-bold text-gray-900 leading-tight">{site.firmName}</p>
          <div className="mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              site.status === 'published'
                ? 'bg-green-50 text-green-700'
                : 'bg-yellow-50 text-yellow-700'
            }`}>
              {site.status === 'published' ? '公開中' : '下書き'}
            </span>
          </div>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 py-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={`/dashboard/${slug}${item.href}`}
              className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* フッター */}
        <div className="px-5 py-4 border-t border-gray-200 space-y-2">
          <Link
            href={siteUrl(slug)}
            target="_blank"
            className="block text-xs text-blue-600 hover:underline"
          >
            🔗 公開サイトを見る
          </Link>
          <Link
            href={`/onboard/preview/${slug}`}
            className="block text-xs text-gray-400 hover:text-gray-600"
          >
            ← プレビューに戻る
          </Link>
          <Link
            href={`/dashboard/${slug}/settings`}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
          >
            ⚙ 設定
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
