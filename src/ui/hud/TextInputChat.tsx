import { useState, useRef, useEffect } from 'react'
import { usePveGameStore } from '@/pve/gameStore'

export function TextInputChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const state = usePveGameStore(s => s.state)
  const chatLog = usePveGameStore(s => s.chatLog)
  const sendChatMessage = usePveGameStore(s => s.sendChatMessage)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatLog])
  
  if (!state) return null
  const humanPlayer = state.players.find(p => p.type === 'HUMAN')
  if (!humanPlayer || humanPlayer.eliminated) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = message.trim()
    if (trimmed && humanPlayer) {
      sendChatMessage(humanPlayer.id, trimmed)
      setMessage('')
    }
  }

  return (
    <div className="relative pointer-events-auto z-50">
      {/* The Chat Panel (Hidden on mobile unless open, always visible on md+) */}
      <div className={`flex-col bg-black/80 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.8)] w-64 md:w-72 transition-all duration-300 ${isOpen ? 'flex h-64' : 'hidden md:flex h-48'}`}>
        
        {/* Mobile Header to Close */}
        <div className="md:hidden flex justify-between items-center p-2 bg-black/40 border-b border-white/10">
          <span className="text-xs font-bold text-gray-300">Chat da Partida</span>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Chat History */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 text-[11px] md:text-xs"
        >
          {chatLog.length === 0 ? (
            <p className="text-gray-500/50 italic text-center mt-4">O chat está vazio.</p>
          ) : (
            chatLog.map((chat, idx) => (
              <div key={idx} className="flex gap-1.5 leading-tight">
                <span className={`font-bold shrink-0 ${chat.playerId === humanPlayer.id ? 'text-[var(--color-accent)]' : 'text-gray-300'}`}>
                  {chat.playerName}:
                </span>
                <span className="text-gray-200 break-words flex-1">
                  {chat.message}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center bg-black/40 border-t border-white/5 shrink-0">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Falar no chat..."
            className="flex-1 bg-transparent text-sm text-white px-3 py-2 outline-none placeholder:text-gray-500"
            maxLength={60}
          />
          <button 
            type="submit" 
            disabled={!message.trim()}
            className="px-2 py-2 text-[var(--color-accent)] disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Mobile Toggle Button (Visible only on mobile) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`md:hidden flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800/80 backdrop-blur-sm border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.5)] text-white hover:bg-[var(--color-accent)] hover:text-black transition-all hover:scale-105 active:scale-95 ${isOpen ? 'hidden' : 'block absolute bottom-0 left-0'}`}
        title="Abrir Chat Livre"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      </button>
    </div>
  )
}
