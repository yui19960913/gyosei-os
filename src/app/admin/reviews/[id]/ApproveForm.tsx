'use client'

import { useState } from 'react'

interface Reviewer {
  id: string
  name: string
  title: string
  company: string
}

interface Props {
  reviewId: string
  currentStatus: string
  currentNote: string | null
  reviewers: Reviewer[]
  currentReviewerId: string | null
}

export function ApproveForm({ reviewId, currentStatus, currentNote, reviewers, currentReviewerId }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [note, setNote] = useState(currentNote ?? '')
  const [reviewerId, setReviewerId] = useState(currentReviewerId ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note, reviewerId: reviewerId || null }),
    })
    setLoading(false)
    if (res.ok) setSaved(true)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>ステータス</label>
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }}>
          <option value="pending">⏳ 未対応</option>
          <option value="in_review">🔍 確認中</option>
          <option value="approved">✅ 承認済み</option>
          <option value="rejected">❌ 却下</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>担当レビュアー</label>
        <select value={reviewerId} onChange={e => setReviewerId(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }}>
          <option value="">選択してください</option>
          {reviewers.map(r => (
            <option key={r.id} value={r.id}>{r.name}（{r.company}）</option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>レビューコメント（任意）</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={4}
          placeholder="確認した内容や所感を入力してください"
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
      </div>

      {saved && <p style={{ color: '#10b981', fontSize: 14, fontWeight: 600 }}>✓ 保存しました</p>}

      <button type="submit" disabled={loading}
        style={{
          background: '#6366f1', color: '#fff', fontWeight: 700,
          padding: '12px', borderRadius: 8, border: 'none', fontSize: 15, cursor: 'pointer',
        }}>
        {loading ? '保存中...' : status === 'approved' ? '✅ 承認して保存' : '保存する'}
      </button>
    </form>
  )
}
