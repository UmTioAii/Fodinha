import type { GameState } from '@/game-engine/types'
import { getWinningPlay } from '@/game-engine/rules'
import { PlayerSeat } from './PlayerSeat'
import { CardComponent } from '@/ui/cards/CardComponent'

interface TableLayoutProps {
  state: GameState
}

export function TableLayout({ state }: TableLayoutProps) {
  // Order players so Human is at index 0 (bottom of the screen)
  const humanIndex = state.players.findIndex(p => p.type === 'HUMAN')
  const orderedPlayers = humanIndex >= 0 
    ? [...state.players.slice(humanIndex), ...state.players.slice(0, humanIndex)]
    : state.players

  const totalPlayers = orderedPlayers.length

  // Calculate position in an oval table
  // Human is at angle PI/2 (bottom). Next player is to their right (counter-clockwise).
  function getPositionStyle(index: number) {
    if (totalPlayers === 1) return { left: '50%', top: '85%' }

    const angle = (Math.PI / 2) - (index * 2 * Math.PI / totalPlayers)
    
    // Oval radius percentages (keeps them away from the exact edge)
    const rx = 40
    const ry = 35
    
    const x = 50 + rx * Math.cos(angle)
    const y = 50 + ry * Math.sin(angle)
    
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
      position: 'absolute' as const
    }
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto flex items-center justify-center p-4 md:p-8 mt-10">
      {/* The felt table (Oval/Rounded Rectangle) */}
      <div
        className="relative w-full aspect-[4/3] rounded-[4rem] sm:rounded-[6rem] border-[12px] border-[#2c1810]"
        style={{
          background: 'radial-gradient(ellipse at center, #1b6338 0%, #0d381e 100%)',
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.6), 0 20px 40px rgba(0,0,0,0.7)',
        }}
      >
        {/* Seats */}
        {orderedPlayers.map((player, i) => (
          <div key={player.id} style={getPositionStyle(i)} className="z-10">
            <PlayerSeat
              player={player}
              isCurrentTurn={state.currentPlayerSeat === player.seat}
              isDealer={state.dealerSeat === player.seat}
              isBlindRound={state.cardsPerPlayer === 1}
              manilhaValue={state.manilhaRank}
            />
          </div>
        ))}

        {/* Center trick area */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {state.currentTrick.length > 0 && (() => {
            const winningPlay = getWinningPlay(state.currentTrick, state.vira, state.deckMode)
            return (
              <div className="flex items-center justify-center relative w-48 h-48">
                {state.currentTrick.map((play, trickIndex) => {
                  const player = state.players.find((p) => p.id === play.playerId)
                  const isManilha = state.manilhaRank !== null && play.card.value === state.manilhaRank
                  const isWinning = play.card.id === winningPlay.card.id
                  
                  // Slight random rotation for natural feel
                  const rotation = (play.card.id.charCodeAt(0) % 30) - 15
                  
                  return (
                    <div 
                      key={play.card.id} 
                      className={`absolute transition-all duration-300 animate-in zoom-in-50 fade-in ${isWinning ? 'z-50 scale-110 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]' : 'z-10'}`}
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        marginLeft: `${trickIndex * 15}px`,
                        marginTop: isWinning ? '-40px' : `${(trickIndex % 2 === 0 ? 1 : -1) * 10}px`
                      }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold text-white/80 drop-shadow-md bg-black/40 px-1.5 rounded-sm">{player?.name}</span>
                        <CardComponent
                          card={play.card}
                          isManilha={isManilha}
                          size="sm"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {state.currentTrick.length === 0 && state.phase === 'PLAYING_TRICK' && (
            <p className="text-white/30 text-sm font-medium tracking-widest uppercase">Esperando jogadas...</p>
          )}

          {state.phase === 'ROUND_SCORING' && (
            <p className="text-amber-300 text-lg font-bold tracking-widest uppercase animate-pulse drop-shadow-lg">Contando pontos...</p>
          )}

          {state.phase === 'GAME_OVER' && (
            <p className="text-amber-400 text-2xl font-black tracking-widest uppercase drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">Fim de Jogo!</p>
          )}
        </div>
      </div>
    </div>
  )
}
