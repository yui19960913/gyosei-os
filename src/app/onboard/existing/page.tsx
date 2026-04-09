'use client'

import Link from 'next/link'
import { useState } from 'react'

type AuditItem = { key: string; label: string; score: number; max: number; message: string }
type AuditResult = { url: string; score: number; grade: string; title: string; items: AuditItem[] }

export default function ExistingPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const [auditUrl, setAuditUrl] = useState('')
  const [auditing, setAuditing] = useState(false)
  const [auditError, setAuditError] = useState('')
  const [audit, setAudit] = useState<AuditResult | null>(null)

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuditing(true)
    setAuditError('')
    setAudit(null)
    try {
      const res = await fetch('/api/onboard/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: auditUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAuditError(data.error || '診断に失敗しました')
      } else {
        setAudit(data)
      }
    } catch {
      setAuditError('診断に失敗しました。時間をおいて再度お試しください。')
    } finally {
      setAuditing(false)
    }
  }

  const gradeColor = (g: string) =>
    g === 'S' ? '#10b981' : g === 'A' ? '#22c55e' : g === 'B' ? '#6366f1' : g === 'C' ? '#f59e0b' : '#ef4444'

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

        {/* サイト診断 */}
        <div style={{
          background: '#fff', borderRadius: 20, padding: 'clamp(28px, 4vw, 40px)',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
          marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
            無料サイト診断
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
            URLを入力するだけで、現在のサイトを100点満点で採点します。
          </p>

          <form onSubmit={handleAudit} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              value={auditUrl}
              onChange={e => setAuditUrl(e.target.value)}
              required
              placeholder="https://your-site.com"
              style={{
                flex: 1, padding: '11px 14px', borderRadius: 8,
                border: '1.5px solid #e5e7eb', fontSize: 14,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            <button
              type="submit"
              disabled={auditing || !auditUrl}
              style={{
                padding: '11px 18px', borderRadius: 8, border: 'none',
                background: auditing || !auditUrl ? '#e5e7eb' : '#6366f1',
                color: auditing || !auditUrl ? '#9ca3af' : '#fff',
                fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap',
                cursor: auditing || !auditUrl ? 'not-allowed' : 'pointer',
              }}
            >
              {auditing ? '診断中…' : '診断する'}
            </button>
          </form>

          {auditError && (
            <p style={{ fontSize: 13, color: '#ef4444', marginTop: 4 }}>{auditError}</p>
          )}

          {audit && (
            <div style={{ marginTop: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 20,
                padding: '20px 24px', borderRadius: 14,
                background: 'linear-gradient(135deg, #f5f3ff, #eef2ff)',
                border: '1px solid #e0e7ff', marginBottom: 20,
              }}>
                <div style={{
                  width: 84, height: 84, borderRadius: '50%',
                  background: '#fff', border: `4px solid ${gradeColor(audit.grade)}`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                    {audit.score}
                  </div>
                  <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>/ 100</div>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    display: 'inline-block', padding: '3px 12px', borderRadius: 100,
                    background: gradeColor(audit.grade), color: '#fff',
                    fontSize: 12, fontWeight: 700, marginBottom: 6,
                  }}>
                    評価 {audit.grade}
                  </div>
                  <div style={{
                    fontSize: 13, color: '#374151', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {audit.title || audit.url}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {audit.items.map(item => {
                  const ratio = item.score / item.max
                  const color = ratio >= 0.8 ? '#10b981' : ratio >= 0.5 ? '#f59e0b' : '#ef4444'
                  return (
                    <div key={item.key} style={{
                      border: '1px solid #e5e7eb', borderRadius: 10,
                      padding: '12px 14px',
                    }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: 6,
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                          {item.label}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color }}>
                          {item.score} / {item.max}
                        </span>
                      </div>
                      <div style={{
                        height: 4, background: '#f3f4f6', borderRadius: 2,
                        overflow: 'hidden', marginBottom: 6,
                      }}>
                        <div style={{
                          width: `${ratio * 100}%`, height: '100%', background: color,
                        }} />
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
                        {item.message}
                      </div>
                    </div>
                  )
                })}
              </div>

              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 14, lineHeight: 1.6 }}>
                ※ HTMLの公開情報のみを元にした簡易診断です。詳しい改善提案はお問い合わせください。
              </p>

              {audit.score < 95 && (
                <Link href="/onboard/create" style={{ textDecoration: 'none' }}>
                  <div style={{
                    marginTop: 20, padding: '20px 22px', borderRadius: 14,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
                  }}>
                    <div style={{ minWidth: 0, color: '#fff' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.9, marginBottom: 4 }}>
                        webseiseiでサイトを作り直すと
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.4 }}>
                        {audit.score}点 → <span style={{ fontSize: 24 }}>約95点</span> にアップ
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>
                        5分・無料で試せます
                      </div>
                    </div>
                    <span style={{ fontSize: 22, color: '#fff', flexShrink: 0 }}>→</span>
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* プロに無料相談（診断後に表示） */}
        <div style={{
          background: '#fff', borderRadius: 20, padding: 'clamp(28px, 4vw, 40px)',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
          display: audit ? 'block' : 'none',
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
                プロに無料相談する
              </h2>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
                現在のサイトの状況をお聞かせください。専門スタッフがご返信します。
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

      </div>
    </div>
  )
}
