'use client'

import { useState } from 'react'

export interface SiteTemplate {
  id: string
  name: string
  tag: string
  desc: string
  colors: {
    primary: string
    accent: string
    bg: string
    surface: string
    text: string
    sub: string
  }
  style: {
    fontFamily: string
    borderRadius: string
    headerStyle: 'solid' | 'bordered' | 'minimal'
    heroLayout: 'left' | 'center' | 'fullbg' | 'split'
  }
}

export const GYOSEI_TEMPLATES: SiteTemplate[] = [
  {
    id: 'trustful-navy',
    name: 'トラストネイビー',
    tag: '信頼・誠実',
    desc: '深いネイビーで知性と安心感。王道の士業スタイル',
    colors: { primary: '#1B3A6B', accent: '#C8A84B', bg: '#F8F9FC', surface: '#FFFFFF', text: '#1A2340', sub: '#6B7A99' },
    style: { fontFamily: '"Noto Serif JP", serif', borderRadius: '4px', headerStyle: 'solid', heroLayout: 'fullbg' },
  },
  {
    id: 'calm-forest',
    name: 'カームフォレスト',
    tag: '安心・親しみ',
    desc: '落ち着いた緑系。地域密着・親しみやすさを演出',
    colors: { primary: '#2D6A4F', accent: '#95C7A9', bg: '#F4F8F5', surface: '#FFFFFF', text: '#1C3528', sub: '#6B8C7A' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '8px', headerStyle: 'bordered', heroLayout: 'split' },
  },
  {
    id: 'warm-terracotta',
    name: 'ウォームテラコッタ',
    tag: '親しみ・温かさ',
    desc: '温かみのあるオレンジ系。話しかけやすい雰囲気',
    colors: { primary: '#B5451B', accent: '#E8935A', bg: '#FDF8F4', surface: '#FFFFFF', text: '#2E1A0E', sub: '#9A6B50' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '10px', headerStyle: 'minimal', heroLayout: 'split' },
  },
  {
    id: 'elegant-charcoal',
    name: 'エレガントチャコール',
    tag: '高級感・格式',
    desc: 'チャコール×ゴールドで上質な格式と専門性を表現',
    colors: { primary: '#2C2C2C', accent: '#B8962E', bg: '#F9F9F7', surface: '#FFFFFF', text: '#1A1A1A', sub: '#888888' },
    style: { fontFamily: '"Noto Serif JP", serif', borderRadius: '2px', headerStyle: 'solid', heroLayout: 'fullbg' },
  },
  {
    id: 'sky-reliable',
    name: 'スカイリライアブル',
    tag: '清潔感・誠実',
    desc: '明るいスカイブルーで清潔・誠実・オープンな印象',
    colors: { primary: '#1A6EAB', accent: '#5BB8F5', bg: '#F3F8FD', surface: '#FFFFFF', text: '#0D2A42', sub: '#6B8FAD' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '8px', headerStyle: 'solid', heroLayout: 'left' },
  },
  {
    id: 'pure-minimal',
    name: 'ピュアミニマル',
    tag: 'シンプル・モダン',
    desc: '余白を活かした現代的なミニマルデザイン',
    colors: { primary: '#111111', accent: '#3B82F6', bg: '#FFFFFF', surface: '#F7F7F7', text: '#111111', sub: '#999999' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '6px', headerStyle: 'minimal', heroLayout: 'center' },
  },
  {
    id: 'sakura-soft',
    name: 'サクラソフト',
    tag: '親しみ・女性向け',
    desc: '桜ピンクで柔らかく親しみやすい、女性行政書士に',
    colors: { primary: '#B5476A', accent: '#F0A0B8', bg: '#FDF7F9', surface: '#FFFFFF', text: '#2C1018', sub: '#AA7080' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '12px', headerStyle: 'bordered', heroLayout: 'split' },
  },
  {
    id: 'midnight-pro',
    name: 'ミッドナイトプロ',
    tag: '専門性・先進性',
    desc: 'ダークテーマで専門性と先進的なイメージを強調',
    colors: { primary: '#0F172A', accent: '#38BDF8', bg: '#0F172A', surface: '#1E293B', text: '#F1F5F9', sub: '#64748B' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '8px', headerStyle: 'solid', heroLayout: 'fullbg' },
  },
  {
    id: 'earth-natural',
    name: 'アースナチュラル',
    tag: '地域密着・自然',
    desc: '土のような温かいブラウン系。地に足のついた信頼感',
    colors: { primary: '#5C3D1E', accent: '#A07850', bg: '#FAF6F0', surface: '#FFFFFF', text: '#2C1A08', sub: '#8C6A48' },
    style: { fontFamily: '"Noto Serif JP", serif', borderRadius: '6px', headerStyle: 'bordered', heroLayout: 'left' },
  },
  {
    id: 'civic-blue',
    name: 'シビックブルー',
    tag: '行政・公共感',
    desc: '公共・官公庁を想起させる落ち着いたロイヤルブルー',
    colors: { primary: '#1E3A8A', accent: '#3B82F6', bg: '#EFF6FF', surface: '#FFFFFF', text: '#1E2E50', sub: '#6B80A8' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '4px', headerStyle: 'solid', heroLayout: 'fullbg' },
  },
  {
    id: 'fresh-teal',
    name: 'フレッシュティール',
    tag: '清潔感・現代的',
    desc: 'みずみずしいティールグリーンで清潔感と現代的な印象',
    colors: { primary: '#0D7377', accent: '#14A085', bg: '#F0FAFA', surface: '#FFFFFF', text: '#0A2E30', sub: '#5A8A8C' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '8px', headerStyle: 'bordered', heroLayout: 'left' },
  },
  {
    id: 'deep-amethyst',
    name: 'ディープアメシスト',
    tag: '格式・独自性',
    desc: '深みのある紫で格調と個性を兼ね備えた印象',
    colors: { primary: '#4A1E8C', accent: '#8B5CF6', bg: '#F8F4FF', surface: '#FFFFFF', text: '#1E0A3C', sub: '#7B6A9A' },
    style: { fontFamily: '"Noto Serif JP", serif', borderRadius: '4px', headerStyle: 'solid', heroLayout: 'fullbg' },
  },
  {
    id: 'warm-ivory',
    name: 'ウォームアイボリー',
    tag: '上品・ナチュラル',
    desc: '温かみのあるアイボリーとゴールドで上品かつ親しみやすい',
    colors: { primary: '#8B6914', accent: '#C9973A', bg: '#FDFAF4', surface: '#FFFEF9', text: '#2C1F00', sub: '#9A8060' },
    style: { fontFamily: '"Noto Serif JP", serif', borderRadius: '6px', headerStyle: 'minimal', heroLayout: 'center' },
  },
  {
    id: 'steel-sharp',
    name: 'スティールシャープ',
    tag: '都会的・スマート',
    desc: 'スチールグレーで都会的でスマート。シャープな第一印象',
    colors: { primary: '#374151', accent: '#6B7280', bg: '#F9FAFB', surface: '#FFFFFF', text: '#111827', sub: '#9CA3AF' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '2px', headerStyle: 'bordered', heroLayout: 'split' },
  },
  {
    id: 'ocean-deep',
    name: 'オーシャンディープ',
    tag: '信頼・開放感',
    desc: '深い海をイメージした爽やかで開放感のあるブルー',
    colors: { primary: '#0369A1', accent: '#0EA5E9', bg: '#F0F9FF', surface: '#FFFFFF', text: '#0C2A3E', sub: '#5B8CAA' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '10px', headerStyle: 'solid', heroLayout: 'fullbg' },
  },
  {
    id: 'moss-organic',
    name: 'モスオーガニック',
    tag: '自然・落ち着き',
    desc: '深みのある苔色で地に足のついた自然な安心感',
    colors: { primary: '#3D5A3E', accent: '#7CB87E', bg: '#F5F8F5', surface: '#FFFFFF', text: '#1A2E1B', sub: '#6B8A6C' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '8px', headerStyle: 'minimal', heroLayout: 'left' },
  },
  {
    id: 'rose-gold',
    name: 'ローズゴールド',
    tag: '洗練・女性向け',
    desc: 'ローズゴールドで洗練された上品な印象。女性行政書士に',
    colors: { primary: '#9D4B6A', accent: '#D4869F', bg: '#FDF8F9', surface: '#FFFFFF', text: '#2C0E1A', sub: '#B08090' },
    style: { fontFamily: '"Noto Serif JP", serif', borderRadius: '12px', headerStyle: 'bordered', heroLayout: 'split' },
  },
  {
    id: 'carbon-pro',
    name: 'カーボンプロ',
    tag: 'ハイエンド・先進',
    desc: 'カーボン調ダーク×オレンジで先進的かつ高級感を演出',
    colors: { primary: '#1C1C1E', accent: '#FF9F0A', bg: '#1C1C1E', surface: '#2C2C2E', text: '#F2F2F7', sub: '#8E8E93' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '10px', headerStyle: 'solid', heroLayout: 'fullbg' },
  },
  {
    id: 'sage-calm',
    name: 'セージカーム',
    tag: '穏やか・誠実',
    desc: 'セージグリーンで穏やかで誠実な安心感。相談しやすい雰囲気',
    colors: { primary: '#5A7A6A', accent: '#8FB0A0', bg: '#F6FAF8', surface: '#FFFFFF', text: '#1A2E25', sub: '#7A9A8A' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '8px', headerStyle: 'bordered', heroLayout: 'center' },
  },
  {
    id: 'indigo-bold',
    name: 'インディゴボールド',
    tag: '力強さ・信頼',
    desc: '鮮やかなインディゴで力強さと信頼感を印象付ける',
    colors: { primary: '#3730A3', accent: '#6366F1', bg: '#EEF2FF', surface: '#FFFFFF', text: '#1E1B4B', sub: '#6B7280' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '6px', headerStyle: 'solid', heroLayout: 'left' },
  },
]

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
          style={{ height: 'calc(100vh - 160px)', overflowY: 'scroll', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px', overscrollBehavior: 'contain' }}
          onWheel={e => e.stopPropagation()}
        >
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
                }}
              >
                <MiniPreview t={t} />
                <div style={{ padding: '10px 12px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t.name}</span>
                      <span style={{ fontSize: '10px', background: `${t.colors.primary}14`, color: t.colors.primary, padding: '1px 7px', borderRadius: '999px', fontWeight: 600, flexShrink: 0 }}>{t.tag}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.desc}</div>
                  </div>
                  <div style={{ background: isSelected ? t.colors.primary : '#F3F4F6', color: isSelected ? '#fff' : '#374151', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {isSelected ? '✓ 適用中' : '適用'}
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '13px', padding: '32px 0' }}>該当するテンプレートが見つかりません</div>}
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', fontSize: '11px', color: '#9CA3AF', textAlign: 'center' }}>クリックするとすぐ反映されます</div>
      </aside>
    </>
  )
}
