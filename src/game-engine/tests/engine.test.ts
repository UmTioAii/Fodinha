import { describe, it, expect } from 'vitest'
import { createDeck } from '@/game-engine/deck'
import { getManilhaValue, compareCards } from '@/game-engine/rules'
import { getForbiddenDealerBid, getValidBids, validateBid } from '@/game-engine/bidding'
import { playCard, resolveTrick } from '@/game-engine/tricks'
import { scoreRound, eliminatePlayers, checkGameOver } from '@/game-engine/scoring'
import { initGame, dealRound, submitBid, nextRound } from '@/game-engine/state'
import type { Player } from '@/game-engine/types'
import type { Card } from '@/game-engine/types'
import type { Suit } from '@/shared/constants/cards'

describe('Fodinha Engine Tests', () => {
  describe('Deck Creation and Properties', () => {
    it('CLEAN deck should have 24 cards', () => {
      const deck = createDeck('CLEAN')
      expect(deck).toHaveLength(24)
      const values = new Set(deck.map((c) => c.value))
      expect(values.size).toBe(6)
      expect(Array.from(values).sort()).toEqual(['2', '3', 'A', 'J', 'K', 'Q'].sort())
    })

    it('DIRTY deck should have 40 cards', () => {
      const deck = createDeck('DIRTY')
      expect(deck).toHaveLength(40)
      const values = new Set(deck.map((c) => c.value))
      expect(values.size).toBe(10)
    })

    it('no duplicate cards should exist in the deck', () => {
      const deck = createDeck('DIRTY')
      const ids = deck.map((c) => c.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(deck.length)
    })

    it('each value has 4 suits', () => {
      const deck = createDeck('CLEAN')
      const qCards = deck.filter((c) => c.value === 'Q')
      expect(qCards).toHaveLength(4)
      const suits = qCards.map((c) => c.suit)
      expect(suits.sort()).toEqual(['OURO', 'ESPADA', 'COPAS', 'ZAP'].sort())
    })
  })

  describe('Manilha Calculation Mappings', () => {
    it('verifies CLEAN deck manilha mappings', () => {
      expect(getManilhaValue('Q', 'CLEAN')).toBe('J')
      expect(getManilhaValue('J', 'CLEAN')).toBe('K')
      expect(getManilhaValue('K', 'CLEAN')).toBe('A')
      expect(getManilhaValue('A', 'CLEAN')).toBe('2')
      expect(getManilhaValue('2', 'CLEAN')).toBe('3')
      expect(getManilhaValue('3', 'CLEAN')).toBe('Q')
    })

    it('verifies DIRTY deck manilha mappings', () => {
      expect(getManilhaValue('4', 'DIRTY')).toBe('5')
      expect(getManilhaValue('5', 'DIRTY')).toBe('6')
      expect(getManilhaValue('6', 'DIRTY')).toBe('7')
      expect(getManilhaValue('7', 'DIRTY')).toBe('Q')
      expect(getManilhaValue('Q', 'DIRTY')).toBe('J')
      expect(getManilhaValue('J', 'DIRTY')).toBe('K')
      expect(getManilhaValue('K', 'DIRTY')).toBe('A')
      expect(getManilhaValue('A', 'DIRTY')).toBe('2')
      expect(getManilhaValue('2', 'DIRTY')).toBe('3')
      expect(getManilhaValue('3', 'DIRTY')).toBe('4')
    })
  })

  describe('Card Comparisons and Powers', () => {
    const makeCard = (value: string, suit: Suit, deck: 'CLEAN' | 'DIRTY' = 'CLEAN'): Card => ({
      id: `${value}-${suit}`,
      value: value as any,
      suit,
      deck,
    })

    it('manilha beats normal card', () => {
      const manilha = makeCard('J', 'OURO')
      const normal = makeCard('3', 'ZAP')
      expect(compareCards(manilha, normal, 'J', 'CLEAN')).toBeGreaterThan(0)
      expect(compareCards(normal, manilha, 'J', 'CLEAN')).toBeLessThan(0)
    })

    it('manilha of Zap beats manilha of Copas', () => {
      const zapManilha = makeCard('J', 'ZAP')
      const copasManilha = makeCard('J', 'COPAS')
      expect(compareCards(zapManilha, copasManilha, 'J', 'CLEAN')).toBeGreaterThan(0)
    })

    it('3 beats 2 when no manilha is active', () => {
      const card3 = makeCard('3', 'OURO')
      const card2 = makeCard('2', 'ZAP')
      expect(compareCards(card3, card2, 'J', 'CLEAN')).toBeGreaterThan(0)
    })

    it('verifies standard non-manilha hierarchy', () => {
      const card3 = makeCard('3', 'OURO')
      const card2 = makeCard('2', 'OURO')
      const cardA = makeCard('A', 'OURO')
      const cardK = makeCard('K', 'OURO')
      const cardJ = makeCard('J', 'OURO')
      const cardQ = makeCard('Q', 'OURO')
      const card7 = makeCard('7', 'OURO', 'DIRTY')
      const card6 = makeCard('6', 'OURO', 'DIRTY')
      const card5 = makeCard('5', 'OURO', 'DIRTY')
      const card4 = makeCard('4', 'OURO', 'DIRTY')

      expect(compareCards(card3, card2, null, 'DIRTY')).toBeGreaterThan(0)
      expect(compareCards(card2, cardA, null, 'DIRTY')).toBeGreaterThan(0)
      expect(compareCards(cardA, cardK, null, 'DIRTY')).toBeGreaterThan(0)
      expect(compareCards(cardK, cardJ, null, 'DIRTY')).toBeGreaterThan(0)
      expect(compareCards(cardJ, cardQ, null, 'DIRTY')).toBeGreaterThan(0)
      expect(compareCards(cardQ, card7, null, 'DIRTY')).toBeGreaterThan(0)
      expect(compareCards(card7, card6, null, 'DIRTY')).toBeGreaterThan(0)
      expect(compareCards(card5, card4, null, 'DIRTY')).toBeGreaterThan(0)
    })

    it('compares same values using suit order (Zap > Copas > Espada > Ouro)', () => {
      const zap = makeCard('A', 'ZAP')
      const copas = makeCard('A', 'COPAS')
      const espada = makeCard('A', 'ESPADA')
      const ouro = makeCard('A', 'OURO')

      expect(compareCards(zap, copas, 'K', 'CLEAN')).toBeGreaterThan(0)
      expect(compareCards(copas, espada, 'K', 'CLEAN')).toBeGreaterThan(0)
      expect(compareCards(espada, ouro, 'K', 'CLEAN')).toBeGreaterThan(0)
    })
  })

  describe('Bidding Rules and Constraints', () => {
    it('dealer cannot bid the exact difference', () => {
      expect(getForbiddenDealerBid(3, 2)).toBe(1)
      expect(validateBid(1, 3, true, 2)).toBe(false)
      expect(validateBid(0, 3, true, 2)).toBe(true)
      expect(validateBid(2, 3, true, 2)).toBe(true)
    })

    it('dealer can bid anything if sum is out of bounds', () => {
      expect(getForbiddenDealerBid(2, 3)).toBeNull()
      expect(getValidBids(2, true, 3)).toEqual([0, 1, 2])
    })

    it('non-dealer can bid anything between 0 and cardsPerPlayer', () => {
      expect(getValidBids(3, false, 2)).toEqual([0, 1, 2, 3])
      expect(validateBid(1, 3, false, 2)).toBe(true)
    })
  })

  describe('Lives & Elimination scoring', () => {
    const p1: Player = { id: '1', name: 'A', type: 'HUMAN', seat: 0, lives: 3, hand: [], bid: 1, tricksWon: 1, eliminated: false }
    const p2: Player = { id: '2', name: 'B', type: 'BOT', seat: 1, lives: 3, hand: [], bid: 2, tricksWon: 1, eliminated: false }
    const p3: Player = { id: '3', name: 'C', type: 'BOT', seat: 2, lives: 1, hand: [], bid: 0, tricksWon: 1, eliminated: false }

    it('does not deduct life on matching bid, deducts 1 on mismatch', () => {
      const scored = scoreRound([p1, p2, p3])
      expect(scored.find((p) => p.id === '1')?.lives).toBe(3)
      expect(scored.find((p) => p.id === '2')?.lives).toBe(2)
      expect(scored.find((p) => p.id === '3')?.lives).toBe(0)
    })

    it('eliminates players when lives are 0', () => {
      const withZeroLives = scoreRound([p1, p2, p3])
      const eliminated = eliminatePlayers(withZeroLives)
      expect(eliminated.find((p) => p.id === '3')?.eliminated).toBe(true)
      expect(eliminated.find((p) => p.id === '1')?.eliminated).toBe(false)
    })

    it('detects game over when only 1 active player is left', () => {
      const players = [
        { ...p1, eliminated: false },
        { ...p2, eliminated: true },
        { ...p3, eliminated: true },
      ]
      const status = checkGameOver(players)
      expect(status.isGameOver).toBe(true)
      expect(status.winnerId).toBe('1')
    })
  })

  describe('Round State Machine & Game Flow Simulation', () => {
    it('simulates a simple 1-card round with 4 players and CLEAN deck', () => {
      const playersInfo = [
        { id: 'p1', name: 'Humano', type: 'HUMAN' as const },
        { id: 'p2', name: 'Bot 1', type: 'BOT' as const },
        { id: 'p3', name: 'Bot 2', type: 'BOT' as const },
        { id: 'p4', name: 'Bot 3', type: 'BOT' as const },
      ]

      let state = initGame('game-id', 'CLEAN', playersInfo)
      expect(state.phase).toBe('LOBBY')

      state = dealRound(state, 1)
      expect(state.phase).toBe('BIDDING')
      expect(state.players[0].hand).toHaveLength(1)
      expect(state.vira).not.toBeNull()
      expect(state.roundNumber).toBe(1)
      expect(state.currentPlayerSeat).toBe(1)

      state = submitBid(state, 'p2', 0)
      state = submitBid(state, 'p3', 1)
      state = submitBid(state, 'p4', 0)

      expect(state.currentPlayerSeat).toBe(0)
      expect(() => submitBid(state, 'p1', 0)).toThrow()

      state = submitBid(state, 'p1', 1)
      expect(state.phase).toBe('PLAYING_TRICK')
      expect(state.currentPlayerSeat).toBe(1)

      const c2 = state.players[1].hand[0].id
      state = playCard(state, 'p2', c2)

      expect(state.currentPlayerSeat).toBe(2)
      const c3 = state.players[2].hand[0].id
      state = playCard(state, 'p3', c3)

      expect(state.currentPlayerSeat).toBe(3)
      const c4 = state.players[3].hand[0].id
      state = playCard(state, 'p4', c4)

      expect(state.currentPlayerSeat).toBe(0)
      const c1 = state.players[0].hand[0].id
      state = playCard(state, 'p1', c1)

      expect(state.phase).toBe('TRICK_RESOLUTION')
      expect(state.currentTrick).toHaveLength(4)

      state = resolveTrick(state)
      expect(state.phase).toBe('ROUND_SCORING')
      expect(state.completedTricks).toHaveLength(1)

      const scoredPlayers = scoreRound(state.players)
      const finalPlayers = eliminatePlayers(scoredPlayers)
      state = { ...state, players: finalPlayers, phase: 'ELIMINATION_CHECK' }

      const overStatus = checkGameOver(state.players)
      expect(overStatus.isGameOver).toBe(false)

      state = nextRound(state)
      expect(state.dealerSeat).toBe(1)
      expect(state.phase).toBe('DEALING')
    })
  })
})
