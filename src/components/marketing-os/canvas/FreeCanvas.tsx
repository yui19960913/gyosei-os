'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { CanvasElement, CanvasElementType } from '@/lib/marketing-os/canvas/types'

// ─── Constants ───────────────────────────────────────────────────────────────

export const CANVAS_WIDTH = 1200
const SNAP_THRESHOLD = 6
const HANDLE = 8

// ─── Local types ─────────────────────────────────────────────────────────────

interface Guide { type: 'h' | 'v'; pos: number }

type DragType =
  | 'move'
  | 'resize-nw' | 'resize-n' | 'resize-ne'
  | 'resize-e'  | 'resize-se'
  | 'resize-s'  | 'resize-sw' | 'resize-w'

interface Interaction {
  id: string; type: DragType
  startPX: number; startPY: number
  startEX: number; startEY: number
  startEW: number; startEH: number
}

// ─── Snap ────────────────────────────────────────────────────────────────────

function snapPos(
  x: number, y: number, w: number, h: number,
  others: CanvasElement[]
): { x: number; y: number; guides: Guide[] } {
  let sx = x, sy = y
  const guides: Guide[] = []

  const xRefs = [0, CANVAS_WIDTH / 2, CANVAS_WIDTH,
    ...others.flatMap(o => [o.x, o.x + o.width / 2, o.x + o.width])]
  const xCases = [
    { val: x,       set: (r: number) => r },
    { val: x + w/2, set: (r: number) => r - w/2 },
    { val: x + w,   set: (r: number) => r - w },
  ]
  outer: for (const ref of xRefs) {
    for (const c of xCases) {
      if (Math.abs(c.val - ref) <= SNAP_THRESHOLD) {
        sx = c.set(ref); guides.push({ type: 'v', pos: ref }); break outer
      }
    }
  }

  const yRefs = others.flatMap(o => [o.y, o.y + o.height / 2, o.y + o.height])
  const yCases = [
    { val: y,       set: (r: number) => r },
    { val: y + h/2, set: (r: number) => r - h/2 },
    { val: y + h,   set: (r: number) => r - h },
  ]
  outer2: for (const ref of yRefs) {
    for (const c of yCases) {
      if (Math.abs(c.val - ref) <= SNAP_THRESHOLD) {
        sy = c.set(ref); guides.push({ type: 'h', pos: ref }); break outer2
      }
    }
  }

  return { x: Math.max(0, Math.min(sx, CANVAS_WIDTH - w)), y: Math.max(0, sy), guides }
}

// ─── Element content renderers ───────────────────────────────────────────────

function TextContent({ el, isEditing, onChange }: {
  el: CanvasElement; isEditing: boolean
  onChange: (p: Record<string, unknown>) => void
}) {
  const p = el.props as {
    content: string; fontSize: number; fontWeight: string
    color: string; textAlign: string; italic: boolean
  }
  const style: React.CSSProperties = {
    fontSize: p.fontSize, fontWeight: p.fontWeight,
    color: p.color, textAlign: p.textAlign as 'left' | 'center' | 'right',
    fontStyle: p.italic ? 'italic' : 'normal',
    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    width: '100%', minHeight: p.fontSize * 1.4,
    lineHeight: 1.4,
  }
  return isEditing ? (
    <div
      contentEditable suppressContentEditableWarning
      style={{ ...style, outline: 'none', cursor: 'text' }}
      onBlur={e => onChange({ content: e.currentTarget.textContent ?? '' })}
      onKeyDown={e => { if (e.key === 'Escape') e.currentTarget.blur() }}
    >{p.content}</div>
  ) : (
    <div style={{ ...style, userSelect: 'none' }}>{p.content}</div>
  )
}

