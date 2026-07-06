import type { Player } from '@/game-engine/types'

/**
 * Calculates lives lost for each player in the round.
 * If tricks won != bid, player loses 1 life.
 */
export function scoreRound(players: Player[]): Player[] {
  return players.map((p) => {
    if (p.eliminated) return p
    const matchedBid = p.tricksWon === p.bid
    const nextLives = matchedBid ? p.lives : Math.max(0, p.lives - 1)
    return { ...p, lives: nextLives }
  })
}

export const applyLifeLosses = scoreRound

/**
 * Eliminates players whose lives have reached 0.
 */
export function eliminatePlayers(players: Player[]): Player[] {
  return players.map((p) => {
    if (p.lives <= 0 && !p.eliminated) {
      return { ...p, eliminated: true, hand: [] }
    }
    return p
  })
}

/**
 * Checks if the game is over.
 */
export function checkGameOver(players: Player[]): {
  isGameOver: boolean
  winnerId: string | null
} {
  const activePlayers = players.filter((p) => !p.eliminated)

  if (activePlayers.length === 1) {
    return { isGameOver: true, winnerId: activePlayers[0].id }
  }

  if (activePlayers.length === 0) {
    return { isGameOver: true, winnerId: null }
  }

  return { isGameOver: false, winnerId: null }
}
