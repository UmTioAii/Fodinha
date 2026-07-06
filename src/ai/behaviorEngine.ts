/**
 * Dynamic behavior selection for bots.
 * Evaluates the current round state and selects a behavior mode.
 */
import type { GameState } from '@/game-engine/types'
import type { BotBehavior } from '@/shared/constants/cards'
import type { BotPersonality } from './personalities'
import type { DifficultyModifier } from './difficulty'

export interface BotRoundAssessment {
  targetBid: number
  tricksWon: number
  tricksNeeded: number
  tricksRemaining: number
  canStillHitTarget: boolean
  hasReachedTarget: boolean
  hasExceededTarget: boolean
  lifePressure: 'LOW' | 'MEDIUM' | 'HIGH'
}

/**
 * Assesses a bot's current round situation.
 */
export function assessRound(state: GameState, playerId: string): BotRoundAssessment {
  const player = state.players.find((p) => p.id === playerId)
  if (!player || player.bid === null) {
    return {
      targetBid: 0,
      tricksWon: 0,
      tricksNeeded: 0,
      tricksRemaining: 0,
      canStillHitTarget: false,
      hasReachedTarget: false,
      hasExceededTarget: false,
      lifePressure: 'LOW',
    }
  }

  const tricksPlayed = state.completedTricks.length
  const totalTricks = state.cardsPerPlayer
  const tricksRemaining = totalTricks - tricksPlayed - (state.currentTrick.length > 0 ? 0 : 0)
  const tricksNeeded = Math.max(0, player.bid - player.tricksWon)

  const canStillHitTarget = tricksNeeded <= tricksRemaining
  const hasReachedTarget = player.tricksWon === player.bid
  const hasExceededTarget = player.tricksWon > player.bid

  let lifePressure: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
  if (player.lives <= 1) lifePressure = 'HIGH'
  else if (player.lives <= 2) lifePressure = 'MEDIUM'

  return {
    targetBid: player.bid,
    tricksWon: player.tricksWon,
    tricksNeeded,
    tricksRemaining,
    canStillHitTarget,
    hasReachedTarget,
    hasExceededTarget,
    lifePressure,
  }
}

/**
 * Selects a behavior mode based on round assessment, personality, and difficulty.
 */
export function selectBehavior(
  state: GameState,
  playerId: string,
  personality: BotPersonality,
  modifier: DifficultyModifier
): BotBehavior {
  const assessment = assessRound(state, playerId)

  // Calculate weighted scores for each behavior
  const scores: Record<BotBehavior, number> = {
    NORMAL: 0,
    SAFE: 0,
    AGGRESSIVE: 0,
    SABOTAGE: 0,
    CHAOTIC: 0,
  }

  // Base personality tendencies
  for (const behavior of Object.keys(scores) as BotBehavior[]) {
    scores[behavior] = personality.tendencies[behavior]
  }

  // Situation-based adjustments
  if (assessment.hasReachedTarget) {
    // Already at target — strongly favor SAFE
    scores.SAFE += 0.6
    scores.AGGRESSIVE -= 0.3
    scores.NORMAL -= 0.1
  } else if (assessment.canStillHitTarget && assessment.tricksNeeded > 0) {
    // Still chasing target — favor AGGRESSIVE
    scores.AGGRESSIVE += 0.4
    scores.SAFE -= 0.2
  } else if (assessment.hasExceededTarget) {
    // Over target — SAFE to stop winning more
    scores.SAFE += 0.5
    scores.AGGRESSIVE -= 0.4
  } else if (!assessment.canStillHitTarget) {
    // Can't reach target — look for SABOTAGE
    scores.SABOTAGE += 0.5
    scores.CHAOTIC += 0.3
    scores.NORMAL -= 0.2
  }

  // Life pressure adjustments
  if (assessment.lifePressure === 'HIGH') {
    // Low life — prioritize accuracy, avoid chaos
    scores.SAFE += 0.2
    scores.CHAOTIC -= 0.3
    if (assessment.canStillHitTarget) {
      scores.AGGRESSIVE += 0.2
    }
  }

  // Apply tactical accuracy from difficulty
  // Lower accuracy means more random/chaotic play
  if (modifier.tacticalAccuracy < 0.6) {
    scores.CHAOTIC += 0.2
    scores.SABOTAGE -= 0.1
  }

  // Pick the highest scoring behavior
  let best: BotBehavior = 'NORMAL'
  let bestScore = -Infinity
  for (const [behavior, score] of Object.entries(scores)) {
    // Add slight randomness to avoid fully deterministic play
    const finalScore = score + (Math.random() * 0.15)
    if (finalScore > bestScore) {
      bestScore = finalScore
      best = behavior as BotBehavior
    }
  }

  return best
}
