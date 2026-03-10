import Link from 'next/link'

const navItems = [
  { href: '/admin',             label: 'ダッシュボード' },
  { href: '/admin/users',       label: 'ユーザー管理' },
  { href: '/admin/reviews',     label: 'レビュー管理' },
  { href: '/admin/reviewers',   label: 'レビュアー' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200">
          <p className="text-xs text-gray-400">運営管理</p>
          <p className="text-sm font-bold text-gray-900 mt-0.5">AI集客OS</p>
        </div>
        <nav className="py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
