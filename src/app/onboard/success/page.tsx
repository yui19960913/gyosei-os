'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const params = useSearchParams()
  const slug = params.get('slug')

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: "'Inter','Helvetica Neue',Arial,'Hiragino Sans',sans-serif",
    }}>
      <div style={{
        background: '#fff', borderRadius: 20,
        padding: 'clamp(40px, 5vw, 56px) clamp(28px, 5vw, 48px)',
        maxWidth: 480, width: '100%',
        boxShadow: '0 2px 24px rgba(0,0,0,0.06)',
        border: '1px solid #e5e7eb',
      }}>
        {/* チェックマーク */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24, fontSize: 20,
        }}>
          ✓
        </div>

        <h1 style={{
          fontSize: 22, fontWeight: 700,
          color: '#111827', letterSpacing: '-0.5px', lineHeight: 1.3, marginBottom: 10,
        }}>
          お申し込みが完了しました
        </h1>

        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, marginBottom: 32 }}>
          ご契約ありがとうございます。<br />
          管理画面からサイトの内容を確認し、準備ができたら公開してください。
        </p>

        {/* ステップ */}
        <div style={{
          background: '#f9fafb', borderRadius: 12, padding: '20px 24px',
          marginBottom: 28, border: '1px solid #f3f4f6',
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 14, letterSpacing: '0.5px', textTransform: 'uppercase' as const }}>次のステップ</p>
          {[
            { num: '1', text: '管理画面でサイトを確認する' },
            { num: '2', text: '問題なければ「公開する」ボタンを押す' },
          ].map(item => (
            <div key={item.num} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
              <span style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: '#6366f1', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
              }}>{item.num}</span>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginTop: 1 }}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* 管理画面ボタン */}
        <a
          href={slug ? `/dashboard/${slug}` : '/dashboard'}
          style={{
            display: 'block', width: '100%', padding: '13px',
            borderRadius: 10, background: '#6366f1',
            color: '#fff', fontSize: 14, fontWeight: 700,
            textDecoration: 'none', textAlign: 'center',
            letterSpacing: '-0.2px', boxSizing: 'border-box' as const,
          }}
        >
          管理画面へ →
        </a>

        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 14, textAlign: 'center', lineHeight: 1.6 }}>
          領収書はご登録のメールアドレスに届きます
        </p>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
