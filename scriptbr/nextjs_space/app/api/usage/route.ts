export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { getScriptLimit } from '@/lib/plans'
import type { PlanId } from '@/lib/plans'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true,
        scriptsUsedThisMonth: true,
        monthResetDate: true,
        subscriptionStatus: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }

    // Reset monthly counter if needed
    const now = new Date()
    const resetDate = new Date(user.monthResetDate)
    let scriptsUsed = user.scriptsUsedThisMonth

    if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { scriptsUsedThisMonth: 0, monthResetDate: now },
      })
      scriptsUsed = 0
    }

    const plan = (user.plan || 'free') as PlanId
    const limit = getScriptLimit(plan)

    return NextResponse.json({
      plan,
      scriptsUsed,
      scriptsLimit: limit,
      subscriptionStatus: user.subscriptionStatus,
    })
  } catch (error: any) {
    console.error('Usage error:', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
