'use client'

import { useRef, useState } from 'react'
import type { ImageProps } from '@/lib/marketing-os/blocks/types'
import { InlineText } from './InlineText'

interface Props {
  props: ImageProps
  onPropChange?: (key: string, value: unknown) => void
}

export function ImageBlock({ props, onPropChange }: Props) {
  const { src, alt, caption } = props
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onPropChange) return

    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/marketing-os/upload', { method: 'POST', body: form })
      if (!res.ok) throw new Error('アップロード失敗')
      const { url } = await res.json()
      onPropChange('src', url)
      onPropChange('alt', file.name.replace(/\.[^.]+$/, ''))
    } catch {
      alert('画像のアップロードに失敗しました')
    } finally {
      setUploading(false)
      // ファイル選択をリセット（同じファイルを再選択できるように）
      e.target.value = ''
    }
  }

  return (
    <section className="py-10 px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        {/* 編集モード */}
        {onPropChange ? (
          <>
            <div
              className="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {src ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={alt} className="w-full h-auto block" />
                  {/* ホバーオーバーレイ */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-medium bg-black/60 px-4 py-2 rounded-lg">
                      {uploading ? 'アップロード中...' : 'クリックして画像を変更'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  {uploading ? (
                    <p className="text-sm">アップロード中...</p>
                  ) : (
                    <>
                      <span className="text-5xl mb-4">🖼️</span>
                      <p className="text-sm font-medium">クリックして画像を選択</p>
                      <p className="text-xs mt-1">JPG / PNG / WebP / GIF</p>
                    </>
                  )}
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {/* キャプション */}
            <InlineText
              as="p"
              value={caption || 'キャプションを入力（省略可）'}
              onChange={(v) => onPropChange('caption', v)}
              className="text-center text-sm text-gray-500 mt-3 block w-full"
            />
          </>
        ) : (
          /* 表示モード */
          src ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt} className="w-full h-auto rounded-xl" />
              {caption && (
                <p className="text-center text-sm text-gray-500 mt-3">{caption}</p>
              )}
            </>
          ) : null
        )}
      </div>
    </section>
  )
}