function ImageContent({ el, onChange, onRegisterUpload }: {
  el: CanvasElement
  onChange: (p: Record<string, unknown>) => void
  onRegisterUpload: (trigger: () => void) => void
}) {
  const p = el.props as {
    src: string; alt: string; borderRadius: number; objectFit: string
    objectPosX?: number; objectPosY?: number
  }
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  // ファイルピッカーをツールバーから呼べるように登録
  useEffect(() => {
    onRegisterUpload(() => fileRef.current?.click())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const upload = async (file: File) => {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/marketing-os/upload', { method: 'POST', body: form })
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      onChange({ src: url, alt: file.name.replace(/\.[^.]+$/, '') })
    } catch { alert('アップロードに失敗しました') }
    finally { setUploading(false) }
  }

  const posX = p.objectPosX ?? 50
  const posY = p.objectPosY ?? 50

  return (
    <>
      <div
        style={{
          width: '100%', height: '100%', overflow: 'hidden',
          borderRadius: p.borderRadius, background: '#f3f4f6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          // 画像ロード済みのときはクリックしてもファイルピッカーを開かない
          cursor: p.src ? 'default' : 'pointer',
        }}
        onClick={() => { if (!p.src) fileRef.current?.click() }}
      >
        {p.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.src} alt={p.alt}
            style={{
              width: '100%', height: '100%',
              objectFit: p.objectFit as 'cover' | 'contain',
              objectPosition: `${posX}% ${posY}%`,
              display: 'block',
            }} />
        ) : (
          <div style={{ textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
            <div style={{ fontSize: 13 }}>{uploading ? 'アップロード中…' : 'クリックして画像を選択'}</div>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
    </>
  )
}

function IconContent({ el, isEditing, onChange }: {
  el: CanvasElement; isEditing: boolean; onChange: (p: Record<string, unknown>) => void
}) {
  const p = el.props as { emoji: string; size: number }
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (isEditing) setTimeout(() => inputRef.current?.focus(), 0) }, [isEditing])

  return isEditing ? (
    <input ref={inputRef} type="text" defaultValue={p.emoji}
      style={{
        fontSize: p.size, width: '100%', border: 'none', outline: 'none',
        background: 'transparent', textAlign: 'center', cursor: 'text',
      }}
      onBlur={e => onChange({ emoji: e.target.value })}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur() }}
    />
  ) : (
    <div style={{ fontSize: p.size, textAlign: 'center', lineHeight: 1, userSelect: 'none' }}>
      {p.emoji}
    </div>
  )
}

function LineContent({ el }: { el: CanvasElement }) {
  const p = el.props as { direction: 'h' | 'v'; color: string; thickness: number }
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: p.direction === 'h' ? '100%' : p.thickness,
        height: p.direction === 'h' ? p.thickness : '100%',
        background: p.color, borderRadius: 2,
      }} />
    </div>
  )
}

function RectContent({ el }: { el: CanvasElement }) {
  const p = el.props as { color: string; borderRadius: number; opacity: number }
  return (
    <div style={{
      width: '100%', height: '100%',
      background: p.color,
      borderRadius: p.borderRadius,
      opacity: p.opacity ?? 1,
    }} />
  )
}

// ─── Snap Guides ─────────────────────────────────────────────────────────────

function SnapGuides({ guides, height }: { guides: Guide[]; height: number }) {
  return (
    <>
      {guides.map((g, i) => (
        <div key={i} style={{
          position: 'absolute', background: '#ef4444', pointerEvents: 'none', zIndex: 9999,
          ...(g.type === 'v'
            ? { left: g.pos, top: 0, width: 1, height }
            : { top: g.pos, left: 0, height: 1, width: CANVAS_WIDTH }),
        }} />
      ))}
    </>
  )
}

// ─── Resize Handles ──────────────────────────────────────────────────────────

const HANDLE_DEFS: { type: DragType; xFn: (w: number) => number; yFn: (h: number) => number; cursor: string }[] = [
  { type: 'resize-nw', xFn: () => -HANDLE/2,    yFn: () => -HANDLE/2,    cursor: 'nw-resize' },
  { type: 'resize-n',  xFn: w => w/2-HANDLE/2,  yFn: () => -HANDLE/2,    cursor: 'n-resize'  },
  { type: 'resize-ne', xFn: w => w-HANDLE/2,    yFn: () => -HANDLE/2,    cursor: 'ne-resize' },
  { type: 'resize-e',  xFn: w => w-HANDLE/2,    yFn: h => h/2-HANDLE/2,  cursor: 'e-resize'  },
  { type: 'resize-se', xFn: w => w-HANDLE/2,    yFn: h => h-HANDLE/2,    cursor: 'se-resize' },
  { type: 'resize-s',  xFn: w => w/2-HANDLE/2,  yFn: h => h-HANDLE/2,    cursor: 's-resize'  },
  { type: 'resize-sw', xFn: () => -HANDLE/2,    yFn: h => h-HANDLE/2,    cursor: 'sw-resize' },
  { type: 'resize-w',  xFn: () => -HANDLE/2,    yFn: h => h/2-HANDLE/2,  cursor: 'w-resize'  },
]

