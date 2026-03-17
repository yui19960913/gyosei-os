'use client'

import { useState } from 'react'

export default function ExistingPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      if (res.ok) {
        setSent(true)
      } else {
        setError('送信に失敗しました。時間をおいて再度お試しください。')
      }
    } catch {
      setError('送信に失敗しました。時間をおいて再度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f9fafb',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: "'Inter','Helvetica Neue',Arial,'Hiragino Sans',sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
            padding: '6px 16px', borderRadius: 100,
            fontSize: 12, fontWeight: 700, color: '#6366f1', letterSpacing: '0.5px',
          }}>
            既存サイトをお持ちの方へ
          </span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{
            fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800,
            color: '#1e1b4b', letterSpacing: '-1px', lineHeight: 1.3, marginBottom: 12,
          }}>
            今のサイトに<br />満足していますか？
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8 }}>
            問い合わせが少ない・更新が面倒・デザインが古い。<br />
            そんなお悩みがあれば、お気軽にご相談ください。
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
          {[
            '問い合わせがほとんど来ない',
            'サイトの更新が手間でそのままになっている',
            'デザインが古くなってきた気がする',
            '費用が高い割に効果を感じない',
          ].map(text => (
            <div key={text} style={{
              background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: 12, padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
              fontSize: 14, color: '#374151',
            }}>
              <span style={{ color: '#6366f1', fontWeight: 700, flexShrink: 0 }}>✓</span>
              {text}
            </div>
          ))}
        </div>

        <div style={{
          background: '#fff', borderRadius: 20, padding: 'clamp(28px, 4vw, 40px)',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
        }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                お問い合わせを受け付けました
              </h2>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8 }}>
                内容を確認の上、<strong>{email}</strong> へご連絡します。<br />
                通常2営業日以内にご返信いたします。
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
                無料相談を申し込む
              </h2>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
                現在のサイトの状況をお聞かせください。
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    お名前 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="山田 太郎"
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8,
                      border: '1.5px solid #e5e7eb', fontSize: 14,
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    メールアドレス <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8,
                      border: '1.5px solid #e5e7eb', fontSize: 14,
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    現在のサイトについて（任意）
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="現在のサイトのURL・お困りの点など、自由にお書きください"
                    rows={4}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8,
                      border: '1.5px solid #e5e7eb', fontSize: 14,
                      outline: 'none', resize: 'vertical',
                      boxSizing: 'border-box', fontFamily: 'inherit',
                    }}
                  />
                </div>

                {error && (
                  <p style={{ fontSize: 13, color: '#ef4444' }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !name || !email}
                  style={{
                    padding: '13px', borderRadius: 10, border: 'none',
                    background: loading || !name || !email ? '#e5e7eb' : '#6366f1',
                    color: loading || !name || !email ? '#9ca3af' : '#fff',
                    fontSize: 15, fontWeight: 700,
                    cursor: loading || !name || !email ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? '送信中…' : '無料相談を申し込む →'}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 20 }}>
          強引な営業は一切行いません
        </p>
      </div>
    </div>
  )
}
