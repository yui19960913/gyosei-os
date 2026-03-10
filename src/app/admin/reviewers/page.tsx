import { prisma } from '@/lib/prisma'
import { ReviewerForm } from './ReviewerForm'

export default async function AdminReviewersPage() {
  const reviewers = await prisma.reviewer.findMany({ orderBy: { createdAt: 'asc' } })

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 4 }}>レビュアー管理</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>レビューを担当するプロフェッショナルを管理します</p>
      </div>

      {/* 一覧 */}
      {reviewers.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 40 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['名前', '肩書き', '事務所', '経験', '専門分野', 'ステータス'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviewers.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < reviewers.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>{r.name}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{r.title}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{r.company}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>{r.experience}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{r.speciality}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: r.active ? '#10b981' : '#9ca3af',
                      background: r.active ? '#10b98115' : '#9ca3af15',
                      padding: '4px 10px', borderRadius: 100,
                    }}>
                      {r.active ? '有効' : '無効'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reviewers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', marginBottom: 40 }}>
          レビュアーはまだ登録されていません
        </div>
      )}

      {/* 追加フォーム */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '28px', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#111827' }}>レビュアーを追加</h2>
        <ReviewerForm />
      </div>
    </div>
  )
}
