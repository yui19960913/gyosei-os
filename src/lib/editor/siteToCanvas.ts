/**
 * SiteContent → CanvasElement[] 変換
 * テンプレート由来の要素は ID prefix = "tpl:" で識別する
 */
import type { SiteContent } from '@/lib/ai-site/types'
import type { CanvasElement } from '@/lib/marketing-os/canvas/types'

const W = 1200

function rect(id: string, x: number, y: number, w: number, h: number, color: string, borderRadius = 0, zIndex = 1): CanvasElement {
  return { id, type: 'rect', x, y, width: w, height: h, zIndex, props: { color, borderRadius, opacity: 1 } }
}

function text(id: string, x: number, y: number, w: number, h: number, content: string, fontSize: number, fontWeight: 'normal' | 'bold', color: string, textAlign: 'left' | 'center' | 'right', zIndex = 2): CanvasElement {
  return { id, type: 'text', x, y, width: w, height: h, zIndex, props: { content, fontSize, fontWeight, color, textAlign, italic: false } }
}

function icon(id: string, x: number, y: number, size: number, emoji: string, zIndex = 2): CanvasElement {
  return { id, type: 'icon', x, y, width: size, height: size, zIndex, props: { emoji, size: size * 0.75 } }
}

// ─── SiteContent → CanvasElement[] ───────────────────────────────────────────