function ResizeHandles({ el, onDown }: {
  el: CanvasElement; onDown: (e: React.PointerEvent, t: DragType) => void
}) {
  return (
    <>
      {HANDLE_DEFS.map(h => (
        <div key={h.type}
          onPointerDown={e => { e.stopPropagation(); onDown(e, h.type) }}
          style={{
            position: 'absolute',
            left: h.xFn(el.width), top: h.yFn(el.height),
            width: HANDLE, height: HANDLE,
            background: 'white', border: '2px solid #3b82f6',
            borderRadius: 2, cursor: h.cursor, zIndex: 1001,
          }}
        />
      ))}
    </>
  )
}

// ─── Floating Toolbar ────────────────────────────────────────────────────────

function FloatingToolbar({ el, onChange, onDelete, onBringForward, onSendBackward, onTriggerUpload, onSetAsBackground }: {
  el: CanvasElement
  onChange: (p: Record<string, unknown>) => void
  onDelete: () => void
  onBringForward: () => void
  onSendBackward: () => void
  onTriggerUpload?: () => void
  onSetAsBackground?: () => void
}) {
  const p = el.props as Record<string, unknown>
  const TOOLBAR_H = 36
  const top = Math.max(0, el.y - TOOLBAR_H - 8)

  const btn = (content: React.ReactNode, onClick: () => void, active = false, danger = false): React.ReactNode => (
    <button onClick={onClick} style={{
      background: active ? '#3b82f6' : 'transparent', border: 'none',
      color: danger ? '#f87171' : active ? 'white' : '#e2e8f0',
      cursor: 'pointer', padding: '2px 8px', borderRadius: 4,
      fontSize: 12, fontWeight: 500,
      display: 'flex', alignItems: 'center', height: TOOLBAR_H - 8,
    }}>{content}</button>
  )
  const sep = <div style={{ width: 1, height: 18, background: '#475569', margin: '0 2px' }} />
  const numCtrl = (label: string, val: number, key: string, min = 1, step = 1) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {label && <span style={{ color: '#94a3b8', fontSize: 11 }}>{label}</span>}
      {btn('−', () => onChange({ [key]: Math.max(min, val - step) }))}
      <span style={{ color: '#e2e8f0', fontSize: 11, minWidth: 28, textAlign: 'center' }}>{val}</span>
      {btn('+', () => onChange({ [key]: val + step }))}
    </div>
  )

  return (
    <div
      onPointerDown={e => e.stopPropagation()}
      style={{
        position: 'absolute', left: Math.min(el.x, CANVAS_WIDTH - 400), top,
        height: TOOLBAR_H, display: 'flex', alignItems: 'center', gap: 2,
        background: '#1e293b', borderRadius: 8, padding: '0 8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)', zIndex: 1000,
        whiteSpace: 'nowrap', userSelect: 'none',
      }}
    >
      {el.type === 'text' && <>
        {numCtrl('', p.fontSize as number, 'fontSize', 8, 2)}
        {sep}
        {btn('B', () => onChange({ fontWeight: p.fontWeight === 'bold' ? 'normal' : 'bold' }), p.fontWeight === 'bold')}
        {btn('I', () => onChange({ italic: !p.italic }), !!p.italic)}
        {sep}
        {btn('L', () => onChange({ textAlign: 'left' }),   p.textAlign === 'left')}
        {btn('C', () => onChange({ textAlign: 'center' }), p.textAlign === 'center')}
        {btn('R', () => onChange({ textAlign: 'right' }),  p.textAlign === 'right')}
        {sep}
        <input type="color" value={p.color as string} onChange={e => onChange({ color: e.target.value })}
          style={{ width: 24, height: 24, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 0, background: 'none' }} />
      </>}

      {el.type === 'image' && <>
        {onTriggerUpload && btn('変更', onTriggerUpload)}
        {sep}
        {btn('cover',   () => onChange({ objectFit: 'cover' }),   p.objectFit === 'cover')}
        {btn('contain', () => onChange({ objectFit: 'contain' }), p.objectFit === 'contain')}
        {sep}
        {numCtrl('角丸', p.borderRadius as number, 'borderRadius', 0, 4)}
        {sep}
        <span style={{ color: '#94a3b8', fontSize: 11 }}>位置</span>
        {btn('←', () => onChange({ objectPosX: Math.max(0,   (p.objectPosX as number ?? 50) - 10) }))}
        {btn('→', () => onChange({ objectPosX: Math.min(100, (p.objectPosX as number ?? 50) + 10) }))}
        {btn('↑', () => onChange({ objectPosY: Math.max(0,   (p.objectPosY as number ?? 50) - 10) }))}
        {btn('↓', () => onChange({ objectPosY: Math.min(100, (p.objectPosY as number ?? 50) + 10) }))}
        {sep}
        {onSetAsBackground && btn('背景に設定', onSetAsBackground)}
      </>}

      {el.type === 'icon' && <>
        {numCtrl('', p.size as number, 'size', 16, 8)}
      </>}

      {el.type === 'line' && <>
        {btn('横', () => onChange({ direction: 'h' }), p.direction === 'h')}
        {btn('縦', () => onChange({ direction: 'v' }), p.direction === 'v')}
        {sep}
        <input type="color" value={p.color as string} onChange={e => onChange({ color: e.target.value })}
          style={{ width: 24, height: 24, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 0, background: 'none' }} />
        {sep}
        {numCtrl('太さ', p.thickness as number, 'thickness', 1, 1)}
      </>}

      {el.type === 'rect' && <>
        <input type="color" value={p.color as string} onChange={e => onChange({ color: e.target.value })}
          style={{ width: 24, height: 24, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 0, background: 'none' }} />
        {sep}
        {numCtrl('角丸', p.borderRadius as number, 'borderRadius', 0, 4)}
        {sep}
        {numCtrl('透明度', Math.round((p.opacity as number ?? 1) * 100), 'opacity', 0, 5)}
      </>}

      {sep}
      <span style={{ color: '#94a3b8', fontSize: 11 }}>回転</span>
      {btn('−', () => onChange({ rotation: Math.round(((p.rotation as number ?? 0) - 5) * 10) / 10 }))}
      <span style={{ color: '#e2e8f0', fontSize: 11, minWidth: 36, textAlign: 'center' }}>
        {p.rotation as number ?? 0}°
      </span>
      {btn('+', () => onChange({ rotation: Math.round(((p.rotation as number ?? 0) + 5) * 10) / 10 }))}
      {sep}
      {btn('↑', onBringForward)}
      {btn('↓', onSendBackward)}
      {sep}
      {btn('✕', onDelete, false, true)}
    </div>
  )
}

