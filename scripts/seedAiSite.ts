/**
 * テスト用 AiSite レコードを挿入するスクリプト
 * 実行: npx tsx scripts/seedAiSite.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const siteContent = {
  hero: {
    headline: '複雑な許認可申請を\nスピーディーに解決します',
    subheadline: '東京都の行政書士として、会社設立から建設業許可まで幅広くサポート。初回相談無料で、あなたのビジネスをしっかり支援します。',
    ctaText: '無料相談はこちら',
    ctaNote: '※ 初回相談無料・秘密厳守',
  },
  services: [
    { name: '会社設立', description: '合同会社・株式会社の設立手続きを一括代行。最短1週間で法人化。', icon: '🏢', price: '¥55,000〜' },
    { name: '建設業許可', description: '新規・更新・業種追加に対応。書類作成から申請まで全て代行します。', icon: '🔨', price: '¥110,000〜' },
    { name: '飲食店営業許可', description: '保健所・消防署への申請をワンストップで対応。開業をスムーズに。', icon: '🍴', price: '¥44,000〜' },
    { name: 'ビザ申請', description: '就労ビザ・配偶者ビザ・永住許可など各種在留資格の申請をサポート。', icon: '✈️', price: '¥88,000〜' },
    { name: '補助金申請', description: '小規模事業者持続化補助金など各種補助金の申請書作成を支援。', icon: '💰', price: 'お見積り' },
    { name: '契約書作成', description: '業務委託・売買・賃貸借など各種契約書のドラフト・レビュー。', icon: '📝', price: '¥33,000〜' },
  ],
  profile: {
    title: '信頼と実績の行政書士事務所',
    body: '東京都新宿区に拠点を置く行政書士事務所です。2015年の開業以来、中小企業・個人事業主のお客様を中心に、許認可申請・会社設立・在留資格など幅広い業務を手がけてまいりました。お客様のビジネスの成長を全力でサポートします。',
    strengths: ['即日対応・スピード申請', '料金明確・追加費用なし', '申請実績500件以上'],
  },
  faq: [
    { question: '相談だけでも対応していただけますか？', answer: 'はい、初回相談は無料です。お気軽にお問い合わせください。電話・メール・Zoomでのオンライン相談も対応しています。' },
    { question: '料金はどのように決まりますか？', answer: '業務の種類・複雑さによって異なります。お見積りは無料ですので、まずはお問い合わせください。追加費用は一切発生しません。' },
    { question: '申請にどれくらい時間がかかりますか？', answer: '業務によって異なりますが、会社設立は最短1週間、建設業許可は1〜2ヶ月が目安です。お急ぎの場合はご相談ください。' },
    { question: '東京都以外でも対応していますか？', answer: 'はい、関東全域に対応しています。その他の地域についてもご相談ください。' },
  ],
  cta: {
    headline: 'まずはお気軽にご相談ください',
    subheadline: '初回相談無料・即日見積もり可能。あなたのビジネスに最適なプランをご提案します。',
    ctaText: '無料相談を予約する',
  },
}

async function main() {
  const slug = 'demo-gyosei-tokyo'

  const existing = await prisma.aiSite.findUnique({ where: { slug } })
  if (existing) {
    console.log(`既存レコードを更新: slug=${slug}`)
    await prisma.aiSite.update({
      where: { slug },
      data: { siteContent: siteContent as object, status: 'active' },
    })
  } else {
    await prisma.aiSite.create({
      data: {
        slug,
        firmName: '山田行政書士事務所',
        prefecture: '東京都',
        services: ['会社設立', '建設業許可', '飲食店営業許可', 'ビザ申請'],
        strengths: '即日対応・スピード申請、料金明確、申請実績500件以上',
        styles: ['信頼感重視', '専門性重視'],
        siteContent: siteContent as object,
        seoKeywords: ['東京都 行政書士', '会社設立 東京', '建設業許可 東京'],
        status: 'active',
        autoReply: false,
      },
    })
    console.log(`作成しました: slug=${slug}`)
  }

  console.log(`\n公開ページ: http://localhost:3000/site/${slug}`)
  console.log(`エディタ:   http://localhost:3000/editor/${slug}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
