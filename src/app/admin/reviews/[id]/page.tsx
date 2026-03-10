import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ApproveForm } from './ApproveForm'

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const review = await prisma.reviewRequest.findUnique({
    where: { id },
    include: { site: true, reviewer: true },
  })
  if (!review) notFound()

  const reviewers = await prisma.reviewer.findMany({ where: { active: true }, orderBy: { createdAt: 'asc' } })

  const sitePreviewUrl = process.env.NODE_ENV === 'production'
    ? `https://app.coreai-x.com/onboard/preview/${review.site.slug}`
    : `http://localhost:3000/onboard/preview/${review.site.slug}`

  return (
    <div style={{ padding: '32px', maxWidth: 800, margin: '0 auto' }}>
      <Link href="/admin/reviews" style={{ fontSize: 13, color: '#6366f1', textDecoration: 'none' }}>← レビュー一覧に戻る</Link>

      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '24px 0 32px' }}>
        レビュー依頼詳細
      </h1>

      {/* サイト情報 */}
      <div style={{ background: '#f9fafb', borderRadius: 12, padding: '24px', marginBottom: 24, border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#111827' }}>サイト情報</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {([
            ['事務所名', review.site.firmName],
            ['依頼者', `${review.clientName} (${review.clientEmail})`],
            ['プラン', review.reviewerType === 'double' ? '二人に依頼' : '一人に依頼'],
            ['金額', `¥${(review.amountJpy ?? 0).toLocaleString()}`],
            ['依頼日', new Date(review.createdAt).toLocaleString('ja-JP')],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} style={{ display: 'flex', gap: 16 }}>
              <span style={{ fontSize: 13, color: '#6b7280', minWidth: 100 }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{value}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ fontSize: 13, color: '#6b7280', minWidth: 100 }}>サイト</span>
            <a href={sitePreviewUrl} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: '#6366f1', fontWeight: 600 }}>
              プレビューを確認 →
            </a>
          </div>
        </div>
      </div>

      {/* 承認フォーム */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '24px', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#111827' }}>ステータス更新</h2>
        <ApproveForm
          reviewId={review.id}
          currentStatus={review.status}
          currentNote={review.note}
          reviewers={reviewers}
          currentReviewerId={review.reviewerId}
        />
      </div>
    </div>
  )
}
