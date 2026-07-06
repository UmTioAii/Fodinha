/**
 * Difficulty modifiers for AI bots.
 */
import type { Difficulty } from '@/shared/constants/cards'

export interface DifficultyModifier {
  /** Random bid error range: ±N from calculated bid */
  bidErrorRange: number
  /** Chance (0–1) of playing a random card instead of optimal */
  randomPlayChance: number
  /** Whether the bot tracks played cards */
  tracksCards: boolean
  /** Multiplier for sabotage/chaos evaluation accuracy */
  tacticalAccuracy: number
}

export const DIFFICULTY_MODIFIERS: Record<Difficulty, DifficultyModifier> = {
  EASY: {
    bidErrorRange: 1,
    randomPlayChance: 0.3,
    tracksCards: false,
    tacticalAccuracy: 0.4,
  },
  MEDIUM: {
    bidErrorRange: 0,
    randomPlayChance: 0.1,
    tracksCards: false,
    tacticalAccuracy: 0.7,
  },
  HARD: {
    bidErrorRange: 0,
    randomPlayChance: 0.02,
    tracksCards: true,
    tacticalAccuracy: 0.95,
  },
}
