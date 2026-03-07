'use client'

import type { CTAProps } from '@/lib/marketing-os/blocks/types'
import { InlineText } from './InlineText'

interface Props {
  props: CTAProps
  onPropChange?: (key: string, value: unknown) => void
}

export function CTABlock({ props, onPropChange }: Props) {
  const { title, subtitle, buttonLabel, buttonHref, bgColor } = props

  return (
    <section
      className="py-20 px-8 text-center text-white"
      style={{ backgroundColor: bgColor || '#0f172a' }}
    >
      {onPropChange ? (
        <>
          <InlineText
            as="h2"
            value={title}
            onChange={(v) => onPropChange('title', v)}
            className="text-3xl font-bold mb-4 block w-full"
          />
          <InlineText
            as="p"
            value={subtitle}
            onChange={(v) => onPropChange('subtitle', v)}
            className="text-lg opacity-80 mb-8 block"
            multiline
          />
          <InlineText
            as="span"
            value={buttonLabel}
            onChange={(v) => onPropChange('buttonLabel', v)}
            className="inline-block bg-white text-gray-900 font-semibold px-10 py-4 rounded-xl text-lg"
          />
        </>
      ) : (
        <>
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-lg opacity-80 mb-8">{subtitle}</p>
          <a
            href={buttonHref}
            className="inline-block bg-white text-gray-900 font-semibold px-10 py-4 rounded-xl hover:bg-gray-100 transition-colors text-lg"
          >
            {buttonLabel}
          </a>
        </>
      )}
    </section>
  )
}
