'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  keyword: string
  siteId: string
  siteSlug: string
}

export function SeoGenerateButton({ keyword, siteId, siteSlug }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle')

  const handleGenerate = async () => {
    setStatus('generating')
    try {
      const res = await fetch('/api/seo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, siteId }),
      })
      if (!res.ok) throw new Error()
      setStatus('done')
      router.refresh()
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={status === 'generating' || status === 'done'}
      className={`text-sm px-4 py-2 rounded-xl border transition-colors ${
        status === 'done'
          ? 'bg-green-50 border-green-300 text-green-700 cursor-default'
          : status === 'error'
          ? 'bg-red-50 border-red-300 text-red-700'
          : status === 'generating'
          ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-wait'
          : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-400'
      }`}
    >
      {status === 'generating' ? '⟳ 生成中...' : status === 'done' ? '✓ 生成完了' : status === 'error' ? '✕ 失敗' : keyword}
    </button>
  )
}
