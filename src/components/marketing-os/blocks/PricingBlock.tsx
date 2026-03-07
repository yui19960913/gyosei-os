'use client'

import type { PricingProps, PricingPlan } from '@/lib/marketing-os/blocks/types'
import { InlineText } from './InlineText'

interface Props {
  props: PricingProps
  onPropChange?: (key: string, value: unknown) => void
}

export function PricingBlock({ props, onPropChange }: Props) {
  const { title, plans } = props

  const updatePlan = (idx: number, key: keyof PricingPlan, value: unknown) => {
    const next = plans.map((plan, i) => i === idx ? { ...plan, [key]: value } : plan)
    onPropChange?.('plans', next)
  }

  return (
    <section className="py-16 px-8 bg-gray-50">
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
      <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`flex-1 min-w-64 max-w-xs rounded-2xl p-8 border ${
              plan.highlighted
                ? 'bg-blue-700 text-white border-blue-700 shadow-xl scale-105'
                : 'bg-white text-gray-900 border-gray-200 shadow-sm'
            }`}
          >
            {onPropChange ? (
              <>
                <InlineText
                  as="h3"
                  value={plan.name}
                  onChange={(v) => updatePlan(i, 'name', v)}
                  className="text-xl font-bold mb-2 block"
                />
                <InlineText
                  as="p"
                  value={plan.price}
                  onChange={(v) => updatePlan(i, 'price', v)}
                  className={`text-3xl font-extrabold mb-6 block ${plan.highlighted ? 'text-white' : 'text-blue-700'}`}
                />
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className={`text-3xl font-extrabold mb-6 ${plan.highlighted ? 'text-white' : 'text-blue-700'}`}>
                  {plan.price}
                </p>
              </>
            )}
            <ul className="space-y-2">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-center gap-2 text-sm">
                  <span className="shrink-0">✓</span>
                  {onPropChange ? (
                    <InlineText
                      as="span"
                      value={f}
                      onChange={(v) => {
                        const next = plan.features.map((feat, fi) => fi === j ? v : feat)
                        updatePlan(i, 'features', next)
                      }}
                      className="flex-1"
                    />
                  ) : (
                    <span>{f}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
