'use client'

import type { HeroProps } from '@/lib/marketing-os/blocks/types'
import { InlineText } from './InlineText'

interface Props {
  props: HeroProps
  onPropChange?: (key: string, value: unknown) => void
}

export function HeroBlock({ props, onPropChange }: Props) {
  const { title, subtitle, ctaLabel, ctaHref, bgColor } = props

  return (
    <section
      className="py-20 px-8 text-center text-white"
      style={{ backgroundColor: bgColor || '#1e40af' }}
    >
      {onPropChange ? (
        <>
          <InlineText
            as="h1"
            value={title}
            onChange={(v) => onPropChange('title', v)}
            className="text-4xl font-bold leading-tight mb-4 block w-full"
          />
          <InlineText
            as="p"
            value={subtitle}
            onChange={(v) => onPropChange('subtitle', v)}
            className="text-lg opacity-90 mb-8 max-w-2xl mx-auto block"
            multiline
          />
          <InlineText
            as="span"
            value={ctaLabel}
            onChange={(v) => onPropChange('ctaLabel', v)}
            className="inline-block bg-white text-gray-900 font-semibold px-8 py-3 rounded-lg"
          />
        </>
      ) : (
        <>
          <h1 className="text-4xl font-bold leading-tight mb-4">{title}</h1>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">{subtitle}</p>
          <a
            href={ctaHref}
            className="inline-block bg-white text-gray-900 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {ctaLabel}
          </a>
        </>
      )}
    </section>
  )
}
