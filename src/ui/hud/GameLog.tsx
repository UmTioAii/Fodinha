/**
 * Scrollable game log — shows recent actions.
 */
import { useEffect, useRef, useState } from 'react'
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
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries.length, isOpen])

  return (
    <div className="relative">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/80 backdrop-blur-sm border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.5)] text-white hover:bg-[var(--color-accent)] hover:text-black transition-all hover:scale-105 active:scale-95 ${isOpen ? 'hidden' : 'block'}`}
        title="Histórico da Partida"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      </button>

      {/* Log Container */}
      <div
        className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-col h-64 md:h-[400px] w-64 md:w-full bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)]`}
      >
        {/* Mobile Header to Close */}
        <div className="md:hidden flex justify-between items-center p-2 bg-black/40 border-b border-white/10 shrink-0">
          <span className="text-xs font-bold text-gray-300">Histórico</span>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3 text-xs space-y-2 scrollbar-thin"
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
      </div>
    </div>
  )
}
