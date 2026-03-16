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
]

function MiniPreview({ t }: { t: SiteTemplate }) {
  const isDark = t.id === 'midnight-pro'
  return (
    <div style={{ background: t.colors.bg, borderRadius: '8px', overflow: 'hidden', height: '120px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, fontFamily: t.style.fontFamily, position: 'relative' }}>
      <div style={{ background: t.style.headerStyle === 'solid' ? t.colors.primary : t.colors.surface, borderBottom: t.style.headerStyle === 'bordered' ? `2px solid ${t.colors.accent}` : t.style.headerStyle === 'minimal' ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` : 'none', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '8px', fontWeight: 700, color: t.style.headerStyle === 'solid' ? '#fff' : t.colors.primary }}>○○行政書士事務所</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['業務内容', '料金', 'お問合せ'].map(n => (
            <span key={n} style={{ fontSize: '6px', color: t.style.headerStyle === 'solid' ? 'rgba(255,255,255,0.8)' : t.colors.sub }}>{n}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: '10px 10px 8px', background: t.colors.surface }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: t.colors.text, marginBottom: '4px', lineHeight: 1.3 }}>あなたの困りごとを<br />丁寧に解決します</div>
        <div style={{ fontSize: '7px', color: t.colors.sub, marginBottom: '8px' }}>相続・遺言・在留資格・許認可申請はお任せください</div>
        <button style={{ background: t.colors.accent, color: '#fff', border: 'none', borderRadius: t.style.borderRadius, padding: '3px 8px', fontSize: '7px', fontWeight: 700, cursor: 'default' }}>無料相談はこちら</button>
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
  '信頼・格式': ['trustful-navy', 'elegant-charcoal', 'civic-blue', 'sky-reliable'],
  '親しみやすい': ['calm-forest', 'warm-terracotta', 'sakura-soft', 'earth-natural'],
  'モダン': ['pure-minimal', 'midnight-pro'],
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
      <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '360px', background: '#FFFFFF', borderLeft: '1px solid #E5E7EB', zIndex: 70, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)' }}>
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>🎨 デザインテンプレート</div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>行政書士サイト向け 10種類</div>
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
                  border: `2px solid ${isSelected ? t.colors.primary : isHovered ? '#D1D5DB' : '#F3F4F6'}`,
                  borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  boxShadow: isSelected ? `0 0 0 3px ${t.colors.primary}30` : isHovered ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
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
        <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', fontSize: '11px', color: '#9CA3AF', textAlign: 'center' }}>クリックで即反映 ・ 「保存」ボタンで確定</div>
      </aside>
    </>
  )
}
