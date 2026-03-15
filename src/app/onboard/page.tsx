'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function OnboardPage() {
  const router = useRouter()
  const [showExplanation, setShowExplanation] = useState(false)

  if (showExplanation) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(150deg, #eef2ff 0%, #f0fdf4 50%, #fdf4ff 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', fontFamily: "'Inter','Helvetica Neue',Arial,'Hiragino Sans',sans-serif",
      }}>
        <div style={{ width: '100%', maxWidth: 560 }}>

          {/* 戻る */}
          <div style={{ marginBottom: 32 }}>
            <button
              onClick={() => setShowExplanation(false)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: '#6b7280', background: 'none', border: 'none',
                cursor: 'pointer', padding: 0,
              }}
            >
              ← 戻る
            </button>
          </div>

          <h2 style={{
            fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800,
            color: '#1e1b4b', letterSpacing: '-1px', lineHeight: 1.3, marginBottom: 24,
          }}>
            ウェブサイトを持つのに<br />必要なもの3つ
          </h2>

          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, marginBottom: 36 }}>
            インターネット上にサイトを公開するには、<strong style={{ color: '#374151' }}>ドメイン（サイトのアドレス）</strong>・<strong style={{ color: '#374151' }}>サーバー（データの置き場所）</strong>・<strong style={{ color: '#374151' }}>表示されるページ</strong>の3つが必要です。<br /><br />
            通常は業者に依頼するか、それぞれ別々に契約・設定する必要がありますが、このサービスを使えば<strong style={{ color: '#374151' }}>未経験の方でも一括で設定・公開まで完結</strong>できます。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
            {[
              { icon: '🌐', label: 'ドメイン', desc: 'サイトのアドレス（例: tanaka-office.com）' },
              { icon: '🖥️', label: 'サーバー', desc: 'サイトのデータを24時間公開し続ける場所' },
              { icon: '✨', label: '表示されるページ', desc: 'AIが5分でプロ品質のデザインを自動生成' },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: '#fff', borderRadius: 14, padding: '16px 20px',
                border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{item.label}</p>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/onboard/questions')}
            style={{
              width: '100%', background: '#6366f1', color: '#fff', fontWeight: 700,
              fontSize: 16, padding: '16px', borderRadius: 100,
              border: 'none', cursor: 'pointer', letterSpacing: '-0.3px',
              boxShadow: '0 4px 28px rgba(99,102,241,0.35)',
            }}
          >
            無料でサイトを作る →
          </button>

        </div>
      </div>
    )
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

        {/* 選択カード */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>

          {/* 持っていない */}
          <button
            onClick={() => setShowExplanation(true)}
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

      </div>
    </div>
  )
}
