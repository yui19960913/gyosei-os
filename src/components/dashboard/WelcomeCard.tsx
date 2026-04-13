'use client'

import { useState, useEffect } from 'react'

interface Props {
  slug: string
  prefecture: string
}

export function WelcomeCard({ slug, prefecture }: Props) {
  const [visible, setVisible] = useState(false)
  const storageKey = `welcome-dismissed-${slug}`

  useEffect(() => {
    if (!localStorage.getItem(storageKey)) {
      setVisible(true)
    }
  }, [storageKey])

  function dismiss() {
    localStorage.setItem(storageKey, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-6 relative">
      <button
        onClick={dismiss}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg leading-none"
        aria-label="閉じる"
      >
        ✕
      </button>

      <h2 className="text-lg font-bold text-gray-900 mb-4">
        サイトの準備をしましょう
      </h2>

      <div className="space-y-4">
        {/* ステップ1 */}
        <div className="flex gap-3">
          <span className="shrink-0 w-6 h-6 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">1</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">サイトを確認・編集する</p>
            <p className="text-xs text-gray-500 mt-0.5">
              AIが生成したサイトの内容を確認し、必要に応じてテキストやデザインを編集できます。
            </p>
            <a
              href={`/onboard/preview/${slug}`}
              className="inline-block mt-2 text-xs text-indigo-600 font-semibold hover:underline"
            >
              編集画面を開く →
            </a>
          </div>
        </div>

        {/* ステップ2 */}
        <div className="flex gap-3">
          <span className="shrink-0 w-6 h-6 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">2</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">サイトを公開する</p>
            <p className="text-xs text-gray-500 mt-0.5">
              準備ができたら、この画面の右上にある「公開する」ボタンをクリックしてください。
            </p>
          </div>
        </div>

        {/* ステップ3 */}
        <div className="flex gap-3">
          <span className="shrink-0 w-6 h-6 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">3</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">Googleマップに登録する（任意）</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Googleマップで「行政書士 {prefecture}」と検索したときに事務所を表示するには、Googleビジネスプロフィールへの登録が必要です。無料で登録できます。
            </p>
            <div className="mt-2 bg-white rounded-lg border border-gray-200 p-3">
              <ol className="text-xs text-gray-600 leading-loose pl-4 list-decimal space-y-0.5">
                <li>下のリンクからGoogleビジネスプロフィールにアクセス</li>
                <li>「今すぐ管理」をクリックしてGoogleアカウントでログイン</li>
                <li>事務所名・住所・電話番号・営業時間を入力</li>
                <li>Googleからハガキが届くので、記載の確認コードを入力</li>
              </ol>
              <p className="text-xs text-gray-400 mt-1.5">※ 確認コードの到着まで1〜2週間かかる場合があります</p>
            </div>
            <a
              href="https://business.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-green-700 font-semibold hover:underline"
            >
              Googleビジネスプロフィールに登録する →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
