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
    const scriptId = searchParams.get('id')
    const format = searchParams.get('format') || 'txt'

    if (!scriptId) {
      return NextResponse.json({ error: 'ID do roteiro é obrigatório.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user || user.plan === 'free') {
      return NextResponse.json({ error: 'Exportação disponível apenas para planos pagos.' }, { status: 403 })
    }

    if (format === 'pdf' && user.plan !== 'pro') {
      return NextResponse.json({ error: 'Exportação PDF disponível apenas no plano Pro.' }, { status: 403 })
    }

    const script = await prisma.script.findFirst({
      where: { id: scriptId, userId: session.user.id },
    })

    if (!script) {
      return NextResponse.json({ error: 'Roteiro não encontrado.' }, { status: 404 })
    }

    const thumbnails = JSON.parse(script.thumbnailOptions || '[]')
    const titles = JSON.parse(script.titleOptions || '[]')
    const hashtags = JSON.parse(script.hashtags || '[]')

    const content = `SCRIPTBR - Roteiro Gerado
========================================
Tema: ${script.topic}
Formato: ${script.format}
Tom: ${script.tone}
Público: ${script.audience}
Duração: ${script.duration}
${script.channelName ? `Canal: ${script.channelName}` : ''}
========================================

ROTEIRO:
${script.scriptContent}

========================================
GANCHO (Primeiros 3 segundos):
${script.hookText}

========================================
OPÇÕES DE THUMBNAIL:
${thumbnails.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')}

========================================
OPÇÕES DE TÍTULO:
${titles.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')}

========================================
DESCRIÇÃO:
${script.description}

========================================
HASHTAGS:
${hashtags.join(' ')}
`

    return new Response(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="scriptbr-${script.topic.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.txt"`,
      },
    })
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Erro ao exportar.' }, { status: 500 })
  }
}
