import { useState } from 'react'
import { QUICK_CHATS } from '@/pve/types'
import { usePveGameStore } from '@/pve/gameStore'

export function ChatBox() {
  const [isOpen, setIsOpen] = useState(false)
  const state = usePveGameStore(s => s.state)
  const sendChatMessage = usePveGameStore(s => s.sendChatMessage)
  
  if (!state) return null
  
  const humanPlayer = state.players.find(p => p.type === 'HUMAN')
  if (!humanPlayer || humanPlayer.eliminated) return null

  function handleSend(msg: string) {
    if (humanPlayer) {
      sendChatMessage(humanPlayer.id, msg)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative pointer-events-auto z-50">
      {/* Quick Chat Menu */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-48 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="p-2 border-b border-white/10 text-xs font-bold text-gray-400 bg-black/40">
            Falas Rápidas
          </div>
          <div className="max-h-60 overflow-y-auto scrollbar-thin flex flex-col">
            {QUICK_CHATS.map((chat, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chat)}
                className="text-left px-3 py-2 text-xs text-gray-200 hover:bg-[var(--color-accent)] hover:text-black transition-colors border-b border-white/5 last:border-0"
              >
                {chat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800/80 backdrop-blur-sm border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.5)] text-white hover:bg-[var(--color-accent)] hover:text-black transition-all hover:scale-105 active:scale-95"
        title="Chat Rápido"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
        </svg>
      </button>
    </div>
  )
}
