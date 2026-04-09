// ============================================================
// AI集客OS 型定義
// ============================================================

export interface UserTestimonial {
  name: string
  content: string
}

export interface GenerateInput {
  firmName: string
  services: string[]
  strengths: string
  /** 対応エリア（必須: エリア選択画面で選択した値の配列） */
  serviceAreas: string[]
  styles: string[]
  /** 代表者名（必須） */
  ownerName: string
  /** 代表者経歴（任意: 入力された場合サイトに掲載） */
  ownerBio?: string
  /** お客様の声（任意・最大5件: 入力された場合のみサイトに掲載） */
  userTestimonials?: UserTestimonial[]
  /** 問い合わせ通知先メール（必須: 問い合わせが来たときに届く） */
  ownerEmail: string
  /** LINE公式アカウントURL（任意） */
  lineSns?: string
  /** FacebookページURL（任意） */
  facebookSns?: string
}

export interface HeroContent {
  headline: string
  subheadline: string
  ctaText: string
  ctaNote: string
  heroFontSize?: number
}

export interface ServiceContent {
  name: string
  description: string
  icon: string
  price: string
}

export interface ProfileContent {
  title: string
  body: string
  strengths: string[]
  /** 行政書士本人の写真URL（フリープランで追加可能） */
  profilePhotoUrl?: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface CTAContent {
  headline: string
  subheadline: string
  ctaText: string
}

export interface PricingItem {
  name: string
  price: string
  features: string[]
}

export interface AreaContent {
  description: string
  areas: string[]
}

export interface TestimonialItem {
  name: string
  role: string
  content: string
}

export interface SocialLinks {
  line?: string
  facebook?: string
  instagram?: string
}

export interface MapLocation {
  address: string
}

export interface SiteContent {
  hero: HeroContent
  services: ServiceContent[]
  profile: ProfileContent
  pricing?: PricingItem[]
  area?: AreaContent
  testimonials?: TestimonialItem[]
  faq: FAQItem[]
  cta: CTAContent
  /** 都道府県バッジのテキスト（例: 埼玉県の行政書士）。編集可能 */
  prefectureLabel?: string
  /** 料金セクションのCTAテキスト（例: 無料相談はこちら →）。編集可能 */
  pricingCtaText?: string
  /** SNSリンク（月額プランのみ設定可能） */
  social?: SocialLinks
  /** Googleマップ表示用の事務所住所 */
  map?: MapLocation
}

export interface GenerateResult {
  slug: string
  siteId: string
  siteContent: SiteContent
  seoKeywords: string[]
}

// 47都道府県 → ローマ字変換マップ
export const PREF_TO_SLUG: Record<string, string> = {
  '北海道': 'hokkaido', '青森県': 'aomori',   '岩手県': 'iwate',
  '宮城県': 'miyagi',   '秋田県': 'akita',    '山形県': 'yamagata',
  '福島県': 'fukushima','茨城県': 'ibaraki',  '栃木県': 'tochigi',
  '群馬県': 'gunma',    '埼玉県': 'saitama',  '千葉県': 'chiba',
  '東京都': 'tokyo',    '神奈川県': 'kanagawa','新潟県': 'niigata',
  '富山県': 'toyama',   '石川県': 'ishikawa', '福井県': 'fukui',
  '山梨県': 'yamanashi','長野県': 'nagano',   '岐阜県': 'gifu',
  '静岡県': 'shizuoka', '愛知県': 'aichi',    '三重県': 'mie',
  '滋賀県': 'shiga',    '京都府': 'kyoto',    '大阪府': 'osaka',
  '兵庫県': 'hyogo',    '奈良県': 'nara',     '和歌山県': 'wakayama',
  '鳥取県': 'tottori',  '島根県': 'shimane',  '岡山県': 'okayama',
  '広島県': 'hiroshima','山口県': 'yamaguchi','徳島県': 'tokushima',
  '香川県': 'kagawa',   '愛媛県': 'ehime',    '高知県': 'kochi',
  '福岡県': 'fukuoka',  '佐賀県': 'saga',     '長崎県': 'nagasaki',
  '熊本県': 'kumamoto', '大分県': 'oita',     '宮崎県': 'miyazaki',
  '鹿児島県': 'kagoshima','沖縄県': 'okinawa',
}

export const ALL_PREFECTURES = Object.keys(PREF_TO_SLUG)

export const SERVICE_OPTIONS = [
  '会社設立', '建設業許可', '飲食店営業許可', '補助金申請',
  'ビザ申請', '契約書作成', '遺言・相続', '運送業許可',
  '宅建業許可', '古物商許可', '農地転用', '帰化申請',
]

export const STYLE_OPTIONS = [
  '信頼感重視', '親しみやすい', '専門性重視', '実績重視',
]
