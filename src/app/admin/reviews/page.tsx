import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminReviewsPage() {
  const reviews = await prisma.reviewRequest.findMany({
    include: { site: true, reviewer: true },
    orderBy: { createdAt: 'desc' },
  })

  const statusLabel: Record<string, string> = {
    pending: '⏳ 未対応',
    in_review: '🔍 確認中',
    approved: '✅ 承認済み',
    rejected: '❌ 却下',
  }

  const statusColor: Record<string, string> = {
    pending: '#f59e0b',
    in_review: '#3b82f6',
    approved: '#10b981',
    rejected: '#ef4444',
  }

  return (
    <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 4 }}>レビュー依頼管理</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          {reviews.filter(r => r.status === 'pending').length}件の未対応依頼があります
        </p>
      </div>

      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
          レビュー依頼はまだありません
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['依頼日', '事務所名', '依頼者', 'プラン', '金額', 'ステータス', '操作'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviews.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < reviews.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>
                    {new Date(r.createdAt).toLocaleDateString('ja-JP')}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>
                    {r.site.firmName}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>
                    <div>{r.clientName}</div>
                    <div style={{ color: '#9ca3af', fontSize: 12 }}>{r.clientEmail}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>
                    {r.reviewerType === 'double' ? '二人に依頼' : '一人に依頼'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: '#6366f1' }}>
                    ¥{(r.amountJpy ?? 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: statusColor[r.status] ?? '#6b7280',
                      background: `${statusColor[r.status]}15`,
                      padding: '4px 10px', borderRadius: 100,
                    }}>
                      {statusLabel[r.status] ?? r.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={`/admin/reviews/${r.id}`} style={{
                      fontSize: 13, color: '#6366f1', textDecoration: 'none', fontWeight: 600,
                    }}>
                      詳細・対応 →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
