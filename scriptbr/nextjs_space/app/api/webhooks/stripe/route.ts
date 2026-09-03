export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil' as any,
})

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Missing stripe signature or webhook secret')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 })
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err?.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId || session.client_reference_id
        const plan = session.metadata?.plan || 'criador'
        const subscriptionId = session.subscription as string

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan,
              stripeSubscriptionId: subscriptionId,
              subscriptionStatus: 'active',
              scriptsUsedThisMonth: 0,
              monthResetDate: new Date(),
            },
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const status = subscription.status

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          const updateData: any = { subscriptionStatus: status }
          if (status === 'canceled' || status === 'unpaid') {
            updateData.plan = 'free'
            updateData.stripeSubscriptionId = null
          }
          await prisma.user.update({ where: { id: user.id }, data: updateData })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: 'free',
              subscriptionStatus: 'canceled',
              stripeSubscriptionId: null,
              stripePriceId: null,
            },
          })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { subscriptionStatus: 'past_due' },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
