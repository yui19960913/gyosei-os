'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ReviewerForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    title: '',
    company: '',
    experience: '',
    speciality: '',
    bio: '',
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/reviewers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) {
      setSaved(true)
      setForm({ name: '', title: '', company: '', experience: '', speciality: '', bio: '' })
      router.refresh()
    }
  }

  const fieldStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 14,
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>名前 <span style={{ color: '#ef4444' }}>*</span></label>
          <input required name="name" value={form.name} onChange={handleChange} placeholder="山田 太郎" style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>肩書き <span style={{ color: '#ef4444' }}>*</span></label>
          <input required name="title" value={form.title} onChange={handleChange} placeholder="行政書士" style={fieldStyle} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>事務所名 <span style={{ color: '#ef4444' }}>*</span></label>
          <input required name="company" value={form.company} onChange={handleChange} placeholder="山田行政書士事務所" style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>経験年数 <span style={{ color: '#ef4444' }}>*</span></label>
          <input required name="experience" value={form.experience} onChange={handleChange} placeholder="10年以上" style={fieldStyle} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>専門分野 <span style={{ color: '#ef4444' }}>*</span></label>
        <input required name="speciality" value={form.speciality} onChange={handleChange} placeholder="在留資格・帰化申請・会社設立" style={fieldStyle} />
      </div>
      <div>
        <label style={labelStyle}>自己紹介（任意）</label>
        <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
          placeholder="略歴や特徴を入力してください"
          style={{ ...fieldStyle, resize: 'vertical' }} />
      </div>

      {saved && <p style={{ color: '#10b981', fontSize: 14, fontWeight: 600 }}>✓ レビュアーを追加しました</p>}

      <button type="submit" disabled={loading} style={{
        background: '#6366f1', color: '#fff', fontWeight: 700,
        padding: '12px', borderRadius: 8, border: 'none', fontSize: 15, cursor: 'pointer',
      }}>
        {loading ? '追加中...' : 'レビュアーを追加'}
      </button>
    </form>
  )
}
