// ============================================================
// ブロックレジストリ
// 新ブロックを追加するときはこのファイルに1エントリ追加するだけ
// ============================================================

import type { BlockDef, BlockType } from './types'

const heroBlock: BlockDef = {
  type: 'hero',
  label: 'ヒーロー',
  icon: '🌟',
  description: 'ページ最上部のメインビジュアル',
  defaultProps: {
    title: '見出しテキスト',
    subtitle: 'サブテキストをここに入力してください',
    ctaLabel: '無料相談はこちら',
    ctaHref: '#contact',
    bgColor: '#1e40af',
  },
  schema: [
    { key: 'title',    label: '見出し',       type: 'text' },
    { key: 'subtitle', label: 'サブテキスト',  type: 'textarea' },
    { key: 'ctaLabel', label: 'ボタンラベル',  type: 'text' },
    { key: 'ctaHref',  label: 'ボタンリンク',  type: 'text', placeholder: '#contact or https://...' },
    { key: 'bgColor',  label: '背景色',        type: 'color' },
  ],
}

const servicesBlock: BlockDef = {
  type: 'services',
  label: 'サービス一覧',
  icon: '📋',
  description: '提供サービスや業務内容の一覧',
  defaultProps: {
    title: 'サービス内容',
    items: [
      { title: 'サービス1', description: 'サービスの説明を入力してください', icon: '✅' },
      { title: 'サービス2', description: 'サービスの説明を入力してください', icon: '✅' },
      { title: 'サービス3', description: 'サービスの説明を入力してください', icon: '✅' },
    ],
  },
  schema: [
    { key: 'title', label: 'セクション見出し', type: 'text' },
    {
      key: 'items',
      label: 'サービス項目',
      type: 'repeater',
      itemSchema: [
        { key: 'icon',        label: 'アイコン',   type: 'text', placeholder: '✅' },
        { key: 'title',       label: 'タイトル',   type: 'text' },
        { key: 'description', label: '説明文',     type: 'textarea' },
      ],
    },
  ],
}

const pricingBlock: BlockDef = {
  type: 'pricing',
  label: '料金プラン',
  icon: '💰',
  description: '料金・プラン一覧',
  defaultProps: {
    title: '料金プラン',
    plans: [
      {
        name: 'スタンダード',
        price: '¥50,000〜',
        features: ['サービスA', 'サービスB', '相談無料'],
        highlighted: false,
      },
      {
        name: 'プレミアム',
        price: '¥100,000〜',
        features: ['スタンダードの全て', 'サービスC', '優先対応'],
        highlighted: true,
      },
    ],
  },
  schema: [
    { key: 'title', label: 'セクション見出し', type: 'text' },
    {
      key: 'plans',
      label: 'プラン',
      type: 'repeater',
      itemSchema: [
        { key: 'name',  label: 'プラン名', type: 'text' },
        { key: 'price', label: '価格',     type: 'text' },
      ],
    },
  ],
}

const faqBlock: BlockDef = {
  type: 'faq',
  label: 'よくある質問',
  icon: '❓',
  description: 'FAQ / よくある質問',
  defaultProps: {
    title: 'よくある質問',
    items: [
      { question: '相談は無料ですか？', answer: 'はい、初回相談は無料です。お気軽にご連絡ください。' },
      { question: '対応エリアを教えてください', answer: '全国対応しています。' },
    ],
  },
  schema: [
    { key: 'title', label: 'セクション見出し', type: 'text' },
    {
      key: 'items',
      label: 'Q&A',
      type: 'repeater',
      itemSchema: [
        { key: 'question', label: '質問', type: 'text' },
        { key: 'answer',   label: '回答', type: 'textarea' },
      ],
    },
  ],
}

const ctaBlock: BlockDef = {
  type: 'cta',
  label: 'CTA（行動喚起）',
  icon: '📣',
  description: '問い合わせや申し込みへ誘導するセクション',
  defaultProps: {
    title: 'まずは無料相談から',
    subtitle: 'お気軽にお問い合わせください。',
    buttonLabel: '無料相談を申し込む',
    buttonHref: '#contact',
    bgColor: '#0f172a',
  },
  schema: [
    { key: 'title',       label: '見出し',       type: 'text' },
    { key: 'subtitle',    label: 'サブテキスト',  type: 'textarea' },
    { key: 'buttonLabel', label: 'ボタンラベル',  type: 'text' },
    { key: 'buttonHref',  label: 'ボタンリンク',  type: 'text' },
    { key: 'bgColor',     label: '背景色',        type: 'color' },
  ],
}

const contactBlock: BlockDef = {
  type: 'contact',
  label: '問い合わせフォーム',
  icon: '📨',
  description: 'リード獲得用のお問い合わせフォーム',
  defaultProps: {
    title: 'お問い合わせ',
    subtitle: '24時間以内にご返信します',
    buttonLabel: '送信する',
  },
  schema: [
    { key: 'title',       label: '見出し',       type: 'text' },
    { key: 'subtitle',    label: 'サブテキスト',  type: 'text' },
    { key: 'buttonLabel', label: 'ボタンラベル',  type: 'text' },
  ],
}

const imageBlock: BlockDef = {
  type: 'image',
  label: '画像',
  icon: '🖼️',
  description: 'フォルダから画像をアップロード',
  defaultProps: {
    src: '',
    alt: '',
    caption: '',
  },
  schema: [
    { key: 'alt',     label: 'alt テキスト', type: 'text' },
    { key: 'caption', label: 'キャプション',  type: 'text' },
  ],
}

export const BLOCK_REGISTRY: Record<BlockType, BlockDef> = {
  hero:     heroBlock,
  services: servicesBlock,
  pricing:  pricingBlock,
  faq:      faqBlock,
  cta:      ctaBlock,
  contact:  contactBlock,
  image:    imageBlock,
}

/** ブロックパレットに表示する順序 */
export const BLOCK_PALETTE_ORDER: BlockType[] = [
  'hero',
  'services',
  'pricing',
  'faq',
  'cta',
  'contact',
  'image',
]
