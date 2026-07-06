// Tipos centrais do jogo Fodinha.
// Esta camada não depende de React, Supabase nem Vercel.

export type Suit = 'OURO' | 'ESPADA' | 'COPAS' | 'ZAP'

// Ordem fraca -> forte. Ideia: valor numérico crescente.
export const SUIT_ORDER: ReadonlyArray<Suit> = ['OURO', 'ESPADA', 'COPAS', 'ZAP']

export type DeckMode = 'CLEAN' | 'DIRTY'

// Valores válidos por baralho.
export type CleanValue = 'Q' | 'J' | 'K' | 'A' | '2' | '3'
export type DirtyValue = '4' | '5' | '6' | '7' | 'Q' | 'J' | 'K' | 'A' | '2' | '3'
export type CardValue = DirtyValue

export interface Card {
  readonly id: string
  readonly value: CardValue
  readonly suit: Suit
  readonly deck: DeckMode
}

// Identidades de bots — nomes não são dificuldades.
export type BotIdentity =
  | 'JOAO'
  | 'GLAUBILENO'
  | 'BETAO'
  | 'THALES'
  | 'LUCAS'
  | 'RENAN'
  | 'BABY'
  | 'FELIPE'

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

export type BotBehavior = 'NORMAL' | 'SAFE' | 'AGGRESSIVE' | 'SABOTAGE' | 'CHAOTIC'

export type PlayerKind = 'HUMAN' | 'BOT'

export interface PlayerId {
  readonly id: string
  readonly kind: PlayerKind
  readonly name: string
  readonly botIdentity?: BotIdentity
}

export type GameMode = 'PVE' | 'MULTIPLAYER'

export type MatchStatus = 'WAITING' | 'IN_PROGRESS' | 'FINISHED' | 'ABANDONED'

export type ThemeMode = 'DARK' | 'LIGHT' | 'SYSTEM'

export type TableColor = 'GREEN_CLASSIC' | 'BLUE' | 'RED' | 'BLACK'

export type BackgroundStyle = 'DARK_TABLE' | 'NEON' | 'WOOD'

export type CardBackStyle = 'FODINHA_DEFAULT' | 'CLASSIC' | 'MINIMAL'

export type CardFaceStyle = 'CLASSIC' | 'MODERN' | 'RETRO'
