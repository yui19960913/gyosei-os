export type CanvasElementType = 'text' | 'image' | 'icon' | 'line' | 'rect'

export interface CanvasElement {
  id: string
  type: CanvasElementType
  x: number        // px from canvas left
  y: number        // px from canvas top
  width: number    // px
  height: number   // px
  zIndex: number
  props: Record<string, unknown>
}

// props shapes (for reference):
// text:  { content, fontSize, fontWeight:'normal'|'bold', color, textAlign:'left'|'center'|'right', italic }
// image: { src, alt, borderRadius, objectFit:'cover'|'contain' }
// icon:  { emoji, size }
// line:  { direction:'h'|'v', color, thickness }
