'use client'

import { useState, useCallback, useEffect } from 'react'
import { SiteTemplate } from '@/components/editor/SiteTemplate'
import { TemplateSelectorPanel } from '@/components/editor/TemplateSelectorPanel'
import type { SiteTemplate as SiteTheme } from '@/components/editor/TemplateSelectorPanel'
import { SeiSeiChat } from '@/components/editor/SeiSeiChat'
import type { SiteContent } from '@/lib/ai-site/types'

// ── プラン選択モーダル ─────────────────────────────────────────────────────────

function PlanModal({
  onClose,
  onSelectMonthly,
  onSelectReview,
  onSelectCustom,
}: {
  onClose: () => void
  onSelectMonthly: () => void
  onSelectReview: () => void
  onSelectCustom: () => void
}) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#f9fafb', borderRadius: 24, padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 40px)', maxWidth: 1040, width: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: '#e5e7eb', border: 'none', borderRadius: 100,
          width: 32, height: 32, cursor: 'pointer',
          fontSize: 16, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>

        <h2 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800, color: '#111827', marginBottom: 8, letterSpacing: '-0.6px', textAlign: 'center' }}>
          サイトを公開しましょう
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 36, textAlign: 'center' }}>
          今日申し込みで初月無料。いつでも解約できます。
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 28 }}>

          {/* Plan 1: 月額プラン */}
          <div style={{
            background: '#fff', borderRadius: 20, padding: 28,
            border: '2px solid #6366f1',
            display: 'flex', flexDirection: 'column', gap: 12,
            position: 'relative',
          }}>
            <span style={{
              position: 'absolute', top: -12, left: 20,
              background: '#6366f1', color: '#fff',
              fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 100,
              letterSpacing: '0.5px',
            }}>🎉 初月無料</span>

            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 8 }}>サイト公開・運用プラン</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: '#111827', letterSpacing: '-1px' }}>¥2,980</span>
                <span style={{ fontSize: 14, color: '#6b7280' }}>/月（税込）</span>
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>年間 ¥35,760（一括払い）</p>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'AIが生成したサイトをそのまま公開',
                'テキスト・写真をいつでも編集',
                '問い合わせフォーム付き',
                '問い合わせをメールで即時通知',
                'AIによる自動返信メール',
                'SSL・サーバー代込み',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                  <span style={{ color: '#6366f1', fontWeight: 700 }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <button
              onClick={onSelectMonthly}
              style={{
                marginTop: 'auto', padding: '14px', borderRadius: 10, border: 'none',
                background: '#6366f1', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}
            >
              申し込む →
            </button>
          </div>

          {/* Plan 2: プロ確認（おすすめ） */}
          <div style={{
            background: '#fff', borderRadius: 20, padding: 28,
            border: '2px solid #f59e0b',
            display: 'flex', flexDirection: 'column', gap: 12,
            position: 'relative',
          }}>
            <span style={{
              position: 'absolute', top: -12, left: 20,
              background: '#f59e0b', color: '#fff',
              fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 100,
              letterSpacing: '0.5px',
            }}>⭐ おすすめ</span>

            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 8 }}>プロ確認オプション</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: '#111827', letterSpacing: '-1px' }}>¥50,000</span>
                <span style={{ fontSize: 14, color: '#6b7280' }}>（一括）</span>
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>2名ダブルチェックは ¥100,000</p>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                '月額プランの内容すべて込み',
                '現役エンジニアによる技術確認',
                'フォーム・メール動作確認',
                '独自ドメイン設定（1年分含む）',
                '1年間サポート保証',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <button
              onClick={onSelectReview}
              style={{
                marginTop: 'auto', padding: '14px', borderRadius: 10, border: 'none',
                background: '#f59e0b', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}
            >
              プロに依頼する →
            </button>
          </div>

          {/* Plan 3: 完全オーダーメイド */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', borderRadius: 20, padding: 28,
            border: '2px solid #4338ca',
            display: 'flex', flexDirection: 'column', gap: 12,
            position: 'relative',
          }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>完全オーダーメイド</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>¥500,000</span>
                <span style={{ fontSize: 14, color: '#a5b4fc' }}>〜（一括）</span>
              </div>
              <p style={{ fontSize: 12, color: '#818cf8', marginTop: 4 }}>要件・規模により個別お見積り</p>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'プロ確認プランの内容すべて込み',
                'サイト設計・構成からお任せ',
                'AIチャット機能をサイト内に実装',
                '予約・決済など独自機能の設計',
                '専任担当による伴走サポート',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#e0e7ff' }}>
                  <span style={{ color: '#818cf8', fontWeight: 700 }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <button
              onClick={onSelectCustom}
              style={{
                marginTop: 'auto', padding: '14px', borderRadius: 10, border: '1.5px solid #6366f1',
                background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}
            >
              相談する（無料） →
            </button>
          </div>
        </div>

        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', lineHeight: 1.7 }}>
          ※ 申し込み後、担当よりメールにてご案内します。いつでもキャンセル可能です。
        </p>
      </div>
    </div>
  )
}

// ── レビュアー選択モーダル ────────────────────────────────────────────────────

function ReviewerModal({
  onClose,
  onSelectReviewer,
}: {
  onClose: () => void
  onSelectReviewer: (reviewer: string) => void
}) {
  const reviewers = [
    {
      id: 'tanaka',
      name: '田中 健太',
      note: '※プレースホルダー',
      role: 'フロントエンドエンジニア',
      org: 'フリーランス・経験8年',
      specialty: 'UI/UX・表示速度・モバイル対応',
      price: '¥50,000',
      buttonLabel: 'このレビュアーに依頼する',
    },
    {
      id: 'reviewer_b',
      name: '（名前は後で設定）',
      note: '',
      role: 'エンジニア部長',
      org: 'GMOインターネットグループ',
      specialty: 'セキュリティ・システム品質',
      price: '¥50,000',
      buttonLabel: 'このレビュアーに依頼する',
    },
    {
      id: 'double',
      name: 'ダブルチェック',
      note: '',
      role: '両名によるW確認',
      org: 'より安心・確実なチェック',
      specialty: '',
      price: '¥100,000（2名分）',
      buttonLabel: '二人に依頼する',
    },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#f9fafb', borderRadius: 24, padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 40px)', maxWidth: 960, width: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: '#e5e7eb', border: 'none', borderRadius: 100,
          width: 32, height: 32, cursor: 'pointer',
          fontSize: 16, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>

        <h2 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800, color: '#111827', marginBottom: 8, letterSpacing: '-0.6px', textAlign: 'center' }}>
          レビュアーを選んでください
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 36, textAlign: 'center' }}>
          現役エンジニアが技術動作を確認し、お名前付きで承認します
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {reviewers.map(r => (
            <div key={r.id} style={{
              background: '#fff', borderRadius: 20, padding: 28,
              border: '1px solid #e5e7eb',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 2 }}>
                  {r.name}
                  {r.note && <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', marginLeft: 8 }}>{r.note}</span>}
                </h3>
                <p style={{ fontSize: 13, color: '#6366f1', fontWeight: 600 }}>{r.role}</p>
                <p style={{ fontSize: 12, color: '#6b7280' }}>{r.org}</p>
              </div>
              {r.specialty && (
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                  <span style={{ fontWeight: 700 }}>専門:</span> {r.specialty}
                </p>
              )}
              <p style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>{r.price}</p>
              <button
                onClick={() => onSelectReviewer(r.id)}
                style={{
                  marginTop: 'auto', padding: '12px', borderRadius: 10, border: 'none',
                  background: '#6366f1', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {r.buttonLabel}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 登録モーダル ───────────────────────────────────────────────────────────────

function RegisterModal({
  slug,
  onClose,
  plan,
  reviewer,
}: {
  slug: string
  onClose: () => void
  plan?: string
  reviewer?: string
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/onboard/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, name, email, plan, reviewer }),
    })

    if (res.ok) {
      window.location.href = '/dashboard'
    } else {
      const data = await res.json() as { error?: string }
      setError(data.error ?? 'エラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 24, padding: '40px 36px', maxWidth: 440, width: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 8, letterSpacing: '-0.5px' }}>
          このサイトをあなたのものにする
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 28 }}>
          お名前とメールアドレスを登録すると、サイトが公開され、いつでも編集・管理できるようになります。
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              お名前
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
              placeholder="山田 太郎"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8,
                border: '1px solid #d1d5db', fontSize: 14, outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8,
                border: '1px solid #d1d5db', fontSize: 14, outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#dc2626', background: '#fef2f2', padding: '10px 14px', borderRadius: 8 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 10, border: 'none',
              background: loading ? '#9ca3af' : '#6366f1',
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4,
            }}
          >
            {loading
              ? '送信中...'
              : plan === 'review'
              ? '登録してプロに依頼する →'
              : plan === 'custom'
              ? '登録して相談する（無料） →'
              : '申し込む（初月無料）→'}
          </button>
          <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
            パスワード不要。次回からメールアドレスだけでログインできます。
          </p>
        </form>
      </div>
    </div>
  )
}

