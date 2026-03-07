/**
 * AiSite.status の "active" を "published" に一括更新
 * 実行: npx tsx scripts/migrate-status.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.aiSite.updateMany({
    where: { status: 'active' },
    data: { status: 'published' },
  })
  console.log(`Updated ${result.count} site(s): active → published`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
