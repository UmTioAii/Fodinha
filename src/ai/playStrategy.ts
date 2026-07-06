/**
 * Card play selection strategy for AI bots.
 * Picks which card to play from the bot's hand based on behavior mode.
 */
import type { GameState, Card } from '@/game-engine/types'
import type { BotBehavior } from '@/shared/constants/cards'
import { getManilhaValue, compareCards } from '@/game-engine/rules'
import { sortCardsByStrength } from './handEval'
import type { DifficultyModifier } from './difficulty'

/**
 * Choose which card to play.
 */
export function chooseCard(
  state: GameState,
  playerId: string,
  behavior: BotBehavior,
  modifier: DifficultyModifier
): string {
  const player = state.players.find((p) => p.id === playerId)
  if (!player || player.hand.length === 0) {
    throw new Error(`Player ${playerId} has no cards to play`)
  }

  // Random play chance (difficulty-based)
  if (Math.random() < modifier.randomPlayChance) {
    const randomIdx = Math.floor(Math.random() * player.hand.length)
    return player.hand[randomIdx].id
  }

  const manilhaValue = state.vira
    ? getManilhaValue(state.vira.value, state.deckMode)
    : null

  // Sort hand from weakest to strongest
  const sorted = sortCardsByStrength(player.hand, manilhaValue, state.deckMode)

  // Find the currently winning card in the trick (if any)
  let currentWinner: Card | null = null
  if (state.currentTrick.length > 0) {
    currentWinner = state.currentTrick[0].card
    for (let i = 1; i < state.currentTrick.length; i++) {
      if (compareCards(state.currentTrick[i].card, currentWinner, manilhaValue, state.deckMode) > 0) {
        currentWinner = state.currentTrick[i].card
      }
    }
  }

  switch (behavior) {
    case 'SAFE':
      return playSafe(sorted, currentWinner, manilhaValue, state)

    case 'AGGRESSIVE':
      return playAggressive(sorted, currentWinner, manilhaValue, state)

    case 'SABOTAGE':
      return playSabotage(sorted, currentWinner, manilhaValue, state)

    case 'CHAOTIC':
      return playChaotic(sorted)

    case 'NORMAL':
    default:
      return playNormal(sorted, currentWinner, manilhaValue, state, playerId)
  }
}

/**
 * NORMAL: Play to reach bid target — strong if behind, weak if ahead.
 */
function playNormal(
  sorted: Card[],
  currentWinner: Card | null,
  manilhaValue: string | null,
  state: GameState,
  playerId: string
): string {
  const player = state.players.find((p) => p.id === playerId)!
  const tricksNeeded = Math.max(0, (player.bid ?? 0) - player.tricksWon)

  if (tricksNeeded > 0 && currentWinner) {
    // Need more tricks — try to beat current winner with minimal card
    const beaters = sorted.filter(
      (c) => compareCards(c, currentWinner!, manilhaValue as any, state.deckMode) > 0
    )
    if (beaters.length > 0) {
      return beaters[0].id // Play weakest card that still wins
    }
  }

  if (tricksNeeded > 0) {
    // Leading the trick and need wins — play a strong card
    return sorted[sorted.length - 1].id
  }

  // Already at target — play weakest
  return sorted[0].id
}

/**
 * SAFE: Play weakest card to avoid winning extra tricks.
 */
function playSafe(
  sorted: Card[],
  currentWinner: Card | null,
  manilhaValue: string | null,
  state: GameState
): string {
  if (currentWinner) {
    // Try to play a card that loses to the current winner
    const losers = sorted.filter(
      (c) => compareCards(c, currentWinner!, manilhaValue as any, state.deckMode) < 0
    )
    if (losers.length > 0) {
      return losers[losers.length - 1].id // Play strongest loser (waste least)
    }
  }
  // If must win, play weakest
  return sorted[0].id
}

/**
 * AGGRESSIVE: Play strongest available to win the trick.
 */
function playAggressive(
  sorted: Card[],
  currentWinner: Card | null,
  manilhaValue: string | null,
  state: GameState
): string {
  if (currentWinner) {
    const beaters = sorted.filter(
      (c) => compareCards(c, currentWinner, manilhaValue as any, state.deckMode) > 0
    )
    if (beaters.length > 0) {
      const activePlayers = state.players.filter(p => !p.eliminated).length
      const isLast = state.currentTrick.length === activePlayers - 1
      if (isLast) {
        // Last to play, just secure the win with the weakest beater
        return beaters[0].id
      }
      // Not last, play a strong beater to dominate
      return beaters[beaters.length - 1].id
    }
  }
  // If leading or cannot win, play the strongest card to try and force a win or draw out enemies
  return sorted[sorted.length - 1].id
}

/**
 * SABOTAGE: Play a card that disrupts the current leader.
 * If someone is about to win the trick and is near their target, beat them.
 * Otherwise, play weakest to preserve strong cards.
 */
function playSabotage(
  sorted: Card[],
  currentWinner: Card | null,
  manilhaValue: string | null,
  state: GameState
): string {
  if (currentWinner && state.currentTrick.length > 0) {
    // Find who is currently winning
    let winnerPlay = state.currentTrick[0]
    for (let i = 1; i < state.currentTrick.length; i++) {
      if (compareCards(state.currentTrick[i].card, winnerPlay.card, manilhaValue as any, state.deckMode) > 0) {
        winnerPlay = state.currentTrick[i]
      }
    }

    const trickLeader = state.players.find((p) => p.id === winnerPlay.playerId)
    if (trickLeader) {
      const leaderNeedsThisTrick =
        trickLeader.bid !== null && trickLeader.tricksWon < trickLeader.bid

      if (leaderNeedsThisTrick) {
        // Try to beat the leader with minimal card
        const beaters = sorted.filter(
          (c) => compareCards(c, currentWinner!, manilhaValue as any, state.deckMode) > 0
        )
        if (beaters.length > 0) {
          return beaters[0].id
        }
      }
    }
  }

  // Fallback: play weakest
  return sorted[0].id
}

/**
 * CHAOTIC: Play a random mid-strength card.
 */
function playChaotic(sorted: Card[]): string {
  if (sorted.length <= 2) {
    return sorted[Math.floor(Math.random() * sorted.length)].id
  }
  // Pick from the middle range
  const midStart = Math.floor(sorted.length * 0.25)
  const midEnd = Math.ceil(sorted.length * 0.75)
  const midRange = sorted.slice(midStart, midEnd)
  return midRange[Math.floor(Math.random() * midRange.length)].id
}
