'use client'

import { useCallback, useEffect, useState } from 'react'
import { SiteTemplate } from '@/components/editor/SiteTemplate'
import { TemplateSelectorPanel } from '@/components/editor/TemplateSelectorPanel'
import type { SiteTemplate as SiteTheme } from '@/components/editor/TemplateSelectorPanel'
import { SeiSeiChat } from '@/components/editor/SeiSeiChat'
import { FreeCanvas, defaultElement, CANVAS_WIDTH } from '@/components/marketing-os/canvas/FreeCanvas'
import {
  siteContentToElements,
  extractSiteContent,
  buildPosCache,
  applyPosCache,
} from '@/lib/editor/siteToCanvas'
import type { SiteContent } from '@/lib/ai-site/types'
import type { CanvasElement, CanvasElementType } from '@/lib/marketing-os/canvas/types'

// ─── 追加ボタン定義 ──────────────────────────────────────────────────────────

const ADD_BUTTONS: { type: CanvasElementType; icon: string; label: string }[] = [
  { type: 'text',  icon: 'T',  label: 'テキスト' },
  { type: 'image', icon: '🖼️', label: '画像' },
  { type: 'icon',  icon: '⭐', label: 'アイコン' },
  { type: 'line',  icon: '—',  label: '罫線' },
  { type: 'rect',  icon: '▭',  label: '背景' },
]

// ─── SiteEditor ───────────────────────────────────────────────────────────────

interface SiteEditorProps {
  slug: string
  firmName: string
  prefecture: string
  initialContent: SiteContent
  initialOverlay: CanvasElement[]
  /** free: テキスト編集 + プロフィール写真のみ / paid: 全機能 */
  plan?: 'free' | 'paid'
}

/**
 * モード:
 *   inline  = SiteTemplate 上でテキスト直接編集（contentEditable）
 *   canvas  = 全要素をキャンバスで自由配置・移動・z-index変更
 */
