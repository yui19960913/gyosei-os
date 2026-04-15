import Anthropic from '@anthropic-ai/sdk'
import { PREF_TO_SLUG } from './types'
import { derivePrefecture, buildPrefectureLabel, buildAreaDisplayList } from './areas'
import type { GenerateInput, SiteContent } from './types'

const SYSTEM_PROMPT = `あなたは行政書士事務所専門のプロコピーライターです。
提供された情報をもとに、集客力の高いWebサイトコンテンツをJSON形式で生成してください。
出力はJSONのみ。マークダウンのコードブロック（\`\`\`json など）は絶対に使わないでください。
純粋なJSONオブジェクトだけを返してください。

【日本語の品質基準】
以下は士業・法律系Webサイトとして不自然な表現です。絶対に使用しないでください。

❌ 禁止表現 → ✅ 正しい代替
・「話しかけてください」「お声がけください」→「お問い合わせください」
・「気軽に話しかけ」→「気軽にご相談」「気軽にお問い合わせ」
・「チャット」「DM」「メッセージ」→「お問い合わせ」「ご連絡」
・「サービス」（単独使用）→「業務」「申請手続き」「サポート」
・「プロフィール」→「代表者紹介」「事務所紹介」
・「シェア」「いいね」→ 使用禁止
・「ぜひ」の多用（1文書に2回以上）→ 1回まで
・「〜となっております」→「〜です」「〜となっています」
・「〜させていただきます」の多用→「〜いたします」「〜します」に置き換え
・「リーズナブル」「コスパ」→「適正な費用」「明確な料金体系」
・「アフターフォロー」→「手続き完了後のサポート」「継続サポート」
・語尾「〜ませ」の連続使用（例：「くださいませ」）→ 避ける

【CTAテキストの例（参考）】
・「無料相談はこちら」「まずはご相談を」「お問い合わせはこちら」
・「今すぐ相談する」「無料でご相談」「相談予約をする」

【基本トーン】
丁寧・誠実・専門的。読者は法的手続きに不安を抱えた一般の方。
過度にカジュアルな表現・SNS的な言い回しは避け、信頼感を重視すること。

【文章スタイル別ガイドライン】
ユーザーが選んだ文章スタイルに応じて、以下のガイドラインを厳守すること。

■ 信頼感重視
- キーワード: 誠実・実直・確か・責任・丁寧・承ります
- 文末: 〜いたします / 〜に努めます / 〜承ります（命令形・感嘆符を避ける）
- リズム: 中長文（20〜30字）、句点区切り、見出しは体言止め
- 強調: 経験年数・専門知識の深さ・お客様の財産や生活を守る責任感
- 見出し例: 「誠実な対応と確かな実績で、大切な手続きを支えます」「〇〇のご相談、確実にお受けいたします」
- 禁止: 感嘆符の多用・SNS的口語・根拠のない最上級（「最高の」「完璧な」）

■ 親しみやすい
- キーワード: 身近な・寄り添う・まずはご相談・わかりやすく・地域密着・一緒に
- 文末: 〜ます / 〜ませんか？ / 〜ご安心ください（問いかけ形を積極的に使う）
- リズム: 短文（15〜20字）、問いかけ→回答の構造、ひらがな多め
- 強調: 相談しやすさ・人柄・「初めての方でも安心」・敷居の低さ
- 見出し例: 「一人で悩まず、まずご相談ください」「身近な法律の相談相手として」
- 禁止: 法律用語の羅列・数値の冷たい並列・格調を強調するフォーマル表現

■ 専門性重視
- キーワード: 専門・特化・精通・申請取次・法的根拠・完全対応・迅速かつ確実
- 文末: 〜が可能です / 〜に対応しています / 〜いたします（能動的・断定的）
- リズム: やや長文（25〜40字）、情報密度高め、箇条書き積極活用
- 強調: 業務特化の深さ・難易度の高い案件の解決力・法的知識の確かさ
- 見出し例: 「〇〇申請専門。要件から書類作成まで完全対応」「他所で断られた案件もご相談ください」
- 禁止: 「わかりやすく」「気軽に」・感情的表現（寄り添う・心を込めて）・曖昧表現

■ 実績重視
- キーワード: 年間〇件・累計〇件・実績・許可率・解決率・数字が証明する・保証
- 文末: 〜の実績があります / 〜を達成しています / 〜保証いたします（断言・約束）
- リズム: 短文＋数値の組み合わせ（「年間〇件。業界最多水準」）、数字を文の中心に
- 強調: 定量的な実績・他事務所との比較優位・保証制度・成功事例のエビデンス
- 見出し例: 「累計〇〇件の実績が証明する確かな申請力」「許可取得実績〇〇件。結果でお応えします」
- 禁止: 曖昧な形容詞（豊富な・多くの）・謙遜表現・感情的・情緒的な表現`

