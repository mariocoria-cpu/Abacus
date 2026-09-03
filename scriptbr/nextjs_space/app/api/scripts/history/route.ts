export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    const [scripts, total] = await Promise.all([
      prisma.script.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          topic: true,
          format: true,
          tone: true,
          audience: true,
          duration: true,
          channelName: true,
          scriptContent: true,
          thumbnailOptions: true,
          titleOptions: true,
          description: true,
          hashtags: true,
          hookText: true,
          createdAt: true,
        },
      }),
      prisma.script.count({ where: { userId: session.user.id } }),
    ])

    return NextResponse.json({
      scripts: scripts.map((s: any) => ({
        ...s,
        thumbnailOptions: JSON.parse(s.thumbnailOptions || '[]'),
        titleOptions: JSON.parse(s.titleOptions || '[]'),
        hashtags: JSON.parse(s.hashtags || '[]'),
        createdAt: s.createdAt.toISOString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error: any) {
    console.error('History error:', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
