'use client'

import { useRouter } from 'next/navigation'

const FEATURES = [
  {
    icon: '🤝',
    reason: '未経験でも安心のウィザード形式',
    result: '質問に答えるだけで雛形を自動生成。後から自由に編集。',
  },
  {
    icon: '✅',
    reason: 'WEB業界経験者×現役行政書士監修',
    result: '制作会社に頼まなくても、プロ品質で行政書士特化。',
  },
  {
    icon: '🚀',
    reason: '表示が速く、セキュリティに強い設計',
    result: 'サイト訪問者を待たせず、顧客情報をしっかり守る。',
  },
]

export default function OnboardCreatePage() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(150deg, #eef2ff 0%, #f0fdf4 50%, #fdf4ff 100%)',
      fontFamily: "'Inter','Helvetica Neue',Arial,'Hiragino Sans',sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>
      {/* 戻る */}
      <div style={{ padding: '20px 32px' }}>
        <button
          onClick={() => router.push('/onboard')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: '#6b7280', background: 'none', border: 'none',
            cursor: 'pointer', padding: 0,
          }}
        >
          ← 戻る
        </button>
      </div>

      <div style={{
        flex: 1,
        maxWidth: 900, margin: '0 auto', padding: '0 32px 32px',
        width: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        gap: 32,
      }}>

        {/* 上部: バッジ・ヘッドライン・サブコピー */}
        <div style={{ textAlign: 'center' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
            padding: '6px 16px', borderRadius: 100,
            fontSize: 12, fontWeight: 700, color: '#6366f1', letterSpacing: '0.5px',
            marginBottom: 20,
          }}>
            AI集客OS for 行政書士
          </span>

          <h1 style={{
            fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800,
            color: '#1e1b4b', letterSpacing: '-1.5px', lineHeight: 1.15, marginBottom: 16,
          }}>
            行政書士専用。はじめてのサイト制作から<br />公開・運用まで伴走。
          </h1>

          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8 }}>
            あなたの情報を入力するだけ。AIがサイトの構成・文章・デザインを自動生成。<br />
            仕上げは自分の手で、あなただけのサイトに。
          </p>
        </div>

        {/* 特徴カード 3列（スマホは1列） */}
        <style>{`
          @media (max-width: 640px) {
            .feature-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <div className="feature-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 16,
        }}>
          {FEATURES.map((f) => (
            <div key={f.reason} style={{
              background: '#fff',
              borderRadius: 16,
              padding: '20px 22px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
              <span style={{ fontSize: 28, lineHeight: 1, display: 'block', marginBottom: 12 }}>{f.icon}</span>
              <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8, lineHeight: 1.5 }}>
                {f.reason}
              </p>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px', lineHeight: 1.6 }}>
                {f.result}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => router.push('/onboard/questions')}
            style={{
              background: '#6366f1', color: '#fff', fontWeight: 700,
              fontSize: 16, padding: '16px 40px', borderRadius: 100,
              border: 'none', cursor: 'pointer', letterSpacing: '-0.3px',
              boxShadow: '0 4px 28px rgba(99,102,241,0.35)',
              display: 'inline-block',
            }}
          >
            無料でサイトを作る →
          </button>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 12 }}>
            初月無料・いつでも解約OK・約5分で完成
          </p>
        </div>

      </div>
    </div>
  )
}
