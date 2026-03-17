import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { slug, billing } = await req.json() as { slug: string; billing: 'monthly' | 'annual' }

    if (!slug || !billing) {
      return NextResponse.json({ error: 'パラメータが不正です' }, { status: 400 })
    }

    const site = await prisma.aiSite.findUnique({ where: { slug } })
    if (!site) {
      return NextResponse.json({ error: 'サイトが見つかりません' }, { status: 404 })
    }

    const priceId = billing === 'annual'
      ? process.env.STRIPE_PRICE_ANNUAL!
      : process.env.STRIPE_PRICE_MONTHLY!

    // セッションからメールアドレスを取得（ある場合）
    const session = await getSession()
    const email = session?.email ?? site.ownerEmail ?? undefined

    // 既存の Stripe Customer ID があれば再利用
    let customerId = site.stripeCustomerId ?? undefined
    if (!customerId && email) {
      const existing = await stripe.customers.list({ email, limit: 1 })
      if (existing.data.length > 0) {
        customerId = existing.data[0].id
      }
    }

    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://app.webseisei.com'
      : 'http://localhost:3000'

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customerId,
      customer_email: !customerId ? email : undefined,
      success_url: `${baseUrl}/onboard/success?slug=${slug}`,
      cancel_url: `${baseUrl}/onboard/preview/${slug}?plan=cancel`,
      metadata: { slug },
      subscription_data: {
        metadata: { slug },
      },
      locale: 'ja',
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error('[stripe/checkout] error:', err)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
