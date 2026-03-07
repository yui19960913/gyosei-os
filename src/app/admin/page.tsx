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

type RankItem = { label: string; count7d: number; count30d: number }

function RankCard({ title, items }: { title: string; items: RankItem[] }) {
  const max = Math.max(...items.map((i) => i.count7d), 1)
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold text-gray-700">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">データなし</p>
      ) : (
        <ol className="space-y-3">
          {items.map((item, i) => (
            <li key={item.label} className="flex items-center gap-3">
              <span className="w-4 shrink-0 text-xs font-medium text-gray-400">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm text-gray-800">{item.label}</span>
                  <span className="shrink-0 tabular-nums text-sm font-bold text-gray-900">
                    {item.count7d}
                    <span className="ml-1 text-xs font-normal text-gray-400">/{item.count30d}</span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full bg-blue-500"
                    style={{ width: `${Math.round((item.count7d / max) * 100)}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-4 text-xs text-gray-400">7日リード / 30日リード</p>
    </div>
  )
}

export default async function AdminPage() {
  const ago7  = daysAgo(7)
  const ago14 = daysAgo(14)
  const ago30 = daysAgo(30)

  const [
    total7d,
    total30d,
    totalPrev7d,
    clientRank7d,
    clientRank30d,
    clients,
    areaRank7d,
    areaRank30d,
    areas,
    lpRank7d,
    lpRank30d,
    landingPages,
  ] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: ago7 } } }),
    prisma.lead.count({ where: { createdAt: { gte: ago30 } } }),
    prisma.lead.count({ where: { createdAt: { gte: ago14, lt: ago7 } } }),

    prisma.lead.groupBy({
      by:      ['clientId'],
      where:   { createdAt: { gte: ago7 } },
      _count:  { id: true },
      orderBy: { _count: { id: 'desc' } },
      take:    5,
    }),
    prisma.lead.groupBy({
      by:    ['clientId'],
      where: { createdAt: { gte: ago30 } },
      _count: { id: true },
    }),
    prisma.client.findMany({ select: { id: true, firmName: true } }),

    prisma.lead.groupBy({
      by:      ['practiceAreaId'],
      where:   { createdAt: { gte: ago7 } },
      _count:  { id: true },
      orderBy: { _count: { id: 'desc' } },
      take:    5,
    }),
    prisma.lead.groupBy({
      by:    ['practiceAreaId'],
      where: { createdAt: { gte: ago30 } },
      _count: { id: true },
    }),
    prisma.practiceArea.findMany({ select: { id: true, name: true } }),

    prisma.lead.groupBy({
      by:      ['landingPageId'],
      where:   { createdAt: { gte: ago7 } },
      _count:  { id: true },
      orderBy: { _count: { id: 'desc' } },
      take:    5,
    }),
    prisma.lead.groupBy({
      by:    ['landingPageId'],
      where: { createdAt: { gte: ago30 } },
      _count: { id: true },
    }),
    prisma.landingPage.findMany({ select: { id: true, title: true } }),
  ])

  const clientNameMap  = new Map(clients.map((c) => [c.id, c.firmName]))
  const areaNameMap    = new Map(areas.map((a) => [a.id, a.name]))
  const lpTitleMap     = new Map(landingPages.map((l) => [l.id, l.title]))

  const client30dMap = new Map(clientRank30d.map((r) => [r.clientId,       r._count.id]))
  const area30dMap   = new Map(areaRank30d.map((r)   => [r.practiceAreaId, r._count.id]))
  const lp30dMap     = new Map(lpRank30d.map((r)     => [r.landingPageId,  r._count.id]))

  const clientItems: RankItem[] = clientRank7d.map((r) => ({
    label:   clientNameMap.get(r.clientId) ?? r.clientId,
    count7d: r._count.id,
    count30d: client30dMap.get(r.clientId) ?? 0,
  }))
  const areaItems: RankItem[] = areaRank7d.map((r) => ({
    label:   areaNameMap.get(r.practiceAreaId) ?? r.practiceAreaId,
    count7d: r._count.id,
    count30d: area30dMap.get(r.practiceAreaId) ?? 0,
  }))
  const lpItems: RankItem[] = lpRank7d.map((r) => ({
    label:   lpTitleMap.get(r.landingPageId) ?? r.landingPageId,
    count7d: r._count.id,
    count30d: lp30dMap.get(r.landingPageId) ?? 0,
  }))

  const wow = wowLabel(total7d, totalPrev7d)

  return (
    <div className="space-y-8">

      {/* KPIカード */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 border-l-4 border-l-blue-500 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">直近7日リード</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">{total7d}</p>
          <p className="mt-1 text-xs text-gray-400">過去7日間（全体）</p>
        </div>
        <div className="rounded-lg border border-gray-200 border-l-4 border-l-violet-500 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">直近30日リード</p>
          <p className="mt-1 text-3xl font-bold text-violet-700">{total30d}</p>
          <p className="mt-1 text-xs text-gray-400">過去30日間（全体）</p>
        </div>
        <div className="rounded-lg border border-gray-200 border-l-4 border-l-amber-500 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">前週比</p>
          <p className={`mt-1 text-3xl font-bold ${wow.cls}`}>{wow.text}</p>
          <p className="mt-1 text-xs text-gray-400">直近7日 vs 直前7日</p>
        </div>
      </div>

      {/* ランキング */}
      <div className="grid gap-4 lg:grid-cols-3">
        <RankCard title="クライアント別（7日 TOP5）" items={clientItems} />
        <RankCard title="業務別（7日 TOP5）"         items={areaItems}   />
        <RankCard title="LP別（7日 TOP5）"           items={lpItems}     />
      </div>

    </div>
  )
}
