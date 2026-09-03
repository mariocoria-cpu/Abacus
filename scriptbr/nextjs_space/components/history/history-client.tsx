'use client'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { History, FileText, Copy, Download, Check, Sparkles, ChevronLeft, ChevronRight, Hash, Zap, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { SafeDate } from '@/components/safe-format'

interface ScriptItem {
  id: string
  topic: string
  format: string
  tone: string
  audience: string
  duration: string
  channelName: string | null
  scriptContent: string
  thumbnailOptions: string[]
  titleOptions: string[]
  description: string
  hashtags: string[]
  hookText: string
  createdAt: string
}

export function HistoryClient() {
  const [scripts, setScripts] = useState<ScriptItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedScript, setSelectedScript] = useState<ScriptItem | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const fetchScripts = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/scripts/history?page=${p}&limit=10`)
      if (res.ok) {
        const data = await res.json()
        setScripts(data?.scripts ?? [])
        setTotalPages(data?.totalPages ?? 1)
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchScripts(page)
  }, [page, fetchScripts])

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

  const handleExport = async (scriptId: string) => {
    try {
      const res = await fetch(`/api/scripts/export?id=${scriptId}&format=txt`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || 'Erro ao exportar.')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'roteiro-scriptbr.txt'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Arquivo baixado!')
    } catch {
      toast.error('Erro ao exportar.')
    }
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
          <History className="h-7 w-7 inline-block mr-2 text-primary" />
          Histórico de Roteiros
        </h1>
        <p className="text-muted-foreground mt-1">Todos os roteiros que você já gerou</p>
      </FadeIn>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted/50 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (scripts?.length ?? 0) === 0 ? (
        <FadeIn>
          <Card className="border-border/50 border-dashed">
            <CardContent className="py-16 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-display text-muted-foreground">Nenhum roteiro encontrado</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Crie seu primeiro roteiro para ver o histórico</p>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <>
          <Stagger className="space-y-4">
            {(scripts ?? []).map((script: ScriptItem) => (
              <StaggerItem key={script?.id}>
                <Card
                  className="border-border/50 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
                  onClick={() => setSelectedScript(script)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{script?.topic ?? 'Sem título'}</p>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            <Badge variant="outline" className="text-xs">{script?.format ?? ''}</Badge>
                            <Badge variant="outline" className="text-xs">{script?.tone ?? ''}</Badge>
                            <Badge variant="outline" className="text-xs">{script?.audience ?? ''}</Badge>
                            <Badge variant="outline" className="text-xs">{script?.duration ?? ''}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <SafeDate date={script?.createdAt} options={{ dateStyle: 'short' }} className="text-xs text-muted-foreground" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation()
                            handleExport(script?.id)
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Script detail dialog */}
      <Dialog open={!!selectedScript} onOpenChange={() => setSelectedScript(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{selectedScript?.topic ?? 'Roteiro'}</DialogTitle>
          </DialogHeader>
          {selectedScript && (
            <div className="space-y-6 mt-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{selectedScript.format}</Badge>
                <Badge variant="outline">{selectedScript.tone}</Badge>
                <Badge variant="outline">{selectedScript.audience}</Badge>
                <Badge variant="outline">{selectedScript.duration}</Badge>
              </div>

              {/* Hook */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold flex items-center gap-1.5"><Zap className="h-4 w-4 text-secondary" />Gancho</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(selectedScript.hookText ?? '', 'modal-hook')}>
                    {copiedField === 'modal-hook' ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <p className="text-sm font-medium">{selectedScript.hookText ?? ''}</p>
              </div>

              {/* Script */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold flex items-center gap-1.5"><FileText className="h-4 w-4 text-blue-500" />Roteiro</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(selectedScript.scriptContent ?? '', 'modal-script')}>
                    {copiedField === 'modal-script' ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <div className="whitespace-pre-wrap text-sm leading-relaxed p-4 rounded-lg bg-muted/30">
                  {selectedScript.scriptContent ?? ''}
                </div>
              </div>

              {/* Titles */}
              <div>
                <span className="text-sm font-semibold flex items-center gap-1.5 mb-2"><MessageSquare className="h-4 w-4 text-purple-500" />Títulos</span>
                <div className="space-y-1.5">
                  {(selectedScript.titleOptions ?? []).map((t: string, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
                      <span>{i + 1}. {t}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(t, `modal-title-${i}`)}>
                        {copiedField === `modal-title-${i}` ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold flex items-center gap-1.5"><FileText className="h-4 w-4 text-green-500" />Descrição</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(selectedScript.description ?? '', 'modal-desc')}>
                    {copiedField === 'modal-desc' ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap p-3 rounded-lg bg-muted/30">{selectedScript.description ?? ''}</p>
              </div>

              {/* Hashtags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold flex items-center gap-1.5"><Hash className="h-4 w-4 text-cyan-500" />Hashtags</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard((selectedScript.hashtags ?? []).join(' '), 'modal-hashtags')}>
                    {copiedField === 'modal-hashtags' ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedScript.hashtags ?? []).map((tag: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleExport(selectedScript.id)} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />Exportar TXT
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
