import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ================================================================
// テストデータ生成ヘルパー
// ================================================================

/** 直近 maxDaysBack 日以内のランダム日時。bias7d = 直近7日に入る確率 */
function biasedDate(bias7d: number): Date {
  const daysBack =
    Math.random() < bias7d
      ? Math.random() * 7           // 直近7日
      : 7 + Math.random() * 23      // 8〜30日前
  return new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const SAMPLE_NAMES = [
  '田中 花子', '山田 太郎', '鈴木 一郎', '佐藤 美咲', '高橋 健二',
  '渡辺 さくら', '伊藤 拓也', '中村 愛', '小林 誠', '加藤 由美',
]
const SAMPLE_PHONES = [
  '090-1234-5678', '080-2345-6789', '070-3456-7890',
  '090-4567-8901', '080-5678-9012', '070-6789-0123',
]
const UTM_SOURCES = ['google', 'google', 'yahoo', null, null, null]

// ================================================================
// テストクライアント定義
// ================================================================
const TEST_CLIENTS = [
  { slug: 'test-gyosei-a', firmName: 'テスト事務所A（東京）', prefecture: '東京都'  },
  { slug: 'test-gyosei-b', firmName: 'テスト事務所B（大阪）', prefecture: '大阪府'  },
  { slug: 'test-gyosei-c', firmName: 'テスト事務所C（名古屋）', prefecture: '愛知県' },
  { slug: 'test-gyosei-d', firmName: 'テスト事務所D（福岡）', prefecture: '福岡県'  },
  { slug: 'test-gyosei-e', firmName: 'テスト事務所E（札幌）', prefecture: '北海道'  },
]

// ================================================================
// LP / リード配分計画
// [clientSlug, practiceAreaSlug, lpTitle, leadCount, bias7d]
//
// リード分布（意図的な偏り）:
//   Client A:18 / B:12 / C:9 / D:7 / E:4   合計50件
//   restaurant_permit:25 / visa_zairyu:15 / construction:10
//
// bias7d:
//   A(成長) 0.7〜0.8 / B(横ばい) 0.45〜0.55 /
//   C(下降) 0.20〜0.30 / D(急成長) 0.70 / E(低調) 0.20〜0.30
// ================================================================
type LpPlan = [string, string, string, number, number]

const LP_PLANS: LpPlan[] = [
  // Client A — 18件, 成長中
  ['test-gyosei-a', 'restaurant_permit', '飲食店営業許可 | テスト事務所A', 10, 0.80],
  ['test-gyosei-a', 'visa_zairyu',       '在留資格申請 | テスト事務所A',   5,  0.60],
  ['test-gyosei-a', 'construction',      '建設業許可 | テスト事務所A',     3,  0.50],
  // Client B — 12件, 横ばい
  ['test-gyosei-b', 'restaurant_permit', '飲食店営業許可 | テスト事務所B', 7,  0.55],
  ['test-gyosei-b', 'visa_zairyu',       '在留資格申請 | テスト事務所B',   5,  0.45],
  // Client C — 9件, 下降傾向
  ['test-gyosei-c', 'restaurant_permit', '飲食店営業許可 | テスト事務所C', 5,  0.30],
  ['test-gyosei-c', 'construction',      '建設業許可 | テスト事務所C',     4,  0.20],
  // Client D — 7件, 急成長
  ['test-gyosei-d', 'visa_zairyu',       '在留資格申請 | テスト事務所D',   4,  0.70],
  ['test-gyosei-d', 'restaurant_permit', '飲食店営業許可 | テスト事務所D', 3,  0.70],
  // Client E — 4件, 低調
  ['test-gyosei-e', 'visa_zairyu',       '在留資格申請 | テスト事務所E',   1,  0.30],
  ['test-gyosei-e', 'construction',      '建設業許可 | テスト事務所E',     3,  0.20],
]

async function main() {
  // ================================================================
  // 1. practice_areas マスタデータ
  //    slug は公開URL /lp/{client.slug}/{practice_area.slug} に使われる。変更不可
  // ================================================================
  const practiceAreas = [
    { slug: 'restaurant_permit', name: '飲食店営業許可',     category: 'permit',      sortOrder: 1 },
    { slug: 'construction',      name: '建設業許可',         category: 'permit',      sortOrder: 2 },
    { slug: 'transport',         name: '運送業許可',         category: 'permit',      sortOrder: 3 },
    { slug: 'liquor',            name: '酒類販売免許',       category: 'permit',      sortOrder: 4 },
    { slug: 'visa_zairyu',       name: '在留資格・ビザ申請', category: 'immigration', sortOrder: 5 },
    { slug: 'naturalization',    name: '帰化申請',           category: 'immigration', sortOrder: 6 },
    { slug: 'corporation_set',   name: '会社設立',           category: 'corporate',   sortOrder: 7 },
    { slug: 'inheritance',       name: '相続手続き',         category: 'inheritance', sortOrder: 8 },
    { slug: 'will',              name: '遺言書作成',         category: 'inheritance', sortOrder: 9 },
    { slug: 'subsidy',           name: '補助金・助成金申請', category: 'other',       sortOrder: 10 },
  ]

  for (const area of practiceAreas) {
    await prisma.practiceArea.upsert({
      where:  { slug: area.slug },
      update: { name: area.name, category: area.category, sortOrder: area.sortOrder },
      create: area,
    })
  }

  console.log(`✓ practice_areas: ${practiceAreas.length}件`)

  // ================================================================
  // 2. テスト用LP（飲食店営業許可）
  //    クライアント: test-gyosei / 業務: restaurant_permit
  // ================================================================
  const testClient      = await prisma.client.findUnique({ where: { slug: 'test-gyosei' } })
  const restaurantPermit = await prisma.practiceArea.findUnique({ where: { slug: 'restaurant_permit' } })

  if (testClient && restaurantPermit) {
    // ⚠️ content キー名は /docs/jsonb-schema.md に準拠。変更禁止
    const content = {
      hero: {
        headline:    '飲食店の営業許可、最短5日で取得します',
        subheadline: '書類収集から申請まで丸ごとサポート。難しい手続きはすべてお任せください。',
        cta_text:    '無料相談を申し込む',
        cta_note:    '相談料0円・全国対応・返信1営業日以内',
      },
      problems: {
        title: 'こんなお悩みありませんか？',
        items: [
          '許可申請の手続きが複雑で、何から始めればいいかわからない',
          '開業準備で忙しく、書類を揃える時間が取れない',
          '申請が通るか不安。一度失敗してしまったことがある',
        ],
      },
      features: {
        title: '選ばれる3つの理由',
        items: [
          {
            title: '最短5日でスピード申請',
            body:  '書類が揃い次第、最短5営業日で申請手続きを完了。開業日から逆算したスケジュール管理もお任せください。',
          },
          {
            title: '書類収集から申請まで完全サポート',
            body:  '必要書類のリストアップから役所への申請まで、すべて代行します。お客様の手間は最小限。',
          },
          {
            title: '全国対応・オンライン完結',
            body:  '来所不要。メール・電話・Web会議で全国どこでも対応しています。地方の方もお気軽にご相談ください。',
          },
        ],
      },
      flow: {
        title: '申請の流れ',
        steps: [
          '無料相談（現状ヒアリング・必要書類のご案内）',
          '書類の収集サポート（チェックリストをお渡しします）',
          '書類作成・役所への申請',
          '許可取得・お客様へご報告',
        ],
      },
      faq: {
        title: 'よくある質問',
        items: [
          {
            question: '費用はいくらですか？',
            answer:   '基本料金は55,000円（税込）〜です。物件の状況や申請の複雑さにより変動します。まずは無料相談でお見積りします。',
          },
          {
            question: 'どのくらいの期間がかかりますか？',
            answer:   '書類が揃ってから最短5営業日で申請できます。保健所の審査期間を含めると、許可取得まで通常2〜4週間が目安です。',
          },
          {
            question: '他の事務所に断られた案件でも対応できますか？',
            answer:   'はい、複雑な案件や過去に断られた案件もご相談ください。これまでの実績で難しいケースにも多数対応してきました。',
          },
          {
            question: '相談だけでも大丈夫ですか？',
            answer:   'もちろんです。相談料は一切かかりません。「まだ開業するか決めていない」という段階からでもお気軽にどうぞ。',
          },
        ],
      },
      profile: {
        title:          '事務所紹介',
        body:           'テスト行政書士事務所は、飲食店・小売業の開業支援を専門とする行政書士事務所です。年間100件以上の許可申請実績を持ち、スピードと丁寧なサポートを強みとしています。',
        representative: 'テスト 太郎',
        license_number: '第XXXXXX号',
      },
      cta_bottom: {
        headline:    'まずは無料相談から',
        subheadline: 'フォームに入力するだけ。1営業日以内にご連絡します。',
        cta_text:    '無料相談を申し込む',
        cta_note:    '相談料0円・押し売りなし',
      },
    }

    await prisma.landingPage.upsert({
      where: {
        clientId_practiceAreaId: {
          clientId:       testClient.id,
          practiceAreaId: restaurantPermit.id,
        },
      },
      update: {
        status:      'published',
        content,
        publishedAt: new Date(),
      },
      create: {
        clientId:        testClient.id,
        practiceAreaId:  restaurantPermit.id,
        title:           '飲食店営業許可 | テスト行政書士事務所',
        status:          'published',
        metaDescription: '飲食店の営業許可申請を最短5日でサポート。書類収集から申請まで丸ごとお任せ。相談料0円・全国対応。',
        targetKeywords:  ['飲食店 営業許可', '飲食店 開業 許可', '飲食店 許可 申請'],
        publishedAt:     new Date(),
        content,
      },
    })

    console.log('✓ landing_pages: test-gyosei / restaurant_permit（published）')
  } else {
    if (!testClient)       console.warn('⚠ クライアント test-gyosei が見つかりません。LP seedをスキップ。')
    if (!restaurantPermit) console.warn('⚠ practice_area restaurant_permit が見つかりません。LP seedをスキップ。')
  }

  // ================================================================
  // 3. テストデータ（5社・50件リード）
  //    testClient=true / testFlag=true で本番データと完全分離
  //    削除: npx tsx scripts/purgeTestData.ts
  // ================================================================

  // 3-1. テストクライアント upsert
  const clientMap = new Map<string, string>() // slug → id

  for (const tc of TEST_CLIENTS) {
    const c = await prisma.client.upsert({
      where:  { slug: tc.slug },
      update: { firmName: tc.firmName, testClient: true },
      create: {
        slug:               tc.slug,
        firmName:           tc.firmName,
        ownerName:          'テスト 担当者',
        email:              `seed@${tc.slug}.example.com`,
        prefecture:         tc.prefecture,
        status:             'active',
        monthlyFee:         30000,
        contractStartedAt:  new Date('2024-01-01'),
        testClient:         true,
      },
    })
    clientMap.set(tc.slug, c.id)
  }

  console.log(`✓ test clients: ${TEST_CLIENTS.length}社`)

  // 3-2. practice_area ID の取得（slug → id）
  const AREA_SLUGS = ['restaurant_permit', 'visa_zairyu', 'construction'] as const
  const areaMap = new Map<string, string>()

  for (const slug of AREA_SLUGS) {
    const a = await prisma.practiceArea.findUnique({ where: { slug } })
    if (!a) throw new Error(`practice_area が見つかりません: ${slug}`)
    areaMap.set(slug, a.id)
  }

  // 3-3. LP upsert + リード生成
  //      testFlag=true のリードが既に存在する場合はリード生成をスキップ（冪等）
  const existingTestLeads = await prisma.lead.count({ where: { testFlag: true } })

  if (existingTestLeads > 0) {
    console.log(`⚠ テストリードが既に ${existingTestLeads} 件存在します。リード生成をスキップ。`)
    console.log('  （再生成したい場合は先に npx tsx scripts/purgeTestData.ts を実行してください）')
  } else {
    let totalLeadsCreated = 0

    for (const [clientSlug, areaSlug, title, leadCount, bias7d] of LP_PLANS) {
      const clientId       = clientMap.get(clientSlug)
      const practiceAreaId = areaMap.get(areaSlug)

      if (!clientId || !practiceAreaId) {
        console.warn(`⚠ ID が見つかりません: ${clientSlug} / ${areaSlug} — スキップ`)
        continue
      }

      // LP upsert
      const lp = await prisma.landingPage.upsert({
        where:  { clientId_practiceAreaId: { clientId, practiceAreaId } },
        update: { title, status: 'published' },
        create: {
          clientId,
          practiceAreaId,
          title,
          status:      'published',
          content:     {},
          publishedAt: new Date('2024-01-01'),
        },
      })

      // リード生成（testFlag: true）
      const leadsData = Array.from({ length: leadCount }, () => ({
        clientId,
        practiceAreaId,
        landingPageId: lp.id,
        testFlag:      true,
        name:          pick(SAMPLE_NAMES),
        phone:         pick(SAMPLE_PHONES),
        email:         Math.random() < 0.6
                         ? `testuser${Math.floor(Math.random() * 99) + 1}@example.com`
                         : null,
        utmSource:     pick(UTM_SOURCES),
        createdAt:     biasedDate(bias7d),
      }))

      await prisma.lead.createMany({ data: leadsData })

      // ⚠️ 更新ルール: Lead INSERT と同時に totalLeads を更新
      await prisma.landingPage.update({
        where: { id: lp.id },
        data:  { totalLeads: { increment: leadCount } },
      })

      totalLeadsCreated += leadCount
    }

    console.log(`✓ test leads: ${totalLeadsCreated}件（testFlag=true）`)
  }

  // ================================================================
  // 4. マーケOS: Site と Page のデモデータ
  //    対象: test-gyosei-a（既存テストクライアントを再利用）
  // ================================================================
  const mosClientId = clientMap.get('test-gyosei-a')

  if (mosClientId) {
    // Site upsert（domain はダミー）
    const existingSite = await prisma.site.findFirst({
      where: { clientId: mosClientId, name: 'テスト事務所A 公式サイト' },
    })

    const site = existingSite ?? await prisma.site.create({
      data: {
        clientId: mosClientId,
        name:     'テスト事務所A 公式サイト',
        domain:   'test-gyosei-a.example.com',
      },
    })

    // Page upsert: トップページ
    const topPageBlocks = [
      {
        id:    'block-hero-1',
        type:  'hero',
        props: {
          title:    '行政書士・テスト事務所A',
          subtitle: '飲食店開業・在留資格・建設業許可など、許認可申請を全力サポートします。まずはお気軽にご相談ください。',
          ctaLabel: '無料相談はこちら',
          ctaHref:  '#contact',
          bgColor:  '#1e40af',
        },
      },
      {
        id:    'block-services-1',
        type:  'services',
        props: {
          title: '対応業務',
          items: [
            { icon: '🍜', title: '飲食店営業許可',     description: '保健所への申請書類作成から許可取得まで一括サポート' },
            { icon: '🛂', title: '在留資格・ビザ申請', description: '就労ビザ・永住・帰化など各種在留資格申請に対応' },
            { icon: '🏗️', title: '建設業許可',         description: '新規取得から更新まで、建設業許可申請を代行します' },
          ],
        },
      },
      {
        id:    'block-faq-1',
        type:  'faq',
        props: {
          title: 'よくある質問',
          items: [
            { question: '相談は無料ですか？',       answer: 'はい、初回相談は無料です。お気軽にお問い合わせください。' },
            { question: 'オンラインで対応できますか？', answer: 'はい、全国対応しています。Zoom等のオンライン面談も対応可能です。' },
            { question: '費用の目安を教えてください', answer: '業務内容によって異なります。ご相談時に詳細なお見積りをご提示します。' },
          ],
        },
      },
      {
        id:    'block-cta-1',
        type:  'cta',
        props: {
          title:       'まずは無料相談から',
          subtitle:    'お問い合わせから1営業日以内にご連絡します。',
          buttonLabel: '無料相談を申し込む',
          buttonHref:  '#contact',
          bgColor:     '#0f172a',
        },
      },
      {
        id:    'block-contact-1',
        type:  'contact',
        props: {
          title:       'お問い合わせ',
          subtitle:    '24時間受付・1営業日以内に返信します',
          buttonLabel: '送信する',
        },
      },
    ]

    await prisma.page.upsert({
      where:  { siteId_slug: { siteId: site.id, slug: 'top' } },
      update: { blocks: topPageBlocks, status: 'published' },
      create: {
        siteId: site.id,
        slug:   'top',
        title:  'トップページ',
        status: 'published',
        blocks: topPageBlocks,
      },
    })

    // Page upsert: 飲食店LP
    const lpBlocks = [
      {
        id:    'block-hero-lp',
        type:  'hero',
        props: {
          title:    '飲食店営業許可、最短5日で取得します',
          subtitle: '書類収集から申請まで丸ごとサポート。難しい手続きはすべてお任せください。',
          ctaLabel: '無料相談を申し込む',
          ctaHref:  '#contact',
          bgColor:  '#b45309',
        },
      },
      {
        id:    'block-pricing-lp',
        type:  'pricing',
        props: {
          title: '料金プラン',
          plans: [
            {
              name:        'スタンダード',
              price:       '¥55,000〜',
              features:    ['書類作成代行', '申請同行', 'アフターフォロー'],
              highlighted: false,
            },
            {
              name:        'プレミアム',
              price:       '¥88,000〜',
              features:    ['スタンダードの全て', '物件調査同行', '優先対応', '開業後1年サポート'],
              highlighted: true,
            },
          ],
        },
      },
      {
        id:    'block-contact-lp',
        type:  'contact',
        props: {
          title:       'お問い合わせ',
          subtitle:    '相談料0円・押し売りなし',
          buttonLabel: '無料相談を申し込む',
        },
      },
    ]

    await prisma.page.upsert({
      where:  { siteId_slug: { siteId: site.id, slug: 'lp-restaurant' } },
      update: { blocks: lpBlocks },
      create: {
        siteId: site.id,
        slug:   'lp-restaurant',
        title:  '飲食店営業許可 LP',
        status: 'draft',
        blocks: lpBlocks,
      },
    })

    console.log('✓ marketing-os: site=1 / pages=2（test-gyosei-a）')
  } else {
    console.warn('⚠ test-gyosei-a が見つかりません。マーケOSシードをスキップ。')
  }

  console.log('\n✅ seed 完了')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
