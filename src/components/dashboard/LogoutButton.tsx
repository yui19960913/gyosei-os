'use client'

import { signOut } from 'next-auth/react'

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="block w-full text-left text-xs text-gray-400 hover:text-red-500 transition-colors"
    >
      ログアウト
    </button>
  )
}
