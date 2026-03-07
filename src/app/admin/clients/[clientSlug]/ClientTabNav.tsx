'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { key: 'dashboard',     label: 'ダッシュボード' },
  { key: 'landing-pages', label: 'LP一覧' },
  { key: 'leads',         label: 'リード一覧' },
]

export default function ClientTabNav({ base }: { base: string }) {
  const pathname = usePathname()

  return (
    <nav className="mb-6 flex border-b border-gray-200">
      {TABS.map((tab) => {
        const href     = `${base}/${tab.key}`
        const isActive = pathname.startsWith(href)
        return (
          <Link
            key={tab.key}
            href={href}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
