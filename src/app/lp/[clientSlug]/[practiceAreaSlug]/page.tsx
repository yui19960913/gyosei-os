import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import LeadForm from './LeadForm'

// ⚠️ contentのキー名は /docs/jsonb-schema.md に準拠。変更禁止
type LpContent = {
  hero?: {
    headline?:    string
    subheadline?: string
    cta_text?:    string
    cta_note?:    string
  }
  problems?: {
    title?: string
    items?: string[]
  }
  features?: {
    title?: string
    items?: { title: string; body: string }[]
  }
  flow?: {
    title?: string
    steps?: string[]
  }
  faq?: {
    title?: string
    items?: { question: string; answer: string }[]
  }
  profile?: {
    title?:          string
    body?:           string
    representative?: string
    license_number?: string
    image_url?:      string
  }
  cta_bottom?: {
    headline?:    string
    subheadline?: string
    cta_text?:    string
    cta_note?:    string
  }
}

const STATS = [
  { number: '100件+',  label: '年間サポート実績' },
  { number: '最短5日', label: '申請スピード' },
  { number: '500件+',  label: '累計サポート件数' },
]

type Props = {
  params: Promise<{ clientSlug: string; practiceAreaSlug: string }>
}

async function getLp(clientSlug: string, practiceAreaSlug: string) {
  return prisma.landingPage.findFirst({
    where: {
      status:       'published',
      client:       { slug: clientSlug },
      practiceArea: { slug: practiceAreaSlug },
    },
    include: {
      client:       { select: { firmName: true, phone: true, slug: true } },
      practiceArea: { select: { name: true, slug: true } },
    },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clientSlug, practiceAreaSlug } = await params
  const lp = await getLp(clientSlug, practiceAreaSlug)
  if (!lp) return {}
  return {
    title:       lp.title,
    description: lp.metaDescription ?? undefined,
  }
}

export default async function LpPage({ params }: Props) {
  const { clientSlug, practiceAreaSlug } = await params
  const lp = await getLp(clientSlug, practiceAreaSlug)

  if (!lp) notFound()

  const c = lp.content as LpContent
  const hero       = c.hero       ?? {}
  const problems   = c.problems   ?? {}
  const features   = c.features   ?? {}
  const flow       = c.flow       ?? {}
  const faq        = c.faq        ?? {}
  const profile    = c.profile    ?? {}
  const cta_bottom = c.cta_bottom ?? {}

  const formId = 'inquiry-form'

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">

      {/* ===== ヘッダー ===== */}
      <header className="bg-blue-950 px-6 py-4 border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              {lp.practiceArea.name}
            </p>
            <p className="mt-0.5 text-sm font-bold text-white">{lp.client.firmName}</p>
          </div>
          {lp.client.phone && (
            <a
              href={`tel:${lp.client.phone}`}
              className="flex items-center gap-2 rounded-full border border-amber-400/40 px-4 py-1.5 text-sm font-semibold text-amber-400 transition-colors hover:bg-amber-400/10"
            >
              <span>📞</span>
              <span>{lp.client.phone}</span>
            </a>
          )}
        </div>
      </header>

      {/* ===== ヒーロー（左:コピー / 右:写真エリア）===== */}
      <section className="bg-blue-950">
        <div className="mx-auto grid max-w-6xl lg:grid-cols-2">

          {/* 左: コピー */}
          <div className="flex flex-col justify-center px-8 py-20 lg:px-16 lg:py-28">
            <span className="inline-block w-fit rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-amber-400">
              開業伴走型サポート
            </span>

            <h1 className="mt-5 text-3xl font-black leading-snug tracking-tight text-white sm:text-4xl">
              {hero.headline
                ? hero.headline.split('\n').map((line, i, arr) => (
                    <span key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))
                : lp.title}
            </h1>

            <p className="mt-5 text-base leading-relaxed text-blue-300">
              {hero.subheadline}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={`#${formId}`}
                className="inline-block rounded-lg bg-amber-400 px-8 py-3.5 text-center text-base font-extrabold text-blue-950 transition-all hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/20"
              >
                {hero.cta_text ?? '無料で開業相談する'}
              </a>
              {hero.cta_note && (
                <p className="text-sm text-blue-400">{hero.cta_note}</p>
              )}
            </div>
          </div>

          {/* 右: 写真エリア（現場写真を差し込む想定） */}
          <div className="relative hidden lg:block">
            {profile.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.image_url}
                alt="事務所・現場の様子"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              /* 写真未設定時: プレースホルダー */
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-blue-900/60">
                <div className="h-px w-16 bg-amber-400/40" />
                <p className="text-xs tracking-widest text-blue-500 uppercase">Photo</p>
                <div className="h-px w-16 bg-amber-400/40" />
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ===== 実績数字バー ===== */}
      <section className="bg-white px-6 py-10 shadow-sm">
        <dl className="mx-auto grid max-w-3xl grid-cols-3 divide-x divide-gray-100">
          {STATS.map((stat) => (
            <div key={stat.label} className="px-4 text-center sm:px-8">
              <dt className="text-2xl font-black text-blue-950">{stat.number}</dt>
              <dd className="mt-1 text-xs font-medium text-gray-400">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ===== お悩み ===== */}
      {(problems.items?.length ?? 0) > 0 && (
        <section className="bg-slate-50 px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-black tracking-tight text-blue-950">
              {problems.title ?? 'こんなお悩みありませんか？'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              多くの方が開業前に同じ壁にぶつかっています
            </p>

            <ul className="mt-10 space-y-3">
              {problems.items!.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white px-6 py-5 shadow-sm"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm">
                    😟
                  </span>
                  <span className="text-sm leading-relaxed text-gray-700">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 rounded-xl bg-blue-950 px-8 py-6 text-center">
              <p className="text-lg font-bold text-white">
                そのお悩み、まとめてお任せください。
              </p>
              <p className="mt-1 text-sm text-blue-300">
                開業前の不安をゼロにして、オープン日を迎えましょう。
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ===== 選ばれる理由 ===== */}
      {(features.items?.length ?? 0) > 0 && (
        <section className="bg-white px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-black tracking-tight text-blue-950">
              {features.title ?? '選ばれる理由'}
            </h2>

            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {features.items!.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-950 text-sm font-black text-amber-400">
                    0{i + 1}
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 代表メッセージ ===== */}
      {profile.body && (
        <section className="bg-blue-950 px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-amber-400">
              代表メッセージ
            </p>
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
              <div className="shrink-0">
                {profile.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.image_url}
                    alt={profile.representative ?? '代表'}
                    className="h-20 w-20 rounded-full object-cover ring-4 ring-amber-400/30"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-800 text-xl font-black text-amber-400 ring-4 ring-amber-400/20">
                    {profile.representative?.charAt(0) ?? '代'}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <blockquote className="text-base font-medium leading-relaxed text-white">
                  &ldquo;{profile.body}&rdquo;
                </blockquote>
                <div className="mt-6 border-t border-blue-800 pt-5">
                  {profile.representative && (
                    <p className="text-sm font-bold text-white">{profile.representative}</p>
                  )}
                  {profile.license_number && (
                    <p className="mt-0.5 text-xs text-blue-400">
                      行政書士 登録番号 {profile.license_number}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-blue-400">{lp.client.firmName}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== 問い合わせフォーム ===== */}
      <section id={formId} className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-lg">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-amber-500">
            Free Consultation
          </p>
          <h2 className="mt-2 text-center text-2xl font-black tracking-tight text-blue-950">
            無料で開業相談する
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            相談料0円・押し売りなし。1営業日以内にご返信します。
          </p>

          <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
            <LeadForm landingPageId={lp.id} />
          </div>
        </div>
      </section>

      {/* ===== 申請の流れ ===== */}
      {(flow.steps?.length ?? 0) > 0 && (
        <section className="bg-white px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-black tracking-tight text-blue-950">
              {flow.title ?? '申請の流れ'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              ご相談から許可取得まで、ステップを追ってサポートします
            </p>

            <ol className="mt-12 space-y-4">
              {flow.steps!.map((step, i) => (
                <li key={i} className="flex items-start gap-5">
                  <div className="flex flex-col items-center">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-950 text-xs font-black text-amber-400">
                      {i + 1}
                    </span>
                    {i < flow.steps!.length - 1 && (
                      <span className="mt-1 h-8 w-px bg-blue-100" />
                    )}
                  </div>
                  <div className="flex-1 rounded-lg border border-gray-100 bg-slate-50 px-5 py-4">
                    <p className="text-sm font-medium text-gray-800">{step}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ===== FAQ ===== */}
      {(faq.items?.length ?? 0) > 0 && (
        <section className="bg-slate-50 px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-black tracking-tight text-blue-950">
              {faq.title ?? 'よくある質問'}
            </h2>

            <dl className="mt-10 space-y-4">
              {faq.items!.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <dt className="flex items-start gap-3 text-sm font-bold text-blue-950">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-blue-950">
                      Q
                    </span>
                    {item.question}
                  </dt>
                  <dd className="mt-3 flex items-start gap-3 text-sm leading-relaxed text-gray-600">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-gray-400">
                      A
                    </span>
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* ===== 最終CTA ===== */}
      {cta_bottom.cta_text && (
        <section className="bg-blue-950 px-6 py-20">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-black tracking-tight text-white">
              {cta_bottom.headline}
            </h2>
            {cta_bottom.subheadline && (
              <p className="mt-3 text-sm text-blue-300">{cta_bottom.subheadline}</p>
            )}
            <a
              href={`#${formId}`}
              className="mt-8 inline-block rounded-lg bg-amber-400 px-10 py-3.5 text-base font-extrabold text-blue-950 transition-all hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/20"
            >
              {cta_bottom.cta_text}
            </a>
            {cta_bottom.cta_note && (
              <p className="mt-3 text-sm text-blue-400">{cta_bottom.cta_note}</p>
            )}
          </div>
        </section>
      )}

      {/* ===== フッター ===== */}
      <footer className="border-t border-blue-900 bg-blue-950 px-6 py-8 text-center">
        <p className="text-sm text-blue-400">
          © {new Date().getFullYear()} {lp.client.firmName}. All rights reserved.
        </p>
        <p className="mt-1 text-xs text-blue-700">
          このサイトで取得した個人情報はご相談対応にのみ使用します。
        </p>
      </footer>

    </div>
  )
}
