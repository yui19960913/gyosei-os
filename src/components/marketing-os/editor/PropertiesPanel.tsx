'use client'

import { useEditor } from '@/lib/marketing-os/editor/context'
import { BLOCK_REGISTRY } from '@/lib/marketing-os/blocks/registry'
import type { FieldDef } from '@/lib/marketing-os/blocks/types'

// ---- フィールドの汎用レンダラー ----

interface FieldRendererProps {
  field: FieldDef
  value: unknown
  onChange: (value: unknown) => void
}

function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  const baseInputClass =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors'

  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          value={typeof value === 'string' ? value : ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
        />
      )

    case 'textarea':
      return (
        <textarea
          value={typeof value === 'string' ? value : ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`${baseInputClass} resize-none`}
        />
      )

    case 'color':
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={typeof value === 'string' ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-12 rounded-lg border border-gray-200 cursor-pointer p-0.5"
          />
          <input
            type="text"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseInputClass} flex-1`}
          />
        </div>
      )

    case 'repeater':
      return (
        <RepeaterField
          field={field}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
        />
      )

    default:
      return null
  }
}

// ---- リピーターフィールド ----

interface RepeaterFieldProps {
  field: FieldDef
  value: Record<string, unknown>[]
  onChange: (value: unknown) => void
}

function RepeaterField({ field, value, onChange }: RepeaterFieldProps) {
  const itemSchema = field.itemSchema ?? []

  const updateItem = (index: number, key: string, val: unknown) => {
    const next = value.map((item, i) =>
      i === index ? { ...item, [key]: val } : item
    )
    onChange(next)
  }

  const addItem = () => {
    const blank: Record<string, unknown> = {}
    itemSchema.forEach((f) => { blank[f.key] = '' })
    onChange([...value, blank])
  }

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">#{i + 1}</span>
            <button
              onClick={() => removeItem(i)}
              className="text-xs text-red-400 hover:text-red-600"
            >
              削除
            </button>
          </div>
          {itemSchema.map((subField) => (
            <div key={subField.key}>
              <label className="block text-xs text-gray-500 mb-1">{subField.label}</label>
              <FieldRenderer
                field={subField}
                value={item[subField.key]}
                onChange={(val) => updateItem(i, subField.key, val)}
              />
            </div>
          ))}
        </div>
      ))}
      <button
        onClick={addItem}
        className="w-full text-sm text-blue-600 border border-dashed border-blue-300 rounded-lg py-2 hover:bg-blue-50 transition-colors"
      >
        + 追加
      </button>
    </div>
  )
}

// ---- PropertiesPanel（右ドロワー） ----

export function PropertiesPanel() {
  const { state, updateBlockProps, selectBlock } = useEditor()
  const blocks = state.pageData?.blocks ?? []
  const selectedBlockId = state.selectedBlockId

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null

  if (!selectedBlock) return null

  const def = BLOCK_REGISTRY[selectedBlock.type]

  const handleChange = (key: string, value: unknown) => {
    updateBlockProps(selectedBlock.id, { [key]: value })
  }

  return (
    <aside className="absolute right-0 top-0 bottom-0 w-72 bg-white border-l border-gray-200 flex flex-col shadow-xl z-30 animate-in slide-in-from-right duration-200">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">編集中</p>
          <h2 className="text-sm font-semibold text-gray-900">
            {def.icon} {def.label}
          </h2>
        </div>
        <button
          onClick={() => selectBlock(null)}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          ×
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {def.schema.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {field.label}
            </label>
            <FieldRenderer
              field={field}
              value={selectedBlock.props[field.key]}
              onChange={(val) => handleChange(field.key, val)}
            />
          </div>
        ))}
      </div>
    </aside>
  )
}
