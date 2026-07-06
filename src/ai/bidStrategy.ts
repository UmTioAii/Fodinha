/**
 * Bid selection strategy for AI bots.
 */
import type { GameState } from '@/game-engine/types'
import { getManilhaValue } from '@/game-engine/rules'
import { getValidBids } from '@/game-engine/bidding'
import { evaluateHand } from './handEval'
import type { BotPersonality } from './personalities'
import type { DifficultyModifier } from './difficulty'

/**
 * Chooses a bid for a bot player.
 */
export function chooseBid(
  state: GameState,
  playerId: string,
  personality: BotPersonality,
  modifier: DifficultyModifier
): number {
  const player = state.players.find((p) => p.id === playerId)
  if (!player) throw new Error(`Player ${playerId} not found`)

  const manilhaValue = state.vira
    ? getManilhaValue(state.vira.value, state.deckMode)
    : null

  let rawBid = 0

  if (state.cardsPerPlayer === 1) {
    // Blind round: bots cannot see their own card, must guess based on visible opponent cards
    const visibleCards = state.players
      .filter((p) => p.id !== playerId && !p.eliminated && p.hand.length > 0)
      .map((p) => p.hand[0])

    let maxOpponentStrength = 0
    for (const card of visibleCards) {
      const isManilha = manilhaValue !== null && card.value === manilhaValue
      const strength = isManilha ? 100 : card.value.charCodeAt(0) // Simplified metric
      if (strength > maxOpponentStrength) maxOpponentStrength = strength
    }
    
    // If opponents have a manilha, bid 0. If opponents have weak cards, maybe bid 1.
    if (maxOpponentStrength === 100) {
      rawBid = 0
    } else {
      // 50/50 chance, influenced by personality
      rawBid = Math.random() > 0.5 ? 1 : 0
    }
  } else {
    // Normal round: evaluate based on own hand
    const handStrength = evaluateHand(player.hand, manilhaValue, state.deckMode)
    rawBid = handStrength.expectedTricks
  }

  // Apply personality adjustment
  rawBid += personality.bidAdjustment

  // Apply difficulty error
  if (modifier.bidErrorRange > 0) {
    const error = (Math.random() * 2 - 1) * modifier.bidErrorRange
    rawBid += error
  }

  // Round and clamp to valid range
  let bid = Math.round(rawBid)
  bid = Math.max(0, Math.min(state.cardsPerPlayer, bid))

  // Check against valid bids (respects dealer forbidden bid)
  const activePlayers = state.players.filter((p) => !p.eliminated)
  const unbiddenActive = activePlayers.filter((p) => p.bid === null)
  const isDealer = unbiddenActive.length === 1

  const otherBidsSum = activePlayers
    .filter((p) => p.id !== playerId && p.bid !== null)
    .reduce((sum, p) => sum + (p.bid ?? 0), 0)

  const validBids = getValidBids(state.cardsPerPlayer, isDealer, otherBidsSum)

  if (validBids.includes(bid)) {
    return bid
  }

  // If chosen bid is forbidden, pick the nearest valid bid
  let nearest = validBids[0]
  let minDist = Math.abs(bid - nearest)
  for (const vb of validBids) {
    const dist = Math.abs(bid - vb)
    if (dist < minDist) {
      minDist = dist
      nearest = vb
    }
  }

  return nearest
}
