export interface SiteTemplateTheme {
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

export const GYOSEI_TEMPLATES: SiteTemplateTheme[] = [
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

  // ── 写真ヒーロー: 相談シーン (33945329_s.jpg) ──
  {
    id: 'consult-warm',
    name: 'コンサルトウォーム',
    tag: '親しみ・相談',
    desc: '相談風景の写真で親しみやすさと安心感を演出',
    colors: { primary: '#2563EB', accent: '#60A5FA', bg: '#F8FAFF', surface: '#FFFFFF', text: '#1E293B', sub: '#64748B' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '10px', headerStyle: 'minimal', heroLayout: 'left' },
  },
  {
    id: 'consult-green',
    name: 'コンサルトグリーン',
    tag: '安心・寄り添い',
    desc: '相談風景×グリーンで寄り添う安心感を表現',
    colors: { primary: '#166534', accent: '#4ADE80', bg: '#F0FDF4', surface: '#FFFFFF', text: '#14532D', sub: '#6B8A6C' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '8px', headerStyle: 'bordered', heroLayout: 'center' },
  },
  {
    id: 'consult-plum',
    name: 'コンサルトプラム',
    tag: '上品・専門性',
    desc: '相談風景×プラムカラーで上品かつ専門的な印象',
    colors: { primary: '#7E22CE', accent: '#A855F7', bg: '#FAF5FF', surface: '#FFFFFF', text: '#3B0764', sub: '#9A7AB5' },
    style: { fontFamily: '"Noto Serif JP", serif', borderRadius: '6px', headerStyle: 'solid', heroLayout: 'left' },
  },

  // ── 写真ヒーロー: ビル街で会話 (34039686_s.jpg) ──
  {
    id: 'city-trust',
    name: 'シティトラスト',
    tag: '都会的・信頼',
    desc: 'ビル街の会話シーンで都会的な信頼感を演出',
    colors: { primary: '#1E40AF', accent: '#3B82F6', bg: '#EFF6FF', surface: '#FFFFFF', text: '#1E3A5F', sub: '#6B80A8' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '6px', headerStyle: 'solid', heroLayout: 'left' },
  },
  {
    id: 'city-modern',
    name: 'シティモダン',
    tag: '洗練・スマート',
    desc: 'ビル街の会話シーン×モノトーンで洗練されたスマートさ',
    colors: { primary: '#18181B', accent: '#71717A', bg: '#FAFAFA', surface: '#FFFFFF', text: '#09090B', sub: '#A1A1AA' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '4px', headerStyle: 'minimal', heroLayout: 'center' },
  },
  {
    id: 'city-warm',
    name: 'シティウォーム',
    tag: '都会・親しみ',
    desc: 'ビル街の会話シーン×暖色で都会的かつ親しみやすい印象',
    colors: { primary: '#B45309', accent: '#F59E0B', bg: '#FFFBEB', surface: '#FFFFFF', text: '#451A03', sub: '#92690D' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '10px', headerStyle: 'bordered', heroLayout: 'left' },
  },

  // ── 写真ヒーロー: 高層ビル (34156942_s.jpg) ──
  {
    id: 'tower-navy',
    name: 'タワーネイビー',
    tag: '格式・プロ',
    desc: '高層ビル×ネイビーで堂々とした格式とプロフェッショナル感',
    colors: { primary: '#1E3A8A', accent: '#2563EB', bg: '#EFF6FF', surface: '#FFFFFF', text: '#1E2E50', sub: '#6B80A8' },
    style: { fontFamily: '"Noto Serif JP", serif', borderRadius: '4px', headerStyle: 'solid', heroLayout: 'left' },
  },
  {
    id: 'tower-slate',
    name: 'タワースレート',
    tag: '都会的・先進',
    desc: '高層ビル×スレートグレーで先進的な都会のイメージ',
    colors: { primary: '#334155', accent: '#94A3B8', bg: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A', sub: '#94A3B8' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '6px', headerStyle: 'minimal', heroLayout: 'center' },
  },
  {
    id: 'tower-emerald',
    name: 'タワーエメラルド',
    tag: '信頼・成長',
    desc: '高層ビル×エメラルドで信頼と成長を象徴',
    colors: { primary: '#065F46', accent: '#10B981', bg: '#ECFDF5', surface: '#FFFFFF', text: '#022C22', sub: '#5A8A7A' },
    style: { fontFamily: '"Noto Sans JP", sans-serif', borderRadius: '8px', headerStyle: 'bordered', heroLayout: 'left' },
  },
]
