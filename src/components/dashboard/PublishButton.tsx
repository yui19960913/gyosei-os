'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  slug: string
}

export function PublishButton({ slug }: Props) {
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      const res = await fetch(`/api/dashboard/${slug}/publish`, { method: 'POST' })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      alert('公開に失敗しました。もう一度お試しください。')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <button
      onClick={handlePublish}
      disabled={isPublishing}
      className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
    >
      {isPublishing ? '公開中...' : '🌐 サイトを公開する'}
    </button>
  )
}
