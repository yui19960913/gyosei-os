'use client'

import { ElementType, useEffect, useRef } from 'react'

interface InlineTextProps {
  as?: ElementType
  value: string
  onChange: (v: string) => void
  className?: string
  /** true の場合 Enter で改行を許可（default: false = Enter でblur） */
  multiline?: boolean
}

/**
 * エディタ上でインライン編集できるテキスト要素。
 * onChange が渡された場合のみ contentEditable になる。
 */
export function InlineText({
  as: Tag = 'span',
  value,
  onChange,
  className = '',
  multiline = false,
}: InlineTextProps) {
  const ref = useRef<HTMLElement>(null)

  // フォーカスしていないときだけ外部 value を DOM に同期
  useEffect(() => {
    const el = ref.current
    if (el && el !== document.activeElement) {
      el.textContent = value
    }
  }, [value])

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      className={`${className} cursor-text focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-0 rounded-sm empty:before:content-['...'] empty:before:text-gray-400`}
      onBlur={(e: React.FocusEvent<HTMLElement>) => onChange(e.currentTarget.textContent ?? '')}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (!multiline && e.key === 'Enter') {
          e.preventDefault()
          e.currentTarget.blur()
        }
        if (e.key === 'Escape') {
          e.currentTarget.textContent = value
          e.currentTarget.blur()
        }
      }}
    />
  )
}
