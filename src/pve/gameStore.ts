/**
 * Zustand store for PVE game management.
 */
import { create } from 'zustand'
import type { GameState } from '@/game-engine/types'
import type { BotIdentity, Difficulty } from '@/shared/constants/cards'
import { initGame, dealRound, submitBid } from '@/game-engine/state'
import { playCard } from '@/game-engine/tricks'
import { PERSONALITIES } from '@/ai'
import type { PveConfig, GameLogEntry, ChatEntry } from './types'
import {
  generateRoundSequence,
  runBotBidding,
  runBotTrickPlay,
  runTrickResolution,
  runRoundScoring,
  startNextRound,
} from './gameLoop'
import type { GameLoopCallbacks } from './gameLoop'

export type PveStatus = 'IDLE' | 'PLAYING' | 'FINISHED'

interface PveGameStore {
  state: GameState | null
  status: PveStatus
  config: PveConfig | null
  log: GameLogEntry[]
  chatLog: ChatEntry[]
  roundSequence: number[]
  roundIndex: number
  winnerId: string | null

  /** Bot metadata map: playerId → { identity, difficulty } */
  botMap: Map<string, { identity: BotIdentity; difficulty: Difficulty }>

  // Public actions
  startGame: (config: PveConfig) => void
  submitHumanBid: (bid: number) => void
  playHumanCard: (cardId: string) => void
  sendChatMessage: (playerId: string, message: string) => void
  reset: () => void
}