/** サイトコンテンツをAI生成する */
export async function generateSiteContent(input: GenerateInput): Promise<SiteContent> {
  const anthropic = new Anthropic()
  const servicesText = input.services.join('、')
  const styleGuideMap: Record<string, string> = {
    '信頼感重視': '信頼感重視（誠実・実直・承ります。中長文。感嘆符・SNS口語禁止）',
    '親しみやすい': '親しみやすい（身近な・寄り添う・問いかけ形。短文・ひらがな多め。法律用語羅列禁止）',
    '専門性重視': '専門性重視（特化・精通・断定的。やや長文・情報密度高め。曖昧表現・感情表現禁止）',
    '実績重視': '実績重視（数字中心・断言・保証。短文＋数値の組み合わせ。曖昧形容詞・謙遜表現禁止）',
  }
  const stylesText = input.styles.length > 0
    ? input.styles.map(s => styleGuideMap[s] ?? s).join('、')
    : styleGuideMap['信頼感重視']

  // ビザ・在留資格関連業務が含まれるかどうかで④型を優先
  const isVisaRelated = input.services.some(s =>
    s.includes('ビザ') || s.includes('帰化') || s.includes('在留')
  )

  const headlineGuide = `メインキャッチコピー（完結した1文・20字以内）

以下の4つの型パターンから最も適切なものを選び、{専門分野}・{事務所名}に実際の情報を当てはめて生成してください。
型はそのままコピーせず、自然な日本語になるよう微調整してよい。

① 専門特化型（標準）:
「{専門分野}は、お任せください。」
「{専門分野}のことなら、{事務所名}へ。」
「{専門分野}の手続き、全部引き受けます。」
「{専門分野}で困ったら、まずご相談を。」
「{専門分野}、一緒に解決しましょう。」
「{専門分野}の専門家が、全力でサポートします。」
「{専門分野}をもっとシンプルに。」
「{専門分野}の手続き、プロに任せませんか。」
「{専門分野}なら、{事務所名}にご相談ください。」
「{専門分野}の悩み、ここで解決。」

② 悩み解決型:
「複雑な{専門分野}、丸ごと解決します。」
「{専門分野}の不安、一緒に解消しましょう。」
「{専門分野}でお困りなら、まずは一言。」
「{専門分野}の手続き、難しく考えなくて大丈夫。」
「{専門分野}の複雑な書類、全部お任せ。」
「{専門分野}の手続き、一人で抱え込まないで。」
「{専門分野}の手間、ぜんぶ引き受けます。」
「{専門分野}の不安を、安心に変えます。」

③ 安心訴求型:
「はじめての{専門分野}も、安心して。」
「{専門分野}、丁寧にご説明します。」
「はじめてでも、安心してご相談ください。」
「{専門分野}、一から一緒に考えます。」
「{専門分野}、わかりやすく・確実に。」
「{専門分野}、納得いくまでご説明します。」
「あなたのペースで、{専門分野}を進めましょう。」

${isVisaRelated ? `④ 想い訴求型（在留資格・ビザ関連 → 優先して使用）:
「あなたの大切な手続き、真剣に取り組みます。」
「{専門分野}を通じて、あなたの未来を応援します。」
「あなたの「やりたい」を、形にするお手伝いを。」
「{専門分野}で、あなたの一歩を後押しします。」
「大切な決断だから、一緒に考えたい。」
「あなたの想いに、全力で応えます。」
「{専門分野}、あなたのために全力を尽くします。」
「寄り添いながら、{専門分野}をサポートします。」` : ''}

【選択指針】
${isVisaRelated ? '- ビザ・在留資格関連が含まれるため ④想い訴求型 を最優先で使用すること' : '- ①専門特化型 または ②悩み解決型 を基本とし、スタイルが親しみやすい場合は ③安心訴求型 も可'}
- {専門分野}には対応業務（${servicesText}）から最も代表的なものを入れる
- {事務所名}には「${input.firmName}」を入れる

【禁止ルール】
- 述語だけで終わるフレーズ禁止（「誠実に」「真摯に」など副詞のみで終わるもの）
- 抽象的な形容詞だけを並べたフレーズ禁止
- {専門分野}・{事務所名}をプレースホルダーのまま出力しない`

  const prefShort = derivePrefecture(input.serviceAreas).replace(/[都道府県]$/, '')
  const areaText = input.serviceAreas.includes('全国') ? '全国' : input.serviceAreas.slice(0, 5).join('・')

  const prompt = `
行政書士事務所の集客Webサイトコンテンツを生成してください。

【事務所情報】
事務所名: ${input.firmName}
代表者名: ${input.ownerName}
${input.ownerBio ? `代表者経歴: ${input.ownerBio}` : ''}
主な対応エリア: ${areaText}
対応業務: ${servicesText}
事務所の強み: ${input.strengths}
文章スタイル: ${stylesText}

以下のJSON形式で出力してください:

{
  "hero": {
    "headline": "${headlineGuide}",
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
- testimonialsは3件生成（匿名）
- faqは5〜6件生成
- 全て自然な日本語で書く
- 強みのテキストをそのまま使わず、セールスコピーとして昇華させる`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

  const content = sanitizeSiteContent(parseJsonSafely(rawText)) as SiteContent

  // 対応エリアはユーザー入力から構築
  const areaList = buildAreaDisplayList(input.serviceAreas)
  if (areaList.length > 0) {
    content.area = {
      description: input.serviceAreas.includes('全国')
        ? '全国からのご相談に対応しています。オンライン対応も承っています。'
        : `${prefShort}を中心に周辺エリアのご相談に対応しています。`,
      areas: areaList,
    }
  } else {
    content.area = undefined
  }

  content.prefectureLabel = buildPrefectureLabel(input.serviceAreas)

  return content
}

