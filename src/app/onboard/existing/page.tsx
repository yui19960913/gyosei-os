'use client'

import { useRouter } from 'next/navigation'

export default function OnboardExistingPage() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(150deg, #eef2ff 0%, #f0fdf4 50%, #fdf4ff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Inter','Helvetica Neue',Arial,'Hiragino Sans',sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* 戻る */}
        <button
          onClick={() => router.back()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: '#6b7280', background: 'none', border: 'none',
            cursor: 'pointer', marginBottom: 40, padding: 0,
          }}
        >
          ← 戻る
        </button>

        <div style={{
          background: '#fff', borderRadius: 24, padding: '48px 40px',
          boxShadow: '0 4px 40px rgba(99,102,241,0.08)',
        }}>
          <div style={{ fontSize: 44, marginBottom: 20 }}>🌐</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e1b4b', letterSpacing: '-1px', marginBottom: 12, lineHeight: 1.2 }}>
            既存サイトの連携
          </h1>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 40 }}>
            現在のサイトURLを登録することで、集客分析・広告管理・AIサポートを利用できます。
          </p>

          {/* URL 入力 */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
              サイトURL
            </label>
            <input
              type="url"
              placeholder="https://your-office.com"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none',
                boxSizing: 'border-box', color: '#1e1b4b',
                fontFamily: 'inherit',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#6366f1' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb' }}
            />
          </div>

          {/* 機能リスト */}
          <div style={{ background: '#f5f3ff', borderRadius: 16, padding: '20px 24px', marginBottom: 32 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', marginBottom: 12 }}>連携でできること</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['📊', '集客データの可視化・分析'],
                ['📣', '広告LPの自動生成・管理'],
                ['🤖', 'お問い合わせへのAI自動返信'],
                ['📈', '月次レポートの自動生成'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 準備中バナー */}
          <div style={{
            background: 'rgba(99,102,241,0.06)', border: '1.5px dashed #c7d2fe',
            borderRadius: 12, padding: '16px 20px', marginBottom: 28, textAlign: 'center',
          }}>
            <p style={{ fontSize: 13, color: '#6366f1', fontWeight: 600, margin: 0 }}>
              🚧 この機能は近日公開予定です
            </p>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>
              メールアドレスを登録しておくと、公開時にお知らせします
            </p>
          </div>

          <button
            onClick={() => router.push('/onboard/questions')}
            style={{
              width: '100%', padding: '14px', borderRadius: 100,
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              border: '1.5px solid #c7d2fe', background: '#fff',
              color: '#6366f1', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5f3ff' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
          >
            先にAIサイトを生成してみる →
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 20 }}>
          サイト生成も無料・登録不要で利用できます
        </p>
      </div>
    </div>
  )
}