// ─── FreeCanvas ──────────────────────────────────────────────────────────────

export interface FreeCanvasProps {
  elements: CanvasElement[]
  onChange: (elements: CanvasElement[]) => void
  /** オーバーレイモード: 背景透明, コンテナは pointer-events:none */
  overlay?: boolean
}

export function FreeCanvas({ elements, onChange, overlay = false }: FreeCanvasProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId,  setEditingId]  = useState<string | null>(null)
  const [interaction, setInteraction] = useState<Interaction | null>(null)
  const [guides, setGuides] = useState<Guide[]>([])
  // 画像アップロードトリガー (elId → trigger fn)
  const uploadTriggers = useRef<Map<string, () => void>>(new Map())

  const canvasHeight = Math.max(800, ...elements.map(e => e.y + e.height + 120))
  const selectedEl = elements.find(e => e.id === selectedId) ?? null
  const isDragging = interaction?.type === 'move'

  // ── helpers ──
  const updateEl = useCallback((id: string, up: Partial<CanvasElement>) => {
    onChange(elements.map(e => e.id === id ? { ...e, ...up } : e))
  }, [elements, onChange])

  const updateProps = useCallback((id: string, props: Record<string, unknown>) => {
    onChange(elements.map(e => e.id === id ? { ...e, props: { ...e.props, ...props } } : e))
  }, [elements, onChange])

  const deleteEl = useCallback((id: string) => {
    onChange(elements.filter(e => e.id !== id))
    setSelectedId(null)
  }, [elements, onChange])

  const bringForward = useCallback((id: string) => {
    const el = elements.find(e => e.id === id)
    if (!el) return
    onChange(elements.map(e => e.id === id ? { ...e, zIndex: e.zIndex + 1 } : e))
  }, [elements, onChange])

  const sendBackward = useCallback((id: string) => {
    const el = elements.find(e => e.id === id)
    if (!el) return
    onChange(elements.map(e => e.id === id ? { ...e, zIndex: Math.max(0, e.zIndex - 1) } : e))
  }, [elements, onChange])

  // ── keyboard ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !editingId) {
        deleteEl(selectedId)
      }
      if (e.key === 'Escape') { setEditingId(null); setSelectedId(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, editingId, deleteEl])

  // ── global pointer move / up ──
  useEffect(() => {
    if (!interaction) return
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - interaction.startPX
      const dy = e.clientY - interaction.startPY
      const { type: itype, id } = interaction

      if (itype === 'move') {
        const others = elements.filter(el => el.id !== id)
        const el = elements.find(el => el.id === id)!
        const { x, y, guides: g } = snapPos(
          interaction.startEX + dx, interaction.startEY + dy,
          el.width, el.height, others
        )
        setGuides(g)
        updateEl(id, { x, y })
      } else {
        let x = interaction.startEX, y = interaction.startEY
        let w = interaction.startEW, h = interaction.startEH
        if (itype.includes('e')) w = Math.max(40, interaction.startEW + dx)
        if (itype.includes('s')) h = Math.max(20, interaction.startEH + dy)
        if (itype.includes('w')) {
          const nw = Math.max(40, interaction.startEW - dx)
          x = interaction.startEX + (interaction.startEW - nw); w = nw
        }
        if (itype.includes('n')) {
          const nh = Math.max(20, interaction.startEH - dy)
          y = interaction.startEY + (interaction.startEH - nh); h = nh
        }
        updateEl(id, { x, y, width: w, height: h })
      }
    }
    const onUp = () => { setInteraction(null); setGuides([]) }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [interaction, elements, updateEl])

  const startInteraction = useCallback((e: React.PointerEvent, el: CanvasElement, type: DragType) => {
    if (type === 'move' && editingId === el.id) return
    e.stopPropagation()
    setSelectedId(el.id)
    setInteraction({
      id: el.id, type,
      startPX: e.clientX, startPY: e.clientY,
      startEX: el.x, startEY: el.y, startEW: el.width, startEH: el.height,
    })
  }, [editingId])

  const handleDoubleClick = useCallback((e: React.MouseEvent, el: CanvasElement) => {
    e.stopPropagation()
    if (el.type === 'text' || el.type === 'icon') setEditingId(el.id)
  }, [])

  return (
    <div
      style={{
        position: overlay ? 'absolute' : 'relative',
        ...(overlay && { inset: 0 }),
        width: overlay ? undefined : CANVAS_WIDTH,
        height: overlay ? undefined : canvasHeight,
        background: overlay ? 'transparent' : 'white',
        flexShrink: 0,
        boxShadow: overlay ? 'none' : '0 8px 40px rgba(0,0,0,0.15)',
        userSelect: interaction ? 'none' : 'auto',
        cursor: isDragging ? 'grabbing' : 'default',
        pointerEvents: overlay ? 'none' : 'auto',
      }}
      onClick={e => { if (e.target === e.currentTarget) { setSelectedId(null); setEditingId(null) } }}
    >
      {/* ドット方眼 (通常モードのみ) */}
      {!overlay && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '24px 24px', opacity: 0.5,
        }} />
      )}

      <SnapGuides guides={guides} height={canvasHeight} />

      {[...elements].sort((a, b) => a.zIndex - b.zIndex).map(el => {
        const isSelected = el.id === selectedId
        const isEditing  = el.id === editingId
        return (
          <div key={el.id}>
            {isSelected && !isEditing && selectedEl && (
              <FloatingToolbar
                el={el}
                onChange={p => updateProps(el.id, p)}
                onDelete={() => deleteEl(el.id)}
                onBringForward={() => bringForward(el.id)}
                onSendBackward={() => sendBackward(el.id)}
                onTriggerUpload={el.type === 'image' ? () => uploadTriggers.current.get(el.id)?.() : undefined}
                onSetAsBackground={el.type === 'image' ? () => {
                  const minZ = Math.min(...elements.map(e => e.zIndex))
                  onChange(elements.map(e => e.id === el.id
                    ? { ...e, x: 0, y: el.y, width: CANVAS_WIDTH, height: el.height, zIndex: minZ - 1,
                        props: { ...e.props, objectFit: 'cover' } }
                    : e))
                } : undefined}
              />
            )}
            <div
              onPointerDown={e => startInteraction(e, el, 'move')}
              onClick={e => { e.stopPropagation(); setSelectedId(el.id) }}
              onDoubleClick={e => handleDoubleClick(e, el)}
              style={{
                position: 'absolute',
                left: el.x, top: el.y, width: el.width, height: el.height,
                zIndex: el.zIndex,
                outline: isSelected ? '2px solid #3b82f6' : undefined,
                outlineOffset: 2,
                cursor: isEditing ? 'text' : isSelected && !isDragging ? 'grab' : 'pointer',
                boxSizing: 'border-box',
                pointerEvents: 'all',
                transform: (el.props as Record<string, unknown>).rotation
                  ? `rotate(${(el.props as Record<string, unknown>).rotation}deg)`
                  : undefined,
                transformOrigin: 'center center',
              }}
            >
              {el.type === 'text'  && <TextContent  el={el} isEditing={isEditing} onChange={p => updateProps(el.id, p)} />}
              {el.type === 'image' && <ImageContent el={el} onChange={p => updateProps(el.id, p)}
                onRegisterUpload={fn => uploadTriggers.current.set(el.id, fn)} />}
              {el.type === 'icon'  && <IconContent  el={el} isEditing={isEditing} onChange={p => updateProps(el.id, p)} />}
              {el.type === 'line'  && <LineContent  el={el} />}
              {el.type === 'rect'  && <RectContent  el={el} />}

              {isSelected && !isEditing && (
                <ResizeHandles el={el} onDown={(e, t) => startInteraction(e, el, t)} />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Default props for each element type ─────────────────────────────────────

export function defaultElement(type: CanvasElementType, count: number): Omit<CanvasElement, 'id'> {
  const zIndex = count + 1
  const base = { x: 80 + (count % 5) * 20, y: 80 + (count % 8) * 30 }
  switch (type) {
    case 'text':
      return { type, ...base, width: 400, height: 60, zIndex, props: { content: 'テキストを入力', fontSize: 24, fontWeight: 'normal', color: '#1a1a1a', textAlign: 'left', italic: false } }
    case 'image':
      return { type, ...base, width: 480, height: 320, zIndex, props: { src: '', alt: '', borderRadius: 8, objectFit: 'cover' } }
    case 'icon':
      return { type, ...base, width: 80, height: 80, zIndex, props: { emoji: '⭐', size: 64 } }
    case 'line':
      return { type, x: 0, y: base.y, width: CANVAS_WIDTH, height: 20, zIndex, props: { direction: 'h', color: '#e5e7eb', thickness: 2 } }
    case 'rect':
      return { type, ...base, width: 400, height: 200, zIndex, props: { color: '#f3f4f6', borderRadius: 8, opacity: 1 } }
    default:
      return { type, ...base, width: 400, height: 100, zIndex, props: {} }
  }
}
