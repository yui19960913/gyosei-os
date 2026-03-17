import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { appUrl } from '@/lib/urls'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json() as { slug: string }

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const site = await prisma.aiSite.findUnique({ where: { slug } })
    if (!site || site.ownerEmail !== session.email) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    if (!site.stripeCustomerId) {
      return NextResponse.json({ error: 'Stripeの顧客情報が見つかりません' }, { status: 400 })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: site.stripeCustomerId,
      return_url: `${appUrl()}/dashboard/${slug}`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    console.error('[stripe/portal] error:', err)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
