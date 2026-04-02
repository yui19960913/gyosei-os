'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const isOnboard = searchParams.get('from') === 'onboard'

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await fetch('/api/auth/magic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, next: isOnboard ? '/onboard/questions' : undefined }),
    })

    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center">
        <p className="text-4xl mb-4">📬</p>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">メールをご確認ください</h2>
        <p className="text-sm text-gray-500">
          {email} にログインリンクを送りました。<br />
          リンクの有効期限は15分です。
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isOnboard ? 'メールアドレスで始める' : 'ログイン'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isOnboard
            ? 'メールアドレスを入力すると、サイト作成を開始できます'
            : 'メールアドレスにログインリンクを送ります'}
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg mb-4 text-center">
          {error === 'expired' ? 'リンクの有効期限が切れました。再度お試しください。' : 'リンクが無効です。再度お試しください。'}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? '送信中...' : isOnboard ? '始める' : 'ログインリンクを送る'}
        </button>
      </form>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm p-8">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
