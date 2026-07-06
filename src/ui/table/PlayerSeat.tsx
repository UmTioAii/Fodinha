/**
 * Player seat display around the table.
 */
import type { Player } from '@/game-engine/types'

import { CardComponent } from '@/ui/cards/CardComponent'
import { SpeechBubble } from '@/ui/hud/SpeechBubble'

interface PlayerSeatProps {
  player: Player
  isCurrentTurn: boolean
  isDealer: boolean
  isBlindRound?: boolean
  manilhaValue?: string | null
}

export function PlayerSeat({ player, isCurrentTurn, isDealer, isBlindRound = false, manilhaValue = null }: PlayerSeatProps) {
  return (
    <div className={`relative flex flex-col items-center gap-1 transition-opacity duration-300 ${player.eliminated ? 'opacity-40 grayscale' : 'opacity-100'}`}>
      
      <SpeechBubble playerId={player.id} />

      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
          ${isCurrentTurn ? 'border-amber-400 shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'border-white/20'}
          ${player.type === 'HUMAN' ? 'bg-emerald-800/60' : 'bg-slate-700/60'}
        `}
      >
        {player.name.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <span className="text-xs font-medium truncate max-w-[80px]">
        {player.name}
        {isDealer && <span className="ml-1 text-amber-400">🎴</span>}
      </span>

      {/* Lives */}
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`text-xs ${i < player.lives ? 'text-red-400' : 'text-gray-600/40'}`}
          >
            ♥
          </span>
        ))}
      </div>

      {/* Bid & Tricks */}
      {!player.eliminated && player.bid !== null && (
        <div className="text-xs text-[var(--color-text-muted)] flex gap-2">
          <span>🎯{player.bid}</span>
          <span className="text-amber-300">✓{player.tricksWon}</span>
        </div>
      )}

      {/* Bot cards indicator */}
      {player.type === 'BOT' && !player.eliminated && player.hand.length > 0 && (
        <div className="flex gap-0.5 mt-0.5 relative z-10">
          {isBlindRound ? (
            // Show real cards in blind round (forehead rule)
            player.hand.map((card) => (
              <div key={card.id} className="scale-75 origin-top">
                <CardComponent
                  card={card}
                  size="sm"
                  isManilha={manilhaValue === card.value}
                />
              </div>
            ))
          ) : (
            // Normal hidden cards
            player.hand.map((card) => (
              <div key={card.id} className="scale-75 origin-top">
                <CardComponent
                  card={card}
                  size="sm"
                  faceDown
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
