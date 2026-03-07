'use client'

import type { ServicesProps, ServiceItem } from '@/lib/marketing-os/blocks/types'
import { InlineText } from './InlineText'

interface Props {
  props: ServicesProps
  onPropChange?: (key: string, value: unknown) => void
}

export function ServicesBlock({ props, onPropChange }: Props) {
  const { title, items } = props

  const updateItem = (idx: number, key: keyof ServiceItem, value: string) => {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {items.map((item, i) => (
          <div key={i} className="text-center p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-4xl mb-4">{item.icon}</div>
            {onPropChange ? (
              <>
                <InlineText
                  as="h3"
                  value={item.title}
                  onChange={(v) => updateItem(i, 'title', v)}
                  className="text-lg font-semibold text-gray-900 mb-2 block"
                />
                <InlineText
                  as="p"
                  value={item.description}
                  onChange={(v) => updateItem(i, 'description', v)}
                  className="text-gray-600 text-sm leading-relaxed block"
                  multiline
                />
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
