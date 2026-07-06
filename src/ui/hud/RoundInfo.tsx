/**
 * Round info HUD — displays current round state.
 */
import type { GameState } from '@/game-engine/types'
import { CardComponent } from '@/ui/cards/CardComponent'

interface RoundInfoProps {
  state: GameState
}

const PHASE_LABELS: Record<string, string> = {
  LOBBY: 'Lobby',
  DEALING: 'Distribuindo...',
  BIDDING: 'Fase de Apostas',
  PLAYING_TRICK: 'Jogando Vaza',
  TRICK_RESOLUTION: 'Resolvendo Vaza...',
  ROUND_SCORING: 'Contando Pontos...',
  ELIMINATION_CHECK: 'Verificando Eliminações...',
  GAME_OVER: 'Fim de Jogo',
}

export function RoundInfo({ state }: RoundInfoProps) {
  return (
    <div className="flex items-center gap-2 md:gap-5 px-3 md:px-6 py-2 md:py-3 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)] text-xs md:text-sm">
      <div className="flex items-center gap-1 md:gap-2">
        <span className="text-[var(--color-text-muted)] hidden md:inline">Rodada</span>
        <span className="md:hidden">🚩</span>
        <span className="font-bold text-[var(--color-accent)]">{state.roundNumber}</span>
      </div>

      <div className="w-px h-4 md:h-5 bg-white/10" />

      <div className="flex items-center gap-1 md:gap-2">
        <span className="text-[var(--color-text-muted)] hidden md:inline">Cartas</span>
        <span className="md:hidden">🃏</span>
        <span className="font-bold">{state.cardsPerPlayer}</span>
      </div>

      <div className="w-px h-4 md:h-5 bg-white/10 hidden md:block" />

      <div className="items-center gap-2 hidden md:flex">
        <span className="text-[var(--color-text-muted)]">Fase</span>
        <span className="font-medium text-emerald-400">
          {PHASE_LABELS[state.phase] || state.phase}
        </span>
      </div>

      {state.vira && (
        <>
          <div className="w-px h-4 md:h-5 bg-white/10" />
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-[var(--color-text-muted)] hidden md:inline">Vira</span>
            <CardComponent card={state.vira} size="sm" />
          </div>
          {state.manilhaRank && (
            <div className="flex items-center gap-1 ml-1 md:ml-0">
              <span className="text-[var(--color-text-muted)] hidden md:inline">Manilha</span>
              <span className="md:hidden text-gray-400 font-bold">M:</span>
              <span className="font-bold text-amber-400">{state.manilhaRank}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
