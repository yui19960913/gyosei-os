'use client'

import { useState } from 'react'
import { GYOSEI_TEMPLATES, type SiteTemplateTheme as SiteTemplate } from '@/lib/templates'
export type { SiteTemplateTheme as SiteTemplate } from '@/lib/templates'
export { GYOSEI_TEMPLATES }

function MiniPreview({ t }: { t: SiteTemplate }) {
  const isFullbg = t.style.heroLayout === 'fullbg'
  const isSolidHeader = t.style.headerStyle === 'solid'
  const headerBg = isFullbg ? 'rgba(0,0,0,0.18)' : isSolidHeader ? t.colors.primary : t.colors.surface
  const headerTextColor = (isFullbg || isSolidHeader) ? '#fff' : t.colors.primary
  const headerNavColor = (isFullbg || isSolidHeader) ? 'rgba(255,255,255,0.7)' : t.colors.sub
  const headerBorder = t.style.headerStyle === 'bordered'
    ? `2px solid ${isFullbg ? 'rgba(255,255,255,0.3)' : t.colors.accent}`
    : t.style.headerStyle === 'minimal'
      ? `1px solid ${isFullbg ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)'}`
      : 'none'

  return (
    <div style={{ borderRadius: '8px 8px 0 0', overflow: 'hidden', fontFamily: t.style.fontFamily, display: 'flex', flexDirection: 'column' }}>
      {/* メインプレビューエリア */}
      <div style={{ background: isFullbg ? t.colors.primary : t.colors.bg, height: '140px', display: 'flex', flexDirection: 'column' }}>
        {/* ヘッダー */}
        <div style={{ background: headerBg, borderBottom: headerBorder, padding: '7px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: '8px', fontWeight: 700, color: headerTextColor }}>○○行政書士事務所</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['業務', '料金', '相談'].map(n => (
              <span key={n} style={{ fontSize: '6px', color: headerNavColor }}>{n}</span>
            ))}
          </div>
        </div>
        {/* ヒーロー */}
        <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: isFullbg ? 'transparent' : t.colors.surface }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: isFullbg ? '#fff' : t.colors.text, lineHeight: 1.35, marginBottom: '8px' }}>
            お困りごとを<br />丁寧に解決します
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start', background: t.colors.accent, color: '#fff', borderRadius: t.style.borderRadius, padding: '3px 9px', fontSize: '7px', fontWeight: 700 }}>
            無料相談はこちら
          </div>
        </div>
      </div>
      {/* カラーパレット帯 */}
      <div style={{ display: 'flex', height: '8px' }}>
        <div style={{ flex: 2, background: t.colors.primary }} />
        <div style={{ flex: 1, background: t.colors.accent }} />
        <div style={{ flex: 1, background: t.colors.sub }} />
      </div>
    </div>
  )
}

interface TemplateSelectorPanelProps {
  isOpen: boolean
  onClose: () => void
  currentTemplateId?: string
  onApply: (template: SiteTemplate) => void
}

type Category = 'すべて' | '信頼・格式' | '親しみやすい' | 'モダン'

const CATEGORY_MAP: Record<Category, string[]> = {
  'すべて': [],
  '信頼・格式': ['trustful-navy', 'elegant-charcoal', 'civic-blue', 'sky-reliable', 'deep-amethyst', 'ocean-deep', 'indigo-bold'],
  '親しみやすい': ['calm-forest', 'warm-terracotta', 'sakura-soft', 'earth-natural', 'warm-ivory', 'moss-organic', 'sage-calm', 'rose-gold'],
  'モダン': ['pure-minimal', 'midnight-pro', 'fresh-teal', 'steel-sharp', 'carbon-pro'],
}

export function TemplateSelectorPanel({ isOpen, onClose, currentTemplateId, onApply }: TemplateSelectorPanelProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [appliedId, setAppliedId] = useState<string | null>(currentTemplateId ?? null)
  const [category, setCategory] = useState<Category>('すべて')

  const filtered = category === 'すべて'
    ? GYOSEI_TEMPLATES
    : GYOSEI_TEMPLATES.filter(t => CATEGORY_MAP[category].includes(t.id))

  if (!isOpen) return null

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 60, backdropFilter: 'blur(2px)' }} />
      <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', background: '#FFFFFF', borderLeft: '1px solid #E5E7EB', zIndex: 70, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)' }}>
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>🎨 デザインテンプレート</div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>行政書士サイト向け 20種類</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['すべて', '信頼・格式', '親しみやすい', 'モダン'] as Category[]).map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', border: 'none',
                background: category === cat ? '#111827' : '#F3F4F6',
                color: category === cat ? '#fff' : '#6B7280',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div
          style={{ height: 'calc(100vh - 160px)', overflowY: 'scroll', padding: '12px 12px', overscrollBehavior: 'contain' }}
          onWheel={e => e.stopPropagation()}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {filtered.map(t => {
              const isSelected = appliedId === t.id
              const isHovered = hoveredId === t.id
              return (
                <div
                  key={t.id}
                  onClick={() => { setAppliedId(t.id); onApply(t) }}
                  onMouseEnter={() => setHoveredId(t.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    border: `2px solid ${isSelected ? t.colors.primary : isHovered ? '#D1D5DB' : '#E5E7EB'}`,
                    borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease',
                    boxShadow: isSelected ? `0 0 0 3px ${t.colors.primary}28` : isHovered ? '0 4px 16px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.04)',
                    transform: isHovered && !isSelected ? 'translateY(-1px)' : 'none',
                    display: 'flex', flexDirection: 'column',
                  }}
                >
                  <MiniPreview t={t} />
                  <div style={{ padding: '8px 10px', background: '#FFFFFF', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>{t.name}</span>
                      <span style={{ fontSize: '9px', background: `${t.colors.primary}14`, color: t.colors.primary, padding: '1px 6px', borderRadius: '999px', fontWeight: 600 }}>{t.tag}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#9CA3AF', lineHeight: 1.4 }}>{t.desc}</div>
                    <div style={{
                      marginTop: 'auto', paddingTop: '6px',
                      background: isSelected ? t.colors.primary : '#F3F4F6',
                      color: isSelected ? '#fff' : '#374151',
                      borderRadius: '6px', padding: '4px 0', fontSize: '11px', fontWeight: 700,
                      textAlign: 'center',
                    }}>
                      {isSelected ? '✓ 適用中' : '適用'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {filtered.length === 0 && <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '13px', padding: '32px 0' }}>該当するテンプレートが見つかりません</div>}
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', fontSize: '11px', color: '#9CA3AF', textAlign: 'center' }}>クリックするとすぐ反映されます</div>
      </aside>
    </>
  )
}
