'use client'

import { useRouter } from 'next/navigation'

export default function OnboardPage() {
  const router = useRouter()

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
            onClick={() => router.push('/onboard/questions')}
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