export function siteContentToElements(
  content: SiteContent,
  firmName: string,
  prefecture: string,
): CanvasElement[] {
  const { hero, services, profile, faq, cta } = content
  const els: CanvasElement[] = []
  let z = 0
  const nz = () => ++z

  // ── Hero ──────────────────────────────────────────
  const heroH = 760
  els.push(
    rect('tpl:hero.bg', 0, 0, W, heroH, '#1e3a8a', 0, nz()),
    text('tpl:hero.label', 0, 90, W, 36, `${prefecture}の行政書士 | ${firmName}`, 13, 'normal', '#93c5fd', 'center', nz()),
    text('tpl:hero.headline', 100, 145, 1000, 140, hero.headline, 46, 'bold', '#ffffff', 'center', nz()),
    text('tpl:hero.subheadline', 150, 310, 900, 80, hero.subheadline, 19, 'normal', 'rgba(219,234,254,0.9)', 'center', nz()),
    rect('tpl:hero.ctabg', 380, 420, 440, 60, '#ffffff', 30, nz()),
    text('tpl:hero.ctaText', 380, 433, 440, 34, hero.ctaText, 17, 'bold', '#1e3a8a', 'center', nz()),
  )
  if (hero.ctaNote) {
    els.push(text('tpl:hero.ctaNote', 150, 500, 900, 36, hero.ctaNote, 13, 'normal', '#bfdbfe', 'center', nz()))
  }

  // ── 強みバー ───────────────────────────────────────
  const strY = heroH
  const strH = 150
  els.push(rect('tpl:str.bg', 0, strY, W, strH, '#1d4ed8', 0, nz()))
  profile.strengths.slice(0, 3).forEach((s, i) => {
    els.push(
      text(`tpl:str.icon${i}`, 80 + i * 360, strY + 30, 80, 40, ['⚡', '🤝', '🏆'][i], 28, 'normal', '#ffffff', 'center', nz()),
      text(`tpl:str.${i}`, 80 + i * 360, strY + 80, 320, 44, s, 14, 'bold', '#ffffff', 'center', nz()),
    )
  })

  // ── サービス ──────────────────────────────────────
  const svcY = strY + strH
  const svcRows = Math.ceil(services.length / 3)
  const svcH = 120 + svcRows * 290 + 60
  els.push(
    rect('tpl:svc.bg', 0, svcY, W, svcH, '#ffffff', 0, nz()),
    text('tpl:svc.label', 0, svcY + 30, W, 30, 'Services', 12, 'bold', '#2563eb', 'center', nz()),
    text('tpl:svc.title', 0, svcY + 65, W, 56, '対応業務', 32, 'bold', '#111827', 'center', nz()),
  )
  const cols3 = Math.min(services.length, 3)
  const cw = 340
  const sx0 = (W - cols3 * cw - (cols3 - 1) * 24) / 2
  services.forEach((svc, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const cx = sx0 + col * (cw + 24)
    const cy = svcY + 140 + row * 290
    els.push(
      rect(`tpl:svc.card${i}`, cx, cy, cw, 264, '#f9fafb', 16, nz()),
      icon(`tpl:svc.icon${i}`, cx + cw / 2 - 24, cy + 18, 48, svc.icon || '✅', nz()),
      text(`tpl:svc.name${i}`, cx + 10, cy + 80, cw - 20, 38, svc.name, 17, 'bold', '#111827', 'center', nz()),
      text(`tpl:svc.desc${i}`, cx + 12, cy + 128, cw - 24, 90, svc.description, 13, 'normal', '#6b7280', 'center', nz()),
    )
    if (svc.price) {
      els.push(text(`tpl:svc.price${i}`, cx + 12, cy + 226, cw - 24, 28, svc.price, 13, 'bold', '#2563eb', 'center', nz()))
    }
  })

  // ── 事務所紹介 ─────────────────────────────────────
  const abtY = svcY + svcH
  const abtH = 520
  els.push(
    rect('tpl:abt.bg', 0, abtY, W, abtH, '#f9fafb', 0, nz()),
    text('tpl:abt.label', 0, abtY + 30, W, 30, 'About', 12, 'bold', '#2563eb', 'center', nz()),
    text('tpl:abt.title', 0, abtY + 65, W, 56, profile.title, 32, 'bold', '#111827', 'center', nz()),
    icon('tpl:abt.avatar', 160, abtY + 165, 120, '👨‍💼', nz()),
    text('tpl:abt.name', 325, abtY + 165, 540, 40, firmName, 21, 'bold', '#111827', 'left', nz()),
    text('tpl:abt.pref', 325, abtY + 212, 280, 28, `${prefecture}の行政書士`, 13, 'normal', '#2563eb', 'left', nz()),
    text('tpl:abt.body', 325, abtY + 250, 680, 220, profile.body, 15, 'normal', '#374151', 'left', nz()),
  )

  // ── FAQ ───────────────────────────────────────────
  const faqY = abtY + abtH
  const faqH = 120 + faq.length * 150 + 80
  els.push(
    rect('tpl:faq.bg', 0, faqY, W, faqH, '#ffffff', 0, nz()),
    text('tpl:faq.label', 0, faqY + 30, W, 30, 'FAQ', 12, 'bold', '#2563eb', 'center', nz()),
    text('tpl:faq.title', 0, faqY + 65, W, 56, 'よくある質問', 32, 'bold', '#111827', 'center', nz()),
  )
  faq.forEach((f, i) => {
    const fy = faqY + 140 + i * 150
    els.push(
      rect(`tpl:faq.qbg${i}`, 160, fy, 880, 52, '#f3f4f6', 8, nz()),
      text(`tpl:faq.ql${i}`, 168, fy + 8, 36, 36, 'Q', 16, 'bold', '#3b82f6', 'center', nz()),
      text(`tpl:faq.q${i}`, 210, fy + 8, 810, 36, f.question, 15, 'bold', '#111827', 'left', nz()),
      text(`tpl:faq.al${i}`, 168, fy + 68, 36, 36, 'A', 16, 'bold', '#10b981', 'center', nz()),
      text(`tpl:faq.a${i}`, 210, fy + 68, 810, 64, f.answer, 14, 'normal', '#374151', 'left', nz()),
    )
  })

  // ── CTA ───────────────────────────────────────────
  const ctaY = faqY + faqH
  const ctaH = 380
  els.push(
    rect('tpl:cta.bg', 0, ctaY, W, ctaH, '#0f172a', 0, nz()),
    text('tpl:cta.headline', 100, ctaY + 70, 1000, 80, cta.headline, 34, 'bold', '#ffffff', 'center', nz()),
    text('tpl:cta.subheadline', 150, ctaY + 170, 900, 50, cta.subheadline, 17, 'normal', '#94a3b8', 'center', nz()),
    rect('tpl:cta.btnbg', 380, ctaY + 250, 440, 60, '#3b82f6', 30, nz()),
    text('tpl:cta.ctaText', 380, ctaY + 263, 440, 34, cta.ctaText, 17, 'bold', '#ffffff', 'center', nz()),
  )

  // ── フッター ──────────────────────────────────────
  const ftY = ctaY + ctaH
  els.push(
    rect('tpl:ft.bg', 0, ftY, W, 160, '#f9fafb', 0, nz()),
    text('tpl:ft.name', 0, ftY + 36, W, 36, firmName, 15, 'bold', '#374151', 'center', nz()),
    text('tpl:ft.pref', 0, ftY + 78, W, 28, `${prefecture}の行政書士`, 13, 'normal', '#9ca3af', 'center', nz()),
    text('tpl:ft.copy', 0, ftY + 112, W, 28, `© ${new Date().getFullYear()} ${firmName}. All rights reserved.`, 12, 'normal', '#9ca3af', 'center', nz()),
  )

  return els
}

