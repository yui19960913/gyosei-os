'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import type { SiteContent, PricingItem, AreaContent, TestimonialItem } from '@/lib/ai-site/types'
import type { SiteTemplate as SiteTheme } from '@/components/editor/TemplateSelectorPanel'

// ─── InlineEditable テキスト ──────────────────────────────────────────────────

interface ETProps {
  as?: string
  value: string
  onChange?: (v: string) => void
  className?: string
  style?: React.CSSProperties
  multi?: boolean
}

function ET({ as: tag = 'span', value, onChange, className = '', style, multi = false }: ETProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el && el !== document.activeElement) el.textContent = value
  }, [value])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = tag as any
  const mergedStyle = { whiteSpace: 'pre-wrap' as const, ...style }

  if (!onChange) {
    return <Tag className={className} style={mergedStyle}>{value}</Tag>
  }

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={`${className} focus:outline-none rounded-sm et-editable`}
      style={mergedStyle}
      onBlur={(e: React.FocusEvent<HTMLElement>) => onChange(e.currentTarget.textContent ?? '')}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (!multi && e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur() }
        if (e.key === 'Escape') { e.currentTarget.textContent = value; e.currentTarget.blur() }
      }}
    />
  )
}

// ─── 画像クロップ helper ──────────────────────────────────────────────────────

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = imageSrc
  })
  const canvas = document.createElement('canvas')
  canvas.width  = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/jpeg', 0.92)
  )
}

// ─── クロップモーダル ────────────────────────────────────────────────────────

function CropModal({ imageSrc, onConfirm, onCancel }: {
  imageSrc: string
  onConfirm: (croppedBlob: Blob) => void
  onCancel: () => void
}) {
  const [crop, setCrop]           = useState({ x: 0, y: 0 })
  const [zoom, setZoom]           = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [confirming, setConfirming]   = useState(false)

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels)
  }, [])

  const handleConfirm = async () => {
    if (!croppedArea) return
    setConfirming(true)
    try {
      const blob = await getCroppedBlob(imageSrc, croppedArea)
      onConfirm(blob)
    } catch { alert('切り抜きに失敗しました') }
    finally { setConfirming(false) }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: '90vw', maxWidth: 480, background: '#1f2937', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
        {/* タイトル */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>範囲を選択</p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 }}>ドラッグで移動、ピンチまたはスクロールで拡大</p>
        </div>

        {/* クロッパー */}
        <div style={{ position: 'relative', width: '100%', height: 360, background: '#111' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={9 / 11}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* ズームスライダー */}
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>縮小</span>
          <input
            type="range" min={1} max={3} step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#6366f1' }}
          />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>拡大</span>
        </div>

        {/* ボタン */}
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer',
          }}>キャンセル</button>
          <button onClick={handleConfirm} disabled={confirming} style={{
            flex: 2, padding: '11px', borderRadius: 10, border: 'none',
            background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>{confirming ? '処理中…' : 'この範囲で決定'}</button>
        </div>
      </div>
    </div>
  )
}

// ─── ProfilePhoto アップロード ────────────────────────────────────────────────

const DEFAULT_PROFILE_PHOTO = ''

function ProfilePhotoUpload({ src, editable, onChange, siteSlug }: {
  src?: string; editable: boolean; onChange: (url: string) => void; siteSlug?: string
}) {
  const displaySrc = src || DEFAULT_PROFILE_PHOTO
  const isDefault = !src
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading]     = useState(false)
  const [cropSrc, setCropSrc]         = useState<string | null>(null)

  const upload = async (blob: Blob) => {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', blob, 'photo.jpg')
      const params = siteSlug ? `?slug=${encodeURIComponent(siteSlug)}` : ''
      const res = await fetch(`/api/marketing-os/upload${params}`, { method: 'POST', body: form })
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      onChange(url)
    } catch { alert('アップロードに失敗しました') }
    finally { setUploading(false) }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    e.target.value = ''
    // スマホではクロップをスキップして直接アップロード
    if (window.innerWidth < 768) {
      upload(f)
      return
    }
    const reader = new FileReader()
    reader.onload = () => setCropSrc(reader.result as string)
    reader.readAsDataURL(f)
  }

  // 編集モード中かつスマホでは写真を非表示
  if (editable && typeof window !== 'undefined' && window.innerWidth < 768) return null

  return (
    <>
      {cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          onConfirm={async (blob) => { setCropSrc(null); await upload(blob) }}
          onCancel={() => setCropSrc(null)}
        />
      )}

      <div
        className={`relative overflow-hidden shrink-0 st-about-photo ${editable ? 'group cursor-pointer' : ''}`}
        style={{ width: 180, height: 220, borderRadius: 16 }}
        onClick={() => editable && fileRef.current?.click()}
      >
        {displaySrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displaySrc} alt="プロフィール写真" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="#d1d5db" />
              <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" fill="#d1d5db" />
            </svg>
          </div>
        )}
        {isDefault && editable && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(0,0,0,0.55)', padding: '6px 8px', textAlign: 'center',
          }}>
            <span style={{ fontSize: 10, color: '#fff', fontWeight: 600, letterSpacing: '0.2px' }}>
              📷 フリー素材 · クリックして差し替え
            </span>
          </div>
        )}
        {editable && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            opacity: 0, transition: 'opacity 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} className="group-hover:opacity-100">
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>
              {uploading ? 'アップロード中…' : src ? '写真を変更' : '写真を追加'}
            </span>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </div>
    </>
  )
}

// ─── FAQ アコーディオン アイテム ──────────────────────────────────────────────

