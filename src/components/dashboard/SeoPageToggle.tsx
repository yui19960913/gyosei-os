'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  pageId: string
  currentStatus: string
}

export function SeoPageToggle({ pageId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const isPublished = currentStatus === 'published'

  async function handleToggle() {
    setLoading(true)
    const newStatus = isPublished ? 'draft' : 'published'
    await fetch(`/api/seo/${pageId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors disabled:opacity-50 ${
        isPublished
          ? 'border border-gray-300 text-gray-600 hover:bg-gray-50'
          : 'bg-green-600 text-white hover:bg-green-700'
      }`}
    >
      {loading ? '...' : isPublished ? '非公開にする' : '公開する'}
    </button>
  )
}
