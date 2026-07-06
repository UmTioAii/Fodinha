/**
 * Shared engine utilities — no dependency on state, tricks, scoring, etc.
 */
import type { Player } from '@/game-engine/types'

/**
 * Returns the next active (non-eliminated) player's seat in the round.
 */
export function getNextActiveSeat(currentSeat: number, players: Player[]): number {
  if (players.length === 0) return currentSeat
  let nextSeat = (currentSeat + 1) % players.length
  for (let i = 0; i < players.length; i++) {
    if (!players[nextSeat].eliminated) {
      return nextSeat
    }
    nextSeat = (nextSeat + 1) % players.length
  }
  return currentSeat
}

/**
 * Returns only the active (non-eliminated) players.
 */
export function getActivePlayers(players: Player[]): Player[] {
  return players.filter((p) => !p.eliminated)
}