function FaqItem({ question, answer, editable, onChangeQ, onChangeA, onDelete }: {
  question: string; answer: string; editable: boolean
  onChangeQ: (v: string) => void; onChangeA: (v: string) => void
  onDelete?: () => void
}) {
  const [open, setOpen] = useState(editable)

  return (
    <div style={{ borderTop: '1px solid #e5e7eb' }}>
      <button
        onClick={() => !editable && setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '24px 0', gap: 16, background: 'none', border: 'none',
          cursor: editable ? 'default' : 'pointer', textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#6366f1', minWidth: 18, paddingTop: 2 }}>Q</span>
          <ET as="p" value={question} onChange={editable ? onChangeQ : undefined}
            style={{ fontSize: 16, fontWeight: 600, color: '#111827', lineHeight: 1.6, flex: 1, display: 'block' } as React.CSSProperties} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {editable && onDelete && (
            <span
              onClick={e => { e.stopPropagation(); onDelete() }}
              style={{
                background: '#fee2e2', border: 'none', borderRadius: '50%',
                width: 24, height: 24, fontSize: 12, color: '#ef4444',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</span>
          )}
          {!editable && (
            <span style={{ fontSize: 20, color: '#9ca3af', marginTop: 2, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>
              +
            </span>
          )}
        </div>
      </button>
      {(open || editable) && (
        <div style={{ display: 'flex', gap: 16, paddingBottom: 24, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981', minWidth: 18, paddingTop: 2 }}>A</span>
          <ET as="p" value={answer} onChange={editable ? onChangeA : undefined} multi
            style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, flex: 1, display: 'block' } as React.CSSProperties} />
        </div>
      )}
    </div>
  )
}

// ─── Contact フォーム ─────────────────────────────────────────────────────────

function ContactForm({ siteSlug, primaryColor }: { siteSlug: string; primaryColor?: string }) {
  const primary = primaryColor || '#6366f1'
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const submit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.email && !form.phone) return
    setStatus('sending')
    try {
      const res = await fetch(`/api/site/${siteSlug}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', border: '1.5px solid #e5e7eb', borderRadius: 10,
    fontSize: 14, color: '#111827', background: '#fff', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  if (status === 'done') {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>送信完了しました</p>
        <p style={{ fontSize: 14, color: '#6b7280' }}>内容を確認の上、折り返しご連絡いたします。</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="st-form-row">
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
            お名前
          </label>
          <input value={form.name} onChange={set('name')} placeholder="山田 太郎" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
            メールアドレス <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input type="email" value={form.email} onChange={set('email')} placeholder="example@mail.com" style={inputStyle} required />
        </div>
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
          電話番号（任意）
        </label>
        <input value={form.phone} onChange={set('phone')} placeholder="090-0000-0000" style={inputStyle} />
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
          ご相談内容
        </label>
        <textarea value={form.message} onChange={set('message')} rows={5}
          placeholder="例）建設業の許可申請について相談したいです。"
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} />
      </div>
      {status === 'error' && (
        <p style={{ fontSize: 13, color: '#ef4444' }}>送信に失敗しました。しばらくしてから再度お試しください。</p>
      )}
      <button type="submit" disabled={status === 'sending'}
        style={{
          background: primary, color: '#fff', fontWeight: 700,
          padding: '14px', borderRadius: 10, fontSize: 15, border: 'none',
          cursor: 'pointer', opacity: status === 'sending' ? 0.7 : 1,
          letterSpacing: '-0.2px',
        }}>
        {status === 'sending' ? '送信中…' : '無料相談を申し込む'}
      </button>
      <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
        ご入力いただいた個人情報は、お問い合わせ対応のみに使用します。
      </p>
    </form>
  )
}

// ─── デフォルト Pricing / Area / Testimonials ────────────────────────────────

const DEFAULT_PRICING: PricingItem[] = [
  { name: '会社設立', price: '¥110,000〜', features: ['書類作成・申請代行', '登記申請サポート', '設立後手続き相談'] },
  { name: '建設業許可', price: '¥88,000〜', features: ['新規・更新・変更対応', '書類収集サポート', '申請窓口対応'] },
  { name: '飲食店営業許可', price: '¥55,000〜', features: ['保健所申請代行', '図面作成補助', '開業前相談込み'] },
]



// ─── HeroFontToolbar（Wix風フローティングツールバー） ────────────────────────

const FONT_SIZES = [28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72]

function HeroFontToolbar({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!open) {
    return (
      <div style={{ position: 'absolute', top: -6, right: -6, zIndex: 50 }}>
        <button onClick={() => setOpen(true)} style={{
          width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(0,0,0,0.12)',
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, color: '#374151', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>Aa</button>
      </div>
    )
  }

  return (
    <div ref={wrapRef} style={{
      position: 'absolute', top: -44, left: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', gap: 2,
      background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
      borderRadius: 8, padding: '4px 6px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.08)',
    }}>
      <button onClick={() => onChange(Math.max(24, value - 2))} style={{
        width: 28, height: 28, borderRadius: 4, border: 'none', background: 'transparent',
        cursor: 'pointer', fontSize: 16, color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>−</button>

      <div style={{ position: 'relative' }}>
        <button onClick={() => setShowDropdown(!showDropdown)} style={{
          minWidth: 44, height: 28, borderRadius: 4, border: '1px solid #e5e7eb', background: '#f9fafb',
          cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#111827',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '0 6px',
        }}>
          {value}<span style={{ fontSize: 9, color: '#9ca3af' }}>▼</span>
        </button>
        {showDropdown && (
          <div style={{
            position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)',
            background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: '4px 0',
            maxHeight: 200, overflowY: 'auto', minWidth: 60, zIndex: 51,
          }}>
            {FONT_SIZES.map(s => (
              <button key={s} onClick={() => { onChange(s); setShowDropdown(false) }} style={{
                display: 'block', width: '100%', padding: '6px 14px', border: 'none',
                background: s === value ? '#6366f1' : 'transparent',
                color: s === value ? '#fff' : '#374151',
                fontSize: 12, fontWeight: s === value ? 700 : 400,
                cursor: 'pointer', textAlign: 'center',
              }}>{s}px</button>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => onChange(Math.min(72, value + 2))} style={{
        width: 28, height: 28, borderRadius: 4, border: 'none', background: 'transparent',
        cursor: 'pointer', fontSize: 16, color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>+</button>
    </div>
  )
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface SiteTemplateProps {
  firmName: string
  prefecture: string
  siteSlug: string
  content: SiteContent
  editable?: boolean
  onUpdate?: (c: SiteContent) => void
  theme?: SiteTheme
}

// ─── SiteTemplate ─────────────────────────────────────────────────────────────

export function SiteTemplate({
  firmName, prefecture, siteSlug, content, editable = false, onUpdate, theme,
}: SiteTemplateProps) {
  const { hero, services, profile, faq, cta } = content
  const pricing = content.pricing ?? DEFAULT_PRICING
  const area = content.area
  const map = content.map
  const testimonials = content.testimonials ?? []
  const prefLabel = content.prefectureLabel ?? `${prefecture}の行政書士`
  const pricingCtaText = content.pricingCtaText ?? '無料相談はこちら →'

  const cb = editable && onUpdate ? onUpdate : undefined

  const upHero     = (k: keyof typeof hero,    v: string | number) => cb?.({ ...content, hero:    { ...hero,    [k]: v } })
  const upCta      = (k: keyof typeof cta,     v: string) => cb?.({ ...content, cta:     { ...cta,     [k]: v } })
  const upProfile  = (k: keyof typeof profile, v: string) => cb?.({ ...content, profile: { ...profile, [k]: v } })
  const upService  = (i: number, k: keyof (typeof services)[0], v: string) => {
    const next = services.map((s, idx) => idx === i ? { ...s, [k]: v } : s)
    cb?.({ ...content, services: next })
  }
  const upStrength = (i: number, v: string) => {
    const next = profile.strengths.map((s, idx) => idx === i ? v : s)
    cb?.({ ...content, profile: { ...profile, strengths: next } })
  }
  const upFaq = (i: number, k: 'question' | 'answer', v: string) => {
    const next = faq.map((f, idx) => idx === i ? { ...f, [k]: v } : f)
    cb?.({ ...content, faq: next })
  }
  const upPricing = (i: number, k: keyof PricingItem, v: string | string[]) => {
    const next = pricing.map((p, idx) => idx === i ? { ...p, [k]: v } : p)
    cb?.({ ...content, pricing: next })
  }
  const upPricingFeature = (pi: number, fi: number, v: string) => {
    const next = pricing.map((p, idx) => idx === pi ? {
      ...p, features: p.features.map((f, fidx) => fidx === fi ? v : f)
    } : p)
    cb?.({ ...content, pricing: next })
  }
  const upArea = (k: keyof AreaContent, v: string) => {
    if (!area) return
    cb?.({ ...content, area: { ...area, [k]: v } })
  }
  const upAreaItem = (i: number, v: string) => {
    if (!area) return
    const next = area.areas.map((a, idx) => idx === i ? v : a)
    cb?.({ ...content, area: { ...area, areas: next } })
  }
  const upTestimonial = (i: number, k: keyof TestimonialItem, v: string) => {
    const next = testimonials.map((t, idx) => idx === i ? { ...t, [k]: v } : t)
    cb?.({ ...content, testimonials: next })
  }
  const upPrefectureLabel = (v: string) => cb?.({ ...content, prefectureLabel: v })
  const upPricingCtaText = (v: string) => cb?.({ ...content, pricingCtaText: v })

  const upFaqDelete = (i: number) => {
    cb?.({ ...content, faq: faq.filter((_, idx) => idx !== i) })
  }
  const upServiceDelete = (i: number) => {
    cb?.({ ...content, services: services.filter((_, idx) => idx !== i) })
  }
  const upTestimonialDelete = (i: number) => {
    cb?.({ ...content, testimonials: testimonials.filter((_, idx) => idx !== i) })
  }
  const upAreaItemDelete = (i: number) => {
    if (!area) return
    cb?.({ ...content, area: { ...area, areas: area.areas.filter((_, idx) => idx !== i) } })
  }
  const upStrengthDelete = (i: number) => {
    const next = profile.strengths.filter((_, idx) => idx !== i)
    cb?.({ ...content, profile: { ...profile, strengths: next } })
  }
  const upPricingDelete = (i: number) => {
    cb?.({ ...content, pricing: pricing.filter((_, idx) => idx !== i) })
  }

  // ── テーマカラー ─────────────────────────────────────────────────────────────
  const th = {
    primary:    theme?.colors.primary    ?? '#6366f1',
    accent:     theme?.colors.accent     ?? '#6366f1',
    bg:         theme?.colors.bg         ?? '#ffffff',
    surface:    theme?.colors.surface    ?? '#f9fafb',
    text:       theme?.colors.text       ?? '#111827',
    sub:        theme?.colors.sub        ?? '#6b7280',
    fontFamily: theme?.style.fontFamily  ?? "'Inter', 'Helvetica Neue', Arial, 'Hiragino Sans', 'Yu Gothic', sans-serif",
    radius:     theme?.style.borderRadius ?? '100px',
    headerStyle: theme?.style.headerStyle ?? 'minimal',
    heroLayout: theme?.style.heroLayout  ?? 'left' as 'left' | 'center' | 'fullbg' | 'split',
  }

  // テンプレート別ヒーロー背景写真
  const FULLBG_HERO_PHOTOS: Record<string, string> = {
    'trustful-navy':    '/images/stock/34039686_s.jpg',
    'midnight-pro':     '/images/stock/34039686_s.jpg',
    'deep-amethyst':    '/images/stock/34039686_s.jpg',
    'ocean-deep':       '/images/stock/34039686_s.jpg',
    'elegant-charcoal': '/images/stock/34156942_s.jpg',
    'civic-blue':       '/images/stock/34156942_s.jpg',
    'carbon-pro':       '/images/stock/34156942_s.jpg',
    // 相談シーン
    'consult-warm':     '/images/stock/33945329_s.jpg',
    'consult-green':    '/images/stock/33945329_s.jpg',
    'consult-plum':     '/images/stock/33945329_s.jpg',
    // ビル街で会話
    'city-trust':       '/images/stock/34039686_s.jpg',
    'city-modern':      '/images/stock/34039686_s.jpg',
    'city-warm':        '/images/stock/34039686_s.jpg',
    // 高層ビル
    'tower-navy':       '/images/stock/34156942_s.jpg',
    'tower-slate':      '/images/stock/34156942_s.jpg',
    'tower-emerald':    '/images/stock/34156942_s.jpg',
  }
  const fullbgHeroPhoto = theme?.id ? (FULLBG_HERO_PHOTOS[theme.id] ?? '/images/stock/34039686_s.jpg') : '/images/stock/34039686_s.jpg'

  // ── スタイル定数 ────────────────────────────────────────────────────────────
  const sectionLabel: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase' as const,
    color: th.primary, marginBottom: 12, display: 'block',
  }
  const sectionTitle: React.CSSProperties = {
    fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, color: th.text,
  }
  const sectionTitleClass = 'st-section-title'
  const container: React.CSSProperties = { maxWidth: 1100, margin: '0 auto' }

  return (
    <div style={{ fontFamily: th.fontFamily, color: th.text, background: th.bg }}>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #f3f4f6',
      }}>
        <div className="st-container" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{firmName}</span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            {[
              ['#about', '当事務所について'],
              ['#services', 'サービス'],
              ['#faq', 'よくある質問'],
              ...(testimonials.length > 0 ? [['#testimonials', 'お客様の声']] : []),
              ['#contact', 'お問い合わせ'],
            ].map(([href, label]) => (
              <a key={href} href={href}
                style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, textDecoration: 'none', letterSpacing: '0.1px' }}
                className="hover:text-gray-900 transition-colors hidden md:block"
              >{label}</a>
            ))}
            <a href="#contact" style={{
              fontSize: 13, fontWeight: 700, padding: '8px 18px', borderRadius: 100,
              background: th.primary, color: '#fff', textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}>
              無料相談
            </a>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      {th.heroLayout === 'left' && (
        <section style={{ position: 'relative', overflow: 'hidden', backgroundImage: `url(${fullbgHeroPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          {/* 背景オーバーレイ */}
          <div style={{ position: 'absolute', inset: 0, background: th.bg, opacity: 0.88, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -160, right: -160, width: 560, height: 560, borderRadius: '50%', background: `radial-gradient(circle, ${th.primary}10 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${th.accent}08 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <div className="st-container st-hero-inner" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: 24 }}>
              <ET as="span" value={prefLabel} onChange={editable ? upPrefectureLabel : undefined} style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: th.primary, background: `${th.primary}14`, padding: '5px 14px', borderRadius: 100, border: `1px solid ${th.primary}30` }} />
            </div>
            <div style={{ position: 'relative', maxWidth: 780, marginBottom: 24 }}>
              <ET as="h1" value={hero.headline} onChange={v => upHero('headline', v)} multi className="block st-hero-title"
                style={{ fontSize: hero.heroFontSize ? `${hero.heroFontSize}px` : 'clamp(36px, 5vw, 64px)' as string, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-2px', color: th.text } as React.CSSProperties} />
              {editable && <HeroFontToolbar value={hero.heroFontSize ?? 48} onChange={v => upHero('heroFontSize', v)} />}
            </div>
            <ET as="p" value={hero.subheadline} onChange={v => upHero('subheadline', v)} multi className="block st-hero-sub"
              style={{ fontSize: 17, color: th.sub, lineHeight: 1.8, maxWidth: 520, marginBottom: 44, fontWeight: 400 } as React.CSSProperties} />
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }} className="st-hero-btns">
              <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: th.primary, color: '#fff', fontWeight: 700, padding: '14px 28px', borderRadius: th.radius, fontSize: 15, textDecoration: 'none', letterSpacing: '-0.3px' }}>
                <ET value={hero.ctaText} onChange={v => upHero('ctaText', v)} style={{ pointerEvents: 'none' } as React.CSSProperties} /><span>→</span>
              </a>
              <a href="tel:0120000000" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1.5px solid ${th.primary}40`, color: th.primary, fontWeight: 600, padding: '13px 24px', borderRadius: 100, fontSize: 14, textDecoration: 'none' }}>
                📞 お電話でのご相談
              </a>
            </div>
            {hero.ctaNote && <ET as="p" value={hero.ctaNote} onChange={v => upHero('ctaNote', v)} multi className="block" style={{ marginTop: 20, fontSize: 12, color: th.sub, letterSpacing: '0.3px' } as React.CSSProperties} />}
          </div>
        </section>
      )}

      {th.heroLayout === 'center' && (
        <section style={{ position: 'relative', overflow: 'hidden', textAlign: 'center', backgroundImage: `url(${fullbgHeroPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          {/* 背景オーバーレイ */}
          <div style={{ position: 'absolute', inset: 0, background: th.bg, opacity: 0.88, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', background: `radial-gradient(circle, ${th.primary}08 0%, transparent 65%)`, pointerEvents: 'none' }} />
          <div className="st-container st-hero-inner" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: 24 }}>
              <ET as="span" value={prefLabel} onChange={editable ? upPrefectureLabel : undefined} style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: th.primary, background: `${th.primary}14`, padding: '5px 14px', borderRadius: 100, border: `1px solid ${th.primary}30` }} />
            </div>
            <div style={{ position: 'relative', maxWidth: 700, marginBottom: 24 }}>
              <ET as="h1" value={hero.headline} onChange={v => upHero('headline', v)} multi className="block st-hero-title"
                style={{ fontSize: hero.heroFontSize ? `${hero.heroFontSize}px` : 'clamp(36px, 5vw, 60px)' as string, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-2px', color: th.text } as React.CSSProperties} />
              {editable && <HeroFontToolbar value={hero.heroFontSize ?? 48} onChange={v => upHero('heroFontSize', v)} />}
            </div>
            <ET as="p" value={hero.subheadline} onChange={v => upHero('subheadline', v)} multi className="block st-hero-sub"
              style={{ fontSize: 17, color: th.sub, lineHeight: 1.8, maxWidth: 500, marginBottom: 44, fontWeight: 400 } as React.CSSProperties} />
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }} className="st-hero-btns">
              <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: th.primary, color: '#fff', fontWeight: 700, padding: '14px 32px', borderRadius: th.radius, fontSize: 15, textDecoration: 'none', letterSpacing: '-0.3px' }}>
                <ET value={hero.ctaText} onChange={v => upHero('ctaText', v)} style={{ pointerEvents: 'none' } as React.CSSProperties} /><span>→</span>
              </a>
              <a href="tel:0120000000" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1.5px solid ${th.primary}40`, color: th.primary, fontWeight: 600, padding: '13px 24px', borderRadius: 100, fontSize: 14, textDecoration: 'none' }}>
                📞 お電話でのご相談
              </a>
            </div>
            {hero.ctaNote && <ET as="p" value={hero.ctaNote} onChange={v => upHero('ctaNote', v)} multi className="block" style={{ marginTop: 20, fontSize: 12, color: th.sub, letterSpacing: '0.3px' } as React.CSSProperties} />}
          </div>
        </section>
      )}

      {th.heroLayout === 'fullbg' && (
        <section style={{ position: 'relative', overflow: 'hidden' }}>
          {/* カラー背景 */}
          <div style={{ position: 'absolute', inset: 0, background: th.primary, pointerEvents: 'none' }} />
          <div className="st-container st-hero-inner" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: 24 }}>
              <ET as="span" value={prefLabel} onChange={editable ? upPrefectureLabel : undefined} style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.12)', padding: '5px 14px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.2)' }} />
            </div>
            <div style={{ position: 'relative', maxWidth: 780, marginBottom: 24 }}>
              <ET as="h1" value={hero.headline} onChange={v => upHero('headline', v)} multi className="block st-hero-title"
                style={{ fontSize: hero.heroFontSize ? `${hero.heroFontSize}px` : 'clamp(36px, 5vw, 64px)' as string, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-2px', color: '#ffffff' } as React.CSSProperties} />
              {editable && <HeroFontToolbar value={hero.heroFontSize ?? 48} onChange={v => upHero('heroFontSize', v)} />}
            </div>
            <ET as="p" value={hero.subheadline} onChange={v => upHero('subheadline', v)} multi className="block st-hero-sub"
              style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, maxWidth: 520, marginBottom: 44, fontWeight: 400 } as React.CSSProperties} />
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }} className="st-hero-btns">
              <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ffffff', color: th.primary, fontWeight: 700, padding: '14px 28px', borderRadius: th.radius, fontSize: 15, textDecoration: 'none', letterSpacing: '-0.3px' }}>
                <ET value={hero.ctaText} onChange={v => upHero('ctaText', v)} style={{ pointerEvents: 'none' } as React.CSSProperties} /><span>→</span>
              </a>
              <a href="tel:0120000000" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1.5px solid rgba(255,255,255,0.4)', color: '#ffffff', fontWeight: 600, padding: '13px 24px', borderRadius: 100, fontSize: 14, textDecoration: 'none' }}>
                📞 お電話でのご相談
              </a>
            </div>
            {hero.ctaNote && <ET as="p" value={hero.ctaNote} onChange={v => upHero('ctaNote', v)} multi className="block" style={{ marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.3px' } as React.CSSProperties} />}
          </div>
        </section>
      )}

      {th.heroLayout === 'split' && (
        <section style={{ background: th.bg, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -120, right: -120, width: 480, height: 480, borderRadius: '50%', background: `radial-gradient(circle, ${th.primary}08 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <div className="st-container st-hero-split-grid">
            {/* 左: テキスト */}
            <div>
              <div style={{ marginBottom: 20 }}>
                <ET as="span" value={prefLabel} onChange={editable ? upPrefectureLabel : undefined} style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: th.primary, background: `${th.primary}14`, padding: '5px 14px', borderRadius: 100, border: `1px solid ${th.primary}30` }} />
              </div>
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <ET as="h1" value={hero.headline} onChange={v => upHero('headline', v)} multi className="block"
                  style={{ fontSize: hero.heroFontSize ? `${hero.heroFontSize}px` : 'clamp(28px, 4vw, 52px)' as string, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-1.5px', color: th.text } as React.CSSProperties} />
                {editable && <HeroFontToolbar value={hero.heroFontSize ?? 40} onChange={v => upHero('heroFontSize', v)} />}
              </div>
              <ET as="p" value={hero.subheadline} onChange={v => upHero('subheadline', v)} multi className="block"
                style={{ fontSize: 16, color: th.sub, lineHeight: 1.85, marginBottom: 36, fontWeight: 400 } as React.CSSProperties} />
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: th.primary, color: '#fff', fontWeight: 700, padding: '14px 28px', borderRadius: th.radius, fontSize: 15, textDecoration: 'none', letterSpacing: '-0.3px' }}>
                  <ET value={hero.ctaText} onChange={v => upHero('ctaText', v)} style={{ pointerEvents: 'none' } as React.CSSProperties} /><span>→</span>
                </a>
                <a href="tel:0120000000" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1.5px solid ${th.primary}40`, color: th.primary, fontWeight: 600, padding: '13px 24px', borderRadius: 100, fontSize: 14, textDecoration: 'none' }}>
                  📞 お電話でのご相談
                </a>
              </div>
              {hero.ctaNote && <ET as="p" value={hero.ctaNote} onChange={v => upHero('ctaNote', v)} multi className="block" style={{ marginTop: 16, fontSize: 12, color: th.sub, letterSpacing: '0.3px' } as React.CSSProperties} />}
            </div>
            {/* 右: 代表者写真 */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 340 }}>
                {profile.profilePhotoUrl ? (
                  <img
                    src={profile.profilePhotoUrl}
                    alt={`${firmName} 代表`}
                    style={{ width: '100%', borderRadius: 20, objectFit: 'cover', objectPosition: 'top', aspectRatio: '3/4', boxShadow: `0 24px 64px ${th.primary}20`, display: 'block' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', aspectRatio: '3/4', borderRadius: 20,
                    background: `linear-gradient(135deg, ${th.primary}12, ${th.primary}06)`,
                    border: `1px solid ${th.primary}15`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
                  }}>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" fill={`${th.primary}30`} />
                      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" fill={`${th.primary}30`} />
                    </svg>
                    {editable && <span style={{ fontSize: 11, color: th.sub, fontWeight: 600 }}>写真を追加</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 強み 3バッジ ── */}
      <section style={{ background: '#fafafa', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' }}>
        <div className="st-container st-strengths-grid">
          {profile.strengths.slice(0, 3).map((s, i) => (
            <div key={i} style={{
              padding: '28px 24px',
              borderRight: i < 2 ? '1px solid #f3f4f6' : undefined,
              display: 'flex', alignItems: 'center', gap: 14,
              position: 'relative',
            }}>
              <span style={{ fontSize: 22 }}>{['⚡', '🤝', '🏆'][i]}</span>
              <ET as="span" value={s} onChange={v => upStrength(i, v)}
                style={{ fontSize: 14, fontWeight: 600, color: '#374151', letterSpacing: '-0.2px' } as React.CSSProperties}
              />
              {editable && (
                <button onClick={() => upStrengthDelete(i)} style={{
                  position: 'absolute', top: 8, right: 8,
                  background: '#fee2e2', border: 'none', borderRadius: '50%',
                  width: 20, height: 20, fontSize: 11, color: '#ef4444',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✕</button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── About（当事務所について） ── */}
      <section id="about" className="st-section" style={{ background: '#fff' }}>
        <div className="st-container">
          <span style={sectionLabel}>About</span>
          <ET as="h2" value={profile.title} onChange={v => upProfile('title', v)}
            className={`block ${sectionTitleClass}`}
            style={{ ...sectionTitle, marginBottom: 56 } as React.CSSProperties}
          />

          <div className="st-about-grid">
            <ProfilePhotoUpload
              src={profile.profilePhotoUrl}
              editable={editable}
              onChange={url => cb?.({ ...content, profile: { ...profile, profilePhotoUrl: url } })}
              siteSlug={siteSlug}
            />
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.5px', color: '#111827' }}>{firmName}</h3>
              <ET as="p" value={prefLabel} onChange={editable ? upPrefectureLabel : undefined}
                style={{ fontSize: 13, color: th.primary, fontWeight: 600, marginBottom: 20, letterSpacing: '0.3px', display: 'block' } as React.CSSProperties} />
              <ET as="p" value={profile.body} onChange={v => upProfile('body', v)} multi
                style={{ fontSize: 15, color: '#374151', lineHeight: 1.95, display: 'block', marginBottom: 24 } as React.CSSProperties}
              />
              <div className="st-about-tags" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {profile.strengths.map((s, i) => (
                  <span key={i} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 12, fontWeight: 600, color: th.primary,
                    background: `${th.primary}12`, border: `1px solid ${th.primary}25`,
                    padding: '5px 12px', borderRadius: 100,
                  }}>
                    {s}
                    {editable && (
                      <button onClick={() => upStrengthDelete(i)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#9ca3af', fontSize: 11, padding: 0, lineHeight: 1,
                        display: 'flex', alignItems: 'center',
                      }}>✕</button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services（サービス内容） ── */}
      <section id="services" className="st-section" style={{ background: '#f9fafb' }}>
        <div className="st-container">
          <span style={sectionLabel}>Services</span>
          <h2 className={sectionTitleClass} style={{ ...sectionTitle, marginBottom: 56 }}>サービス内容</h2>
          <div className="st-services-grid">
            {services.map((svc, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 16, padding: '32px 28px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                position: 'relative',
              }}>
                {editable && (
                  <button onClick={() => upServiceDelete(i)} style={{
                    position: 'absolute', top: 8, right: 8,
                    background: '#fee2e2', border: 'none', borderRadius: '50%',
                    width: 24, height: 24, fontSize: 12, color: '#ef4444',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>✕</button>
                )}
                <ET as="div" value={svc.icon} onChange={v => upService(i, 'icon', v)}
                  style={{ fontSize: 36, marginBottom: 16, display: 'block' } as React.CSSProperties} />
                <ET as="h3" value={svc.name} onChange={v => upService(i, 'name', v)}
                  style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.3px', display: 'block', color: '#111827' } as React.CSSProperties} />
                <ET as="p" value={svc.description} onChange={v => upService(i, 'description', v)} multi
                  style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.75, marginBottom: 16, display: 'block' } as React.CSSProperties} />
                {svc.price && (
                  <div style={{
                    borderTop: '1px solid #f3f4f6', paddingTop: 14, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af' }}>料金目安</span>
                    <ET as="span" value={svc.price} onChange={v => upService(i, 'price', v)}
                      style={{ fontSize: 14, fontWeight: 700, color: th.primary } as React.CSSProperties} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing（料金の目安） ── */}
      <section id="pricing" className="st-section" style={{ background: '#fff' }}>
        <div className="st-container">
          <span style={sectionLabel}>Pricing</span>
          <h2 className={sectionTitleClass} style={{ ...sectionTitle, marginBottom: 12 }}>料金の目安</h2>
          <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 56 }}>
            ※ 料金は内容により異なる場合があります。まずはお気軽にご相談ください。
          </p>
          <div className="st-pricing-grid">
            {pricing.map((plan, i) => (
              <div key={i} style={{
                background: i === 1 ? th.primary : th.surface,
                borderRadius: 20, padding: '36px 32px',
                border: i === 1 ? 'none' : '1px solid #e5e7eb',
                position: 'relative',
                boxShadow: i === 1 ? `0 8px 32px ${th.primary}40` : '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                {editable && (
                  <button onClick={() => upPricingDelete(i)} style={{
                    position: 'absolute', top: 8, right: 8,
                    background: i === 1 ? 'rgba(255,255,255,0.2)' : '#fee2e2',
                    border: 'none', borderRadius: '50%',
                    width: 24, height: 24, fontSize: 12,
                    color: i === 1 ? '#fff' : '#ef4444',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>✕</button>
                )}
                {i === 1 && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: '#f59e0b', color: '#fff', fontSize: 11, fontWeight: 800,
                    padding: '4px 14px', borderRadius: 100, letterSpacing: '0.5px',
                  }}>人気</div>
                )}
                <ET as="h3" value={plan.name} onChange={v => upPricing(i, 'name', v)}
                  style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, display: 'block', color: i === 1 ? '#fff' : '#111827' } as React.CSSProperties} />
                <ET as="div" value={plan.price} onChange={v => upPricing(i, 'price', v)}
                  style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', marginBottom: 24, display: 'block', color: i === 1 ? '#fff' : th.primary } as React.CSSProperties} />
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map((feat, fi) => (
                    <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ color: i === 1 ? 'rgba(255,255,255,0.7)' : '#10b981', fontSize: 14, marginTop: 1, flexShrink: 0 }}>✓</span>
                      <ET as="span" value={feat} onChange={v => upPricingFeature(i, fi, v)}
                        style={{ fontSize: 13, lineHeight: 1.6, color: i === 1 ? 'rgba(255,255,255,0.9)' : '#4b5563' } as React.CSSProperties} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <a href="#contact" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: `2px solid ${th.primary}`, color: th.primary, fontWeight: 700,
              padding: '13px 32px', borderRadius: 100, fontSize: 15, textDecoration: 'none',
            }}>
              <ET value={pricingCtaText} onChange={editable ? upPricingCtaText : undefined} style={{ pointerEvents: 'none' } as React.CSSProperties} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Area（対応エリア） ── */}
      {area && (
        <section id="area" className="st-section" style={{ background: '#f9fafb', borderTop: '1px solid #f3f4f6' }}>
          <div className="st-container">
            <span style={sectionLabel}>Area</span>
            <h2 className={sectionTitleClass} style={{ ...sectionTitle, marginBottom: 20 }}>対応エリア</h2>
            <ET as="p" value={area.description} onChange={editable ? v => upArea('description', v) : undefined} multi
              style={{ fontSize: 15, color: '#6b7280', marginBottom: 36, lineHeight: 1.7, display: 'block' } as React.CSSProperties}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {area.areas.map((a, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 13, fontWeight: 600, color: '#374151',
                  background: '#fff', border: '1.5px solid #e5e7eb',
                  padding: '8px 18px', borderRadius: 100,
                }}>
                  <ET as="span" value={a} onChange={editable ? v => upAreaItem(i, v) : undefined} style={{} as React.CSSProperties} />
                  {editable && (
                    <button onClick={() => upAreaItemDelete(i)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#9ca3af', fontSize: 12, padding: 0, lineHeight: 1,
                      display: 'flex', alignItems: 'center',
                    }}>✕</button>
                  )}
                </span>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 24 }}>
              ※ 上記以外のエリアもご相談ください。オンライン対応も承っています。
            </p>
          </div>
        </section>
      )}

      {/* ── Map（Googleマップ） ── */}
      {map?.address && (
        <section id="map" className="st-section" style={{ background: '#fff', borderTop: '1px solid #f3f4f6' }}>
          <div className="st-container">
            <span style={sectionLabel}>Access</span>
            <h2 className={sectionTitleClass} style={{ ...sectionTitle, marginBottom: 20 }}>アクセス</h2>
            <p style={{ fontSize: 15, color: '#374151', marginBottom: 20 }}>{map.address}</p>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(map.address)}&output=embed&z=15`}
                width="100%"
                height="350"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials（お客様の声） ── */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="st-section" style={{ background: '#fff' }}>
          <div className="st-container">
            <span style={sectionLabel}>Testimonials</span>
            <h2 className={sectionTitleClass} style={{ ...sectionTitle, marginBottom: 56 }}>お客様の声</h2>
            <div className="st-testimonials-grid">
              {testimonials.map((t, i) => (
                <div key={i} style={{
                  background: '#f9fafb', borderRadius: 16, padding: '32px 28px',
                  border: '1px solid #e5e7eb',
                  position: 'relative',
                }}>
                  {editable && (
                    <button onClick={() => upTestimonialDelete(i)} style={{
                      position: 'absolute', top: 8, right: 8,
                      background: '#fee2e2', border: 'none', borderRadius: '50%',
                      width: 24, height: 24, fontSize: 12, color: '#ef4444',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                  )}
                  <div style={{ fontSize: 28, color: '#c7d2fe', marginBottom: 16, lineHeight: 1 }}>&ldquo;</div>
                  <ET as="p" value={t.content} onChange={v => upTestimonial(i, 'content', v)} multi
                    style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, marginBottom: 24, display: 'block' } as React.CSSProperties}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid #e5e7eb', paddingTop: 20 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, flexShrink: 0,
                    }}>👤</div>
                    <div>
                      <ET as="div" value={t.name} onChange={v => upTestimonial(i, 'name', v)}
                        style={{ fontSize: 13, fontWeight: 700, color: '#111827', display: 'block' } as React.CSSProperties} />
                      <ET as="div" value={t.role} onChange={v => upTestimonial(i, 'role', v)}
                        style={{ fontSize: 12, color: '#9ca3af', display: 'block' } as React.CSSProperties} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: '#c4c4c4', marginTop: 24, textAlign: 'center' }}>
              ※ お客様の声は掲載許諾のもと掲載しています。
            </p>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section id="faq" className="st-section" style={{ background: '#f9fafb' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }} className="st-container">
          <span style={sectionLabel}>FAQ</span>
          <h2 className={sectionTitleClass} style={{ ...sectionTitle, marginBottom: 56 }}>よくある質問</h2>
          <div>
            {faq.map((item, i) => (
              <FaqItem
                key={i}
                question={item.question}
                answer={item.answer}
                editable={editable}
                onChangeQ={v => upFaq(i, 'question', v)}
                onChangeA={v => upFaq(i, 'answer', v)}
                onDelete={editable ? () => upFaqDelete(i) : undefined}
              />
            ))}
            <div style={{ borderTop: '1px solid #e5e7eb' }} />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="st-section" style={{
        background: 'linear-gradient(135deg, #f0f4ff 0%, #fdf6ff 100%)',
        borderTop: '1px solid #e8ecff',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <ET as="h2" value={cta.headline} onChange={v => upCta('headline', v)}
            className="block st-cta-title"
            style={{ fontSize: 'clamp(28px, 5.5vw, 44px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 16, lineHeight: 1.1, color: '#1e1b4b' } as React.CSSProperties}
          />
          <ET as="p" value={cta.subheadline} onChange={v => upCta('subheadline', v)} multi
            style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.75, marginBottom: 44, display: 'block' } as React.CSSProperties}
          />
          <a href="#contact" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: th.primary, color: '#fff', fontWeight: 700,
            padding: '16px 36px', borderRadius: th.radius, fontSize: 16, textDecoration: 'none',
            letterSpacing: '-0.3px',
          }}>
            <ET value={cta.ctaText} onChange={v => upCta('ctaText', v)} style={{ pointerEvents: 'none' } as React.CSSProperties} />
            <span style={{ fontSize: 20 }}>→</span>
          </a>
        </div>
      </section>

      {/* ── Contact（お問い合わせ） ── */}
      <section id="contact" className="st-section" style={{ background: '#fff' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <span style={sectionLabel}>Contact</span>
          <h2 className={sectionTitleClass} style={{ ...sectionTitle, marginBottom: 8 }}>お問い合わせ</h2>
          <ContactForm siteSlug={siteSlug} primaryColor={th.primary} />
        </div>
      </section>

      {/* ── フローティング SNS ボタン ── */}
      {(content.social?.line || content.social?.facebook) && (
        <div style={{
          position: 'fixed', right: 20, bottom: 24, zIndex: 50,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {content.social?.line && (
            <a
              href={content.social.line}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 52, height: 52, borderRadius: '50%',
                background: '#06C755',
                boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
                textDecoration: 'none', flexShrink: 0,
              }}
              aria-label="LINE公式アカウント"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.03 2 11c0 3.27 1.82 6.14 4.58 7.89.2.12.29.35.22.57l-.55 2.01c-.08.3.22.56.5.42l2.33-1.22c.14-.07.3-.09.45-.05.62.17 1.28.27 1.97.27 5.52 0 10-4.03 10-9S17.52 2 12 2zM8 13H7v-4h1v4zm3 0h-1V9h1v4zm3 0h-1V9h1v4z"/>
              </svg>
            </a>
          )}
          {content.social?.facebook && (
            <a
              href={content.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 52, height: 52, borderRadius: '50%',
                background: '#1877F2',
                boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
                textDecoration: 'none', flexShrink: 0,
              }}
              aria-label="Facebookページ"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
            </a>
          )}
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="st-container" style={{ padding: '48px 0', background: '#f9fafb', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }}>{firmName}</p>
        </div>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>{prefLabel}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24 }}>
          {[['#about', '事務所について'], ['#services', 'サービス'], ['#faq', 'FAQ'], ['#contact', 'お問い合わせ']].map(([href, label]) => (
            <a key={href} href={href} style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
        {/* SNSアイコン */}
        {content.social && (content.social.line || content.social.facebook || content.social.instagram) && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
            {content.social.line && (
              <a href={content.social.line} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, background: '#06C755', textDecoration: 'none' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.03 2 11c0 3.27 1.82 6.14 4.58 7.89.2.12.29.35.22.57l-.55 2.01c-.08.3.22.56.5.42l2.33-1.22c.14-.07.3-.09.45-.05.62.17 1.28.27 1.97.27 5.52 0 10-4.03 10-9S17.52 2 12 2zm-3 13H7v-5h2v5zm3 0h-2v-5h2v5zm3 0h-2v-5h2v5z"/></svg>
              </a>
            )}
            {content.social.facebook && (
              <a href={content.social.facebook} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, background: '#1877F2', textDecoration: 'none' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
              </a>
            )}
            {content.social.instagram && (
              <a href={content.social.instagram} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', textDecoration: 'none' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            )}
          </div>
        )}
        <p style={{ fontSize: 11, color: '#d1d5db' }}>© {new Date().getFullYear()} {firmName}. All rights reserved.</p>
        <p style={{ fontSize: 11, color: '#e5e7eb', marginTop: 12 }}>
          <a href="https://webseisei.com" target="_blank" rel="noopener noreferrer"
            style={{ color: '#d1d5db', textDecoration: 'none' }}>
            Powered by AI集客OS
          </a>
        </p>
      </footer>
    </div>
  )
}
