export type PlanId = 'free' | 'criador' | 'pro'

export interface PlanConfig {
  id: PlanId
  name: string
  description: string
  priceMonthlyBRL: number
  priceMonthlyUSD: number
  scriptsPerMonth: number // -1 = unlimited
  features: string[]
  popular?: boolean
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Grátis',
    description: 'Para testar a ferramenta',
    priceMonthlyBRL: 0,
    priceMonthlyUSD: 0,
    scriptsPerMonth: 3,
    features: [
      '3 roteiros por mês',
      'Todos os formatos',
      'Marca d\'água no output',
    ],
  },
  criador: {
    id: 'criador',
    name: 'Criador',
    description: 'Para criadores em crescimento',
    priceMonthlyBRL: 35,
    priceMonthlyUSD: 7,
    scriptsPerMonth: 30,
    features: [
      '30 roteiros por mês',
      'Todos os formatos',
      'Sem marca d\'água',
      'Exportar para TXT',
    ],
    popular: true,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Para profissionais de conteúdo',
    priceMonthlyBRL: 75,
    priceMonthlyUSD: 15,
    scriptsPerMonth: -1,
    features: [
      'Roteiros ilimitados',
      'Todos os formatos',
      'Sem marca d\'água',
      'Exportar TXT e PDF',
      'Geração prioritária',
      'Histórico salvo',
    ],
  },
}

export function getScriptLimit(plan: PlanId): number {
  return PLANS[plan]?.scriptsPerMonth ?? 3
}

export function canGenerate(plan: PlanId, used: number): boolean {
  const limit = getScriptLimit(plan)
  if (limit === -1) return true
  return used < limit
}
