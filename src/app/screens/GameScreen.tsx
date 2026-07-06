import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePveGameStore } from '@/pve/gameStore'
import { TableLayout } from '@/ui/table/TableLayout'
import { HandDisplay } from '@/ui/cards/HandDisplay'
import { BidSelector } from '@/ui/hud/BidSelector'
import { RoundInfo } from '@/ui/hud/RoundInfo'
import { GameLog } from '@/ui/hud/GameLog'
import { ChatBox } from '@/ui/hud/ChatBox'
import { TextInputChat } from '@/ui/hud/TextInputChat'

export function GameScreen() {
  const navigate = useNavigate()
  const { state, status, log, submitHumanBid, playHumanCard, reset } = usePveGameStore()

  useEffect(() => {
    // If someone navigates to /jogo directly without configuring a match, send them back
    if (status === 'IDLE') {
      navigate('/jogar')
    }
  }, [status, navigate])

  if (!state || status === 'IDLE') {
    return null
  }

  const humanPlayer = state.players.find((p) => p.type === 'HUMAN')
  const isHumanTurn =
    !humanPlayer?.eliminated &&
    state.currentPlayerSeat === humanPlayer?.seat &&
    (state.phase === 'BIDDING' || state.phase === 'PLAYING_TRICK')

  const isBiddingPhase = state.phase === 'BIDDING'
  const isDealer = state.dealerSeat === humanPlayer?.seat
  const otherBidsSum = state.players
    .filter((p) => p.type !== 'HUMAN' && p.bid !== null)
    .reduce((sum, p) => sum + (p.bid ?? 0), 0)

  function handleLeave() {
    if (confirm('Tem certeza que deseja abandonar a partida? O progresso será perdido.')) {
      reset()
      navigate('/jogar')
    }
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-[var(--color-bg)] overflow-hidden">
      {/* Header HUD */}
      <header className="p-4 w-full absolute top-0 left-0 flex justify-between items-start z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <button
            onClick={handleLeave}
            className="cursor-pointer px-3 md:px-4 py-2 rounded-xl bg-slate-900/60 backdrop-blur-md border border-red-500/30 font-bold text-red-400 hover:text-white hover:bg-red-900/80 transition-colors shadow-lg"
            title="Abandonar Partida"
          >
            <span className="md:hidden text-lg leading-none">🚪</span>
            <span className="hidden md:inline text-xs">← ABANDONAR PARTIDA</span>
          </button>
        </div>
        <div className="pointer-events-auto shadow-2xl flex-1 flex justify-center px-2">
          <RoundInfo state={state} />
        </div>
        <div className="pointer-events-auto absolute top-4 right-4 md:static md:w-72 shadow-2xl z-50">
          <GameLog entries={log} />
        </div>
      </header>

      {/* Main Table Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 overflow-y-auto">
        <TableLayout state={state} />
      </main>

      {/* Player Input Area (Bottom) */}
      <footer className="w-full h-40 bg-black/50 border-t border-white/5 relative flex justify-center pb-6">

        {humanPlayer && !humanPlayer.eliminated && (
          <>
            <div className={`w-full max-w-3xl transition-opacity duration-300 ${!isHumanTurn && state.phase === 'PLAYING_TRICK' ? 'opacity-60' : 'opacity-100'}`}>
              <HandDisplay
                cards={humanPlayer.hand}
                manilhaValue={state.manilhaRank as any}
                isMyTurn={isHumanTurn && state.phase === 'PLAYING_TRICK'}
                isBlind={state.cardsPerPlayer === 1}
                onPlayCard={playHumanCard}
              />
            </div>

            {isBiddingPhase && isHumanTurn && (
              <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300">
                <div className="shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-2xl">
                  <BidSelector
                    cardsPerPlayer={state.cardsPerPlayer}
                    otherBidsSum={otherBidsSum}
                    isDealer={isDealer}
                    onBid={submitHumanBid}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {humanPlayer?.eliminated && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-red-400 font-bold text-xl drop-shadow-md">
              Você foi eliminado! Assistindo...
            </span>
          </div>
        )}

        {state.phase === 'GAME_OVER' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-50">
            <h2 className="text-4xl font-bold text-[var(--color-accent)] mb-4">
              Fim de Jogo
            </h2>
            <p className="text-white mb-6 text-lg">
              {status === 'FINISHED' && log[log.length - 1]?.message}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/jogar')}
                className="px-6 py-3 rounded-lg bg-[var(--color-accent)] text-black font-bold hover:scale-105 transition-transform"
              >
                Jogar Novamente
              </button>
              <button
                onClick={() => { reset(); navigate('/') }}
                className="px-6 py-3 rounded-lg bg-gray-700 text-white font-bold hover:scale-105 transition-transform"
              >
                Menu Principal
              </button>
            </div>
          </div>
        )}

        {/* Text Input Chat (Bottom Left, above footer) */}
        <div className="absolute left-4 md:left-8 bottom-full mb-4 z-50">
          <TextInputChat />
        </div>


        {/* Chat Box (Bottom Right, next to cards) */}
        <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-50">
          <ChatBox />
        </div>
      </footer>
    </div>
  )
}
