import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

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
    include: { site: { select: { firmName: true, prefecture: true } } },
  })

  if (!page) notFound()

  const content = page.content as {
    headline?: string
    body?: string
    faq?: Array<{ question: string; answer: string }>
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="text-sm text-blue-600 font-medium mb-3">{page.keyword}</p>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
        {content.headline ?? page.title}
      </h1>
      {content.body && (
        <p className="text-gray-700 leading-relaxed mb-10">{content.body}</p>
      )}

      {content.faq && content.faq.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">よくある質問</h2>
          <div className="space-y-4">
            {content.faq.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 font-semibold text-gray-900 text-sm">
                  Q. {item.question}
                </div>
                <div className="px-5 py-3 text-gray-700 text-sm leading-relaxed">
                  A. {item.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 p-6 bg-blue-50 rounded-2xl text-center">
        <p className="text-lg font-bold text-gray-900 mb-2">{page.site.firmName}</p>
        <p className="text-sm text-gray-500 mb-4">{page.site.prefecture}の行政書士</p>
        <a
          href={`/site/${page.siteId}#contact`}
          className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          無料相談はこちら
        </a>
      </div>
    </div>
  )
}
