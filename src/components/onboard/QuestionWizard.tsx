'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AiAvatar } from './AiAvatar'
import { GeneratingProgress } from './GeneratingProgress'
import { SERVICE_OPTIONS } from '@/lib/ai-site/types'
import { AREA_REGIONS } from '@/lib/ai-site/areas'
import type { Region, Prefecture } from '@/lib/ai-site/areas'
import type { GenerateInput, UserTestimonial } from '@/lib/ai-site/types'

// ---- ステップ定義 ----

type StepId = 'firmName' | 'ownerName' | 'ownerBio' | 'services' | 'serviceAreas' | 'strengths'

interface Step {
  id: StepId
  question: string
  subtext?: string
  type: 'text' | 'url' | 'checkbox' | 'select' | 'textarea' | 'testimonials' | 'area-select' | 'strength-select'
  options?: string[]
  placeholder?: string
  maxLength?: number
  required: boolean
}

const STEPS: Step[] = [
  {
    id: 'firmName',
    question: '事務所名を教えてください',
    subtext: '後から修正できますので、まだ事務所名が決まっていない場合は、仮称でも問題ありません。',
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
  lineSns: '',
  facebookSns: '',
}

// NOTE: lineSns/facebookSns are kept in GenerateInput for backward compatibility
// but no longer asked in the wizard. Users can add them later from the dashboard.

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
  '⚡ スピード対応（即日相談・最短申請）',
  '💰 明確な料金体系',
  '🤝 地域密着・顔の見えるサポート',
  '📅 土日祝対応',
]

const LANGUAGE_OPTIONS = [
  '🇺🇸 英語',
  '🇨🇳 中国語（普通話）',
  '🇹🇼 中国語（広東語）',
  '🇰🇷 韓国語',
  '🇻🇳 ベトナム語',
  '🇵🇭 タガログ語（フィリピノ語）',
  '🇳🇵 ネパール語',
  '🇮🇩 インドネシア語',
  '🇲🇲 ミャンマー語',
  '🇧🇷 ポルトガル語',
  '🇪🇸 スペイン語',
  '🇹🇭 タイ語',
]

function StrengthsInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ALL_OPTIONS = [...STRENGTH_OPTIONS, ...LANGUAGE_OPTIONS]
  const lines = value ? value.split('\n') : []
  const selectedOptions = lines.filter(l => ALL_OPTIONS.includes(l))
  const otherText = lines.filter(l => !ALL_OPTIONS.includes(l)).join('\n')

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

  const CheckButton = ({ opt }: { opt: string }) => {
    const checked = selectedOptions.includes(opt)
    return (
      <button
        key={opt}
        onClick={() => toggleOption(opt)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-colors ${
          checked ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
        }`}
      >
        <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${checked ? 'bg-white border-white' : 'border-gray-400'}`}>
          {checked && <span className="text-blue-600 text-xs font-bold">✓</span>}
        </span>
        {opt}
      </button>
    )
  }

  return (
    <div className="space-y-2">
      {STRENGTH_OPTIONS.map(opt => <CheckButton key={opt} opt={opt} />)}

      <p className="text-xs font-semibold text-gray-500 pt-2 pb-1">🌐 日本語以外で対応可能な言語</p>
      <div className="grid grid-cols-2 gap-2">
        {LANGUAGE_OPTIONS.map(opt => <CheckButton key={opt} opt={opt} />)}
      </div>

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

export function QuestionWizard({ ownerEmail }: { ownerEmail: string }) {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<GenerateInput>({ ...INITIAL_ANSWERS, ownerEmail })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSlug, setGeneratedSlug] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [existingDraftSlug, setExistingDraftSlug] = useState<string | null>(null)
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
      const current = answers[currentStep.id as 'services'] as string[]
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

  const handleGenerate = useCallback(async (overwrite = false) => {
    setIsGenerating(true)
    setError(null)
    setExistingDraftSlug(null)

    try {
      const res = await fetch('/api/onboard/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...answers, overwrite }),
      })

      const data = await res.json() as {
        slug?: string
        error?: string
        existingPaid?: boolean
        existingDraft?: boolean
      }

      // 決済済みサイトが存在 → ダッシュボードへ
      if (data.existingPaid && data.slug) {
        router.push(`/dashboard/${data.slug}`)
        return
      }

      // 別入力のドラフトが存在 → 上書き確認
      if (data.existingDraft && data.slug) {
        setExistingDraftSlug(data.slug)
        setIsGenerating(false)
        return
      }

      if (!res.ok) {
        throw new Error(data.error ?? '生成に失敗しました')
      }

      setGeneratedSlug(data.slug!)
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
      setIsGenerating(false)
    }
  }, [answers, router])

  // ---- 生成完了後のリダイレクト ----

  const handleProgressComplete = useCallback(() => {
    if (generatedSlug) {
      router.push(`/onboard/preview/${generatedSlug}`)
    }
  }, [generatedSlug, router])

  // ---- 上書き確認UI ----

  if (existingDraftSlug) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(150deg, #eef2ff 0%, #f0fdf4 50%, #fdf4ff 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, fontFamily: "'Inter','Helvetica Neue',Arial,'Hiragino Sans',sans-serif",
      }}>
        <div style={{
          background: '#fff', borderRadius: 20, padding: 'clamp(32px, 5vw, 48px)',
          maxWidth: 480, width: '100%', textAlign: 'center',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb',
        }}>
          <p style={{ fontSize: 40, marginBottom: 16 }}>📝</p>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
            作成中のサイトがあります
          </h2>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 32 }}>
            このメールアドレスで作成したサイトが既にあります。<br />
            新しい内容で上書きしますか？
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={() => void handleGenerate(true)}
              style={{
                padding: '14px', borderRadius: 12, border: 'none',
                background: '#6366f1', color: '#fff',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}
            >
              上書きして新しく作る
            </button>
            <button
              onClick={() => router.push(`/onboard/preview/${existingDraftSlug}`)}
              style={{
                padding: '14px', borderRadius: 12,
                border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}
            >
              既存のサイトを編集する
            </button>
          </div>
        </div>
      </div>
    )
  }

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
      <div className="w-full max-w-lg lg:max-w-2xl">
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
        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 lg:p-10">
          {/* AIアバター + 質問 */}
          <div className="flex items-start gap-4 mb-8">
            <AiAvatar size={56} />
            <div className="flex-1">
              <div className="bg-blue-50 rounded-2xl rounded-tl-none px-5 py-4">
                <p className="text-gray-800 font-medium leading-relaxed lg:text-lg">
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
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {currentStep.type === 'url' && (
              <input
                type="url"
                value={currentValue as string}
                onChange={(e) => setValue(e.target.value)}
                placeholder={currentStep.placeholder}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            )}

            {currentStep.type === 'textarea' && (
              <div>
                <textarea
                  value={currentValue as string}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={currentStep.placeholder}
                  maxLength={currentStep.maxLength}
                  rows={4}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