// ── 使い方ガイドオーバーレイ ──────────────────────────────────────────────────

function UsageGuide({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        background: '#fff', borderRadius: 24,
        width: '90vw', maxWidth: 680, maxHeight: '85vh',
        padding: 'clamp(24px, 5vw, 56px)', textAlign: 'center',
        boxShadow: '0 32px 100px rgba(0,0,0,0.4)',
        animation: 'slideUp 0.35s ease',
        overflow: 'auto',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#111827', marginBottom: 8 }}>
          サイトが完成しました！
        </h2>
        <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 48, lineHeight: 1.6 }}>
          すべてのテキストは直接クリックして編集できます。<br />
          以下の機能をご活用ください。
        </p>

        <div className="usage-guide-grid">
          {[
            { icon: '✏️', title: 'テキスト編集', desc: '各テキストをクリックするとそのまま編集できます' },
            { icon: '🗑️', title: '項目の削除', desc: '各カードの右上の ✕ ボタンで項目を削除できます' },
            { icon: '📷', title: '写真を追加', desc: '「事務所紹介」の写真エリアをクリックして写真をアップロードできます' },
          ].map(item => (
            <div key={item.title} style={{
              background: '#f9fafb', borderRadius: 16, padding: '28px 20px',
              border: '1px solid #e5e7eb',
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            background: '#6366f1', color: '#fff', fontWeight: 700,
            fontSize: 16, padding: '14px 40px', borderRadius: 100, border: 'none',
            cursor: 'pointer', letterSpacing: '-0.3px',
            boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
          }}
        >
          編集を始める →
        </button>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  )
}

// ── PreviewClient ──────────────────────────────────────────────────────────────

interface Props {
  slug: string
  firmName: string
  prefecture: string
  initialContent: SiteContent
}

export function PreviewClient({ slug, firmName, prefecture, initialContent }: Props) {
  const [content, setContent] = useState<SiteContent>(initialContent)
  const [history, setHistory] = useState<SiteContent[]>([initialContent])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showReviewerModal, setShowReviewerModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'review' | 'custom' | null>(null)
  const [selectedReviewer, setSelectedReviewer] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [viewport, setViewport] = useState<'pc' | 'iphone'>('pc')
  const [showTemplatePanel, setShowTemplatePanel] = useState(false)
  const [activeTheme, setActiveTheme] = useState<SiteTheme | undefined>(undefined)
  const [showChat, setShowChat] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    const key = `guide_shown_${slug}`
    if (!localStorage.getItem(key)) {
      setShowGuide(true)
      localStorage.setItem(key, '1')
    }
  }, [slug])

  const saveToDb = useCallback(async (c: SiteContent) => {
    setSaving(true)
    try {
      await fetch(`/api/editor/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteContent: c }),
      })
      setSavedAt(Date.now())
    } catch {
      // next edit will retry
    } finally {
      setSaving(false)
    }
  }, [slug])

  const handleUpdate = useCallback(async (c: SiteContent) => {
    setContent(c)
    setHistory(prev => [...prev.slice(0, historyIndex + 1), c])
    setHistoryIndex(prev => prev + 1)
    await saveToDb(c)
  }, [historyIndex, saveToDb])

  const undo = useCallback(async () => {
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)
    setContent(history[newIndex])
    await saveToDb(history[newIndex])
  }, [history, historyIndex, saveToDb])

  const redo = useCallback(async () => {
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    setContent(history[newIndex])
    await saveToDb(history[newIndex])
  }, [history, historyIndex, saveToDb])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      // Undo: Cmd+Z (Mac) / Ctrl+Z (Windows)
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return }
      // Redo: Cmd+Shift+Z (Mac) / Ctrl+Shift+Z / Ctrl+Y (Windows)
      if (e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); return }
      if (e.key === 'y' && e.ctrlKey && !e.metaKey) { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  const handleReset = useCallback(async () => {
    if (!confirm('編集内容を破棄して、AIが生成した最初の状態に戻しますか？')) return
    setResetting(true)
    setContent(initialContent)
    try {
      await fetch(`/api/editor/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteContent: initialContent }),
      })
    } catch { /* ignore */ }
    finally { setResetting(false) }
  }, [slug, initialContent])

  // 保存後2秒だけ「保存しました」表示
  const showSaved = savedAt !== null && Date.now() - savedAt < 2500

  return (
    <>
      {/* ── 使い方ガイド ── */}
      {showGuide && <UsageGuide onClose={() => setShowGuide(false)} />}

      {/* ── 上部バー（固定） ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(17,24,39,0.97)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 52,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* 左 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            background: '#fbbf24', color: '#1f2937', fontSize: 10, fontWeight: 800,
            padding: '3px 10px', borderRadius: 100, letterSpacing: '0.5px',
          }}>
            PREVIEW
          </span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', display: 'none' }} className="sm:inline">
            {firmName}
          </span>
          {saving && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>保存中…</span>
          )}
          {!saving && showSaved && (
            <span style={{ fontSize: 11, color: '#34d399' }}>✓ 保存しました</span>
          )}
          {!saving && !showSaved && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>テキストをクリックして編集</span>
          )}
        </div>

        {/* 右 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* テンプレートボタン */}
          <button
            onClick={() => setShowTemplatePanel(true)}
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.7)', fontSize: 12,
              padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
              display: isMobile ? 'none' : undefined,
            }}
          >
            🎨 デザイン
          </button>

          {/* AIチャットボタン */}
          {!isMobile && (
          <button
            onClick={() => setShowChat(v => !v)}
            style={{
              background: showChat ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.07)',
              border: `1px solid ${showChat ? 'rgba(96,165,250,0.5)' : 'rgba(255,255,255,0.15)'}`,
              color: showChat ? '#93c5fd' : 'rgba(255,255,255,0.7)', fontSize: 12,
              padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
            }}
          >
            💬 AIチャット
          </button>
          )}

          {/* リセットボタン */}
          <button
            onClick={handleReset}
            disabled={resetting}
            className="preview-btn-secondary"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.5)', fontSize: 12,
              padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
            }}
          >
            {resetting ? '戻しています…' : '↺ リセット'}
          </button>

          {/* ビューポート切替（PCのみ） */}
          {!isMobile && <div className="preview-viewport-toggle" style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, overflow: 'hidden' }}>
            <button
              onClick={() => setViewport('pc')}
              style={{
                padding: '6px 12px', fontSize: 12, border: 'none', cursor: 'pointer',
                background: viewport === 'pc' ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: viewport === 'pc' ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            >
              💻 PC
            </button>
            <button
              onClick={() => setViewport('iphone')}
              style={{
                padding: '6px 12px', fontSize: 12, border: 'none', cursor: 'pointer',
                background: viewport === 'iphone' ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: viewport === 'iphone' ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            >
              📱 スマホ
            </button>
          </div>}


          {/* 公開ボタン */}
          <button
            onClick={() => setShowPlanModal(true)}
            style={{
              background: '#6366f1', color: '#fff', fontWeight: 700,
              fontSize: 13, padding: '7px 18px', borderRadius: 8, border: 'none',
              cursor: 'pointer', letterSpacing: '-0.2px',
            }}
          >
            サイトを公開する →
          </button>
        </div>
      </div>

      {/* ── サイト本体 ── */}
      <div style={{ paddingTop: 52, background: (!isMobile && viewport === 'iphone') ? '#f3f4f6' : '#fff', minHeight: '100vh' }}>
        {(!isMobile && viewport === 'iphone') ? (
          /* スマホフレーム：実機サイズ固定 + 内部スクロール */
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0 48px' }}>
            <div style={{
              width: 390,
              height: 844,
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
              borderRadius: 44,
              border: '8px solid #1a1a1a',
              overflow: 'hidden',
              position: 'relative',
              flexShrink: 0,
            }}>
              {/* ノッチ */}
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: 120, height: 28, background: '#1a1a1a', borderRadius: '0 0 18px 18px',
                zIndex: 10,
              }} />
              {/* スクロール可能なコンテンツ領域 */}
              <div
                className="phone-frame"
                style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}
              >
                <SiteTemplate
                  firmName={firmName}
                  prefecture={prefecture}
                  siteSlug={slug}
                  content={content}
                  editable
                  onUpdate={handleUpdate}
                  theme={activeTheme}
                />
              </div>
            </div>
          </div>
        ) : (
          <SiteTemplate
            firmName={firmName}
            prefecture={prefecture}
            siteSlug={slug}
            content={content}
            editable
            onUpdate={handleUpdate}
            theme={activeTheme}
          />
        )}
      </div>


      {/* ── プラン選択モーダル ── */}
      {showPlanModal && (
        <PlanModal
          onClose={() => setShowPlanModal(false)}
          onSelectMonthly={() => {
            setSelectedPlan('monthly')
            setSelectedReviewer(null)
            setShowPlanModal(false)
            setShowRegisterModal(true)
          }}
          onSelectReview={() => {
            setSelectedPlan('review')
            setShowPlanModal(false)
            setShowReviewerModal(true)
          }}
          onSelectCustom={() => {
            setSelectedPlan('custom')
            setSelectedReviewer(null)
            setShowPlanModal(false)
            setShowRegisterModal(true)
          }}
        />
      )}

      {/* ── レビュアー選択モーダル ── */}
      {showReviewerModal && (
        <ReviewerModal
          onClose={() => setShowReviewerModal(false)}
          onSelectReviewer={(reviewer) => {
            setSelectedReviewer(reviewer)
            setShowReviewerModal(false)
            setShowRegisterModal(true)
          }}
        />
      )}

      {/* ── 登録モーダル ── */}
      {showRegisterModal && (
        <RegisterModal
          slug={slug}
          onClose={() => setShowRegisterModal(false)}
          plan={selectedPlan ?? undefined}
          reviewer={selectedReviewer ?? undefined}
        />
      )}

      {/* ── せいせい君チャット ── */}
      <SeiSeiChat
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        slug={slug}
      />

      {/* ── テンプレートパネル ── */}
      <TemplateSelectorPanel
        isOpen={showTemplatePanel}
        onClose={() => setShowTemplatePanel(false)}
        currentTemplateId={activeTheme?.id}
        onApply={(t) => { setActiveTheme(t) }}
      />

      {/* ── 生成完了トースト ── */}
      {showToast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, background: '#1e1b4b', color: '#fff',
          borderRadius: 16, padding: '20px 28px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: 20,
          maxWidth: 480, width: 'calc(100% - 48px)',
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
              ✨ サイトを生成しました！
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
              テキストを直接クリックして修正できます。準備ができたら「サイトを公開する」を押してください。
            </p>
          </div>
          <button
            onClick={() => setShowToast(false)}
            style={{
              background: '#6366f1', color: '#fff', fontWeight: 700,
              fontSize: 13, padding: '8px 16px', borderRadius: 8,
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            編集を始める
          </button>
        </div>
      )}
    </>
  )
}
