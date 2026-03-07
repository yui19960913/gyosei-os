/**
 * テストデータ一括削除スクリプト
 *
 * 削除対象:
 *   - leads     where testFlag = true
 *   - その他    where clientId IN (clients where testClient = true)
 *
 * 本番データ（testClient=false / testFlag=false）には一切触れない。
 *
 * 実行:
 *   npx tsx scripts/purgeTestData.ts
 *
 * ⚠️ UIや管理画面に一括削除ボタンを実装してはいけない（設計上の制約）。
 *    削除はこの CLI スクリプトからのみ行うこと。
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== テストデータ削除 ===')
  console.log('対象: testFlag=true のリード、testClient=true のクライアント関連データ')
  console.log('本番データ（testClient=false / testFlag=false）は削除しません。\n')

  // 削除対象のテストクライアントを特定
  const testClients = await prisma.client.findMany({
    where:  { testClient: true },
    select: { id: true, firmName: true, slug: true },
  })
  const testClientIds = testClients.map((c) => c.id)

  if (testClientIds.length === 0) {
    const orphanLeads = await prisma.lead.count({ where: { testFlag: true } })
    if (orphanLeads === 0) {
      console.log('テストデータが見つかりません。何もしません。')
      return
    }
    // テストクライアントがなくても孤立リードがある場合は削除
    const { count } = await prisma.lead.deleteMany({ where: { testFlag: true } })
    console.log(`✓ leads（孤立 testFlag）削除: ${count}件`)
    console.log('\n完了。')
    return
  }

  console.log(`対象クライアント（${testClients.length}社）:`)
  testClients.forEach((c) => console.log(`  - ${c.firmName}（${c.slug}）`))
  console.log()

  // 1. testFlag=true のリードを削除（clientId スコープ外の孤立リードも含め安全に削除）
  const { count: leadCount } = await prisma.lead.deleteMany({
    where: { testFlag: true },
  })
  console.log(`✓ leads 削除: ${leadCount}件`)

  // 2. AI生成ログ（testClient 配下）
  const { count: logCount } = await prisma.aiGenerationLog.deleteMany({
    where: { clientId: { in: testClientIds } },
  })
  if (logCount > 0) console.log(`✓ ai_generation_logs 削除: ${logCount}件`)

  // 3. 月次レポート（testClient 配下）
  const { count: reportCount } = await prisma.monthlyReport.deleteMany({
    where: { clientId: { in: testClientIds } },
  })
  if (reportCount > 0) console.log(`✓ monthly_reports 削除: ${reportCount}件`)

  // 4. 請求書（testClient 配下）
  const { count: invoiceCount } = await prisma.invoice.deleteMany({
    where: { clientId: { in: testClientIds } },
  })
  if (invoiceCount > 0) console.log(`✓ invoices 削除: ${invoiceCount}件`)

  // 5. LP（testClient 配下）— leads より後に削除すること
  const { count: lpCount } = await prisma.landingPage.deleteMany({
    where: { clientId: { in: testClientIds } },
  })
  console.log(`✓ landing_pages 削除: ${lpCount}件`)

  // 6. テストクライアント本体
  const { count: clientCount } = await prisma.client.deleteMany({
    where: { testClient: true },
  })
  console.log(`✓ clients 削除: ${clientCount}社`)

  console.log('\n✅ 完了。本番データ（testClient=false / testFlag=false）は無傷です。')
}

main()
  .catch((e) => {
    console.error('削除中にエラーが発生しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
