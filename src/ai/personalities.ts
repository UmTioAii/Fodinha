/**
 * Bot personality definitions for Fodinha.
 * Each bot has weighted tendencies toward different behavior modes.
 */
import type { BotIdentity, BotBehavior } from '@/shared/constants/cards'

export interface BotPersonality {
  readonly identity: BotIdentity
  readonly displayName: string
  readonly tendencies: Record<BotBehavior, number> // 0–1 weight for each behavior
  readonly bidAdjustment: number // -1 to +1, shifts expected tricks estimate
  readonly description: string
}

export const PERSONALITIES: Record<BotIdentity, BotPersonality> = {
  JOAO: {
    identity: 'JOAO',
    displayName: 'João',
    description: 'Imprevisível leve. Pode errar por leitura ruim. Pode causar caos sem querer.',
    tendencies: { NORMAL: 0.7, SAFE: 0.5, AGGRESSIVE: 0.35, SABOTAGE: 0.2, CHAOTIC: 0.5 },
    bidAdjustment: 0,
  },
  GLAUBILENO: {
    identity: 'GLAUBILENO',
    displayName: 'Glaubileno',
    description: 'Competitivo. Provocador. Gosta de atrapalhar quando percebe fraqueza.',
    tendencies: { NORMAL: 0.5, SAFE: 0.5, AGGRESSIVE: 0.5, SABOTAGE: 0.8, CHAOTIC: 0.5 },
    bidAdjustment: 0.1,
  },
  BETAO: {
    identity: 'BETAO',
    displayName: 'Betão',
    description: 'Bruto. Agressivo. Gosta de ganhar na força. Gasta carta alta cedo.',
    tendencies: { NORMAL: 0.5, SAFE: 0.2, AGGRESSIVE: 0.85, SABOTAGE: 0.5, CHAOTIC: 0.5 },
    bidAdjustment: 0.2,
  },
  THALES: {
    identity: 'THALES',
    displayName: 'Thales',
    description: 'Calculista. Frio. Pune quem está perto de acertar. Sabota de forma precisa.',
    tendencies: { NORMAL: 0.5, SAFE: 0.5, AGGRESSIVE: 0.5, SABOTAGE: 0.85, CHAOTIC: 0.35 },
    bidAdjustment: 0,
  },
  LUCAS: {
    identity: 'LUCAS',
    displayName: 'Lucas',
    description: 'Técnico. Equilibrado. Joga com lógica e evita exageros.',
    tendencies: { NORMAL: 0.8, SAFE: 0.5, AGGRESSIVE: 0.5, SABOTAGE: 0.5, CHAOTIC: 0.2 },
    bidAdjustment: 0,
  },
  RENAN: {
    identity: 'RENAN',
    displayName: 'Renan',
    description: 'Oportunista. Espera a mesa se comprometer. Ataca quando surge brecha.',
    tendencies: { NORMAL: 0.5, SAFE: 0.5, AGGRESSIVE: 0.5, SABOTAGE: 0.7, CHAOTIC: 0.35 },
    bidAdjustment: -0.1,
  },
  BABY: {
    identity: 'BABY',
    displayName: 'Baby',
    description: 'Caótico. Imprevisível. Faz jogadas estranhas que bagunçam leitura da mesa.',
    tendencies: { NORMAL: 0.35, SAFE: 0.2, AGGRESSIVE: 0.5, SABOTAGE: 0.5, CHAOTIC: 0.9 },
    bidAdjustment: 0,
  },
  FELIPE: {
    identity: 'FELIPE',
    displayName: 'Felipe',
    description: 'Defensivo. Sobrevivente. Evita risco e tenta perder pouca vida.',
    tendencies: { NORMAL: 0.5, SAFE: 0.85, AGGRESSIVE: 0.3, SABOTAGE: 0.5, CHAOTIC: 0.2 },
    bidAdjustment: -0.15,
  },
}

/**
 * Returns a random selection of bot identities, ensuring no duplicates.
 */
export function pickRandomBots(count: number): BotIdentity[] {
  const all: BotIdentity[] = ['JOAO', 'GLAUBILENO', 'BETAO', 'THALES', 'LUCAS', 'RENAN', 'BABY', 'FELIPE']
  const shuffled = [...all].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, all.length))
}
