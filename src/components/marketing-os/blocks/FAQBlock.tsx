'use client'

import type { FAQProps, FAQItem } from '@/lib/marketing-os/blocks/types'
import { InlineText } from './InlineText'

interface Props {
  props: FAQProps
  onPropChange?: (key: string, value: unknown) => void
}

export function FAQBlock({ props, onPropChange }: Props) {
  const { title, items } = props

  const updateItem = (idx: number, key: keyof FAQItem, value: string) => {
    const next = items.map((item, i) => i === idx ? { ...item, [key]: value } : item)
    onPropChange?.('items', next)
  }

  return (
    <section className="py-16 px-8 bg-white">
      {onPropChange ? (
        <InlineText
          as="h2"
          value={title}
          onChange={(v) => onPropChange('title', v)}
          className="text-3xl font-bold text-center text-gray-900 mb-12 block w-full"
        />
      ) : (
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{title}</h2>
      )}
      <div className="max-w-2xl mx-auto space-y-4">
        {items.map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-4">
              <p className="font-semibold text-gray-900 flex gap-3">
                <span className="text-blue-600 font-bold shrink-0">Q</span>
                {onPropChange ? (
                  <InlineText
                    as="span"
                    value={item.question}
                    onChange={(v) => updateItem(i, 'question', v)}
                    className="flex-1"
                  />
                ) : item.question}
              </p>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700 text-sm leading-relaxed flex gap-3">
                <span className="text-green-600 font-bold shrink-0">A</span>
                {onPropChange ? (
                  <InlineText
                    as="span"
                    value={item.answer}
                    onChange={(v) => updateItem(i, 'answer', v)}
                    className="flex-1"
                    multiline
                  />
                ) : item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
