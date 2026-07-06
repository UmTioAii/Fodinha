/**
 * Public AI API for Fodinha bots.
 * This is the only module that PVE/game controllers need to import.
 */
import type { GameState } from '@/game-engine/types'
import type { BotIdentity, Difficulty } from '@/shared/constants/cards'
import { PERSONALITIES } from './personalities'
import { DIFFICULTY_MODIFIERS } from './difficulty'
import { chooseBid } from './bidStrategy'
import { chooseCard } from './playStrategy'
import { selectBehavior } from './behaviorEngine'

export { PERSONALITIES, pickRandomBots } from './personalities'
export { DIFFICULTY_MODIFIERS } from './difficulty'
export type { BotPersonality } from './personalities'
export type { HandStrength } from './handEval'

/**
 * Determines the bid for a bot player.
 */
export function botBid(
  state: GameState,
  playerId: string,
  identity: BotIdentity,
  difficulty: Difficulty
): number {
  const personality = PERSONALITIES[identity]
  const modifier = DIFFICULTY_MODIFIERS[difficulty]
  return chooseBid(state, playerId, personality, modifier)
}

/**
 * Determines which card a bot should play (returns card ID).
 */
export function botPlayCard(
  state: GameState,
  playerId: string,
  identity: BotIdentity,
  difficulty: Difficulty
): string {
  const personality = PERSONALITIES[identity]
  const modifier = DIFFICULTY_MODIFIERS[difficulty]
  const behavior = selectBehavior(state, playerId, personality, modifier)
  return chooseCard(state, playerId, behavior, modifier)
}
