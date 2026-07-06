/**
 * Game state transitions for Fodinha.
 */
import type { GameState, GamePhase, PlayerType, Card } from '@/game-engine/types'
import { getManilhaValue } from '@/game-engine/rules'
import { createDeck, shuffleDeck } from '@/game-engine/deck'
import { getNextActiveSeat } from '@/game-engine/utils'
import { getForbiddenDealerBid } from '@/game-engine/bidding'

// Re-export all types from the centralized types module
export type { GameState, GamePhase, PlayerType, Player, PlayerType as PType, Trick, CardPlay } from '@/game-engine/types'

/**
 * Initializes a new game state.
 */
export function initGame(
  id: string,
  deckMode: GameState['deckMode'],
  playersInfo: { id: string; name: string; type: PlayerType }[]
): GameState {
  const players = playersInfo.map((p, idx) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    seat: idx,
    lives: 5,
    hand: [] as Card[],
    bid: null as number | null,
    tricksWon: 0,
    eliminated: false,
  }))

  return {
    id,
    phase: 'LOBBY',
    deckMode,
    players,
    dealerSeat: 0,
    currentPlayerSeat: 0,
    cardsPerPlayer: 0,
    vira: null,
    manilhaRank: null,
    currentTrick: [],
    completedTricks: [],
    roundNumber: 0,
  }
}

/**
 * Deals cards to active players for the round.
 */
export function dealRound(state: GameState, cardsPerPlayer: number): GameState {
  const activePlayers = state.players.filter((p) => !p.eliminated)
  const activeCount = activePlayers.length

  if (activeCount === 0) {
    throw new Error('Cannot deal round with 0 active players')
  }

  const deck = createDeck(state.deckMode)
  const shuffled = shuffleDeck(deck)

  const totalNeeded = cardsPerPlayer * activeCount + 1
  if (shuffled.length < totalNeeded) {
    throw new Error(
      `Not enough cards in deck (${shuffled.length}) to deal ${cardsPerPlayer} cards to ${activeCount} players + 1 vira.`
    )
  }

  let cardIdx = 0
  const updatedPlayers = state.players.map((p) => {
    if (p.eliminated) {
      return { ...p, hand: [] as Card[], bid: null as number | null, tricksWon: 0 }
    }
    const hand = shuffled.slice(cardIdx, cardIdx + cardsPerPlayer)
    cardIdx += cardsPerPlayer
    return { ...p, hand, bid: null as number | null, tricksWon: 0 }
  })

  const vira = shuffled[cardIdx]
  const manilhaRank = getManilhaValue(vira.value, state.deckMode)

  const firstBidderSeat = getNextActiveSeat(state.dealerSeat, updatedPlayers)

  return {
    ...state,
    phase: 'BIDDING',
    players: updatedPlayers,
    cardsPerPlayer,
    vira,
    manilhaRank,
    currentTrick: [],
    completedTricks: [],
    currentPlayerSeat: firstBidderSeat,
    roundNumber: state.roundNumber + 1,
  }
}

/**
 * Submits a bid for the current player.
 */
export function submitBid(state: GameState, playerId: string, bid: number): GameState {
  if (state.phase !== 'BIDDING') {
    throw new Error(`Cannot submit bid in phase ${state.phase}`)
  }

  const currentPlayer = state.players[state.currentPlayerSeat]
  if (currentPlayer.id !== playerId) {
    throw new Error(
      `It is not player ${playerId}'s turn to bid (currentPlayer id is ${currentPlayer.id})`
    )
  }

  const activePlayers = state.players.filter((p) => !p.eliminated)
  const unbiddenActivePlayers = activePlayers.filter((p) => p.bid === null)
  const isDealerBidding = unbiddenActivePlayers.length === 1

  const otherBidsSum = activePlayers
    .filter((p) => p.id !== playerId && p.bid !== null)
    .reduce((sum, p) => sum + (p.bid ?? 0), 0)

  if (isDealerBidding) {
    const forbiddenBid = getForbiddenDealerBid(state.cardsPerPlayer, otherBidsSum)
    if (bid === forbiddenBid) {
      throw new Error(`Dealer is forbidden from bidding ${bid} to prevent an exact trick match sum.`)
    }
  }

  if (bid < 0 || bid > state.cardsPerPlayer) {
    throw new Error(`Bid ${bid} is out of bounds [0, ${state.cardsPerPlayer}]`)
  }

  const updatedPlayers = state.players.map((p) => {
    if (p.id === playerId) {
      return { ...p, bid }
    }
    return p
  })

  const allBidsSubmitted = updatedPlayers.filter((p) => !p.eliminated && p.bid === null).length === 0

  let nextPhase: GamePhase = 'BIDDING'
  let nextSeat = state.currentPlayerSeat

  if (allBidsSubmitted) {
    nextPhase = 'PLAYING_TRICK'
    nextSeat = getNextActiveSeat(state.dealerSeat, updatedPlayers)
  } else {
    nextSeat = getNextActiveSeat(state.currentPlayerSeat, updatedPlayers)
  }

  return {
    ...state,
    phase: nextPhase,
    players: updatedPlayers,
    currentPlayerSeat: nextSeat,
  }
}

/**
 * Prepares the game state for the next round.
 */
export function nextRound(state: GameState): GameState {
  const nextDealerSeat = getNextActiveSeat(state.dealerSeat, state.players)

  return {
    ...state,
    phase: 'DEALING',
    dealerSeat: nextDealerSeat,
    currentPlayerSeat: nextDealerSeat,
    cardsPerPlayer: 0,
    vira: null,
    manilhaRank: null,
    currentTrick: [],
    completedTricks: [],
  }
}
