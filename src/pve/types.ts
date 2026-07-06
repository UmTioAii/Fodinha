/**
 * PVE game types.
 */
import type { DeckMode } from '@/game-engine/types'
import type { Difficulty, BotIdentity } from '@/shared/constants/cards'

export interface PveConfig {
  playerName: string
  deckMode: DeckMode
  playerCount: number // 2–8
  botDifficulty: Difficulty
  botIdentities: BotIdentity[]
}

export type GameLogType =
  | 'ROUND_START'
  | 'BID'
  | 'PLAY'
  | 'TRICK_WIN'
  | 'LIFE_LOSS'
  | 'ELIMINATION'
  | 'GAME_OVER'

export interface ChatEntry {
  playerId: string
  playerName: string
  message: string
  timestamp: number
}

export const QUICK_CHATS = [
  'Toma essa!',
  'Me ferrei...',
  'Vou fazer todas!',
  'Ih, melou.',
  'Quem tem dó é violão.',
  'Boa jogada!',
  'Essa rodada é minha.',
]

export interface GameLogEntry {
  type: GameLogType
  message: string
  timestamp: number
  playerId?: string
}
