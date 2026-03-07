// ============================================================
// マーケOS ブロックシステム 型定義
// ブロック配列はDBの pages.blocks カラム（Json）に保存される
// ============================================================

export type BlockType =
  | 'hero'
  | 'services'
  | 'pricing'
  | 'faq'
  | 'cta'
  | 'contact'
  | 'image'

// ---- フィールドスキーマ（PropertiesPanelの自動描画に使用） ----

export type FieldType = 'text' | 'textarea' | 'color' | 'repeater'

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  /** repeaterの場合、各行のフィールド定義 */
  itemSchema?: FieldDef[]
}

// ---- ブロック定義（レジストリエントリ） ----

export interface BlockDef {
  type: BlockType
  label: string
  /** ブロックパレットに表示するアイコン（文字列 or 絵文字） */
  icon: string
  description: string
  defaultProps: Record<string, unknown>
  schema: FieldDef[]
}

// ---- ページデータ構造 ----

export interface Block {
  id: string
  type: BlockType
  props: Record<string, unknown>
}

export interface PageData {
  id: string
  siteId: string
  slug: string
  title: string
  status: 'draft' | 'published'
  blocks: Block[]
}

// ---- よく使うprops型（各ブロックコンポーネントで使用） ----

export interface HeroProps {
  title: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
  bgColor: string
}

export interface ServiceItem {
  title: string
  description: string
  icon: string
}

export interface ServicesProps {
  title: string
  items: ServiceItem[]
}

export interface PricingPlan {
  name: string
  price: string
  features: string[]
  highlighted: boolean
}

export interface PricingProps {
  title: string
  plans: PricingPlan[]
}

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQProps {
  title: string
  items: FAQItem[]
}

export interface CTAProps {
  title: string
  subtitle: string
  buttonLabel: string
  buttonHref: string
  bgColor: string
}

export interface ContactFormProps {
  title: string
  subtitle: string
  buttonLabel: string
}

export interface ImageProps {
  src: string
  alt: string
  caption: string
}
