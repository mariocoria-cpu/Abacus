'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { FadeIn, SlideIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { Sparkles, FileText, History, TrendingUp, ArrowRight, Crown } from 'lucide-react'
import { PLANS } from '@/lib/plans'
import type { PlanId } from '@/lib/plans'
import { SafeDate } from '@/components/safe-format'

interface UsageData {
  plan: string
  scriptsUsed: number
  scriptsLimit: number
  subscriptionStatus: string | null
}

interface RecentScript {
  id: string
  topic: string
  format: string
  tone: string
  createdAt: string
}

export function DashboardClient() {
  const { data: session } = useSession()
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [recentScripts, setRecentScripts] = useState<RecentScript[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [usageRes, historyRes] = await Promise.all([
          fetch('/api/usage'),
          fetch('/api/scripts/history?limit=5'),
        ])
        if (usageRes.ok) {
          const data = await usageRes.json()
          setUsage(data)
        }
        if (historyRes.ok) {
          const data = await historyRes.json()
          setRecentScripts(data?.scripts ?? [])
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const plan = (usage?.plan || 'free') as PlanId
  const planConfig = PLANS[plan] ?? PLANS.free
  const scriptsUsed = usage?.scriptsUsed ?? 0
  const scriptsLimit = usage?.scriptsLimit ?? 3
  const isUnlimited = scriptsLimit === -1
  const usagePercent = isUnlimited ? 0 : Math.min((scriptsUsed / scriptsLimit) * 100, 100)

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
              Olá, {session?.user?.name || 'Criador'}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">Seu painel de criação de conteúdo</p>
          </div>
          <Link href="/gerar">
            <Button size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Gerar novo roteiro
            </Button>
          </Link>
        </div>
      </FadeIn>

      {/* Stats cards */}
      <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StaggerItem>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Crown className="h-4 w-4 text-secondary" />
                Plano Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Badge variant={plan === 'pro' ? 'default' : plan === 'criador' ? 'secondary' : 'outline'} className="text-sm">
                  {planConfig?.name ?? 'Grátis'}
                </Badge>
                {plan === 'free' && (
                  <Link href="/precos">
                    <Button variant="ghost" size="sm" className="text-primary text-xs">
                      Fazer upgrade <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Uso do Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-6 w-24 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <p className="text-2xl font-display font-bold">
                    {scriptsUsed}
                    <span className="text-sm font-normal text-muted-foreground">
                      {isUnlimited ? ' / ∞' : ` / ${scriptsLimit}`}
                    </span>
                  </p>
                  {!isUnlimited && (
                    <Progress value={usagePercent} className="mt-2 h-2" />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Roteiros Criados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-6 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-display font-bold">{recentScripts?.length ?? 0}</p>
              )}
            </CardContent>
          </Card>
        </StaggerItem>
      </Stagger>

      {/* Recent scripts */}
      <FadeIn delay={0.2}>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              Roteiros Recentes
            </CardTitle>
            {(recentScripts?.length ?? 0) > 0 && (
              <Link href="/historico">
                <Button variant="ghost" size="sm" className="text-primary">
                  Ver todos <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (recentScripts?.length ?? 0) === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum roteiro ainda.</p>
                <Link href="/gerar" className="mt-3 inline-block">
                  <Button variant="outline" size="sm">
                    Criar primeiro roteiro
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {(recentScripts ?? []).map((script: RecentScript) => (
                  <Link key={script?.id} href={`/historico`}>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{script?.topic ?? 'Sem título'}</p>
                          <p className="text-xs text-muted-foreground">
                            {script?.format ?? ''} • {script?.tone ?? ''}
                          </p>
                        </div>
                      </div>
                      <SafeDate date={script?.createdAt} options={{ dateStyle: 'short' }} className="text-xs text-muted-foreground shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
