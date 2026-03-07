'use client'

import type { ContactFormProps } from '@/lib/marketing-os/blocks/types'
import { InlineText } from './InlineText'

interface Props {
  props: ContactFormProps
  onPropChange?: (key: string, value: unknown) => void
}

export function ContactFormBlock({ props, onPropChange }: Props) {
  const { title, subtitle, buttonLabel } = props

  return (
    <section className="py-16 px-8 bg-gray-50" id="contact">
      {onPropChange ? (
        <>
          <InlineText
            as="h2"
            value={title}
            onChange={(v) => onPropChange('title', v)}
            className="text-3xl font-bold text-center text-gray-900 mb-2 block w-full"
          />
          <InlineText
            as="p"
            value={subtitle}
            onChange={(v) => onPropChange('subtitle', v)}
            className="text-center text-gray-500 mb-10 block w-full"
          />
        </>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">{title}</h2>
          <p className="text-center text-gray-500 mb-10">{subtitle}</p>
        </>
      )}
      <form className="max-w-lg mx-auto space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
          <input
            type="text"
            placeholder="山田 太郎"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
          <input
            type="email"
            placeholder="example@email.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
          <input
            type="tel"
            placeholder="090-0000-0000"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">お問い合わせ内容</label>
          <textarea
            rows={4}
            placeholder="ご相談内容をご記入ください"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-700 text-white font-semibold py-4 rounded-xl hover:bg-blue-800 transition-colors"
        >
          {onPropChange ? (
            <InlineText
              as="span"
              value={buttonLabel}
              onChange={(v) => onPropChange('buttonLabel', v)}
              className="inline-block w-full"
            />
          ) : buttonLabel}
        </button>
      </form>
    </section>
  )
}
