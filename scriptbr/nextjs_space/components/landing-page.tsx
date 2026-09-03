'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FadeIn, SlideIn, Stagger, StaggerItem } from '@/components/ui/animate'
import {
  Sparkles, FileText, Hash, MessageSquare, Zap, Youtube,
  Instagram, Video, Check, Star, ArrowRight, Play
} from 'lucide-react'

const features = [
  { icon: FileText, title: 'Roteiro Completo', desc: 'Gancho, introdução, desenvolvimento e CTA prontos para gravar.' },
  { icon: MessageSquare, title: '5 Títulos', desc: 'Variações otimizadas para cliques e algoritmo.' },
  { icon: Sparkles, title: '5 Thumbnails', desc: 'Textos impactantes para suas capas de vídeo.' },
  { icon: Hash, title: '20-30 Hashtags', desc: 'Hashtags relevantes em PT-BR para máximo alcance.' },
  { icon: Zap, title: 'Gancho 3 Segundos', desc: 'O início que prende a atenção na primeira frase.' },
  { icon: FileText, title: 'Descrição SEO', desc: 'Texto otimizado para busca no YouTube e Google.' },
]

const formats = [
  { icon: Youtube, name: 'YouTube', color: 'text-red-500' },
  { icon: Instagram, name: 'Reels', color: 'text-pink-500' },
  { icon: Video, name: 'TikTok', color: 'text-cyan-400' },
  { icon: Play, name: 'Shorts', color: 'text-blue-500' },
]

const plans = [
  {
    name: 'Grátis',
    price: 'R$ 0',
    period: '/mês',
    features: ['3 roteiros por mês', 'Todos os formatos', 'Marca d\'agua no output'],
    cta: 'Começar grátis',
    popular: false,
  },
  {
    name: 'Criador',
    price: 'R$ 35',
    period: '/mês',
    features: ['30 roteiros por mês', 'Todos os formatos', 'Sem marca d\'agua', 'Exportar para TXT'],
    cta: 'Assinar Criador',
    popular: true,
  },
  {
    name: 'Pro',
    price: 'R$ 75',
    period: '/mês',
    features: ['Roteiros ilimitados', 'Todos os formatos', 'Sem marca d\'agua', 'Exportar TXT e PDF', 'Geração prioritária', 'Histórico salvo'],
    cta: 'Assinar Pro',
    popular: false,
  },
]

const testimonials = [
  { name: 'Lucas M.', role: 'YouTuber • 120K inscritos', quote: 'Economizo 3 horas por vídeo com o ScriptBR. Os roteiros são incríveis!', stars: 5 },
  { name: 'Ana C.', role: 'Criadora de Reels', quote: 'Os ganchos de 3 segundos mudaram meu jogo. Meu alcance triplicou!', stars: 5 },
  { name: 'Pedro S.', role: 'TikToker • 50K seguidores', quote: 'Melhor investimento que já fiz pro meu canal. Super recomendo!', stars: 5 },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1200px] flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-1.5 font-display font-bold text-lg tracking-tight">
            <span className="text-primary">Script</span>
            <span className="text-secondary">BR</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Criar conta grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-[1200px] px-4 text-center">
          <FadeIn>
            <Badge variant="secondary" className="mb-6 text-sm px-4 py-1">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              IA treinada para conteúdo brasileiro
            </Badge>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-tight">
              Crie <span className="text-primary">conteúdo</span>.
              <br />
              Cresça no <span className="text-secondary">Brasil</span>.
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Roteiros completos, títulos, thumbnails, hashtags e descrições — tudo gerado por IA em português brasileiro. Para YouTube, Reels, TikTok e Shorts.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-base font-semibold">
                  Começar grátis <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="#precos">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  Ver planos
                </Button>
              </Link>
            </div>
          </FadeIn>

          {/* Format badges */}
          <FadeIn delay={0.4}>
            <div className="mt-12 flex items-center justify-center gap-6">
              {formats.map((f) => {
                const Icon = f.icon
                return (
                  <div key={f.name} className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon className={`h-5 w-5 ${f.color}`} />
                    <span className="text-sm font-medium">{f.name}</span>
                  </div>
                )
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-[1200px] px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
                Tudo que você precisa em <span className="text-primary">um clique</span>
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
                Pare de gastar horas planejando conteúdo. Nossa IA cria tudo para você.
              </p>
            </div>
          </FadeIn>

          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon
              return (
                <StaggerItem key={feat.title}>
                  <Card className="h-full border-border/50 bg-card/80 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-display font-semibold mb-2">{feat.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              )
            })}
          </Stagger>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="py-20">
        <div className="mx-auto max-w-[1200px] px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
                Planos que <span className="text-secondary">cabem no bolso</span>
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Comece grátis. Faça upgrade quando quiser.
              </p>
            </div>
          </FadeIn>

          <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <StaggerItem key={plan.name}>
                <Card className={`relative h-full border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${plan.popular ? 'border-primary/50 shadow-primary/10 shadow-lg' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3">Mais popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col h-full">
                    <h3 className="text-xl font-display font-bold">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-display font-bold">{plan.price}</span>
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    </div>
                    <ul className="mt-6 space-y-3 flex-1">
                      {plan.features.map((f: string) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/signup" className="mt-6">
                      <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-[1200px] px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
                O que criadores <span className="text-primary">estão dizendo</span>
              </h2>
            </div>
          </FadeIn>

          <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <StaggerItem key={t.name}>
                <Card className="h-full border-border/50 bg-card/80">
                  <CardContent className="p-6">
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed mb-4">“{t.quote}”</p>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-[1200px] px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              Pronto para criar conteúdo <span className="text-primary">mais rápido</span>?
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Junte-se a centenas de criadores brasileiros que já economizam horas com o ScriptBR.
            </p>
            <div className="mt-8">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-base font-semibold">
                  Começar agora — é grátis <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto max-w-[1200px] px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-display font-bold tracking-tight">
            <span className="text-primary">Script</span>
            <span className="text-secondary">BR</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 ScriptBR. Feito no Brasil 🇧🇷
          </p>
        </div>
      </footer>
    </div>
  )
}
