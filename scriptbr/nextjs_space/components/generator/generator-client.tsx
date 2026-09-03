'use client'
import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FadeIn } from '@/components/ui/animate'
import { Sparkles, Loader2, Copy, Download, Hash, FileText, MessageSquare, Zap, Check } from 'lucide-react'
import { toast } from 'sonner'

interface GeneratedResult {
  scriptContent: string
  thumbnailOptions: string[]
  titleOptions: string[]
  description: string
  hashtags: string[]
  hookText: string
  isWatermarked: boolean
}

export function GeneratorClient() {
  const [topic, setTopic] = useState('')
  const [format, setFormat] = useState('')
  const [tone, setTone] = useState('')
  const [audience, setAudience] = useState('')
  const [duration, setDuration] = useState('')
  const [channelName, setChannelName] = useState('')
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<GeneratedResult | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const handleGenerate = async () => {
    if (!topic || !format || !tone || !audience || !duration) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }

    setGenerating(true)
    setProgress(0)
    setResult(null)

    abortRef.current = new AbortController()

    try {
      const response = await fetch('/api/scripts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, format, tone, audience, duration, channelName }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        toast.error(err?.error || 'Erro ao gerar roteiro.')
        setGenerating(false)
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        toast.error('Falha na conexão.')
        setGenerating(false)
        return
      }

      const decoder = new TextDecoder()
      let partialRead = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        partialRead += decoder.decode(value, { stream: true })
        const lines = partialRead.split('\n')
        partialRead = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return
            try {
              const parsed = JSON.parse(data)
              if (parsed?.status === 'processing') {
                setProgress((prev) => Math.min(prev + 2, 95))
              } else if (parsed?.status === 'completed') {
                setResult(parsed.result ?? null)
                setProgress(100)
                toast.success('Roteiro gerado com sucesso! 🎉')
                return
              } else if (parsed?.status === 'error') {
                toast.error(parsed?.message || 'Erro na geração.')
                return
              }
            } catch {
              // skip
            }
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        toast.error('Erro ao gerar roteiro.')
      }
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success('Copiado!')
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      toast.error('Erro ao copiar.')
    }
  }

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0"
      onClick={() => copyToClipboard(text, field)}
    >
      {copiedField === field ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  )

  return (
    <div className="space-y-8">
      <FadeIn>
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
          Gerar <span className="text-primary">Roteiro</span>
        </h1>
        <p className="text-muted-foreground mt-1">Preencha os detalhes e deixe a IA trabalhar por você</p>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <FadeIn delay={0.1} className="lg:col-span-2">
          <Card className="border-border/50 sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tema do vídeo *</Label>
                <Input
                  placeholder="Ex: Como ganhar dinheiro na internet"
                  value={topic}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Formato *</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YouTube longo">YouTube longo</SelectItem>
                    <SelectItem value="Shorts">Shorts</SelectItem>
                    <SelectItem value="Reels">Reels</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tom/Estilo *</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione o tom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engraçado">Engraçado</SelectItem>
                    <SelectItem value="Educativo">Educativo</SelectItem>
                    <SelectItem value="Motivacional">Motivacional</SelectItem>
                    <SelectItem value="Infantil">Infantil</SelectItem>
                    <SelectItem value="Informativo">Informativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Público-alvo *</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione o público" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Crianças">Crianças</SelectItem>
                    <SelectItem value="Jovens">Jovens</SelectItem>
                    <SelectItem value="Adultos">Adultos</SelectItem>
                    <SelectItem value="Profissionais">Profissionais</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duração estimada *</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 min">1 minuto</SelectItem>
                    <SelectItem value="3 min">3 minutos</SelectItem>
                    <SelectItem value="5 min">5 minutos</SelectItem>
                    <SelectItem value="10 min+">10 minutos+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nome do canal (opcional)</Label>
                <Input
                  placeholder="Ex: Canal do Pedro"
                  value={channelName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChannelName(e.target.value)}
                  className="h-11"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full h-11 mt-2"
                size="lg"
              >
                {generating ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Gerando... {progress}%</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" />Gerar Roteiro</>
                )}
              </Button>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Results */}
        <div className="lg:col-span-3 space-y-6">
          {generating && !result && (
            <FadeIn>
              <Card className="border-border/50">
                <CardContent className="py-16 text-center">
                  <div className="relative mx-auto w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                      <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                  </div>
                  <p className="text-lg font-display font-semibold">Gerando seu roteiro...</p>
                  <p className="text-sm text-muted-foreground mt-1">Isso pode levar alguns segundos</p>
                  <div className="mt-4 max-w-xs mx-auto">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {result && (
            <>
              {/* Hook */}
              <FadeIn>
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-display flex items-center gap-2">
                      <Zap className="h-4 w-4 text-secondary" />
                      Gancho (3 segundos)
                      <CopyButton text={result.hookText ?? ''} field="hook" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold leading-relaxed">{result.hookText ?? ''}</p>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Script */}
              <FadeIn delay={0.1}>
                <Card className={`border-border/50 ${result.isWatermarked ? 'watermark' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-display flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        Roteiro Completo
                      </CardTitle>
                      <CopyButton text={result.scriptContent ?? ''} field="script" />
                    </div>
                    {result.isWatermarked && (
                      <Badge variant="outline" className="text-xs w-fit">Plano Grátis • Marca d&apos;água</Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {result.scriptContent ?? ''}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Titles */}
              <FadeIn delay={0.15}>
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-display flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-purple-500" />
                      Opções de Título
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(result.titleOptions ?? []).map((title: string, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                        <span className="text-sm">{i + 1}. {title}</span>
                        <CopyButton text={title} field={`title-${i}`} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Thumbnails */}
              <FadeIn delay={0.2}>
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-display flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-pink-500" />
                      Textos para Thumbnail
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(result.thumbnailOptions ?? []).map((thumb: string, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                        <span className="text-sm font-semibold">{thumb}</span>
                        <CopyButton text={thumb} field={`thumb-${i}`} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Description */}
              <FadeIn delay={0.25}>
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-display flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-500" />
                        Descrição SEO
                      </CardTitle>
                      <CopyButton text={result.description ?? ''} field="desc" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.description ?? ''}</p>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Hashtags */}
              <FadeIn delay={0.3}>
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-display flex items-center gap-2">
                        <Hash className="h-4 w-4 text-cyan-500" />
                        Hashtags
                      </CardTitle>
                      <CopyButton text={(result.hashtags ?? []).join(' ')} field="hashtags" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(result.hashtags ?? []).map((tag: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80" onClick={() => copyToClipboard(tag, `tag-${i}`)}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </>
          )}

          {!generating && !result && (
            <FadeIn>
              <Card className="border-border/50 border-dashed">
                <CardContent className="py-20 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-lg font-display text-muted-foreground">Preencha o formulário e clique em gerar</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Seu roteiro aparecerá aqui</p>
                </CardContent>
              </Card>
            </FadeIn>
          )}
        </div>
      </div>
    </div>
  )
}
