export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { canGenerate } from '@/lib/plans'
import type { PlanId } from '@/lib/plans'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Não autorizado.' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }

    const body = await request.json()
    const { topic, format, tone, audience, duration, channelName } = body ?? {}

    if (!topic || !format || !tone || !audience || !duration) {
      return new Response(JSON.stringify({ error: 'Preencha todos os campos obrigatórios.' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // Check usage limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, scriptsUsedThisMonth: true, monthResetDate: true },
    })

    if (!user) {
      return new Response(JSON.stringify({ error: 'Usuário não encontrado.' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
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
    if (!canGenerate(plan, scriptsUsed)) {
      return new Response(JSON.stringify({ error: 'Limite de roteiros atingido. Faça upgrade do seu plano!' }), { status: 429, headers: { 'Content-Type': 'application/json' } })
    }

    const isWatermarked = plan === 'free'

    const systemPrompt = `Você é um roteirista profissional brasileiro especializado em conteúdo para YouTube, Reels, TikTok e Shorts. Você escreve em português brasileiro fluente e natural, com gírias e expressões comuns do Brasil quando apropriado.

Sempre responda em JSON válido com a seguinte estrutura:
{
  "roteiro": "O roteiro completo do vídeo com seções: GANCHO (primeiros 3 segundos), INTRODUÇÃO, DESENVOLVIMENTO (com sub-tópicos), e CTA (call to action)",
  "opcoes_thumbnail": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
  "opcoes_titulo": ["Título 1", "Título 2", "Título 3", "Título 4", "Título 5"],
  "descricao": "Descrição otimizada para SEO em PT-BR",
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "gancho": "Texto do gancho dos primeiros 3 segundos"
}

Responda APENAS com JSON válido sem blocos de código ou markdown.`

    const userPrompt = `Crie um pacote completo de conteúdo para um vídeo com as seguintes especificações:

- Tema: ${topic}
- Formato: ${format}
- Tom/Estilo: ${tone}
- Público-alvo: ${audience}
- Duração estimada: ${duration}
${channelName ? `- Canal: ${channelName}` : ''}

Inclua:
1. Roteiro completo com GANCHO (primeiros 3 seg), INTRODUÇÃO, DESENVOLVIMENTO dividido em tópicos, e CTA
2. 5 opções de texto para thumbnail (curtos, impactantes)
3. 5 variações de título otimizados para cliques
4. Descrição SEO em PT-BR
5. 20-30 hashtags relevantes em português
6. Gancho dos primeiros 3 segundos

Tudo em português brasileiro natural e envolvente.`

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]

    const llmResponse = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        messages,
        stream: true,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text().catch(() => 'Unknown error')
      console.error('LLM API error:', errorText)
      return new Response(JSON.stringify({ error: 'Erro ao gerar roteiro. Tente novamente.' }), { status: 502, headers: { 'Content-Type': 'application/json' } })
    }

    const reader = llmResponse.body?.getReader()
    if (!reader) {
      return new Response(JSON.stringify({ error: 'Falha na conexão com IA.' }), { status: 502, headers: { 'Content-Type': 'application/json' } })
    }

    const decoder = new TextDecoder()
    const encoder = new TextEncoder()
    let buffer = ''
    let partialRead = ''
    const userId = session.user.id

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            partialRead += decoder.decode(value, { stream: true })
            const lines = partialRead.split('\n')
            partialRead = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  // Parse and save
                  try {
                    const parsed = JSON.parse(buffer)
                    const scriptContent = parsed?.roteiro || ''
                    const thumbnailOptions = parsed?.opcoes_thumbnail || []
                    const titleOptions = parsed?.opcoes_titulo || []
                    const description = parsed?.descricao || ''
                    const hashtags = parsed?.hashtags || []
                    const hookText = parsed?.gancho || ''

                    // Save to DB
                    await prisma.script.create({
                      data: {
                        userId,
                        topic,
                        format,
                        tone,
                        audience,
                        duration,
                        channelName: channelName || null,
                        scriptContent: isWatermarked ? `[SCRIPTBR - PLANO GRÁTIS]\n\n${scriptContent}` : scriptContent,
                        thumbnailOptions: JSON.stringify(thumbnailOptions),
                        titleOptions: JSON.stringify(titleOptions),
                        description,
                        hashtags: JSON.stringify(hashtags),
                        hookText,
                      },
                    })

                    // Increment usage
                    await prisma.user.update({
                      where: { id: userId },
                      data: { scriptsUsedThisMonth: { increment: 1 } },
                    })

                    const finalData = JSON.stringify({
                      status: 'completed',
                      result: {
                        scriptContent: isWatermarked ? `[SCRIPTBR - PLANO GRÁTIS]\n\n${scriptContent}` : scriptContent,
                        thumbnailOptions,
                        titleOptions,
                        description,
                        hashtags,
                        hookText,
                        isWatermarked,
                      },
                    })
                    controller.enqueue(encoder.encode(`data: ${finalData}\n\n`))
                  } catch (parseErr) {
                    console.error('Parse error:', parseErr)
                    const errData = JSON.stringify({ status: 'error', message: 'Erro ao processar resposta da IA.' })
                    controller.enqueue(encoder.encode(`data: ${errData}\n\n`))
                  }
                  return
                }
                try {
                  const chunk = JSON.parse(data)
                  buffer += chunk?.choices?.[0]?.delta?.content || ''
                  const progressData = JSON.stringify({ status: 'processing', message: 'Gerando roteiro...' })
                  controller.enqueue(encoder.encode(`data: ${progressData}\n\n`))
                } catch {
                  // skip invalid JSON
                }
              }
            }
          }
        } catch (err) {
          console.error('Stream error:', err)
          const errData = JSON.stringify({ status: 'error', message: 'Erro na geração.' })
          controller.enqueue(encoder.encode(`data: ${errData}\n\n`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Generate error:', error)
    return new Response(JSON.stringify({ error: 'Erro interno.' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
