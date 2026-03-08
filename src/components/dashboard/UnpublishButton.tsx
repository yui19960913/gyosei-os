'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  slug: string
}

export function UnpublishButton({ slug }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleUnpublish = async () => {
    if (!confirm('このサイトを非公開にしますか？\nURLにアクセスしても表示されなくなります。')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/${slug}/unpublish`, { method: 'POST' })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      alert('非公開への変更に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUnpublish}
      disabled={loading}
      className="px-5 py-2 bg-white border border-gray-300 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-colors"
    >
      {loading ? '処理中...' : '非公開にする'}
    </button>
  )
}
