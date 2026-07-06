/**
 * PVE Game Loop — orchestrates bot actions with delays.
 */
import type { GameState } from '@/game-engine/types'
import { submitBid, dealRound, nextRound } from '@/game-engine/state'
import { playCard, resolveTrick } from '@/game-engine/tricks'
import { scoreRound, eliminatePlayers, checkGameOver } from '@/game-engine/scoring'
import { getMaxCardsPerPlayer } from '@/game-engine/rules'
import { botBid, botPlayCard } from '@/ai'
import type { BotIdentity, Difficulty } from '@/shared/constants/cards'
import type { GameLogEntry } from './types'

const BOT_BID_DELAY = 1200
const BOT_PLAY_DELAY = 1000
const TRICK_PAUSE = 2200
const ROUND_PAUSE = 2500

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export interface GameLoopCallbacks {
  onStateChange: (state: GameState) => void
  onLog: (entry: GameLogEntry) => void
  onChat: (playerId: string, message: string) => void
  onGameOver: (winnerId: string | null) => void
}

const CHANCE_TO_CHAT = 0.35 // 35% chance to send a chat message

function triggerBotChat(callbacks: GameLoopCallbacks, playerId: string, playerName: string, context: 'WIN' | 'LOSS' | 'ELIMINATED' | 'START') {
  if (Math.random() > CHANCE_TO_CHAT) return
  
  const options = {
    WIN: ['Toma essa!', 'Essa rodada é minha.', 'Na gaveta!', 'Respeita o pai.', 'Mais uma pra conta.'],
    LOSS: ['Me ferrei...', 'Ih, melou.', 'Não acredito...', 'As cartas não ajudam.', 'Lascou...'],
    ELIMINATED: ['Fui pro saco.', 'Pato é pato.', 'Vou treinar mais.', 'A vingança virá!', 'Fui de base.'],
    START: ['Quem tem dó é violão.', 'Bora pro jogo.', 'Vou fazer todas!', 'Boa sorte... vão precisar.']
  }
  
  const pool = options[context]
  const msg = pool[Math.floor(Math.random() * pool.length)]
  
  setTimeout(() => {
    callbacks.onChat(playerId, msg)
  }, 1000)
}

/**
 * Generates the "subida e descida" card sequence for rounds.
 * Goes from 1 up to max, then back down to 1.
 */
export function generateRoundSequence(playerCount: number, deckMode: GameState['deckMode']): number[] {
  const max = getMaxCardsPerPlayer(playerCount, deckMode)
  const seq: number[] = []
  for (let i = 1; i <= max; i++) seq.push(i)
  for (let i = max - 1; i >= 1; i--) seq.push(i)
  return seq
}

/**
 * Runs the bidding phase for bot players.
 * Pauses and updates state for each bot bid.
 */
export async function runBotBidding(
  state: GameState,
  botMap: Map<string, { identity: BotIdentity; difficulty: Difficulty }>,
  callbacks: GameLoopCallbacks
): Promise<GameState> {
  let current = state

  while (current.phase === 'BIDDING') {
    const currentPlayer = current.players[current.currentPlayerSeat]
    if (currentPlayer.type === 'HUMAN') {
      // Wait for human input — return control
      break
    }

    const botInfo = botMap.get(currentPlayer.id)
    if (!botInfo) break

    await delay(BOT_BID_DELAY)

    const bid = botBid(current, currentPlayer.id, botInfo.identity, botInfo.difficulty)
    current = submitBid(current, currentPlayer.id, bid)

    callbacks.onLog({
      type: 'BID',
      message: `${currentPlayer.name} apostou ${bid}`,
      timestamp: Date.now(),
      playerId: currentPlayer.id,
    })
    callbacks.onStateChange(current)
  }

  return current
}

/**
 * Runs the trick-playing phase for bot players.
 */
export async function runBotTrickPlay(
  state: GameState,
  botMap: Map<string, { identity: BotIdentity; difficulty: Difficulty }>,
  callbacks: GameLoopCallbacks
): Promise<GameState> {
  let current = state

  while (current.phase === 'PLAYING_TRICK') {
    const currentPlayer = current.players[current.currentPlayerSeat]
    if (currentPlayer.type === 'HUMAN') {
      // Wait for human input
      break
    }

    const botInfo = botMap.get(currentPlayer.id)
    if (!botInfo) break

    await delay(BOT_PLAY_DELAY)

    const cardId = botPlayCard(current, currentPlayer.id, botInfo.identity, botInfo.difficulty)
    const card = currentPlayer.hand.find((c) => c.id === cardId)
    current = playCard(current, currentPlayer.id, cardId)

    callbacks.onLog({
      type: 'PLAY',
      message: `${currentPlayer.name} jogou ${card?.value ?? '?'}${suitSymbol(card?.suit)}`,
      timestamp: Date.now(),
      playerId: currentPlayer.id,
    })
    callbacks.onStateChange(current)
  }

  return current
}

