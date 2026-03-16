'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AiAvatar } from './AiAvatar'
import { GeneratingProgress } from './GeneratingProgress'
import { SERVICE_OPTIONS, STYLE_OPTIONS } from '@/lib/ai-site/types'
import { AREA_REGIONS } from '@/lib/ai-site/areas'
import type { Region, Prefecture } from '@/lib/ai-site/areas'
import type { GenerateInput, UserTestimonial } from '@/lib/ai-site/types'

// ---- ステップ定義 ----

type StepId = 'firmName' | 'ownerName' | 'ownerEmail' | 'ownerBio' | 'services' | 'serviceAreas' | 'strengths' | 'styles'

interface Step {
  id: StepId
  question: string
  subtext?: string
  type: 'text' | 'checkbox' | 'select' | 'textarea' | 'testimonials' | 'area-select' | 'strength-select'
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
    id: 'ownerEmail',
    question: 'メールアドレスを教えてください。',
    subtext: 'サイトの管理・ログインに使用します。',
    type: 'text',
    placeholder: '例：info@yamada-gyosei.jp',
    required: true,
  },
  {
    id: 'ownerBio',
    question: '代表者の経歴を入力しますか？（任意）',
    subtext: '入力するとサイトの事務所紹介に経歴が掲載されます。スキップも可能です。',
    type: 'textarea',
    placeholder: '例）大手法律事務所に10年勤務後、2015年に独立開業。',
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
    id: 'serviceAreas',
    question: '対応エリアを教えてください',
    subtext: 'サイトの「対応エリア」セクションに掲載されます。',
    type: 'area-select',
    required: true,
  },
  {
    id: 'strengths',
    question: 'できることを教えてください（任意）',
    subtext: '当てはまるものを選んでください。複数選択可。',
    type: 'strength-select',
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
  ownerEmail: '',
  ownerBio: '',
  services: [],
  serviceAreas: [],
  strengths: '',
  styles: [],
  userTestimonials: [],
}

// ---- お客様の声入力コンポーネント ----

function TestimonialsInput({
  value,
  onChange,
}: {
  value: UserTestimonial[]
  onChange: (v: UserTestimonial[]) => void
}) {
  const addItem = () => {
    if (value.length >= 5) return
    onChange([...value, { name: '', content: '' }])
  }

  const updateItem = (i: number, field: keyof UserTestimonial, text: string) => {
    const next = value.map((item, idx) =>
      idx === i ? { ...item, [field]: text } : item
    )
    onChange(next)
  }

  const removeItem = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-4">
      {value.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">
          お客様の声はまだ登録されていません
        </p>
      )}

      {value.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">お客様の声 {i + 1}</span>
            <button
              onClick={() => removeItem(i)}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              削除
            </button>
          </div>
          <input
            type="text"
            value={item.name}
            onChange={(e) => updateItem(i, 'name', e.target.value)}
            placeholder="お名前（例：A様・匿名可）"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={item.content}
            onChange={(e) => updateItem(i, 'content', e.target.value)}
            placeholder="お客様のコメント（例：スムーズに対応していただき、無事に許可が下りました。）"
            rows={3}
            maxLength={200}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className="text-right text-xs text-gray-400">{item.content.length} / 200</p>
        </div>
      ))}

      {value.length < 5 && (
        <button
          onClick={addItem}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          + お客様の声を追加（{value.length}/5）
        </button>
      )}
    </div>
  )
}

// ---- 強み選択コンポーネント ----

const STRENGTH_OPTIONS = [
  '🌐 多言語対応（英語・中国語・ベトナム語など）',
  '⚡ スピード対応（即日相談・最短申請）',
  '💰 明確な料金体系',
  '🤝 地域密着・顔の見えるサポート',
  '📅 土日祝対応',
]

function StrengthsInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const lines = value ? value.split('\n') : []
  const selectedOptions = lines.filter(l => STRENGTH_OPTIONS.includes(l))
  const otherText = lines.filter(l => !STRENGTH_OPTIONS.includes(l)).join('\n')

  const toggleOption = (opt: string) => {
    const next = selectedOptions.includes(opt)
      ? selectedOptions.filter(o => o !== opt)
      : [...selectedOptions, opt]
    const combined = [...next, ...(otherText ? [otherText] : [])].join('\n')
    onChange(combined)
  }

  const handleOtherChange = (text: string) => {
    const combined = [...selectedOptions, ...(text ? [text] : [])].join('\n')
    onChange(combined)
  }

  return (
    <div className="space-y-2">
      {STRENGTH_OPTIONS.map(opt => {
        const checked = selectedOptions.includes(opt)
        return (
          <button
            key={opt}
            onClick={() => toggleOption(opt)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-colors ${
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
      <div className="mt-2">
        <textarea
          value={otherText}
          onChange={e => handleOtherChange(e.target.value)}
          placeholder="その他（自由記述）例）開業支援累計100件"
          rows={2}
          maxLength={200}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>
    </div>
  )
}

// ---- エリア選択コンポーネント ----

function AreaSelectInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set(['関東']))
  const [expandedPrefs, setExpandedPrefs] = useState<Set<string>>(new Set())

  const isNationwide = value.includes('全国')

  const toggleNationwide = () => {
    onChange(isNationwide ? [] : ['全国'])
  }

  const getRegionPrefNames = (region: Region) => region.prefectures.map(p => p.name)

  const isRegionAllChecked = (region: Region) => {
    if (isNationwide) return true
    return getRegionPrefNames(region).every(n => value.includes(n))
  }

  const isRegionPartialChecked = (region: Region) => {
    if (isNationwide) return false
    const prefNames = getRegionPrefNames(region)
    return prefNames.some(n => value.includes(n)) && !prefNames.every(n => value.includes(n))
  }

  const toggleRegion = (region: Region) => {
    if (isNationwide) return
    const prefNames = getRegionPrefNames(region)
    if (prefNames.every(n => value.includes(n))) {
      onChange(value.filter(v => !prefNames.includes(v)))
    } else {
      onChange([...new Set([...value, ...prefNames])])
    }
  }

  const isPrefChecked = (prefName: string) => isNationwide || value.includes(prefName)

  const togglePref = (pref: Prefecture) => {
    if (isNationwide) return
    if (value.includes(pref.name)) {
      const cityNames = pref.cities ?? []
      onChange(value.filter(v => v !== pref.name && !cityNames.includes(v)))
    } else {
      onChange([...value, pref.name])
    }
  }

  const isCityChecked = (city: string, pref: Prefecture) => {
    return isNationwide || value.includes(pref.name) || value.includes(city)
  }

  const toggleCity = (city: string, pref: Prefecture) => {
    if (isNationwide) return
    if (value.includes(pref.name)) {
      // Deselect pref, then add all cities except this one
      const otherCities = (pref.cities ?? []).filter(c => c !== city)
      onChange([...value.filter(v => v !== pref.name), ...otherCities])
    } else if (value.includes(city)) {
      onChange(value.filter(v => v !== city))
    } else {
      onChange([...value, city])
    }
  }

  const toggleExpandRegion = (regionName: string) => {
    setExpandedRegions(prev => {
      const next = new Set(prev)
      if (next.has(regionName)) next.delete(regionName)
      else next.add(regionName)
      return next
    })
  }

  const toggleExpandPref = (prefName: string) => {
    setExpandedPrefs(prev => {
      const next = new Set(prev)
      if (next.has(prefName)) next.delete(prefName)
      else next.add(prefName)
      return next
    })
  }

  const selectedCount = isNationwide ? 1 : value.length

  return (
    <div className="space-y-2">
      {/* 選択済み件数 */}
      {selectedCount > 0 && (
        <p className="text-xs text-blue-600 font-medium mb-2">
          {isNationwide ? '全国を選択中' : `${selectedCount}エリアを選択中`}
        </p>
      )}

      {/* 全国 */}
      <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-colors ${isNationwide ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
        <input type="checkbox" checked={isNationwide} onChange={toggleNationwide} className="w-4 h-4 accent-blue-600" />
        <span className="font-semibold text-sm text-gray-800">🌐 全国対応</span>
      </label>

      {/* 地域別 */}
      {AREA_REGIONS.map(region => {
        const regionChecked = isRegionAllChecked(region)
        const regionPartial = isRegionPartialChecked(region)
        const regionExpanded = expandedRegions.has(region.name)

        return (
          <div key={region.name} className={`border rounded-xl overflow-hidden transition-colors ${isNationwide ? 'opacity-40' : ''}`}>
            {/* 地域ヘッダー */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50">
              <input
                type="checkbox"
                checked={regionChecked}
                ref={el => { if (el) el.indeterminate = regionPartial }}
                onChange={() => toggleRegion(region)}
                disabled={isNationwide}
                className="w-4 h-4 accent-blue-600 flex-shrink-0"
              />
              <button
                type="button"
                onClick={() => toggleExpandRegion(region.name)}
                className="flex-1 flex items-center justify-between text-left"
              >
                <span className="text-sm font-semibold text-gray-700">{region.name}</span>
                <span className="text-gray-400 text-xs">{regionExpanded ? '▲' : '▼'}</span>
              </button>
            </div>

            {/* 都道府県一覧 */}
            {regionExpanded && (
              <div className="px-4 py-3 grid grid-cols-2 gap-y-2 gap-x-3 border-t border-gray-100">
                {region.prefectures.map(pref => {
                  const prefChecked = isPrefChecked(pref.name)
                  const prefExpanded = expandedPrefs.has(pref.name)

                  return (
                    <div key={pref.name}>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={prefChecked}
                          onChange={() => togglePref(pref)}
                          disabled={isNationwide}
                          className="w-3.5 h-3.5 accent-blue-600 flex-shrink-0"
                        />
                        <span
                          className={`text-sm text-gray-700 cursor-pointer flex-1 ${prefChecked ? 'font-medium text-blue-700' : ''}`}
                          onClick={() => !isNationwide && togglePref(pref)}
                        >
                          {pref.name}
                        </span>
                        {pref.cities && (
                          <button
                            type="button"
                            onClick={() => toggleExpandPref(pref.name)}
                            className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0"
                          >
                            {prefExpanded ? '▲' : '＋'}
                          </button>
                        )}
                      </div>

                      {/* 市区町村 */}
                      {pref.cities && prefExpanded && (
                        <div className="ml-5 mt-2 space-y-1 col-span-2">
                          {pref.cities.map(city => (
                            <label key={city} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isCityChecked(city, pref)}
                                onChange={() => toggleCity(city, pref)}
                                disabled={isNationwide}
                                className="w-3 h-3 accent-blue-600"
                              />
                              <span className="text-xs text-gray-600">{city}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---- メインコンポーネント ----

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
    if (typeof val !== 'string' || val.trim().length === 0) return false
    if (currentStep.id === 'ownerEmail') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
    }
    return true
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
        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8">
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
                  type={currentStep.id === 'ownerEmail' ? 'email' : 'text'}
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
                {currentStep.id === 'ownerEmail' && (currentValue as string).length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((currentValue as string).trim()) && (
                  <p className="text-xs text-red-500">メールアドレスの形式で入力してください（例：info@example.com）</p>
                )}
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

            {currentStep.type === 'strength-select' && (
              <StrengthsInput
                value={answers.strengths as string}
                onChange={(v) => setAnswers((prev) => ({ ...prev, strengths: v }))}
              />
            )}

            {currentStep.type === 'area-select' && (
              <AreaSelectInput
                value={(answers.serviceAreas ?? []) as string[]}
                onChange={(v) => setAnswers((prev) => ({ ...prev, serviceAreas: v }))}
              />
            )}

            {currentStep.type === 'testimonials' && (
              <TestimonialsInput
                value={(answers.userTestimonials ?? []) as UserTestimonial[]}
                onChange={(v) => setAnswers((prev) => ({ ...prev, userTestimonials: v }))}
              />
            )}
          </div>

          {/* 全質問共通の注意書き */}
          <p className="text-xs text-gray-300 mt-5 text-center leading-relaxed">
            ※ 回答内容はあとからでも追加・編集できます
          </p>

          {/* エラー */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ナビゲーションボタン */}
          <div className="flex gap-3 mt-6">
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
