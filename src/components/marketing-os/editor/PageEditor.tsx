'use client'

import { useCallback, useState } from 'react'
import { FreeCanvas, defaultElement, CANVAS_WIDTH } from '@/components/marketing-os/canvas/FreeCanvas'
import type { CanvasElement, CanvasElementType } from '@/lib/marketing-os/canvas/types'

// ─── 追加ボタン定義 ──────────────────────────────────────────────────────────

const ADD_BUTTONS: { type: CanvasElementType; icon: string; label: string }[] = [
  { type: 'text',  icon: 'T',  label: 'テキスト' },
  { type: 'image', icon: '🖼️', label: '画像' },
  { type: 'icon',  icon: '⭐', label: 'アイコン' },
  { type: 'line',  icon: '—',  label: '罫線' },
  { type: 'rect',  icon: '▭',  label: '背景' },
]

// ─── PageEditor ──────────────────────────────────────────────────────────────

interface PageEditorProps {
  pageId: string
  title: string
  initialElements: CanvasElement[]
}

export function PageEditor({ pageId, title, initialElements }: PageEditorProps) {
  const [elements, setElements] = useState<CanvasElement[]>(initialElements)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const handleChange = useCallback((next: CanvasElement[]) => {
    setElements(next)
    setIsDirty(true)
  }, [])

  const addElement = useCallback((type: CanvasElementType) => {
    const newEl: CanvasElement = {
      id: crypto.randomUUID(),
      ...defaultElement(type, elements.length),
    }
    setElements(prev => [...prev, newEl])
    setIsDirty(true)
  }, [elements.length])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    setSaveMsg(null)
    try {
      const res = await fetch(`/api/marketing-os/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: elements, title }),
      })
      if (!res.ok) throw new Error()
      setIsDirty(false)
      setSaveMsg('保存しました')
      setTimeout(() => setSaveMsg(null), 3000)
    } catch {
      setSaveMsg('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }, [elements, pageId, title])

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* ── ツールバー ── */}
      <header className="h-12 bg-white border-b border-gray-200 flex items-center gap-3 px-4 shrink-0 z-20">
        {/* 要素追加ボタン */}
        <div className="flex items-center gap-1">
          {ADD_BUTTONS.map(b => (
            <button
              key={b.type}
              onClick={() => addElement(b.type)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              <span>{b.icon}</span>
              {b.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-gray-200" />

        <span className="text-sm text-gray-500 font-medium">{title}</span>

        {isDirty && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            未保存
          </span>
        )}
        {saveMsg && (
          <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            {saveMsg}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400">{elements.length} 要素</span>
          <button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? '保存中…' : '保存'}
          </button>
        </div>
      </header>

      {/* ── キャンバス（スクロールエリア） ── */}
      <div className="flex-1 overflow-auto">
        <div
          style={{ minWidth: CANVAS_WIDTH + 80, minHeight: '100%' }}
          className="flex justify-center py-10 px-10"
        >
          <FreeCanvas elements={elements} onChange={handleChange} />
        </div>
      </div>

      {/* ── 操作ヒント ── */}
      <div className="h-7 bg-white border-t border-gray-100 flex items-center px-4 gap-4 shrink-0">
        {[
          'クリック: 選択',
          'ダブルクリック: テキスト/絵文字を編集',
          'ドラッグ: 移動',
          'コーナー/エッジ: リサイズ',
          'Delete: 削除',
        ].map(h => (
          <span key={h} className="text-xs text-gray-400">{h}</span>
        ))}
      </div>
    </div>
  )
}
