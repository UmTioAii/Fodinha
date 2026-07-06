/**
 * Hand strength evaluator for Fodinha AI.
 * Pure function — no side effects, no state mutation.
 */
import type { Card, CardValue, DeckMode } from '@/game-engine/types'
import { getValueRank, SUIT_RANK } from '@/game-engine/rules'

export interface HandStrength {
  /** Number of manilhas in hand */
  manilhaCount: number
  /** Number of high cards (A, 2, 3) excluding manilhas */
  highCardCount: number
  /** Normalized overall strength 0–1 */
  overallStrength: number
  /** Estimated winnable tricks */
  expectedTricks: number
}

/**
 * Evaluates a hand's strength given the current manilha value.
 */
export function evaluateHand(
  hand: Card[],
  manilhaValue: CardValue | null,
  deckMode: DeckMode
): HandStrength {
  if (hand.length === 0) {
    return { manilhaCount: 0, highCardCount: 0, overallStrength: 0, expectedTricks: 0 }
  }

  const maxRank = deckMode === 'CLEAN' ? 6 : 10

  let manilhaCount = 0
  let highCardCount = 0
  let totalStrength = 0

  for (const card of hand) {
    const isManilha = manilhaValue !== null && card.value === manilhaValue

    if (isManilha) {
      manilhaCount++
      // Manilhas are effectively the strongest cards; max rank + suit bonus
      totalStrength += maxRank + SUIT_RANK[card.suit]
    } else {
      const rank = getValueRank(card.value, deckMode)
      totalStrength += rank

      // High cards: A, 2, 3 (rank >= 4 in clean, rank >= 8 in dirty)
      const highThreshold = deckMode === 'CLEAN' ? 4 : 8
      if (rank >= highThreshold) {
        highCardCount++
      }
    }
  }

  // Normalize: max possible strength per card is maxRank + 4 (best manilha)
  const maxPerCard = maxRank + 4
  const overallStrength = totalStrength / (hand.length * maxPerCard)

  // Estimate expected tricks:
  // Each manilha is ~0.85 expected tricks (not 1.0 because another manilha could beat it)
  // High cards are ~0.45 expected tricks
  // Low cards are ~0.15 expected tricks
  const lowCardCount = hand.length - manilhaCount - highCardCount
  const expectedTricks =
    manilhaCount * 0.85 +
    highCardCount * 0.45 +
    lowCardCount * 0.15

  return {
    manilhaCount,
    highCardCount,
    overallStrength: Math.min(1, overallStrength),
    expectedTricks: Math.min(hand.length, expectedTricks),
  }
}

/**
 * Sorts cards from weakest to strongest for a given context.
 */
export function sortCardsByStrength(
  cards: Card[],
  manilhaValue: CardValue | null,
  deckMode: DeckMode
): Card[] {
  return [...cards].sort((a, b) => {
    const aIsManilha = manilhaValue !== null && a.value === manilhaValue
    const bIsManilha = manilhaValue !== null && b.value === manilhaValue

    if (aIsManilha && !bIsManilha) return 1
    if (!aIsManilha && bIsManilha) return -1
    if (aIsManilha && bIsManilha) {
      return SUIT_RANK[a.suit] - SUIT_RANK[b.suit]
    }

    const rankDiff = getValueRank(a.value, deckMode) - getValueRank(b.value, deckMode)
    if (rankDiff !== 0) return rankDiff
    return SUIT_RANK[a.suit] - SUIT_RANK[b.suit]
  })
}
