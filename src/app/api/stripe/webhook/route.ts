import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[stripe/webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const slug = session.metadata?.slug
        if (!slug) break

        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id

        // サブスクリプションから billing cycle を判定
        let plan: 'monthly' | 'annual' = 'monthly'
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId)
          const priceId = sub.items.data[0]?.price.id
          if (priceId === process.env.STRIPE_PRICE_ANNUAL) plan = 'annual'
        }

        const site = await prisma.aiSite.update({
          where: { slug },
          data: {
            plan,
            // 自動公開しない。ユーザーがダッシュボードから手動で公開する
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          },
        })
        console.log(`[stripe/webhook] checkout.session.completed: slug=${slug} plan=${plan}`)

        // サイト公開完了メールを送信
        const ownerEmail = site.ownerEmail ?? (typeof session.customer_details?.email === 'string' ? session.customer_details.email : null)
        if (ownerEmail) {
          const dashboardUrl = process.env.NODE_ENV === 'production'
            ? `https://app.webseisei.com/dashboard/${slug}`
            : `http://localhost:3000/dashboard/${slug}`

          await resend.emails.send({
            from: process.env.RESEND_FROM ?? 'noreply@webseisei.com',
            to: ownerEmail,
            subject: '【webseisei】お申し込みが完了しました',
            html: `
              <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
                <h2 style="font-size: 20px; color: #111; margin-bottom: 8px;">お申し込みが完了しました</h2>
                <p style="color: #555; line-height: 1.8; margin-bottom: 24px;">
                  ${site.firmName} 様、ご契約ありがとうございます。<br />
                  管理画面からサイトを確認し、準備ができたら公開してください。
                </p>
                <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 28px; background: #6366f1; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">
                  管理画面へ →
                </a>
                <p style="color: #999; font-size: 13px; margin-top: 32px; line-height: 1.7;">
                  テキストや写真はダッシュボードからいつでも編集できます。<br />
                  問い合わせが届いた際はメールでお知らせします。
                </p>
              </div>
            `,
          }).catch(e => console.error('[stripe/webhook] mail error:', e))
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const slug = sub.metadata?.slug
        if (!slug) break

        await prisma.aiSite.update({
          where: { slug },
          data: { plan: null, status: 'paused' },
        })
        console.log(`[stripe/webhook] subscription.deleted: slug=${slug}`)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const slug = sub.metadata?.slug
        if (!slug) break

        if (sub.status === 'active') {
          const priceId = sub.items.data[0]?.price.id
          const plan = priceId === process.env.STRIPE_PRICE_ANNUAL ? 'annual' : 'monthly'
          await prisma.aiSite.update({
            where: { slug },
            data: { plan, status: 'published' },
          })
        } else if (sub.status === 'canceled' || sub.status === 'unpaid') {
          await prisma.aiSite.update({
            where: { slug },
            data: { plan: null, status: 'paused' },
          })
        }
        break
      }
    }
  } catch (err) {
    console.error('[stripe/webhook] handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
