/**
 * Core engine types for Fodinha.
 * All game-engine modules import types from here to avoid circular deps.
 */
import type { Card, CardValue, DeckMode } from '@/shared/constants/cards'

// Re-export card types for convenience
export type { Card, CardValue, DeckMode }

export type PlayerType = 'HUMAN' | 'BOT'

export type GamePhase =
  | 'LOBBY'
  | 'DEALING'
  | 'BIDDING'
  | 'PLAYING_TRICK'
  | 'TRICK_RESOLUTION'
  | 'ROUND_SCORING'
  | 'ELIMINATION_CHECK'
  | 'GAME_OVER'

export interface Player {
  readonly id: string
  readonly name: string
  readonly type: PlayerType
  readonly seat: number
  readonly lives: number
  readonly hand: Card[]
  readonly bid: number | null
  readonly tricksWon: number
  readonly eliminated: boolean
}

export interface CardPlay {
  readonly playerId: string
  readonly card: Card
}

export interface Trick {
  readonly plays: CardPlay[]
  readonly winnerPlayerId: string
}

export interface GameState {
  readonly id: string
  readonly phase: GamePhase
  readonly deckMode: DeckMode
  readonly players: Player[]
  readonly dealerSeat: number
  readonly currentPlayerSeat: number
  readonly cardsPerPlayer: number
  readonly vira: Card | null
  readonly manilhaRank: string | null
  readonly currentTrick: CardPlay[]
  readonly completedTricks: Trick[]
  readonly roundNumber: number
}
