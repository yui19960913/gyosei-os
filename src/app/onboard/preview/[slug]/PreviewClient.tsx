'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SiteTemplate } from '@/components/editor/SiteTemplate'
import type { SiteContent } from '@/lib/ai-site/types'

// ── Pro アップセルモーダル ─────────────────────────────────────────────────────

function ProModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 24, padding: '48px 40px', maxWidth: 480, width: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 20, right: 20,
          background: '#f3f4f6', border: 'none', borderRadius: 100,
          width: 32, height: 32, cursor: 'pointer',
          fontSize: 16, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>

        {/* Proバッジ */}
        <div style={{ marginBottom: 20 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: '1px',
            padding: '5px 14px', borderRadius: 100,
          }}>
            ✦ PRO プラン
          </span>
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.8px', color: '#111827', marginBottom: 12 }}>
          より詳しく修正する
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 32 }}>
          Proプランでは、テキスト編集に加えて、画像・レイアウト・デザインを自由に変更できるフルエディタをご利用いただけます。
        </p>

        {/* 機能リスト */}
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            '画像のアップロード・配置',
            'テキスト・ブロックの自由移動',
            'フォントサイズ・色のカスタマイズ',
            '独自ドメインの設定',
            '問い合わせ管理ダッシュボード',
          ].map((feat) => (
            <li key={feat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: '#6366f1', fontWeight: 700, flexShrink: 0,
              }}>✓</span>
              <span style={{ fontSize: 14, color: '#374151' }}>{feat}</span>
            </li>
          ))}
        </ul>

        <button
          style={{
            width: '100%', padding: '16px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            letterSpacing: '-0.3px', boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
            marginBottom: 12,
          }}
          onClick={() => {
            // TODO: 決済フロー or 問い合わせへ
            alert('準備中です。お問い合わせよりご連絡ください。')
          }}
        >
          Proプランを始める
        </button>
        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
          まずは現在のプレビューページでテキスト編集をお試しください
        </p>
      </div>
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
  const router = useRouter()
  const [content, setContent] = useState<SiteContent>(initialContent)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [showProModal, setShowProModal] = useState(false)

  const handleUpdate = useCallback(async (c: SiteContent) => {
    setContent(c)
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

  const handlePublish = useCallback(async () => {
    setPublishing(true)
    try {
      const res = await fetch(`/api/dashboard/${slug}/publish`, { method: 'POST' })
      if (res.ok) {
        router.push(`/site/${slug}`)
      } else {
        alert('公開に失敗しました。もう一度お試しください。')
      }
    } catch {
      alert('公開に失敗しました。')
    } finally {
      setPublishing(false)
    }
  }, [slug, router])

  // 保存後2秒だけ「保存しました」表示
  const showSaved = savedAt !== null && Date.now() - savedAt < 2500

  return (
    <>
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
          {/* Pro ボタン */}
          <button
            onClick={() => setShowProModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
              border: '1px solid rgba(99,102,241,0.4)',
              color: '#a5b4fc', fontSize: 12, fontWeight: 700,
              padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
              letterSpacing: '0.2px',
            }}
          >
            <span style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 6px',
              borderRadius: 4, letterSpacing: '0.5px',
            }}>PRO</span>
            より詳しく修正する
          </button>

          {/* 公開ボタン */}
          <button
            onClick={handlePublish}
            disabled={publishing}
            style={{
              background: '#6366f1', color: '#fff', fontWeight: 700,
              fontSize: 13, padding: '7px 18px', borderRadius: 8, border: 'none',
              cursor: publishing ? 'not-allowed' : 'pointer',
              opacity: publishing ? 0.7 : 1,
              letterSpacing: '-0.2px',
            }}
          >
            {publishing ? '公開中…' : 'サイトを公開する →'}
          </button>
        </div>
      </div>

      {/* ── サイト本体 ── */}
      <div style={{ paddingTop: 52 }}>
        <SiteTemplate
          firmName={firmName}
          prefecture={prefecture}
          siteSlug={slug}
          content={content}
          editable
          onUpdate={handleUpdate}
        />
      </div>

      {/* ── Proモーダル ── */}
      {showProModal && <ProModal onClose={() => setShowProModal(false)} />}
    </>
  )
}
