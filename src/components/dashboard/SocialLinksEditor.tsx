'use client'

import { useState } from 'react'
import type { SocialLinks } from '@/lib/ai-site/types'

interface Props {
  slug: string
  initial: SocialLinks
}

export function SocialLinksEditor({ slug, initial }: Props) {
  const [line, setLine] = useState(initial.line ?? '')
  const [facebook, setFacebook] = useState(initial.facebook ?? '')
  const [instagram, setInstagram] = useState(initial.instagram ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const res = await fetch(`/api/dashboard/${slug}/social`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ social: { line: line || undefined, facebook: facebook || undefined, instagram: instagram || undefined } }),
    })
    setSaving(false)
    if (res.ok) setSaved(true)
  }

  const fields = [
    {
      key: 'line', label: 'LINE', placeholder: 'https://lin.ee/xxxxxxx',
      value: line, onChange: setLine,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#06C755"><path d="M12 2C6.48 2 2 6.03 2 11c0 3.27 1.82 6.14 4.58 7.89.2.12.29.35.22.57l-.55 2.01c-.08.3.22.56.5.42l2.33-1.22c.14-.07.3-.09.45-.05.62.17 1.28.27 1.97.27 5.52 0 10-4.03 10-9S17.52 2 12 2zm-3 13H7v-5h2v5zm3 0h-2v-5h2v5zm3 0h-2v-5h2v5z"/></svg>
      ),
    },
    {
      key: 'facebook', label: 'Facebook', placeholder: 'https://www.facebook.com/your-page',
      value: facebook, onChange: setFacebook,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
      ),
    },
    {
      key: 'instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/your-account',
      value: instagram, onChange: setInstagram,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24"><defs><linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="25%" stopColor="#e6683c"/><stop offset="50%" stopColor="#dc2743"/><stop offset="75%" stopColor="#cc2366"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs><path fill="url(#ig)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
      ),
    },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-gray-900">SNSリンク設定</h2>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">月額プラン</span>
      </div>
      <div className="p-5 space-y-4">
        <p className="text-xs text-gray-500">URLを入力するとサイトのフッターにアイコンが表示されます。不要な場合は空欄のままにしてください。</p>
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              {f.icon}{f.label}
            </label>
            <input
              type="url"
              value={f.value}
              onChange={e => f.onChange(e.target.value)}
              placeholder={f.placeholder}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        ))}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? '保存中…' : '保存する'}
          </button>
          {saved && <span className="text-xs text-green-600 font-medium">✓ 保存しました</span>}
        </div>
      </div>
    </div>
  )
}