/**
 * Resolves a completed trick and logs the result.
 */
export async function runTrickResolution(
  state: GameState,
  callbacks: GameLoopCallbacks
): Promise<GameState> {
  if (state.phase !== 'TRICK_RESOLUTION') return state

  await delay(TRICK_PAUSE)

  const resolved = resolveTrick(state)
  const lastTrick = resolved.completedTricks[resolved.completedTricks.length - 1]
  const winner = resolved.players.find((p) => p.id === lastTrick.winnerPlayerId)

  callbacks.onLog({
    type: 'TRICK_WIN',
    message: `${winner?.name ?? '?'} venceu a vaza!`,
    timestamp: Date.now(),
    playerId: lastTrick.winnerPlayerId,
  })
  
  if (winner && winner.type === 'BOT') {
    triggerBotChat(callbacks, winner.id, winner.name, 'WIN')
  }

  callbacks.onStateChange(resolved)

  return resolved
}

/**
 * Runs round scoring: apply life losses, eliminations, check game over.
 */
export async function runRoundScoring(
  state: GameState,
  callbacks: GameLoopCallbacks
): Promise<GameState> {
  if (state.phase !== 'ROUND_SCORING') return state

  await delay(1000)

  const scored = scoreRound(state.players)

  // Log life losses
  for (const player of scored) {
    const orig = state.players.find((p) => p.id === player.id)
    if (orig && !orig.eliminated && player.lives < orig.lives) {
      callbacks.onLog({
        type: 'LIFE_LOSS',
        message: `${player.name} errou e perdeu 1 vida (${player.lives} restantes)`,
        timestamp: Date.now(),
        playerId: player.id,
      })
      if (player.type === 'BOT') {
        triggerBotChat(callbacks, player.id, player.name, 'LOSS')
      }
    }
  }

  const afterElimination = eliminatePlayers(scored)

  // Log eliminations
  for (const player of afterElimination) {
    const orig = state.players.find((p) => p.id === player.id)
    if (orig && !orig.eliminated && player.eliminated) {
      callbacks.onLog({
        type: 'ELIMINATION',
        message: `${player.name} foi eliminado!`,
        timestamp: Date.now(),
        playerId: player.id,
      })
      if (player.type === 'BOT') {
        triggerBotChat(callbacks, player.id, player.name, 'ELIMINATED')
      }
    }
  }

  let updated: GameState = {
    ...state,
    players: afterElimination,
    phase: 'ELIMINATION_CHECK',
  }

  callbacks.onStateChange(updated)

  const gameOver = checkGameOver(afterElimination)
  if (gameOver.isGameOver) {
    updated = { ...updated, phase: 'GAME_OVER' }
    const winnerName = afterElimination.find((p) => p.id === gameOver.winnerId)?.name ?? 'Ninguém'
    callbacks.onLog({
      type: 'GAME_OVER',
      message: gameOver.winnerId ? `${winnerName} venceu a partida!` : 'Empate!',
      timestamp: Date.now(),
    })
    callbacks.onStateChange(updated)
    callbacks.onGameOver(gameOver.winnerId)
    return updated
  }

  return updated
}

/**
 * Starts the next round with the given cards per player.
 */
export async function startNextRound(
  state: GameState,
  cardsPerPlayer: number,
  callbacks: GameLoopCallbacks
): Promise<GameState> {
  await delay(ROUND_PAUSE)

  const prepared = nextRound(state)
  const dealt = dealRound(prepared, cardsPerPlayer)

  callbacks.onLog({
    type: 'ROUND_START',
    message: `Rodada ${dealt.roundNumber} — ${cardsPerPlayer} carta${cardsPerPlayer > 1 ? 's' : ''} por jogador`,
    timestamp: Date.now(),
  })
  callbacks.onStateChange(dealt)

  return dealt
}

function suitSymbol(suit?: string): string {
  switch (suit) {
    case 'ZAP': return '♣'
    case 'COPAS': return '♥'
    case 'ESPADA': return '♠'
    case 'OURO': return '♦'
    default: return ''
  }
}
