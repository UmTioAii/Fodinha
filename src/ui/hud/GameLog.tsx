/**
 * Scrollable game log — shows recent actions.
 */
import { useEffect, useRef } from 'react'
import type { GameLogEntry } from '@/pve/types'

const TYPE_COLORS: Record<string, string> = {
  BID: 'text-blue-200 bg-blue-900/30 border border-blue-500/20',
  PLAY: 'text-gray-200 bg-gray-800/50 border border-gray-600/20',
  TRICK_WIN: 'text-emerald-300 bg-emerald-900/30 border border-emerald-500/20',
  LIFE_LOSS: 'text-red-300 bg-red-900/30 border border-red-500/20',
  ELIMINATION: 'text-red-500 font-bold bg-red-950/80 border border-red-500/50',
  ROUND_START: 'text-amber-300 font-bold bg-amber-900/30 border border-amber-500/30',
  GAME_OVER: 'text-amber-400 font-bold bg-amber-900/50 border border-amber-400/50 text-center text-sm p-2',
}

interface GameLogProps {
  entries: GameLogEntry[]
}

export function GameLog({ entries }: GameLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries.length])

  return (
    <div
      ref={scrollRef}
      className="h-64 overflow-y-auto rounded-2xl bg-slate-900/70 backdrop-blur-md border border-white/10 p-3 text-xs space-y-2 scrollbar-thin shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
    >
      {entries.length === 0 && (
        <p className="text-gray-500 text-center italic mt-4">A partida vai começar...</p>
      )}
      {entries.map((entry, i) => (
        <div
          key={i}
          className={`px-3 py-2 rounded-lg shadow-sm transition-all duration-300 animate-in slide-in-from-right-4 fade-in ${TYPE_COLORS[entry.type] || 'text-gray-400 bg-white/5'}`}
        >
          {entry.message}
        </div>
      ))}
    </div>
  )
}
