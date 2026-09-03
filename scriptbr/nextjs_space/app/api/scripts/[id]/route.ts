export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const { id } = await params

    const script = await prisma.script.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!script) {
      return NextResponse.json({ error: 'Roteiro não encontrado.' }, { status: 404 })
    }

    return NextResponse.json({
      ...script,
      thumbnailOptions: JSON.parse(script.thumbnailOptions || '[]'),
      titleOptions: JSON.parse(script.titleOptions || '[]'),
      hashtags: JSON.parse(script.hashtags || '[]'),
      createdAt: script.createdAt.toISOString(),
    })
  } catch (error: any) {
    console.error('Script detail error:', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