export function SiteEditor({ slug, firmName, prefecture, initialContent, initialOverlay, plan = 'free' }: SiteEditorProps) {
  const isPaid = plan === 'paid'
  const [content, setContent] = useState<SiteContent>(initialContent)
  const [mode, setMode] = useState<'inline' | 'canvas'>('inline')
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  // キャンバス要素: tpl:* (テンプレート由来) + 自由追加要素を統合
  const initialElements: CanvasElement[] = (() => {
    const hasTpl = initialOverlay.some(e => e.id.startsWith('tpl:'))
    if (hasTpl) return initialOverlay
    const tplEls = siteContentToElements(initialContent, firmName, prefecture)
    const freeEls = initialOverlay.filter(e => !e.id.startsWith('tpl:'))
    return [...tplEls, ...freeEls]
  })()

  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>(initialElements)
  // Undo/Redo 履歴スタック
  const [history, setHistory] = useState<CanvasElement[][]>([initialElements])
  const [historyIdx, setHistoryIdx] = useState(0)

  // テンプレート・チャット
  const [showTemplatePanel, setShowTemplatePanel] = useState(false)
  const [activeTheme, setActiveTheme] = useState<SiteTheme | undefined>(undefined)
  const [showChat, setShowChat] = useState(false)

  // ── モード切替 ──

  const switchToCanvas = useCallback(() => {
    // inline→canvas: 最新 content からtpl要素を再生成し、既存の位置情報を引き継ぐ
    const posCache = buildPosCache(canvasElements)
    const freshTpl = siteContentToElements(content, firmName, prefecture)
    const mergedTpl = applyPosCache(freshTpl, posCache)
    const freeEls = canvasElements.filter(e => !e.id.startsWith('tpl:'))
    setCanvasElements([...mergedTpl, ...freeEls])
    setMode('canvas')
  }, [content, firmName, prefecture, canvasElements])

  const switchToInline = useCallback(() => {
    // canvas→inline: tpl: 要素のテキストを siteContent に反映
    const extracted = extractSiteContent(canvasElements, content)
    setContent(extracted)
    setMode('inline')
  }, [canvasElements, content])

  const handleModeChange = useCallback((m: 'inline' | 'canvas') => {
    if (m === mode) return
    if (m === 'canvas') switchToCanvas()
    else switchToInline()
  }, [mode, switchToCanvas, switchToInline])

  // ── 履歴管理 ──

  const pushHistory = useCallback((els: CanvasElement[]) => {
    setHistory(prev => {
      const next = prev.slice(0, historyIdx + 1)
      next.push(els)
      // 最大50件
      return next.slice(-50)
    })
    setHistoryIdx(prev => Math.min(prev + 1, 49))
  }, [historyIdx])

  const undo = useCallback(() => {
    if (historyIdx <= 0) return
    const idx = historyIdx - 1
    setHistoryIdx(idx)
    setCanvasElements(history[idx])
    setIsDirty(true)
  }, [history, historyIdx])

  const redo = useCallback(() => {
    if (historyIdx >= history.length - 1) return
    const idx = historyIdx + 1
    setHistoryIdx(idx)
    setCanvasElements(history[idx])
    setIsDirty(true)
  }, [history, historyIdx])

  // ── Cmd/Ctrl+Z / Cmd/Ctrl+Shift+Z ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (mode !== 'canvas') return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo() }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, undo, redo])

  // ── 要素操作 ──

  const handleCanvasChange = useCallback((els: CanvasElement[]) => {
    setCanvasElements(els)
    pushHistory(els)
    setIsDirty(true)
  }, [pushHistory])

  const handleContentUpdate = useCallback((c: SiteContent) => {
    setContent(c)
    setIsDirty(true)
  }, [])

  const addElement = useCallback((type: CanvasElementType) => {
    const newEl: CanvasElement = {
      id: crypto.randomUUID(),
      ...defaultElement(type, canvasElements.length),
    }
    // キャンバスモードに切替してから追加
    switchToCanvas()
    setCanvasElements(prev => [...prev, newEl])
    setIsDirty(true)
  }, [canvasElements.length, switchToCanvas])

  // ── 保存 ──

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    setSaveMsg(null)
    try {
      // キャンバス要素から siteContent を抽出（公開ページ用）
      const latestContent = mode === 'canvas'
        ? extractSiteContent(canvasElements, content)
        : content

      const res = await fetch(`/api/editor/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteContent: latestContent,
          editorOverlay: canvasElements,  // tpl: + free 全部保存
        }),
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
  }, [slug, content, canvasElements, mode])

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* ── ツールバー（fixed） ── */}
      <header className="fixed top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 flex items-center gap-3 px-4 z-50">

        {/* モード切替 */}
        <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden text-sm">
          <button
            onClick={() => handleModeChange('inline')}
            className={`px-3 py-1.5 font-medium transition-colors ${mode === 'inline' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            テキスト編集
          </button>
          {isPaid && (
            <button
              onClick={() => handleModeChange('canvas')}
              className={`px-3 py-1.5 font-medium transition-colors ${mode === 'canvas' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              レイアウト編集
            </button>
          )}
        </div>

        {/* Undo / Redo (有料のみ) */}
        {isPaid && mode === 'canvas' && (
          <>
            <button
              onClick={undo}
              disabled={historyIdx <= 0}
              title="元に戻す (⌘Z)"
              className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ↩
            </button>
            <button
              onClick={redo}
              disabled={historyIdx >= history.length - 1}
              title="やり直す (⌘⇧Z)"
              className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ↪
            </button>
          </>
        )}

        {/* 要素追加ボタン (有料のみ) */}
        {isPaid && (
          <>
            <div className="w-px h-5 bg-gray-200" />
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
          </>
        )}

        {/* フリープラン: アップグレード案内 */}
        {!isPaid && (
          <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
            レイアウト編集・要素追加は
            <span className="text-blue-600 font-semibold ml-1">有料プラン</span>
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* デザイン選択 */}
          <button
            onClick={() => setShowTemplatePanel(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
          >
            🎨 デザイン選択
          </button>

          {/* AIチャット */}
          <button
            onClick={() => setShowChat(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${showChat ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-700 hover:bg-gray-100 border-gray-200'}`}
          >
            💬 AIチャット
          </button>

          <div className="w-px h-5 bg-gray-200" />

          {isDirty && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              未保存
            </span>
          )}
          {saveMsg && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${saveMsg.includes('失敗') ? 'text-red-700 bg-red-50 border-red-200' : 'text-green-700 bg-green-50 border-green-200'}`}>
              {saveMsg}
            </span>
          )}
          <a
            href={`/site/${slug}`}
            target="_blank"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
          >
            公開ページ →
          </a>
          <button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? '保存中…' : '保存'}
          </button>
        </div>
      </header>

      {/* ── キャンバス / テンプレート（ツールバー分 padding-top） ── */}
      <div className="pt-12 pb-7">
        {mode === 'inline' ? (
          // ── テキスト編集モード: SiteTemplate（contentEditable） ──
          <div style={{ minWidth: CANVAS_WIDTH, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: CANVAS_WIDTH }}>
              <SiteTemplate
                firmName={firmName}
                prefecture={prefecture}
                siteSlug={slug}
                content={content}
                editable
                onUpdate={handleContentUpdate}
                theme={activeTheme}
              />
            </div>
          </div>
        ) : (
          // ── レイアウト編集モード: 全要素をキャンバスで自由配置 ──
          <div style={{ minWidth: CANVAS_WIDTH + 80 }} className="flex justify-center py-10 px-10">
            <FreeCanvas elements={canvasElements} onChange={handleCanvasChange} />
          </div>
        )}
      </div>

      {/* ── テンプレートパネル ── */}
      <TemplateSelectorPanel
        isOpen={showTemplatePanel}
        onClose={() => setShowTemplatePanel(false)}
        currentTemplateId={activeTheme?.id}
        onApply={(t) => { setActiveTheme(t) }}
      />

      {/* ── AIチャット ── */}
      <SeiSeiChat
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        slug={slug}
        isPaidPlan={isPaid}
      />

      {/* ── ヒント（fixed bottom） ── */}
      <div className="fixed bottom-0 left-0 right-0 h-7 bg-white border-t border-gray-100 flex items-center px-4 gap-4 z-50">
        {mode === 'inline' ? (
          <>
            <span className="text-xs text-gray-400">クリックしてテキストを直接編集</span>
            <span className="text-xs text-gray-400">Enter: 確定 / Escape: キャンセル</span>
            {!isPaid && <span className="text-xs text-gray-400 ml-2">・事務所紹介の写真をクリックして写真を追加できます</span>}
          </>
        ) : (
          <>
            <span className="text-xs text-gray-400">クリック: 選択</span>
            <span className="text-xs text-gray-400">ダブルクリック: テキスト/絵文字を編集</span>
            <span className="text-xs text-gray-400">ドラッグ: 移動</span>
            <span className="text-xs text-gray-400">コーナー/エッジ: リサイズ</span>
            <span className="text-xs text-gray-400">前面/背面: 選択後ツールバーから</span>
            <span className="text-xs text-gray-400">Delete: 削除</span>
          </>
        )}
      </div>
    </div>
  )
}
