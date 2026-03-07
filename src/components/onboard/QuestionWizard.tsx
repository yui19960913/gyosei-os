'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AiAvatar } from './AiAvatar'
import { GeneratingProgress } from './GeneratingProgress'
import { ALL_PREFECTURES, SERVICE_OPTIONS, STYLE_OPTIONS } from '@/lib/ai-site/types'
import type { GenerateInput } from '@/lib/ai-site/types'

// ---- ステップ定義 ----

type StepId = 'firmName' | 'ownerName' | 'ownerBio' | 'services' | 'prefecture' | 'strengths' | 'targetClients' | 'styles'

interface Step {
  id: StepId
  question: string
  subtext?: string
  type: 'text' | 'checkbox' | 'select' | 'textarea'
  options?: string[]
  placeholder?: string
  maxLength?: number
  required: boolean
}

const STEPS: Step[] = [
  {
    id: 'firmName',
    question: '事務所名を教えてください',
    type: 'text',
    placeholder: '例：東京行政書士事務所',
    required: true,
  },
  {
    id: 'ownerName',
    question: '代表者のお名前を教えてください',
    subtext: 'サイトの事務所紹介に掲載されます',
    type: 'text',
    placeholder: '例：山田 太郎',
    required: true,
  },
  {
    id: 'ownerBio',
    question: '代表者の経歴を入力しますか？（任意）',
    subtext: '入力するとサイトの事務所紹介に経歴が掲載されます。スキップも可能です。',
    type: 'textarea',
    placeholder: '例）大手法律事務所に10年勤務後、2015年に独立開業。建設業・飲食店許可を中心に累計500件以上の申請を担当。',
    maxLength: 300,
    required: false,
  },
  {
    id: 'services',
    question: '担当されている業務を教えてください',
    type: 'checkbox',
    options: SERVICE_OPTIONS,
    required: true,
  },
  {
    id: 'prefecture',
    question: '事務所の所在地を教えてください',
    type: 'select',
    options: ALL_PREFECTURES,
    required: true,
  },
  {
    id: 'strengths',
    question: 'あなたの事務所の強みを教えてください',
    type: 'textarea',
    placeholder: '例）開業支援累計100件\n英語対応可能\n飲食店出身のため現場を熟知',
    maxLength: 200,
    required: true,
  },
  {
    id: 'targetClients',
    question: 'ターゲット顧客を教えてください（任意）',
    type: 'textarea',
    placeholder: '例）都内で飲食店開業を検討している方\n外国籍の方向けビザ申請',
    maxLength: 200,
    required: false,
  },
  {
    id: 'styles',
    question: '文章スタイルを選んでください（複数選択可）',
    type: 'checkbox',
    options: STYLE_OPTIONS,
    required: false,
  },
]

// ---- 初期値 ----

const INITIAL_ANSWERS: GenerateInput = {
  firmName: '',
  ownerName: '',
  ownerBio: '',
  services: [],
  prefecture: '',
  strengths: '',
  targetClients: '',
  styles: [],
}

// ---- コンポーネント ----

export function QuestionWizard() {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<GenerateInput>(INITIAL_ANSWERS)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSlug, setGeneratedSlug] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const lastEnterRef = useRef<number>(0)

  const currentStep = STEPS[stepIndex]

  // ---- 値の更新 ----

  const setValue = useCallback(
    (value: string | string[]) => {
      setAnswers((prev) => ({ ...prev, [currentStep.id]: value }))
    },
    [currentStep.id]
  )

  const toggleCheckbox = useCallback(
    (option: string) => {
      const current = answers[currentStep.id as 'services' | 'styles'] as string[]
      const next = current.includes(option)
        ? current.filter((v) => v !== option)
        : [...current, option]
      setAnswers((prev) => ({ ...prev, [currentStep.id]: next }))
    },
    [currentStep.id, answers]
  )

  // ---- バリデーション ----

  const isValid = (): boolean => {
    if (!currentStep.required) return true
    const val = answers[currentStep.id as keyof GenerateInput]
    if (Array.isArray(val)) return val.length > 0
    return typeof val === 'string' && val.trim().length > 0
  }

  // ---- ナビゲーション ----

  const handleNext = () => {
    if (!isValid()) return
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1)
    } else {
      handleGenerate()
    }
  }

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1)
  }

  // ---- 生成 ----

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/onboard/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? '生成に失敗しました')
      }
      const data = await res.json() as { slug: string }
      setGeneratedSlug(data.slug)
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
      setIsGenerating(false)
    }
  }, [answers])

  // ---- 生成完了後のリダイレクト ----

  const handleProgressComplete = useCallback(() => {
    if (generatedSlug) {
      router.push(`/onboard/preview/${generatedSlug}`)
    }
  }, [generatedSlug, router])

  // ---- 生成中UI ----

  if (isGenerating) {
    return (
      <GeneratingProgress
        isApiDone={generatedSlug !== null}
        error={error}
        onComplete={handleProgressComplete}
        onRetry={() => {
          setIsGenerating(false)
          setError(null)
        }}
      />
    )
  }

  // ---- 質問UI ----

  const currentValue = answers[currentStep.id as keyof GenerateInput]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>質問 {stepIndex + 1} / {STEPS.length}</span>
            <span>{Math.round(((stepIndex + 1) / STEPS.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* カード */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* AIアバター + 質問 */}
          <div className="flex items-start gap-4 mb-8">
            <AiAvatar size={56} />
            <div className="flex-1">
              <div className="bg-blue-50 rounded-2xl rounded-tl-none px-5 py-4">
                <p className="text-gray-800 font-medium leading-relaxed">
                  {currentStep.question}
                </p>
                {currentStep.subtext && (
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    {currentStep.subtext}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 入力フィールド */}
          <div className="space-y-3">
            {currentStep.type === 'text' && (
              <>
                <input
                  type="text"
                  value={currentValue as string}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={currentStep.placeholder}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const now = Date.now()
                      if (now - lastEnterRef.current < 500 && isValid()) {
                        handleNext()
                      }
                      lastEnterRef.current = now
                    }
                  }}
                  autoFocus
                />
                <p className="text-xs text-gray-400 text-right">
                  Enter 2回 または「次へ」で進む
                </p>
              </>
            )}

            {currentStep.type === 'textarea' && (
              <div>
                <textarea
                  value={currentValue as string}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={currentStep.placeholder}
                  maxLength={currentStep.maxLength}
                  rows={4}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  autoFocus
                />
                {currentStep.maxLength && (
                  <p className="text-right text-xs text-gray-400 mt-1">
                    {(currentValue as string).length} / {currentStep.maxLength}
                  </p>
                )}
              </div>
            )}

            {currentStep.type === 'select' && (
              <select
                value={currentValue as string}
                onChange={(e) => setValue(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                autoFocus
              >
                <option value="">都道府県を選択</option>
                {currentStep.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {currentStep.type === 'checkbox' && (
              <div className="grid grid-cols-2 gap-2">
                {currentStep.options?.map((opt) => {
                  const checked = (currentValue as string[]).includes(opt)
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleCheckbox(opt)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm text-left transition-colors ${
                        checked
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                        checked ? 'bg-white border-white' : 'border-gray-400'
                      }`}>
                        {checked && <span className="text-blue-600 text-xs font-bold">✓</span>}
                      </span>
                      {opt}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* エラー */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ナビゲーションボタン */}
          <div className="flex gap-3 mt-8">
            {stepIndex > 0 && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                戻る
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={currentStep.required && !isValid()}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {stepIndex === STEPS.length - 1 ? '✨ サイトを生成する' : '次へ →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
