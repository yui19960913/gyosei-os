'use client'

import { BLOCK_REGISTRY, BLOCK_PALETTE_ORDER } from '@/lib/marketing-os/blocks/registry'
import { useEditor } from '@/lib/marketing-os/editor/context'
import type { BlockType } from '@/lib/marketing-os/blocks/types'

interface BlockLibraryProps {
  onClose: () => void
}

export function BlockLibrary({ onClose }: BlockLibraryProps) {
  const { addBlock } = useEditor()

  const handleAdd = (type: BlockType) => {
    addBlock(type)
    onClose()
  }

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* パネル */}
      <div className="absolute top-14 left-4 z-50 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">ブロックを追加</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
          {BLOCK_PALETTE_ORDER.map((type) => {
            const def = BLOCK_REGISTRY[type]
            return (
              <button
                key={type}
                onClick={() => handleAdd(type)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors text-left group"
              >
                <span className="text-xl shrink-0">{def.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 truncate">
                    {def.label}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{def.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
