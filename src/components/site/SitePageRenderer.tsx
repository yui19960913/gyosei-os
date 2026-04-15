import { ContactForm } from './ContactForm'
import type { SiteContent } from '@/lib/ai-site/types'

interface Props {
  firmName: string
  prefecture: string
  content: SiteContent
  siteSlug: string
  isPreview?: boolean
}

export function SitePageRenderer({ firmName, prefecture, content, siteSlug, isPreview }: Props) {
  const { hero, services, profile, faq, cta } = content

  return (
    <div className="font-sans text-gray-900">
      {/* ヒーロー */}
      <section className="bg-gradient-to-br from-blue-800 to-blue-600 text-white py-24 px-6 text-center">
        <p className="text-sm text-blue-200 mb-4 tracking-wider">
          {prefecture}の行政書士 | {firmName}
        </p>
        <h1 className="text-4xl font-extrabold leading-tight mb-5 max-w-2xl mx-auto">
          {hero.headline}
        </h1>
        <p className="text-lg text-blue-100 mb-10 max-w-xl mx-auto">{hero.subheadline}</p>
        <a
          href="#contact"
          className="inline-block bg-white text-blue-800 font-bold px-10 py-4 rounded-full text-base hover:bg-blue-50 transition-colors shadow-lg"
        >
          {hero.ctaText}
        </a>
        {hero.ctaNote && (
          <p className="mt-4 text-sm text-blue-200">{hero.ctaNote}</p>
        )}
      </section>

      {/* サービス一覧 */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-14">対応業務</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-3">{svc.icon}</div>
                <h3 className="text-lg font-bold mb-2">{svc.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{svc.description}</p>
                {svc.price && (
                  <p className="text-blue-700 font-semibold text-sm">{svc.price}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 選ばれる理由 */}
      <section className="py-20 px-6 bg-blue-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">選ばれる理由</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profile.strengths.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {i + 1}
                </div>
                <p className="text-sm font-semibold text-gray-800">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 事務所紹介 */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">{profile.title}</h2>
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-5xl shrink-0">
              👨‍💼
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">{firmName}</h3>
              <p className="text-gray-700 leading-relaxed">{profile.body}</p>
            </div>
          </div>
        </div>
      </section>

      {/* お客様の声（ユーザー提供がある場合のみ表示） */}
      {content.testimonials && content.testimonials.length > 0 && (
        <section className="py-20 bg-gray-50 overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 mb-10">
            <h2 className="text-3xl font-bold text-center">お客様の声</h2>
          </div>

          {content.testimonials.length >= 4 ? (
            /* 4件以上: 横スクロールカルーセル */
            <div className="relative overflow-hidden">
              <div
                className="testimonial-track flex gap-6"
                style={{ width: 'max-content' }}
              >
                {[...content.testimonials, ...content.testimonials].map((t, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 shadow-sm w-72 shrink-0"
                  >
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">「{t.content}」</p>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* 3件以下: グリッド表示 */
            <div className="max-w-5xl mx-auto px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.testimonials.map((t, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">「{t.content}」</p>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* FAQ */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">よくある質問</h2>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 flex gap-4 items-start">
                  <span className="text-blue-600 font-extrabold text-lg shrink-0">Q</span>
                  <p className="font-semibold text-gray-900">{item.question}</p>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex gap-4 items-start">
                  <span className="text-green-600 font-extrabold text-lg shrink-0">A</span>
                  <p className="text-gray-700 text-sm leading-relaxed">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA バナー */}
      <section className="py-20 px-6 bg-gray-900 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">{cta.headline}</h2>
        <p className="text-gray-300 mb-10">{cta.subheadline}</p>
        <a
          href="#contact"
          className="inline-block bg-blue-500 text-white font-bold px-10 py-4 rounded-full text-base hover:bg-blue-400 transition-colors shadow-lg"
        >
          {cta.ctaText}
        </a>
      </section>

      {/* お問い合わせフォーム */}
      <section id="contact" className="py-20 px-6 bg-white">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">お問い合わせ</h2>
          <p className="text-center text-gray-500 text-sm mb-10">
            24時間受付・1営業日以内にご返信します
          </p>
          <ContactForm siteSlug={siteSlug} isPreview={isPreview} />
        </div>
      </section>

      {/* フッター */}
      <footer className="py-8 px-6 bg-gray-50 text-center text-sm text-gray-400 border-t border-gray-200">
        <p>© {new Date().getFullYear()} {firmName}</p>
        <p className="mt-1 text-xs">Powered by noren</p>
      </footer>
    </div>
  )
}
