import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PageEditor } from '@/components/marketing-os/editor/PageEditor'
import { CANVAS_WIDTH } from '@/components/marketing-os/canvas/FreeCanvas'
import type { CanvasElement } from '@/lib/marketing-os/canvas/types'

interface Props {
  params: Promise<{ pageId: string }>
}

// ─── ブロック → 個別キャンバス要素に分解する変換関数 ─────────────────────────

let _seq = 0
function uid(base: string, suffix: string) { return `${base}-${suffix}` }
function nextZ() { return ++_seq }

function mkRect(id: string, x: number, y: number, w: number, h: number, color: string, borderRadius = 0): CanvasElement {
  return { id, type: 'rect', x, y, width: w, height: h, zIndex: nextZ(), props: { color, borderRadius, opacity: 1 } }
}
function mkText(
  id: string, x: number, y: number, w: number, h: number,
  content: string, fontSize: number, fontWeight: 'normal' | 'bold',
  color: string, textAlign: 'left' | 'center' | 'right'
): CanvasElement {
  return { id, type: 'text', x, y, width: w, height: h, zIndex: nextZ(), props: { content, fontSize, fontWeight, color, textAlign, italic: false } }
}
function mkIcon(id: string, x: number, y: number, size: number, emoji: string): CanvasElement {
  return { id, type: 'icon', x: x - size/2, y, width: size, height: size, zIndex: nextZ(), props: { emoji, size: size * 0.75 } }
}

