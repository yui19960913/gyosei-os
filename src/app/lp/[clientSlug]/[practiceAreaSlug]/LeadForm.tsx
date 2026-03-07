'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  landingPageId: string
}

export default function LeadForm({ landingPageId }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const utmRef = useRef({
    utmSource:   '',
    utmMedium:   '',
    utmCampaign: '',
    utmTerm:     '',
    referrerUrl: '',
  })

  useEffect(() => {
    // ⚠️ UTMパラメータをsessionStorageに退避（ページ遷移でURLから消えるため必須）
    // docs/jsonb-schema.md の実装要件に準拠
    const p = new URLSearchParams(window.location.search)
    ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_term'].forEach((k) => {
      const v = p.get(k)
      if (v) sessionStorage.setItem(k, v)
    })
    if (!sessionStorage.getItem('referrer_url')) {
      sessionStorage.setItem('referrer_url', document.referrer)
    }

    utmRef.current = {
      utmSource:   sessionStorage.getItem('utm_source')   ?? '',
      utmMedium:   sessionStorage.getItem('utm_medium')   ?? '',
      utmCampaign: sessionStorage.getItem('utm_campaign') ?? '',
      utmTerm:     sessionStorage.getItem('utm_term')     ?? '',
      referrerUrl: sessionStorage.getItem('referrer_url') ?? '',
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg(null)

    const form = new FormData(e.currentTarget)
    const payload = {
      landingPageId,
      name:        form.get('name'),
      email:       form.get('email'),
      phone:       form.get('phone'),
      message:     form.get('message'),
      userKeyword: (form.get('userKeyword') as string)?.trim() || null,
      ...utmRef.current,
    }

    const res = await fetch('/api/leads', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })

    if (res.ok) {
      setStatus('success')
    } else {
      const data = await res.json().catch(() => ({}))
      setErrorMsg(data.error ?? '送信に失敗しました。お手数ですがお電話でご連絡ください。')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 px-8 py-12 text-center">
        <div className="mb-4 text-5xl">✅</div>
        <h3 className="mb-2 text-xl font-bold text-gray-900">お問い合わせを受け付けました</h3>
        <p className="text-gray-600">1営業日以内にご連絡いたします。</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMsg && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorMsg}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="山田 太郎"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            電話番号 <span className="text-red-500">*</span>
          </label>
          <input
            name="phone"
            type="tel"
            required
            placeholder="03-0000-0000"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="example@email.com"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">ご相談内容</label>
        <textarea
          name="message"
          rows={4}
          placeholder="例：来月中旬の開業を目指しています。物件はすでに決まっており、厨房設備の設置も完了しています。"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          何と検索してこのページを見つけましたか？
          <span className="ml-1 text-xs font-normal text-gray-400">（任意）</span>
        </label>
        <input
          name="userKeyword"
          type="text"
          placeholder="例：飲食店 営業許可 東京"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full rounded-xl bg-green-600 py-4 text-base font-bold text-white hover:bg-green-700 disabled:opacity-60 transition-colors"
      >
        {status === 'loading' ? '送信中...' : '無料相談を申し込む（完全無料）'}
      </button>

      <p className="text-center text-xs text-gray-400">
        入力いただいた情報は相談対応にのみ使用します。第三者への提供はしません。
      </p>
    </form>
  )
}
