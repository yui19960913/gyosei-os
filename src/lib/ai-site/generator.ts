import Anthropic from '@anthropic-ai/sdk'
import { PREF_TO_SLUG } from './types'
import type { GenerateInput, SiteContent } from './types'

const anthropic = new Anthropic()

const SYSTEM_PROMPT = `あなたは行政書士事務所専門のプロコピーライターです。
提供された情報をもとに、集客力の高いWebサイトコンテンツをJSON形式で生成してください。
出力はJSONのみ。マークダウンのコードブロック（\`\`\`json など）は絶対に使わないでください。
純粋なJSONオブジェクトだけを返してください。`

/** サイトコンテンツをAI生成する */
export async function generateSiteContent(input: GenerateInput): Promise<SiteContent> {
  const servicesText = input.services.join('、')
  const stylesText = input.styles.length > 0 ? input.styles.join('、') : '信頼感重視'

  const prefShort = input.prefecture.replace(/[都道府県]$/, '')

  const prompt = `
行政書士事務所の集客Webサイトコンテンツを生成してください。

【事務所情報】
事務所名: ${input.firmName}
代表者名: ${input.ownerName}
${input.ownerBio ? `代表者経歴: ${input.ownerBio}` : ''}
所在地: ${input.prefecture}
対応業務: ${servicesText}
事務所の強み: ${input.strengths}
ターゲット顧客: ${input.targetClients || '業務を必要とする全ての方'}
文章スタイル: ${stylesText}

以下のJSON形式で出力してください:

{
  "hero": {
    "headline": "メインキャッチコピー（25字以内・インパクト重視）",
    "subheadline": "詳細説明（50字以内・サービスと場所を含める）",
    "ctaText": "CTAボタンテキスト（12字以内）",
    "ctaNote": "補足テキスト（例：相談料0円・全国対応）"
  },
  "services": [
    {
      "name": "サービス名（${servicesText}から選択）",
      "description": "サービス説明（60字以内・メリット訴求）",
      "icon": "関連する絵文字1文字",
      "price": "料金目安（例：¥55,000〜）"
    }
  ],
  "profile": {
    "title": "事務所紹介",
    "body": "代表者名・経歴（あれば）・強みを自然に織り交ぜた事務所説明文（150字以内）",
    "strengths": ["強み1（20字以内）", "強み2（20字以内）", "強み3（20字以内）"]
  },
  "pricing": [
    {
      "name": "サービス名",
      "price": "¥55,000〜",
      "features": ["含まれる内容1", "含まれる内容2", "含まれる内容3"]
    }
  ],
  "area": {
    "description": "${prefShort}を中心に周辺エリア全域のご相談に対応しています（35字以内）",
    "areas": ["区/市1", "区/市2", "区/市3", "区/市4", "区/市5", "区/市6"]
  },
  "testimonials": [
    {
      "name": "A様（匿名）",
      "role": "相談内容（例：建設業許可）",
      "content": "お客様の感想（80字以内・具体的な体験談）"
    }
  ],
  "faq": [
    { "question": "質問（20字以内）", "answer": "回答（60字以内・安心感を与える）" }
  ],
  "cta": {
    "headline": "行動喚起の見出し（20字以内）",
    "subheadline": "補足テキスト（35字以内）",
    "ctaText": "ボタンテキスト（12字以内）"
  }
}

注意:
- servicesは選択された業務を全て含める（最大8つ）
- pricingは代表的なサービス3つ（servicesから選ぶ）
- area.areasは${input.prefecture}の主要な市区町村6〜8個
- testimonialsは3件生成（匿名）
- faqは5〜6件生成
- 全て自然な日本語で書く
- 強みのテキストをそのまま使わず、セールスコピーとして昇華させる`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

  return parseJsonSafely(rawText)
}

/** SEOキーワード候補を生成する（サイト生成と同時に呼ぶ） */
export async function generateSeoKeywords(input: GenerateInput): Promise<string[]> {
  const prefecture = input.prefecture.replace(/[都道府県]$/, '')

  const prompt = `
行政書士事務所（${input.prefecture}）のSEOページ用キーワードを10個生成してください。
対応業務: ${input.services.join('、')}

形式:「業務名 ${prefecture}」「業務名 地域名」のように「サービス × 地域」の組み合わせにしてください。
JSON配列で出力してください。例: ["建設業許可 東京", "飲食店営業許可 新宿", ...]
マークダウン不要。配列だけ返してください。`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]'

  try {
    const match = rawText.match(/\[[\s\S]*\]/)
    return match ? (JSON.parse(match[0]) as string[]) : []
  } catch {
    return []
  }
}

/** 一意スラッグを生成する */
export function buildSlug(prefecture: string): string {
  const prefSlug = PREF_TO_SLUG[prefecture] ?? 'japan'
  const suffix = Math.random().toString(36).substring(2, 8)
  return `${prefSlug}-${suffix}`
}

// ---- 内部ユーティリティ ----

function parseJsonSafely(text: string): SiteContent {
  // コードブロックを除去
  const clean = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    return JSON.parse(clean) as SiteContent
  } catch {
    // JSONを文字列中から抽出
    const match = clean.match(/\{[\s\S]*\}/)
    if (match) {
      return JSON.parse(match[0]) as SiteContent
    }
    throw new Error('AIの生成結果をJSONとして解析できませんでした')
  }
}
