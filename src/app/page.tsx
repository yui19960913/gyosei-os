'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/magic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, next: '/onboard/questions' }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'エラーが発生しました')
      setLoading(false)
      return
    }

    setLoading(false)
    setSent(true)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(150deg, #eef2ff 0%, #f0fdf4 50%, #fdf4ff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Inter','Helvetica Neue',Arial,'Hiragino Sans',sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* バッジ */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
            padding: '6px 16px', borderRadius: 100,
            fontSize: 12, fontWeight: 700, color: '#6366f1', letterSpacing: '0.5px',
          }}>
            AI集客OS for 行政書士
          </span>
        </div>

        {/* ヘッドライン */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{
            fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 800,
            color: '#1e1b4b', letterSpacing: '-1.5px', lineHeight: 1.2, marginBottom: 16,
          }}>
            現在、ホームページは<br />お持ちですか？
          </h1>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7 }}>
            状況に合わせて最適なプランをご案内します
          </p>
        </div>

        {/* メール送信完了 */}
        {sent ? (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '40px 32px',
            border: '1px solid #e5e7eb', textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>📬</p>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
              メールをご確認ください
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>
              {email} にログインリンクを送りました。<br />
              リンクの有効期限は15分です。
            </p>
          </div>
        ) : showEmailForm ? (
          /* メール入力フォーム */
          <div style={{
            background: '#fff', borderRadius: 20, padding: '32px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}>
            <button
              onClick={() => setShowEmailForm(false)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 13, color: '#6b7280', background: 'none', border: 'none',
                cursor: 'pointer', padding: 0, marginBottom: 20,
              }}
            >
              ← 戻る
            </button>

            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e1b4b', marginBottom: 8 }}>
              メールアドレスを入力
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24, lineHeight: 1.6 }}>
              ログインリンクをお送りします。リンクをクリックするとサイト作成を開始できます。
            </p>

            {error && (
              <p style={{
                fontSize: 13, color: '#dc2626', background: '#fef2f2',
                padding: '10px 14px', borderRadius: 8, marginBottom: 16,
              }}>
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="your@email.com"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 10,
                  border: '1px solid #d1d5db', fontSize: 15,
                  outline: 'none', boxSizing: 'border-box', marginBottom: 12,
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10,
                  background: loading ? '#9ca3af' : '#6366f1', color: '#fff',
                  fontSize: 15, fontWeight: 700, border: 'none', cursor: loading ? 'default' : 'pointer',
                }}
              >
                {loading ? '送信中...' : 'ログインリンクを送る'}
              </button>
            </form>
          </div>
        ) : (
          /* 選択カード */
          <div style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>

            {/* 持っていない */}
            <button
              onClick={() => setShowEmailForm(true)}
              style={{
                flex: 1, background: '#fff', border: '2px solid #e5e7eb',
                borderRadius: 20, padding: '28px 24px',
                cursor: 'pointer', textAlign: 'left',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#6366f1'
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
                <span style={{ fontSize: 40 }}>🆕</span>
                <p style={{ fontSize: 17, fontWeight: 700, color: '#1e1b4b', marginBottom: 4, letterSpacing: '-0.3px' }}>
                  まだ持っていない
                </p>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                  AIが5分でプロ品質のサイトを自動生成します
                </p>
              </div>
            </button>

            {/* 持っている */}
            <button
              onClick={() => router.push('/onboard/existing')}
              style={{
                flex: 1, background: '#fff', border: '2px solid #e5e7eb',
                borderRadius: 20, padding: '28px 24px',
                cursor: 'pointer', textAlign: 'left',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#6366f1'
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
                <span style={{ fontSize: 40 }}>🌐</span>
                <p style={{ fontSize: 17, fontWeight: 700, color: '#1e1b4b', marginBottom: 4, letterSpacing: '-0.3px' }}>
                  すでに持っている
                </p>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                  既存サイトにAI集客機能を追加できます
                </p>
              </div>
            </button>

          </div>
        )}

      </div>
    </div>
  )
}
