export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil' as any,
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: 'Nenhuma assinatura encontrada.' }, { status: 400 })
    }

    const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || ''
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${origin}/dashboard`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error('Portal error:', error)
    return NextResponse.json({ error: 'Erro ao acessar portal.' }, { status: 500 })
  }
}