// ─── CanvasElement[] → SiteContent 逆変換 ────────────────────────────────────
// tpl: 要素のテキストを読み取ってsiteContentを再構築する

export function extractSiteContent(
  elements: CanvasElement[],
  fallback: SiteContent,
): SiteContent {
  const getText = (id: string): string => {
    const el = elements.find(e => e.id === id)
    return (el?.props as { content?: string })?.content ?? ''
  }
  const getEmoji = (id: string): string => {
    const el = elements.find(e => e.id === id)
    return (el?.props as { emoji?: string })?.emoji ?? ''
  }
  const or = (val: string, fb: string) => val || fb

  return {
    hero: {
      headline:    or(getText('tpl:hero.headline'),    fallback.hero.headline),
      subheadline: or(getText('tpl:hero.subheadline'), fallback.hero.subheadline),
      ctaText:     or(getText('tpl:hero.ctaText'),     fallback.hero.ctaText),
      ctaNote:     getText('tpl:hero.ctaNote') ?? fallback.hero.ctaNote,
    },
    services: fallback.services.map((svc, i) => ({
      name:        or(getText(`tpl:svc.name${i}`),  svc.name),
      description: or(getText(`tpl:svc.desc${i}`),  svc.description),
      icon:        or(getEmoji(`tpl:svc.icon${i}`), svc.icon),
      price:       getText(`tpl:svc.price${i}`) ?? svc.price,
    })),
    profile: {
      title: or(getText('tpl:abt.title'), fallback.profile.title),
      body:  or(getText('tpl:abt.body'),  fallback.profile.body),
      strengths: fallback.profile.strengths.map((s, i) =>
        or(getText(`tpl:str.${i}`), s)
      ),
    },
    faq: fallback.faq.map((f, i) => ({
      question: or(getText(`tpl:faq.q${i}`), f.question),
      answer:   or(getText(`tpl:faq.a${i}`), f.answer),
    })),
    cta: {
      headline:    or(getText('tpl:cta.headline'),    fallback.cta.headline),
      subheadline: or(getText('tpl:cta.subheadline'), fallback.cta.subheadline),
      ctaText:     or(getText('tpl:cta.ctaText'),     fallback.cta.ctaText),
    },
  }
}

// ─── ポジション保持マージ ──────────────────────────────────────────────────────
// 新しいtpl要素に既存の位置・サイズ・zIndexを引き継ぐ

type PosCache = Record<string, { x: number; y: number; width: number; height: number; zIndex: number }>

export function buildPosCache(elements: CanvasElement[]): PosCache {
  const cache: PosCache = {}
  for (const el of elements) {
    if (el.id.startsWith('tpl:')) {
      cache[el.id] = { x: el.x, y: el.y, width: el.width, height: el.height, zIndex: el.zIndex }
    }
  }
  return cache
}

export function applyPosCache(elements: CanvasElement[], cache: PosCache): CanvasElement[] {
  return elements.map(el => {
    const saved = cache[el.id]
    return saved ? { ...el, ...saved } : el
  })
}
