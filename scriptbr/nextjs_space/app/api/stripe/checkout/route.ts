export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil' as any,
})

const PRICE_MAP: Record<string, { amount: number; name: string }> = {
  criador: { amount: 3500, name: 'ScriptBR Criador' },
  pro: { amount: 7500, name: 'ScriptBR Pro' },
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const { plan } = (await request.json()) ?? {}
    const priceConfig = PRICE_MAP[plan]
    if (!priceConfig) {
      return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }

    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || ''

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: { name: priceConfig.name },
            recurring: { interval: 'month' },
            unit_amount: priceConfig.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/precos?checkout=cancelled`,
      client_reference_id: user.id,
      metadata: { userId: user.id, plan },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Erro ao criar sessão de pagamento.' }, { status: 500 })
  }
}
