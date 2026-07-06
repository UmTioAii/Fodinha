import type { Card, CardValue, DeckMode, Suit } from '@/shared/constants/cards'

const SUITS: Suit[] = ['OURO', 'ESPADA', 'COPAS', 'ZAP']

const CLEAN_VALUES: CardValue[] = ['Q', 'J', 'K', 'A', '2', '3']
const DIRTY_VALUES: CardValue[] = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3']

/**
 * Creates a standard Fodinha deck.
 * - CLEAN: 24 cards (Q, J, K, A, 2, 3)
 * - DIRTY: 40 cards (4, 5, 6, 7, Q, J, K, A, 2, 3)
 */
export function createDeck(mode: DeckMode): Card[] {
  const values = mode === 'CLEAN' ? CLEAN_VALUES : DIRTY_VALUES
  const deck: Card[] = []

  for (const value of values) {
    for (const suit of SUITS) {
      deck.push({
        id: `${value}-${suit}-${mode}`,
        value,
        suit,
        deck: mode,
      })
    }
  }

  return deck
}

/**
 * Shuffles a deck of cards using the Fisher-Yates algorithm.
 * Returns a new shuffled array (pure function).
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = temp
  }
  return shuffled
}
