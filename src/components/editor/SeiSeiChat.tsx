'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AiAvatar } from '@/components/onboard/AiAvatar'

interface Message {
  role: 'sei' | 'user'
  text: string
}

const SUGGESTIONS = [
  'キャッチコピーを改善して',
  '事務所紹介文を書き直して',
  'よくある質問を追加して',
  '料金説明をわかりやすくして',
]

const FREE_LIMIT = 10
const PAID_PACK  = 20
const PACK_PRICE = '¥300'

// 残りクレジット → fat レベル（使うにつれ自然に痩せていく）
function calcFat(paidCredits: number): 0 | 1 | 2 | 3 {
  if (paidCredits >= 15) return 3
  if (paidCredits >= 8)  return 2
  if (paidCredits >= 1)  return 1
  return 0
}

const LS_COUNT = (slug: string) => `sei_chat_count_${slug}`
const LS_PAID  = (slug: string) => `sei_paid_credits_${slug}`

interface SeiSeiChatProps {
  isOpen: boolean
  onClose: () => void
  slug: string
  /** 有料プラン加入済みならtrue → 無料回数制限をスキップ、1分10回のレート制限のみ */
  isPaidPlan?: boolean
}

// ── コイン購入モーダル ────────────────────────────────────────────────
function CoinModal({
  fatLevel,
  onPurchase,
  onClose,
}: {
  fatLevel: 0 | 1 | 2 | 3
  onPurchase: () => void
  onClose: () => void
}) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      borderRadius: 20, padding: 24, textAlign: 'center',
    }}>
      <div style={{ marginBottom: 16 }}>
        <AiAvatar size={72} fat={fatLevel} />
      </div>
      <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6, lineHeight: 1.4 }}>
        せいせいくんがお腹ペコペコ…🪙
      </p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 24, lineHeight: 1.8 }}>
        無料分（{FREE_LIMIT}回）を使い切りました。<br />
        コインを食べさせると{PAID_PACK}回復活します！
      </p>

      <div style={{ fontSize: 40, marginBottom: 16, lineHeight: 1 }}>🪙🪙🪙</div>

      <button
        onClick={onPurchase}
        style={{
          background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
          color: '#1f2937', fontWeight: 800, fontSize: 15,
          padding: '12px 32px', borderRadius: 100, border: 'none',
          cursor: 'pointer', letterSpacing: '-0.3px',
          boxShadow: '0 4px 20px rgba(251,191,36,0.4)',
          marginBottom: 12,
        }}
      >
        コインをあげる → {PACK_PRICE} / {PAID_PACK}回
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ height: 1, width: 48, background: 'rgba(255,255,255,0.2)' }} />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>または</span>
        <div style={{ height: 1, width: 48, background: 'rgba(255,255,255,0.2)' }} />
      </div>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 12 }}>
        有料プランに申し込むと<br />
        <strong style={{ color: '#fbbf24' }}>せいせいくんが無制限</strong>で使えます
      </p>

      <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 12, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
        閉じる
      </button>
    </div>
  )
}

// ── 食べるアニメーション（無言でしれっと） ──────────────────────────
function EatingShow({ fatBefore, fatAfter, onDone }: {
  fatBefore: 0 | 1 | 2 | 3
  fatAfter: 0 | 1 | 2 | 3
  onDone: () => void
}) {
  const [step, setStep] = useState<'fly' | 'eat' | 'done'>('fly')

  useEffect(() => {
    const t1 = setTimeout(() => setStep('eat'),  700)
    const t2 = setTimeout(() => { setStep('done'); onDone() }, 2000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      borderRadius: 20,
    }}>
      <style>{`
        @keyframes coin-fly {
          0%   { transform: translateY(-70px) scale(1.3); opacity: 1; }
          85%  { transform: translateY(4px)   scale(0.5); opacity: 1; }
          100% { transform: translateY(4px)   scale(0);   opacity: 0; }
        }
        @keyframes sei-puff {
          0%   { transform: scale(1);    }
          45%  { transform: scale(1.15); }
          70%  { transform: scale(0.97); }
          100% { transform: scale(1);    }
        }
        .coin-fly  { animation: coin-fly 0.7s ease-in forwards; font-size: 36px; }
        .sei-puff  { animation: sei-puff 0.6s ease-out; }
      `}</style>

      {step === 'fly' && (
        <>
          <div className="coin-fly">🪙</div>
          <div style={{ marginTop: 8 }}>
            <AiAvatar size={72} fat={fatBefore} />
          </div>
        </>
      )}

      {(step === 'eat' || step === 'done') && (
        <div className={step === 'eat' ? 'sei-puff' : ''}>
          <AiAvatar size={72} eating={step === 'eat'} fat={fatAfter} />
        </div>
      )}
    </div>
  )
}

