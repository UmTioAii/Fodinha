import type { GameState, CardPlay, Trick } from '@/game-engine/types'
import { getWinningCardPlay } from '@/game-engine/rules'
import { getNextActiveSeat } from '@/game-engine/utils'

export { getNextActiveSeat } from '@/game-engine/utils'

/**
 * Executes a card play action for a player.
 */
export function playCard(state: GameState, playerId: string, cardId: string): GameState {
  if (state.phase !== 'PLAYING_TRICK') {
    throw new Error(`Cannot play card in phase ${state.phase}`)
  }

  const currentPlayer = state.players[state.currentPlayerSeat]
  if (currentPlayer.id !== playerId) {
    throw new Error(`It is not player ${playerId}'s turn to play (currentPlayer id is ${currentPlayer.id})`)
  }

  const card = currentPlayer.hand.find((c) => c.id === cardId)
  if (!card) {
    throw new Error(`Card ${cardId} is not in player ${playerId}'s hand`)
  }

  const updatedPlayers = state.players.map((p) => {
    if (p.id === playerId) {
      return { ...p, hand: p.hand.filter((c) => c.id !== cardId) }
    }
    return p
  })

  const newPlay: CardPlay = { playerId, card }
  const updatedTrick = [...state.currentTrick, newPlay]

  const activePlayersCount = state.players.filter((p) => !p.eliminated).length

  let nextPhase: GameState['phase'] = state.phase
  let nextSeat = state.currentPlayerSeat

  if (updatedTrick.length === activePlayersCount) {
    nextPhase = 'TRICK_RESOLUTION'
  } else {
    nextSeat = getNextActiveSeat(state.currentPlayerSeat, updatedPlayers)
  }

  return {
    ...state,
    players: updatedPlayers,
    currentTrick: updatedTrick,
    phase: nextPhase,
    currentPlayerSeat: nextSeat,
  }
}

/**
 * Resolves the current trick, determines the winner, awards the trick,
 * and sets up the next turn or transitions to scoring.
 */
export function resolveTrick(state: GameState): GameState {
  if (state.phase !== 'TRICK_RESOLUTION') {
    throw new Error(`Cannot resolve trick in phase ${state.phase}`)
  }

  if (state.currentTrick.length === 0) {
    throw new Error('Cannot resolve trick with no played cards.')
  }

  const winningPlay = getWinningCardPlay(state.currentTrick, state.vira, state.deckMode)
  const winnerId = winningPlay.playerId

  const winnerPlayer = state.players.find((p) => p.id === winnerId)
  if (!winnerPlayer) {
    throw new Error(`Winning player ${winnerId} not found in state`)
  }
  const winnerSeat = winnerPlayer.seat

  const updatedPlayers = state.players.map((p) => {
    if (p.id === winnerId) {
      return { ...p, tricksWon: p.tricksWon + 1 }
    }
    return p
  })

  const completedTrick: Trick = {
    plays: state.currentTrick,
    winnerPlayerId: winnerId,
  }
  const updatedCompletedTricks = [...state.completedTricks, completedTrick]

  const activePlayers = updatedPlayers.filter((p) => !p.eliminated)
  const hasCardsLeft = activePlayers.some((p) => p.hand.length > 0)

  const nextPhase = hasCardsLeft ? 'PLAYING_TRICK' : 'ROUND_SCORING'

  return {
    ...state,
    players: updatedPlayers,
    currentTrick: [],
    completedTricks: updatedCompletedTricks,
    phase: nextPhase,
    currentPlayerSeat: winnerSeat,
  }
}
