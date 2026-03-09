'use client'

import { useEffect, useState } from 'react'
import { AiAvatar } from './AiAvatar'

const STEPS = [
  '事務所情報を分析',
  'キャッチコピーを生成',
  'トップページを構築',
  'SEOキーワードを最適化',
  'お問い合わせフォームを設定',
  'サイトを完成',
]

interface Props {
  /** API呼び出しが完了したか */
  isApiDone: boolean
  error: string | null
  onComplete: () => void
  onRetry: () => void
}

export function GeneratingProgress({ isApiDone, error, onComplete, onRetry }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [animationDone, setAnimationDone] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  // 経過時間カウンター
  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // アニメーション：各ステップを1.5秒ずつ進める
  useEffect(() => {
    if (currentStep < STEPS.length - 1) {
      const t = setTimeout(() => setCurrentStep((s) => s + 1), 1500)
      return () => clearTimeout(t)
    } else {
      setAnimationDone(true)
    }
  }, [currentStep])

  // アニメーション完了 AND API完了 → リダイレクト
  useEffect(() => {
    if (animationDone && isApiDone) {
      const t = setTimeout(onComplete, 800)
      return () => clearTimeout(t)
    }
  }, [animationDone, isApiDone, onComplete])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
          <p className="text-4xl mb-4">😞</p>
          <h2 className="text-lg font-bold text-gray-900 mb-2">生成に失敗しました</h2>
          <p className="text-sm text-red-600 mb-6">{error}</p>
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            もう一度試す
          </button>
        </div>
      </div>
    )
  }

  // アニメーション完了したが API がまだ → "最終調整中" 表示
  const showFinalizing = animationDone && !isApiDone

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <AiAvatar size={80} thinking />

        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">
          {showFinalizing ? '最終調整中...' : 'AIがサイトを作成しています'}
        </h2>
        <p className="text-sm text-gray-400 mb-2">
          {showFinalizing ? 'もう少しお待ちください' : '通常15〜30秒で完成します'}
        </p>
        <div className="text-xs text-gray-300 mb-8">
          経過時間: {elapsed}秒
        </div>

        {/* ステップ一覧 */}
        <div className="space-y-3 text-left">
          {STEPS.map((step, i) => {
            const isDone = i < currentStep || (animationDone && isApiDone)
            const isCurrent = i === currentStep && !animationDone

            return (
              <div
                key={step}
                className={`flex items-center gap-3 text-sm transition-all ${
                  isDone
                    ? 'text-gray-900'
                    : isCurrent
                    ? 'text-blue-700 font-medium'
                    : 'text-gray-300'
                }`}
              >
                <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center">
                  {isDone ? (
                    <span className="text-green-500 text-base">✓</span>
                  ) : isCurrent ? (
                    <span className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-200 mx-auto block" />
                  )}
                </span>
                {step}
              </div>
            )
          })}
        </div>

        {/* 全完了表示 */}
        {animationDone && isApiDone && (
          <div className="mt-6 text-green-600 font-semibold text-sm animate-pulse">
            完成！プレビューへ移動します...
          </div>
        )}
      </div>
    </div>
  )
}
