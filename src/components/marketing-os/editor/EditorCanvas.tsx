'use client'

import { useEditor } from '@/lib/marketing-os/editor/context'
import { BLOCK_REGISTRY } from '@/lib/marketing-os/blocks/registry'
import { HeroBlock } from '../blocks/HeroBlock'
import { ServicesBlock } from '../blocks/ServicesBlock'
import { PricingBlock } from '../blocks/PricingBlock'
import { FAQBlock } from '../blocks/FAQBlock'
import { CTABlock } from '../blocks/CTABlock'
import { ContactFormBlock } from '../blocks/ContactFormBlock'
import { ImageBlock } from '../blocks/ImageBlock'
import type { Block } from '@/lib/marketing-os/blocks/types'

type OnPropChange = (key: string, value: unknown) => void

function renderBlock(block: Block, onPropChange: OnPropChange) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = block.props as any
  switch (block.type) {
    case 'hero':     return <HeroBlock props={p} onPropChange={onPropChange} />
    case 'services': return <ServicesBlock props={p} onPropChange={onPropChange} />
    case 'pricing':  return <PricingBlock props={p} onPropChange={onPropChange} />
    case 'faq':      return <FAQBlock props={p} onPropChange={onPropChange} />
    case 'cta':      return <CTABlock props={p} onPropChange={onPropChange} />
    case 'contact':  return <ContactFormBlock props={p} onPropChange={onPropChange} />
    case 'image':    return <ImageBlock props={p} onPropChange={onPropChange} />
    default:         return null
  }
}

export function EditorCanvas() {
  const { state, selectBlock, removeBlock, updateBlockProps } = useEditor()
  const blocks = state.pageData?.blocks ?? []
  const selectedBlockId = state.selectedBlockId

  if (blocks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <p className="text-5xl mb-4">+</p>
          <p className="text-sm font-medium">上の「ブロック追加」からセクションを追加してください</p>
        </div>
      </div>
    )
  }

  return (
    // h-full で親の高さいっぱいに広がり、overflow-y-auto でスクロール
    <div
      className="h-full overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) selectBlock(null)
      }}
    >
      {blocks.map((block) => {
        const isSelected = block.id === selectedBlockId
        const def = BLOCK_REGISTRY[block.type]
        const onPropChange: OnPropChange = (key, value) =>
          updateBlockProps(block.id, { [key]: value })

        return (
          <div
            key={block.id}
            onClick={(e) => { e.stopPropagation(); selectBlock(block.id) }}
            className={`relative group transition-all ${
              isSelected
                ? 'outline outline-2 outline-blue-500 outline-offset-[-2px]'
                : 'hover:outline hover:outline-1 hover:outline-blue-200 hover:outline-offset-[-1px]'
            }`}
          >
            {renderBlock(block, onPropChange)}

            {/* ブロックラベル + 削除ボタン */}
            <div
              className={`absolute top-3 right-3 flex items-center gap-1 transition-opacity z-10 ${
                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-medium shadow">
                {def.icon} {def.label}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); removeBlock(block.id) }}
                className="bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-300 text-xs px-2 py-1 rounded-md shadow transition-colors"
                title="ブロックを削除"
              >
                ✕
              </button>
            </div>
          </div>
        )
      })}
      <div className="h-20" onClick={() => selectBlock(null)} />
    </div>
  )
}