function convertBlock(block: { id: string; type: string; props: Record<string, unknown> }, startY: number): { elements: CanvasElement[]; height: number } {
  _seq = 0
  const b = block.id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = block.props as any

  switch (block.type) {
    case 'hero': {
      const h = 400
      const bgColor = p.bgColor || '#1e40af'
      return {
        height: h,
        elements: [
          mkRect(uid(b,'bg'), 0, startY, CANVAS_WIDTH, h, bgColor),
          mkText(uid(b,'title'), 100, startY + 80, 1000, 80, p.title || '', 48, 'bold', '#ffffff', 'center'),
          mkText(uid(b,'sub'),   100, startY + 180, 1000, 60, p.subtitle || '', 20, 'normal', 'rgba(255,255,255,0.9)', 'center'),
          mkRect(uid(b,'ctabg'), 460, startY + 280, 280, 56, '#ffffff', 10),
          mkText(uid(b,'cta'),   460, startY + 286, 280, 44, p.ctaLabel || '', 16, 'bold', bgColor, 'center'),
        ],
      }
    }

    case 'services': {
      const items: { title: string; description: string; icon: string }[] = p.items || []
      const h = 120 + 240
      const cols = items.length || 1
      const colW = Math.floor((CANVAS_WIDTH - 100) / cols)
      const itemEls = items.flatMap((item, i) => {
        const cx = 50 + colW * i + colW / 2
        return [
          mkIcon(uid(b,`icon${i}`), cx, startY + 120, 60, item.icon || '✅'),
          mkText(uid(b,`ititle${i}`), 50 + colW * i, startY + 190, colW - 20, 40, item.title || '', 18, 'bold', '#111827', 'center'),
          mkText(uid(b,`idesc${i}`),  50 + colW * i, startY + 240, colW - 20, 80, item.description || '', 14, 'normal', '#6b7280', 'center'),
        ]
      })
      return {
        height: h,
        elements: [
          mkRect(uid(b,'bg'), 0, startY, CANVAS_WIDTH, h, '#ffffff'),
          mkText(uid(b,'title'), 100, startY + 40, 1000, 60, p.title || '', 32, 'bold', '#111827', 'center'),
          ...itemEls,
        ],
      }
    }

    case 'pricing': {
      const plans: { name: string; price: string; features: string[]; highlighted: boolean }[] = p.plans || []
      const cardW = 320
      const totalW = cardW * plans.length + 40 * (plans.length - 1)
      const startX = (CANVAS_WIDTH - totalW) / 2
      const h = 500
      const planEls = plans.flatMap((plan, i) => {
        const px = startX + i * (cardW + 40)
        const bg = plan.highlighted ? '#1d4ed8' : '#ffffff'
        const tc = plan.highlighted ? '#ffffff' : '#111827'
        const featEls = (plan.features || []).map((f, j) =>
          mkText(uid(b,`feat${i}_${j}`), px + 20, startY + 260 + j * 36, cardW - 40, 30, `✓  ${f}`, 14, 'normal', tc, 'left')
        )
        return [
          mkRect(uid(b,`card${i}`), px, startY + 100, cardW, h - 120, bg, 16),
          mkText(uid(b,`pname${i}`),  px + 20, startY + 120, cardW - 40, 40, plan.name || '', 20, 'bold', tc, 'left'),
          mkText(uid(b,`pprice${i}`), px + 20, startY + 170, cardW - 40, 60, plan.price || '', 36, 'bold', plan.highlighted ? '#93c5fd' : '#2563eb', 'left'),
          ...featEls,
        ]
      })
      return {
        height: h,
        elements: [
          mkRect(uid(b,'bg'), 0, startY, CANVAS_WIDTH, h, '#f9fafb'),
          mkText(uid(b,'title'), 100, startY + 30, 1000, 60, p.title || '', 32, 'bold', '#111827', 'center'),
          ...planEls,
        ],
      }
    }

    case 'faq': {
      const items: { question: string; answer: string }[] = p.items || []
      const rowH = 110
      const h = 120 + items.length * rowH + 40
      const faqEls = items.flatMap((item, i) => {
        const iy = startY + 110 + i * rowH
        return [
          mkRect(uid(b,`qbg${i}`), 200, iy, 800, 44, '#f3f4f6', 8),
          mkText(uid(b,`ql${i}`),  210, iy + 6, 40, 32, 'Q', 16, 'bold', '#3b82f6', 'center'),
          mkText(uid(b,`qt${i}`),  260, iy + 6, 720, 32, item.question || '', 15, 'bold', '#111827', 'left'),
          mkText(uid(b,`al${i}`),  210, iy + 56, 40, 32, 'A', 16, 'bold', '#10b981', 'center'),
          mkText(uid(b,`at${i}`),  260, iy + 56, 720, 40, item.answer || '', 14, 'normal', '#374151', 'left'),
        ]
      })
      return {
        height: h,
        elements: [
          mkRect(uid(b,'bg'), 0, startY, CANVAS_WIDTH, h, '#ffffff'),
          mkText(uid(b,'title'), 100, startY + 30, 1000, 60, p.title || '', 32, 'bold', '#111827', 'center'),
          ...faqEls,
        ],
      }
    }

    case 'cta': {
      const h = 320
      const bgColor = p.bgColor || '#0f172a'
      return {
        height: h,
        elements: [
          mkRect(uid(b,'bg'), 0, startY, CANVAS_WIDTH, h, bgColor),
          mkText(uid(b,'title'), 100, startY + 60, 1000, 60, p.title || '', 36, 'bold', '#ffffff', 'center'),
          mkText(uid(b,'sub'),   150, startY + 140, 900, 40, p.subtitle || '', 18, 'normal', 'rgba(255,255,255,0.8)', 'center'),
          mkRect(uid(b,'btnbg'), 460, startY + 220, 280, 64, '#ffffff', 12),
          mkText(uid(b,'btn'),   460, startY + 228, 280, 48, p.buttonLabel || '', 16, 'bold', bgColor, 'center'),
        ],
      }
    }

    case 'contact': {
      const h = 500
      return {
        height: h,
        elements: [
          mkRect(uid(b,'bg'), 0, startY, CANVAS_WIDTH, h, '#f9fafb'),
          mkText(uid(b,'title'), 100, startY + 40, 1000, 60, p.title || '', 32, 'bold', '#111827', 'center'),
          mkText(uid(b,'sub'),   150, startY + 110, 900, 40, p.subtitle || '', 16, 'normal', '#6b7280', 'center'),
          mkRect(uid(b,'form'), 300, startY + 170, 600, 280, '#ffffff', 12),
          mkText(uid(b,'hint'), 300, startY + 310, 600, 30, '※ フォームは公開ページで動作します', 13, 'normal', '#9ca3af', 'center'),
          mkRect(uid(b,'btnbg'), 420, startY + 390, 360, 52, '#2563eb', 10),
          mkText(uid(b,'btn'),   420, startY + 397, 360, 38, p.buttonLabel || '送信する', 16, 'bold', '#ffffff', 'center'),
        ],
      }
    }

    case 'image': {
      const h = 420
      return {
        height: h,
        elements: [
          mkRect(uid(b,'bg'), 0, startY, CANVAS_WIDTH, h, '#ffffff'),
          {
            id: uid(b,'img'), type: 'image' as const,
            x: 200, y: startY + 20, width: 800, height: 360,
            zIndex: nextZ(),
            props: { src: p.src || '', alt: p.alt || '', borderRadius: 8, objectFit: 'cover' },
          },
        ],
      }
    }

    default: {
      const h = 100
      return {
        height: h,
        elements: [mkRect(uid(b,'bg'), 0, startY, CANVAS_WIDTH, h, '#f3f4f6')],
      }
    }
  }
}

function convertBlocksToElements(raw: unknown[]): CanvasElement[] {
  let y = 0
  const all: CanvasElement[] = []
  for (const block of raw) {
    const b = block as { id: string; type: string; props: Record<string, unknown> }
    const { elements, height } = convertBlock(b, y)
    all.push(...elements)
    y += height
  }
  return all
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function PageEditPage({ params }: Props) {
  const { pageId } = await params
  const page = await prisma.page.findUnique({ where: { id: pageId } })
  if (!page) notFound()

  const raw = (page.blocks as unknown as unknown[]) ?? []

  // x・y 座標を持っていれば既にキャンバス形式
  const isCanvasFormat =
    raw.length === 0 ||
    typeof (raw[0] as Record<string, unknown>)?.x === 'number'

  const elements: CanvasElement[] = isCanvasFormat
    ? (raw as CanvasElement[])
    : convertBlocksToElements(raw)

  return (
    <div className="fixed inset-0">
      <PageEditor pageId={pageId} title={page.title} initialElements={elements} />
    </div>
  )
}
