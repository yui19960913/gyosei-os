'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Choice = 'has-site' | 'no-site' | null

export default function OnboardWelcomePage() {
  const router = useRouter()
  const [choice, setChoice] = useState<Choice>(null)

  const handleNext = () => {
    if (choice === 'no-site') router.push('/onboard/questions')
    if (choice === 'has-site') router.push('/onboard/existing')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(150deg, #eef2ff 0%, #f0fdf4 50%, #fdf4ff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Inter','Helvetica Neue',Arial,'Hiragino Sans',sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 640 }}>

        {/* ロゴ */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
            padding: '6px 16px', borderRadius: 100, marginBottom: 32,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', letterSpacing: '0.3px' }}>AI集客OS</span>
            <span style={{ fontSize: 11, color: '#a5b4fc' }}>for 士業</span>
          </div>

          <h1 style={{
            fontSize: 36, fontWeight: 800, color: '#1e1b4b',
            letterSpacing: '-1.5px', lineHeight: 1.15, marginBottom: 16,
          }}>
            ようこそ。<br />まず教えてください。
          </h1>
          <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>
            すでに事務所サイトをお持ちですか？
          </p>
        </div>

        {/* 選択カード */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          {/* サイトなし */}
          <button
            onClick={() => setChoice('no-site')}
            style={{
              background: choice === 'no-site' ? '#6366f1' : '#fff',
              border: choice === 'no-site' ? '2px solid #6366f1' : '2px solid #e5e7eb',
              borderRadius: 20, padding: '32px 24px', cursor: 'pointer',
              textAlign: 'left', transition: 'all 0.15s',
              boxShadow: choice === 'no-site'
                ? '0 8px 32px rgba(99,102,241,0.25)'
                : '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 16 }}>✨</div>
            <div style={{
              fontSize: 16, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.3px',
              color: choice === 'no-site' ? '#fff' : '#1e1b4b',
            }}>
              サイトがない
            </div>
            <div style={{
              fontSize: 13, lineHeight: 1.6,
              color: choice === 'no-site' ? 'rgba(255,255,255,0.75)' : '#6b7280',
            }}>
              AIがあなたの事務所専用サイトを約1分で自動生成します
            </div>
            {choice === 'no-site' && (
              <div style={{
                marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 700, color: '#fff',
                background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 100,
              }}>
                ✓ 選択中
              </div>
            )}
          </button>

          {/* サイトあり */}
          <button
            onClick={() => setChoice('has-site')}
            style={{
              background: choice === 'has-site' ? '#6366f1' : '#fff',
              border: choice === 'has-site' ? '2px solid #6366f1' : '2px solid #e5e7eb',
              borderRadius: 20, padding: '32px 24px', cursor: 'pointer',
              textAlign: 'left', transition: 'all 0.15s',
              boxShadow: choice === 'has-site'
                ? '0 8px 32px rgba(99,102,241,0.25)'
                : '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 16 }}>🌐</div>
            <div style={{
              fontSize: 16, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.3px',
              color: choice === 'has-site' ? '#fff' : '#1e1b4b',
            }}>
              すでにサイトがある
            </div>
            <div style={{
              fontSize: 13, lineHeight: 1.6,
              color: choice === 'has-site' ? 'rgba(255,255,255,0.75)' : '#6b7280',
            }}>
              既存サイトと連携して集客・分析・広告を一元管理します
            </div>
            {choice === 'has-site' && (
              <div style={{
                marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 700, color: '#fff',
                background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 100,
              }}>
                ✓ 選択中
              </div>
            )}
          </button>
        </div>

        {/* 次へボタン */}
        <button
          onClick={handleNext}
          disabled={!choice}
          style={{
            width: '100%', padding: '16px', borderRadius: 100,
            fontSize: 16, fontWeight: 700, cursor: choice ? 'pointer' : 'not-allowed',
            border: 'none', transition: 'all 0.15s', letterSpacing: '-0.2px',
            background: choice ? '#6366f1' : '#e5e7eb',
            color: choice ? '#fff' : '#9ca3af',
            boxShadow: choice ? '0 4px 24px rgba(99,102,241,0.3)' : 'none',
          }}
        >
          {choice === 'no-site' && 'AIでサイトを生成する →'}
          {choice === 'has-site' && '既存サイトを連携する →'}
          {!choice && '選択してください'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 20 }}>
          無料・登録不要・約1分で完成
        </p>
      </div>
    </div>
  )
}
