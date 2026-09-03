'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { Check, CreditCard, Crown, Loader2, Sparkles, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { PLANS } from '@/lib/plans'
import type { PlanId } from '@/lib/plans'

export function PricingClient() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  const handleSubscribe = async (planId: string) => {
    if (!session?.user) {
      router.push('/signup')
      return
    }
    if (planId === 'free') return

    setLoadingPlan(planId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        toast.error(data?.error || 'Erro ao iniciar pagamento.')
      }
    } catch {
      toast.error('Erro ao iniciar pagamento.')
    } finally {
      setLoadingPlan(null)
    }
  }

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      })
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        toast.error(data?.error || 'Erro ao acessar portal.')
      }
    } catch {
      toast.error('Erro ao acessar portal.')
    } finally {
      setPortalLoading(false)
    }
  }

  const planOrder: PlanId[] = ['free', 'criador', 'pro']

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
            <CreditCard className="h-7 w-7 inline-block mr-2 text-primary" />
            Planos e Preços
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Escolha o plano ideal para o seu canal. Cancele quando quiser.
          </p>
        </div>
      </FadeIn>

      <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {planOrder.map((planId) => {
          const plan = PLANS[planId]
          if (!plan) return null
          const isCurrent = false // Would need to fetch from API
          return (
            <StaggerItem key={planId}>
              <Card className={`relative h-full border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${plan.popular ? 'border-primary/50 shadow-primary/10 shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3">
                      <Crown className="h-3 w-3 mr-1" />Mais popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2">
                    {planId === 'pro' ? (
                      <Sparkles className="h-5 w-5 text-secondary" />
                    ) : planId === 'criador' ? (
                      <Crown className="h-5 w-5 text-primary" />
                    ) : null}
                    <h3 className="text-xl font-display font-bold">{plan.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>

                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-display font-bold">
                      R$ {plan.priceMonthlyBRL}
                    </span>
                    <span className="text-muted-foreground ml-1">/mês</span>
                  </div>

                  <ul className="mt-6 space-y-3 flex-1">
                    {(plan.features ?? []).map((f: string) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    {planId === 'free' ? (
                      <Button variant="outline" className="w-full" disabled>
                        Plano atual
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant={plan.popular ? 'default' : 'outline'}
                        onClick={() => handleSubscribe(planId)}
                        disabled={loadingPlan === planId}
                      >
                        {loadingPlan === planId ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Assinar {plan.name}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          )
        })}
      </Stagger>

      {session?.user && (
        <FadeIn delay={0.3}>
          <div className="text-center">
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={handleManageSubscription}
              disabled={portalLoading}
            >
              {portalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
              Gerenciar assinatura
            </Button>
          </div>
        </FadeIn>
      )}
    </div>
  )
}
