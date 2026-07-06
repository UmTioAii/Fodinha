import type { Card, CardValue, DeckMode } from '@/game-engine/types'
import type { Suit } from '@/shared/constants/cards'


export type { CardPlay } from '@/game-engine/types'

// Suit ranking order: OURO < ESPADA < COPAS < ZAP
export const SUIT_RANK: Record<Suit, number> = {
  OURO: 1,
  ESPADA: 2,
  COPAS: 3,
  ZAP: 4,
}

// Clean deck base ranking: 3 > 2 > A > K > J > Q (higher number is stronger)
const CLEAN_VALUE_RANK: Record<string, number> = {
  Q: 1,
  J: 2,
  K: 3,
  A: 4,
  2: 5,
  3: 6,
}

// Dirty deck base ranking: 3 > 2 > A > K > J > Q > 7 > 6 > 5 > 4
const DIRTY_VALUE_RANK: Record<string, number> = {
  '4': 1,
  '5': 2,
  '6': 3,
  '7': 4,
  Q: 5,
  J: 6,
  K: 7,
  A: 8,
  2: 9,
  3: 10,
}

// Cyclic manilha mappings
const CLEAN_MANILHA_CYCLE: Record<string, CardValue> = {
  Q: 'J',
  J: 'K',
  K: 'A',
  A: '2',
  2: '3',
  3: 'Q',
}

const DIRTY_MANILHA_CYCLE: Record<string, CardValue> = {
  '4': '5',
  '5': '6',
  '6': '7',
  '7': 'Q',
  Q: 'J',
  J: 'K',
  K: 'A',
  A: '2',
  2: '3',
  3: '4',
}

/**
 * Returns the card value that is the manilha based on the vira card value.
 */
export function getManilhaValue(viraValue: CardValue, deckMode: DeckMode): CardValue {
  return deckMode === 'CLEAN' ? CLEAN_MANILHA_CYCLE[viraValue] : DIRTY_MANILHA_CYCLE[viraValue]
}

export const getManilhaRank = getManilhaValue

/**
 * Returns the base rank of a card value (higher = stronger).
 */
export function getValueRank(value: CardValue, deckMode: DeckMode): number {
  const rankMap = deckMode === 'CLEAN' ? CLEAN_VALUE_RANK : DIRTY_VALUE_RANK
  return rankMap[value] || 0
}

/**
 * Returns the ordered list of values for a given deck mode (weakest to strongest).
 */
export function getValueOrder(deckMode: DeckMode): CardValue[] {
  if (deckMode === 'CLEAN') return ['Q', 'J', 'K', 'A', '2', '3']
  return ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3']
}

/**
 * Compares cardA and cardB.
 * Returns positive if A is stronger, negative if B is stronger, 0 if identical.
 */
export function compareCards(
  cardA: Card,
  cardB: Card,
  manilhaValue: CardValue | null,
  deckMode: DeckMode
): number {
  const isAManilha = manilhaValue !== null && cardA.value === manilhaValue
  const isBManilha = manilhaValue !== null && cardB.value === manilhaValue

  if (isAManilha && !isBManilha) return 1
  if (!isAManilha && isBManilha) return -1
  if (isAManilha && isBManilha) {
    return SUIT_RANK[cardA.suit] - SUIT_RANK[cardB.suit]
  }

  const rankA = getValueRank(cardA.value, deckMode)
  const rankB = getValueRank(cardB.value, deckMode)

  if (rankA !== rankB) {
    return rankA - rankB
  }

  return SUIT_RANK[cardA.suit] - SUIT_RANK[cardB.suit]
}

/**
 * Resolves the winning CardPlay in a trick.
 */
export function getWinningCardPlay(
  plays: import('@/game-engine/types').CardPlay[],
  vira: Card | null,
  deckMode: DeckMode
): import('@/game-engine/types').CardPlay {
  if (plays.length === 0) {
    throw new Error('Cannot determine winning card play from empty plays list.')
  }

  const manilhaValue = vira ? getManilhaValue(vira.value, deckMode) : null
  let winningPlay = plays[0]

  for (let i = 1; i < plays.length; i++) {
    const play = plays[i]
    if (compareCards(play.card, winningPlay.card, manilhaValue, deckMode) > 0) {
      winningPlay = play
    }
  }

  return winningPlay
}

export const getWinningPlay = getWinningCardPlay

/**
 * Calculates the maximum cards per player.
 */
export function getMaxCardsPerPlayer(playerCount: number, deckMode: DeckMode): number {
  if (playerCount <= 0) return 0
  const totalCards = deckMode === 'CLEAN' ? 24 : 40
  return Math.floor((totalCards - 1) / playerCount)
}

/**
 * Validates if cards per player is within [1, maxCardsPerPlayer].
 */
export function validateCardsPerPlayer(
  count: number,
  playerCount: number,
  deckMode: DeckMode
): boolean {
  const max = getMaxCardsPerPlayer(playerCount, deckMode)
  return count >= 1 && count <= max
}
