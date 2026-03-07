import Link from 'next/link'

const navItems = [
  { href: '/marketing-os/dashboard', label: 'ダッシュボード', icon: '📊' },
  { href: '/marketing-os/pages',     label: 'ページ管理',     icon: '🖥️' },
  { href: '/marketing-os/leads',     label: 'リード管理',     icon: '👤' },
  { href: '/marketing-os/analytics', label: '分析',           icon: '📈' },
  { href: '/marketing-os/ads',       label: '広告管理',       icon: '📣' },
]

export default function MarketingOSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* ロゴ */}
        <div className="px-5 py-4 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-900">マーケOS</span>
          <p className="text-xs text-gray-400 mt-0.5">Marketing OS</p>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* フッター */}
        <div className="px-5 py-3 border-t border-gray-200">
          <Link
            href="/admin"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← 旧管理画面へ
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
