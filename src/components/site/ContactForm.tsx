'use client'

import { useState } from 'react'

interface Props {
  siteSlug: string
  isPreview?: boolean
}

export function ContactForm({ siteSlug, isPreview }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isPreview) return

    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch(`/api/site/${siteSlug}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
      })

      if (!res.ok) throw new Error('送信に失敗しました')
      setStatus('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '予期しないエラーが発生しました')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-4">✅</p>
        <h3 className="text-lg font-bold text-gray-900 mb-2">お問い合わせを受け付けました</h3>
        <p className="text-sm text-gray-500">1営業日以内にご連絡いたします。</p>
      </div>
    )
  }

  const inputClass =
    'w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:opacity-70'
  const isDisabled = isPreview || status === 'sending'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          お名前 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          disabled={isDisabled}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="山田 太郎"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          required
          disabled={isDisabled}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
        <input
          type="tel"
          disabled={isDisabled}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="090-0000-0000"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ご相談内容</label>
        <textarea
          rows={4}
          disabled={isDisabled}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="ご相談内容をご記入ください"
          className={`${inputClass} resize-none`}
        />
      </div>

      {isPreview && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center text-blue-700 text-xs">
          ✳️ プレビューモードです。公開後に実際のフォームが有効になります。
        </div>
      )}

      {status === 'error' && (
        <p className="text-red-600 text-sm">{errorMsg}</p>
      )}

      {!isPreview && (
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full py-4 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'sending' ? '送信中...' : '送信する'}
        </button>
      )}
    </form>
  )
}