export const usePveGameStore = create<PveGameStore>((set, get) => {
  function getCallbacks(): GameLoopCallbacks {
    return {
      onStateChange: (state) => set({ state }),
      onLog: (entry) => set((s) => ({ log: [...s.log, entry] })),
      onChat: (playerId, message) => get().sendChatMessage(playerId, message),
      onGameOver: (winnerId) => set({ status: 'FINISHED', winnerId }),
    }
  }

  /**
   * After a human action, continue the game loop
   * (process remaining bots, resolve tricks, start next round, etc.)
   */
  async function continueLoop() {
    const store = get()
    if (!store.state || store.status !== 'PLAYING') return

    let current = store.state
    const callbacks = getCallbacks()

    // Keep processing until we need human input or game ends
    while (current.phase !== 'GAME_OVER') {
      if (current.phase === 'BIDDING') {
        current = await runBotBidding(current, store.botMap, callbacks)
        if (current.phase === 'BIDDING') break // Waiting for human bid
      }

      if (current.phase === 'PLAYING_TRICK') {
        current = await runBotTrickPlay(current, store.botMap, callbacks)
        if (current.phase === 'PLAYING_TRICK') break // Waiting for human play
      }

      if (current.phase === 'TRICK_RESOLUTION') {
        current = await runTrickResolution(current, callbacks)
        // After resolution, phase becomes PLAYING_TRICK or ROUND_SCORING
        continue
      }

      if (current.phase === 'ROUND_SCORING') {
        current = await runRoundScoring(current, callbacks)
        if (current.phase === 'GAME_OVER') break

        // Advance to next round
        const { roundSequence, roundIndex } = get()
        const nextIdx = roundIndex + 1
        if (nextIdx >= roundSequence.length) {
          // All rounds completed — game over by survival
          set(() => ({
            state: { ...current, phase: 'GAME_OVER' as const },
            status: 'FINISHED',
          }))
          break
        }

        set({ roundIndex: nextIdx })
        current = await startNextRound(current, roundSequence[nextIdx], callbacks)
        // After deal, phase is BIDDING — loop will continue
        continue
      }

      if (current.phase === 'ELIMINATION_CHECK') {
        // This phase is handled within runRoundScoring, should not stay here
        break
      }

      break
    }
  }

  return {
    state: null,
    status: 'IDLE',
    config: null,
    log: [],
    chatLog: [],
    roundSequence: [],
    roundIndex: 0,
    winnerId: null,
    botMap: new Map(),

    startGame: (config: PveConfig) => {
      // Build player list: human first, then bots
      const playersInfo = [
        { id: 'human', name: config.playerName || 'Jogador', type: 'HUMAN' as const },
        ...config.botIdentities.map((identity) => ({
          id: `bot-${identity}`,
          name: PERSONALITIES[identity].displayName,
          type: 'BOT' as const,
        })),
      ]

      const gameState = initGame('pve-game', config.deckMode, playersInfo)
      const roundSeq = generateRoundSequence(
        playersInfo.length,
        config.deckMode
      )

      // Build bot map
      const botMap = new Map<string, { identity: BotIdentity; difficulty: Difficulty }>()
      for (const identity of config.botIdentities) {
        botMap.set(`bot-${identity}`, { identity, difficulty: config.botDifficulty })
      }

      // Deal first round
      const dealt = dealRound(gameState, roundSeq[0])


      const initLog: GameLogEntry = {
        type: 'ROUND_START',
        message: `Rodada 1 — ${roundSeq[0]} carta${roundSeq[0] > 1 ? 's' : ''} por jogador`,
        timestamp: Date.now(),
      }

      set({
        state: dealt,
        status: 'PLAYING',
        config,
        log: [initLog],
        chatLog: [],
        roundSequence: roundSeq,
        roundIndex: 0,
        winnerId: null,
        botMap,
      })

      // Start bot processing
      setTimeout(() => continueLoop(), 100)
    },

    submitHumanBid: (bid: number) => {
      const { state } = get()
      if (!state || state.phase !== 'BIDDING') return

      const currentPlayer = state.players[state.currentPlayerSeat]
      if (currentPlayer.type !== 'HUMAN') return

      try {
        const updated = submitBid(state, currentPlayer.id, bid)
        const callbacks = getCallbacks()
        callbacks.onLog({
          type: 'BID',
          message: `${currentPlayer.name} apostou ${bid}`,
          timestamp: Date.now(),
          playerId: currentPlayer.id,
        })
        set({ state: updated })
        setTimeout(() => continueLoop(), 100)
      } catch (e) {
        console.error('Invalid bid:', e)
      }
    },

    playHumanCard: (cardId: string) => {
      const { state } = get()
      if (!state || state.phase !== 'PLAYING_TRICK') return

      const currentPlayer = state.players[state.currentPlayerSeat]
      if (currentPlayer.type !== 'HUMAN') return

      try {
        const card = currentPlayer.hand.find((c) => c.id === cardId)
        const updated = playCard(state, currentPlayer.id, cardId)
        const callbacks = getCallbacks()
        callbacks.onLog({
          type: 'PLAY',
          message: `${currentPlayer.name} jogou ${card?.value ?? '?'}${suitSymbol(card?.suit)}`,
          timestamp: Date.now(),
          playerId: currentPlayer.id,
        })
        set({ state: updated })
        setTimeout(() => continueLoop(), 100)
      } catch (e) {
        console.error('Invalid card play:', e)
      }
    },

    sendChatMessage: (playerId: string, message: string) => {
      const { state } = get()
      if (!state) return
      
      const player = state.players.find(p => p.id === playerId)
      if (!player) return
      
      set(s => ({
        chatLog: [...s.chatLog, {
          playerId,
          playerName: player.name,
          message,
          timestamp: Date.now()
        }]
      }))
    },

    reset: () => {
      set({
        state: null,
        status: 'IDLE',
        config: null,
        log: [],
        chatLog: [],
        roundSequence: [],
        roundIndex: 0,
        winnerId: null,
        botMap: new Map(),
      })
    },
  }
})

function suitSymbol(suit?: string): string {
  switch (suit) {
    case 'ZAP': return '♣'
    case 'COPAS': return '♥'
    case 'ESPADA': return '♠'
    case 'OURO': return '♦'
    default: return ''
  }
}
