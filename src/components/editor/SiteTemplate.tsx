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

function ProfilePhotoUpload({ src, editable, onChange, siteSlug }: {
  src?: string; editable: boolean; onChange: (url: string) => void; siteSlug?: string
}) {
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

  // スマホでは写真を非表示
  if (typeof window !== 'undefined' && window.innerWidth < 768 && !src) return null
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="プロフィール写真" style={{ width: 180, height: 220, objectFit: 'cover', borderRadius: 16, display: 'block', flexShrink: 0 }} />
    )
  }

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
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="プロフィール写真" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 52 }}>👨‍💼</span>
            {editable && <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>写真を追加</span>}
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

function ContactForm({ siteSlug }: { siteSlug: string }) {
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
        <p style={{ fontSize: 14, color: '#6b7280' }}>1営業日以内にご連絡いたします。</p>
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
          background: '#6366f1', color: '#fff', fontWeight: 700,
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
  const testimonials = content.testimonials ?? []
  const prefLabel = content.prefectureLabel ?? `${prefecture}の行政書士`
  const pricingCtaText = content.pricingCtaText ?? '無料相談はこちら →'

  const cb = editable && onUpdate ? onUpdate : undefined

  const upHero     = (k: keyof typeof hero,    v: string) => cb?.({ ...content, hero:    { ...hero,    [k]: v } })
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
  }

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
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: th.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>法</span>
            </div>
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
      <section style={{
        background: th.bg,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -160, right: -160,
          width: 560, height: 560, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -100, left: -100,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="st-container st-hero-inner">
          <div style={{ marginBottom: 24 }}>
            <ET as="span" value={prefLabel} onChange={editable ? upPrefectureLabel : undefined} style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const,
              color: th.primary, background: `${th.primary}14`,
              padding: '5px 14px', borderRadius: 100, border: `1px solid ${th.primary}30`,
            }} />
          </div>

          <ET as="h1" value={hero.headline} onChange={v => upHero('headline', v)} multi
            className="block st-hero-title"
            style={{
              fontSize: 'clamp(36px, 5vw, 64px)' as string, fontWeight: 800,
              lineHeight: 1.1, letterSpacing: '-2px', color: '#1e1b4b',
              marginBottom: 24, maxWidth: 780,
            } as React.CSSProperties}
          />

          <ET as="p" value={hero.subheadline} onChange={v => upHero('subheadline', v)} multi
            className="block st-hero-sub"
            style={{ fontSize: 17, color: '#4b5563', lineHeight: 1.8, maxWidth: 520, marginBottom: 44, fontWeight: 400 } as React.CSSProperties}
          />

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }} className="st-hero-btns">
            <a href="#contact" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: th.primary, color: '#fff', fontWeight: 700,
              padding: '14px 28px', borderRadius: th.radius, fontSize: 15,
              textDecoration: 'none', letterSpacing: '-0.3px',
            }}>
              <ET value={hero.ctaText} onChange={v => upHero('ctaText', v)} style={{ pointerEvents: 'none' } as React.CSSProperties} />
              <span>→</span>
            </a>
            <a href="tel:0120000000" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '1.5px solid #c7d2fe', color: '#4338ca',
              fontWeight: 600, padding: '13px 24px', borderRadius: 100, fontSize: 14,
              textDecoration: 'none', background: 'rgba(255,255,255,0.7)',
            }}>
              📞 お電話でのご相談
            </a>
          </div>
          {hero.ctaNote && (
            <ET as="p" value={hero.ctaNote} onChange={v => upHero('ctaNote', v)} multi
              className="block"
              style={{ marginTop: 20, fontSize: 12, color: '#9ca3af', letterSpacing: '0.3px' } as React.CSSProperties}
            />
          )}
        </div>
      </section>

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
          <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 48 }}>
            24時間受付 · 1営業日以内にご返信します
          </p>
          {editable ? (
            <div style={{
              background: '#f9fafb', borderRadius: 16, padding: '40px',
              textAlign: 'center', border: '2px dashed #e5e7eb',
            }}>
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>お問い合わせフォームは公開ページで動作します</p>
              <a href={`/${siteSlug}`} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: th.primary, textDecoration: 'none', fontWeight: 600 }}>
                公開ページで確認 →
              </a>
            </div>
          ) : (
            <ContactForm siteSlug={siteSlug} />
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="st-container" style={{ padding: '48px 0', background: '#f9fafb', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: th.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>法</span>
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }}>{firmName}</p>
        </div>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>{prefLabel}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24 }}>
          {[['#about', '事務所について'], ['#services', 'サービス'], ['#faq', 'FAQ'], ['#contact', 'お問い合わせ']].map(([href, label]) => (
            <a key={href} href={href} style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
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