/** SEOキーワード候補を生成する（サイト生成と同時に呼ぶ） */
export async function generateSeoKeywords(input: GenerateInput): Promise<string[]> {
  const anthropic = new Anthropic()
  const derivedPref = derivePrefecture(input.serviceAreas)
  const prefecture = derivedPref.replace(/[都道府県]$/, '')

  const prompt = `
行政書士事務所（${derivedPref}）のSEOページ用キーワードを10個生成してください。
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

// ---- 日本語サニタイザー ----

/** 生成後にHP用として不自然な表現を機械的に置換する */
function sanitizeJapanese(text: string): string {
  const replacements: [RegExp, string][] = [
    [/話しかけてください/g,       'お問い合わせください'],
    [/お声がけください/g,         'お問い合わせください'],
    [/気軽に話しかけ/g,           '気軽にお問い合わせ'],
    [/お気軽にどうぞ/g,           'お気軽にお問い合わせください'],
    [/チャットで相談/g,           'お問い合わせフォームよりご相談'],
    [/アフターフォロー/g,         '手続き完了後のサポート'],
    [/リーズナブル/g,             '適正な費用'],
    [/コスパ/g,                   '費用対効果'],
    [/〜させていただきます。/g,   '〜いたします。'],
    [/くださいませ/g,             'ください'],
    [/となっております。/g,       'となっています。'],
  ]
  return replacements.reduce((s, [pattern, replacement]) => s.replace(pattern, replacement), text)
}

/** SiteContentの文字列フィールドを再帰的にサニタイズする */
function sanitizeSiteContent(obj: unknown): unknown {
  if (typeof obj === 'string') return sanitizeJapanese(obj)
  if (Array.isArray(obj)) return obj.map(sanitizeSiteContent)
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, sanitizeSiteContent(v)])
    )
  }
  return obj
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
