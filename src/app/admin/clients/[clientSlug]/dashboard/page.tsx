import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000)
}

function wowLabel(recent: number, prev: number): { text: string; cls: string } {
  if (recent === 0 && prev === 0) return { text: '—',    cls: 'text-gray-400' }
  if (prev === 0   && recent > 0) return { text: 'New',  cls: 'text-blue-600 font-semibold' }
  const pct = ((recent - prev) / prev * 100).toFixed(1)
  if (recent >= prev) return { text: `+${pct}%`, cls: 'text-green-600 font-semibold' }
  return { text: `${pct}%`, cls: 'text-red-500 font-semibold' }
}

export default async function ClientDashboardPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>
}) {
  const { clientSlug } = await params

  const client = await prisma.client.findUnique({
    where:  { slug: clientSlug },
    select: { id: true, firmName: true },
  })
  if (!client) notFound()

  const ago7  = daysAgo(7)
  const ago14 = daysAgo(14)
  const ago30 = daysAgo(30)

  const [
    count7d,
    count30d,
    countPrev7d,
    areaLeads7d,
    areaLeads30d,
    lpLeads7d,
    lpLeads30d,
    landingPages,
  ] = await Promise.all([
    prisma.lead.count({ where: { clientId: client.id, createdAt: { gte: ago7 } } }),
    prisma.lead.count({ where: { clientId: client.id, createdAt: { gte: ago30 } } }),
    prisma.lead.count({ where: { clientId: client.id, createdAt: { gte: ago14, lt: ago7 } } }),

    // ⚠️ clientId でスコープ
    prisma.lead.groupBy({
      by:    ['practiceAreaId'],
      where: { clientId: client.id, createdAt: { gte: ago7 } },
      _count: { id: true },
    }),
    prisma.lead.groupBy({
      by:    ['practiceAreaId'],
      where: { clientId: client.id, createdAt: { gte: ago30 } },
      _count: { id: true },
    }),
    prisma.lead.groupBy({
      by:    ['landingPageId'],
      where: { clientId: client.id, createdAt: { gte: ago7 } },
      _count: { id: true },
    }),
    prisma.lead.groupBy({
      by:    ['landingPageId'],
      where: { clientId: client.id, createdAt: { gte: ago30 } },
      _count: { id: true },
    }),

    // ⚠️ clientId でスコープ
    prisma.landingPage.findMany({
      where:   { clientId: client.id },
      include: { practiceArea: { select: { id: true, name: true } } },
    }),
  ])

  // Build lookup maps from 30d as base (show items active in 30d even if 0 in 7d)
  const areaMap7d   = new Map(areaLeads7d.map((r)  => [r.practiceAreaId, r._count.id]))
  const areaMap30d  = new Map(areaLeads30d.map((r) => [r.practiceAreaId, r._count.id]))
  const lpMap7d     = new Map(lpLeads7d.map((r)    => [r.landingPageId,  r._count.id]))
  const lpMap30d    = new Map(lpLeads30d.map((r)   => [r.landingPageId,  r._count.id]))
  const areaNameMap = new Map(landingPages.map((lp) => [lp.practiceAreaId, lp.practiceArea.name]))
  const lpTitleMap  = new Map(landingPages.map((lp) => [lp.id, lp.title]))

  // 30d as base: include all IDs that had leads in the last 30 days
  const areaRows = [...new Set(areaLeads30d.map((r) => r.practiceAreaId))]
    .map((id) => ({
      id,
      name: areaNameMap.get(id) ?? id,
      c7d:  areaMap7d.get(id)  ?? 0,
      c30d: areaMap30d.get(id) ?? 0,
    }))
    .sort((a, b) => b.c7d - a.c7d || b.c30d - a.c30d)

  const lpRows = [...new Set(lpLeads30d.map((r) => r.landingPageId))]
    .map((id) => ({
      id,
      title: lpTitleMap.get(id) ?? id,
      c7d:   lpMap7d.get(id)  ?? 0,
      c30d:  lpMap30d.get(id) ?? 0,
    }))
    .sort((a, b) => b.c7d - a.c7d || b.c30d - a.c30d)

  const maxArea = Math.max(...areaRows.map((r) => r.c7d), 1)
  const maxLp   = Math.max(...lpRows.map((r) => r.c7d), 1)
  const wow     = wowLabel(count7d, countPrev7d)

  return (
    <div className="space-y-8">

      {/* KPIカード */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 border-l-4 border-l-blue-500 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">直近7日リード</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">{count7d}</p>
          <p className="mt-1 text-xs text-gray-400">過去7日間</p>
        </div>
        <div className="rounded-lg border border-gray-200 border-l-4 border-l-violet-500 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">直近30日リード</p>
          <p className="mt-1 text-3xl font-bold text-violet-700">{count30d}</p>
          <p className="mt-1 text-xs text-gray-400">過去30日間</p>
        </div>
        <div className="rounded-lg border border-gray-200 border-l-4 border-l-amber-500 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">前週比</p>
          <p className={`mt-1 text-3xl font-bold ${wow.cls}`}>{wow.text}</p>
          <p className="mt-1 text-xs text-gray-400">直近7日 vs 直前7日</p>
        </div>
      </div>

      {/* 内訳パネル */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* 業務別 */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">業務別リード内訳</h2>
          {areaRows.length === 0 ? (
            <p className="text-sm text-gray-400">直近30日のリードなし</p>
          ) : (
            <ol className="space-y-3">
              {areaRows.map((row, i) => (
                <li key={row.id} className="flex items-center gap-3">
                  <span className="w-4 shrink-0 text-xs font-medium text-gray-400">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm text-gray-800">{row.name}</span>
                      <span className="shrink-0 tabular-nums text-sm font-bold text-gray-900">
                        {row.c7d}
                        <span className="ml-1 text-xs font-normal text-gray-400">/{row.c30d}</span>
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full bg-blue-500"
                        style={{ width: `${Math.round((row.c7d / maxArea) * 100)}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-4 text-xs text-gray-400">7日リード / 30日リード（30日実績ベース）</p>
        </div>

        {/* LP別 */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">LP別リード内訳</h2>
          {lpRows.length === 0 ? (
            <p className="text-sm text-gray-400">直近30日のリードなし</p>
          ) : (
            <ol className="space-y-3">
              {lpRows.map((row, i) => (
                <li key={row.id} className="flex items-center gap-3">
                  <span className="w-4 shrink-0 text-xs font-medium text-gray-400">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm text-gray-800">{row.title}</span>
                      <span className="shrink-0 tabular-nums text-sm font-bold text-gray-900">
                        {row.c7d}
                        <span className="ml-1 text-xs font-normal text-gray-400">/{row.c30d}</span>
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full bg-violet-500"
                        style={{ width: `${Math.round((row.c7d / maxLp) * 100)}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-4 text-xs text-gray-400">7日リード / 30日リード（30日実績ベース）</p>
        </div>

      </div>
    </div>
  )
}