// ── メインコンポーネント ──────────────────────────────────────────────
export function SeiSeiChat({ isOpen, onClose, slug, isPaidPlan = false }: SeiSeiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'sei', text: 'こんにちは！AIアシスタントのせいせいです😊\nサイトのことでわからないことがあれば、なんでも気軽に聞いてくださいね。' },
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [chatCount, setChatCount]     = useState(0)
  const [paidCredits, setPaidCredits] = useState(0)
  const [showCoinModal, setShowCoinModal] = useState(false)
  const [showEating, setShowEating]       = useState(false)
  const [prevPaid, setPrevPaid]           = useState(0) // 食べる前のクレジット（fat計算用）

  // 有料プラン用: 1分間のタイムスタンプ記録（レート制限）
  const recentTimestamps = useRef<number[]>([])

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isPaidPlan) return // 有料プランはLocalStorageカウント不要
    const count = parseInt(localStorage.getItem(LS_COUNT(slug)) ?? '0', 10)
    const paid  = parseInt(localStorage.getItem(LS_PAID(slug))  ?? '0', 10)
    setChatCount(count)
    setPaidCredits(paid)
  }, [slug, isPaidPlan])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const remaining    = isPaidPlan ? Infinity : Math.max(0, FREE_LIMIT + paidCredits - chatCount)
  const isLimitReached = !isPaidPlan && remaining === 0
  const fatLevel     = isPaidPlan ? 3 : calcFat(paidCredits)

  async function handleSend(text?: string) {
    const msg = text ?? input
    if (!msg.trim() || loading) return
    if (isLimitReached) { setShowCoinModal(true); return }

    // 有料プラン: 1分10回レート制限
    if (isPaidPlan) {
      const now = Date.now()
      recentTimestamps.current = recentTimestamps.current.filter(t => now - t < 60_000)
      if (recentTimestamps.current.length >= 10) {
        setMessages(prev => [...prev, { role: 'sei', text: '1分間に送れるのは10件までです。少し待ってから試してください。' }])
        return
      }
      recentTimestamps.current.push(now)
    }

    setInput('')
    if (!isPaidPlan) {
      const newCount = chatCount + 1
      // 有料分を先に消費、なければ無料分
      const newPaid  = chatCount >= FREE_LIMIT ? Math.max(0, paidCredits - 1) : paidCredits
      setChatCount(newCount)
      setPaidCredits(newPaid)
      localStorage.setItem(LS_COUNT(slug), String(newCount))
      localStorage.setItem(LS_PAID(slug),  String(newPaid))
    }

    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)

    try {
      const res  = await fetch(`/api/editor/${slug}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json() as { reply?: string; error?: string }
      setMessages(prev => [...prev, {
        role: 'sei',
        text: data.reply ?? 'うまく答えられませんでした。もう一度試してみてください。',
      }])
    } catch {
      setMessages(prev => [...prev, { role: 'sei', text: 'エラーが発生しました。もう一度試してください。' }])
    } finally {
      setLoading(false)
    }
  }

  // TODO: Stripe連携に差し替える
  const handlePurchase = useCallback(() => {
    setPrevPaid(paidCredits)
    setShowCoinModal(false)
    setShowEating(true)
  }, [paidCredits])

  const handleEatingDone = useCallback(() => {
    const newPaid = paidCredits + PAID_PACK
    setPaidCredits(newPaid)
    localStorage.setItem(LS_PAID(slug), String(newPaid))
    setShowEating(false)
  }, [paidCredits, slug])

  if (!isOpen) return null

  const remainingColor = isPaidPlan ? '#34d399' : remaining > 5 ? '#34d399' : remaining > 2 ? '#fbbf24' : '#f87171'

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
      <div style={{
        position: 'fixed', bottom: 80, right: 24, zIndex: 70,
        width: 360, height: 520,
        background: '#fff', borderRadius: 20,
        boxShadow: '0 8px 48px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
      }}>

        {showEating && (
          <EatingShow
            fatBefore={calcFat(prevPaid)}
            fatAfter={calcFat(prevPaid + PAID_PACK)}
            onDone={handleEatingDone}
          />
        )}

        {showCoinModal && (
          <CoinModal
            fatLevel={fatLevel}
            onPurchase={handlePurchase}
            onClose={() => setShowCoinModal(false)}
          />
        )}

        {/* ヘッダー */}
        <div style={{
          background: '#1e40af', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <AiAvatar size={36} fat={fatLevel} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1 }}>せいせいくん</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>サイト編集アシスタント</p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 100, padding: '3px 10px',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ fontSize: 13 }}>🪙</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: remainingColor }}>
              {isPaidPlan ? '無制限' : remaining > 0 ? `残り${remaining}回` : '上限到達'}
            </span>
          </div>

          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8,
            width: 28, height: 28, color: '#fff', cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>✕</button>
        </div>

        {/* メッセージ */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              {m.role === 'sei' && <AiAvatar size={28} fat={fatLevel} />}
              <div style={{
                maxWidth: '80%', padding: '10px 14px',
                borderRadius: m.role === 'sei' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                background: m.role === 'sei' ? '#eff6ff' : '#1e40af',
                color: m.role === 'sei' ? '#1e3a8a' : '#fff',
                fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap',
              }}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <AiAvatar size={28} thinking fat={fatLevel} />
              <div style={{ padding: '10px 14px', borderRadius: '4px 16px 16px 16px', background: '#eff6ff', fontSize: 13, color: '#6b7280' }}>
                考え中…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* サジェスト */}
        {messages.length <= 2 && (
          <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 6, flexShrink: 0 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => handleSend(s)} style={{
                fontSize: 11, padding: '5px 10px', borderRadius: 100,
                border: '1px solid #bfdbfe', background: '#eff6ff',
                color: '#1e40af', cursor: 'pointer', fontWeight: 600,
              }}>{s}</button>
            ))}
          </div>
        )}

        {/* 入力 */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8, flexShrink: 0 }}>
          {isLimitReached ? (
            <button
              onClick={() => setShowCoinModal(true)}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                color: '#1f2937', fontWeight: 800, fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              🪙 コインをあげて復活 → {PACK_PRICE}
            </button>
          ) : (
            <>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="せいせいくんに相談する…"
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: 10,
                  border: '1px solid #e5e7eb', fontSize: 13, outline: 'none',
                  background: '#f9fafb',
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                style={{
                  background: loading || !input.trim() ? '#e5e7eb' : '#1e40af',
                  color: '#fff', border: 'none', borderRadius: 10,
                  width: 38, height: 38,
                  cursor: loading || !input.trim() ? 'default' : 'pointer',
                  fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >→</button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
