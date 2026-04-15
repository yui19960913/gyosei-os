export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { siteUrl } from '@/lib/urls'

interface Props {
  params: Promise<{ keyword: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { keyword } = await params
  const decoded = decodeURIComponent(keyword)
  return {
    title: `${decoded} | 行政書士サポート`,
    description: `${decoded}なら行政書士にお任せください。`,
  }
}

export default async function SeoPage({ params }: Props) {
  const { keyword } = await params
  const slug = decodeURIComponent(keyword)

  const page = await prisma.aiSeoPage.findFirst({
    where: { slug, status: 'published' },
    include: { site: { select: { firmName: true, prefecture: true, slug: true, services: true } } },
  })

  if (!page) notFound()

  const content = page.content as {
    headline?: string
    body?: string
    faq?: Array<{ question: string; answer: string }>
  }

  const services = page.site.services as string[]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーロー */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <span className="inline-block bg-white/20 backdrop-blur text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            {page.keyword}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
            {page.site.prefecture}での{page.keyword}なら
            <br />
            {page.site.firmName}
          </h1>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 -mt-8">
        {/* 本文カード */}
        {content.body && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <p className="text-gray-700 text-base leading-[1.9] whitespace-pre-wrap">
              {content.body}
            </p>
          </section>
        )}

        {/* 対応業務 */}
        {services.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">対応業務</h2>
            <div className="flex flex-wrap gap-2">
              {services.map((s, i) => (
                <span
                  key={i}
                  className="bg-blue-50 text-blue-700 text-sm px-4 py-2 rounded-full font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {content.faq && content.faq.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">よくある質問</h2>
            <div className="space-y-4">
              {content.faq.map((item, i) => (
                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-start gap-3 px-5 py-4 bg-gray-50">
                    <span className="shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      Q
                    </span>
                    <p className="font-semibold text-gray-900 text-sm leading-relaxed">
                      {item.question}
                    </p>
                  </div>
                  <div className="flex items-start gap-3 px-5 py-4">
                    <span className="shrink-0 w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                      A
                    </span>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-10 text-center mb-16">
          <p className="text-xl font-bold text-gray-900 mb-2">{page.site.firmName}</p>
          <p className="text-sm text-gray-500 mb-6">
            {page.site.prefecture}で{page.keyword}のご相談を承ります
          </p>
          <a
            href={`${siteUrl(page.site.slug)}#contact`}
            className="inline-block bg-blue-600 text-white font-semibold px-10 py-4 rounded-xl text-base hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            無料相談はこちら
          </a>
        </section>
      </div>
    </div>
  )
}
