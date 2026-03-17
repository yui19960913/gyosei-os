'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardAuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/auth/session-check').then(r => r.json()).then((d: { authenticated: boolean }) => {
      if (d.authenticated) router.replace('/onboard/questions')
    }).catch(() => {})
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/onboard/magic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (data.success) {
        setSent(true)
      } else {
        setError(data.error ?? 'エラーが発生しました')
      }
    } catch {
      setError('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f9fafb', padding: 24,
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: '48px 40px',
        maxWidth: 440, width: '100%', textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8, letterSpacing: '-0.5px' }}>
          メールアドレスを入力
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32, lineHeight: 1.7 }}>
          入力したアドレスにログインリンクを送ります。<br />
          クリックするだけで認証完了です。
        </p>

        {sent ? (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '20px 16px' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#15803d', marginBottom: 6 }}>メールを送信しました ✓</p>
            <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.7 }}>
              <strong>{email}</strong> にリンクを送りました。<br />
              メールを確認してリンクをクリックしてください。
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                border: '1.5px solid #e5e7eb', fontSize: 15,
                outline: 'none', marginBottom: 12, boxSizing: 'border-box',
              }}
            />
            {error && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 12 }}>{error}</p>}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                background: loading || !email.trim() ? '#e5e7eb' : '#6366f1',
                color: '#fff', fontSize: 15, fontWeight: 700,
                cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '送信中…' : 'ログインリンクを送る'}
            </button>
          </form>
        )}

        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 24, lineHeight: 1.6 }}>
          ログインすることで、
          <a href="#" style={{ color: '#6b7280', textDecoration: 'underline' }}>利用規約</a>と
          <a href="#" style={{ color: '#6b7280', textDecoration: 'underline' }}>プライバシーポリシー</a>
          に同意したものとみなします。
        </p>
      </div>
    </div>
  )
}
