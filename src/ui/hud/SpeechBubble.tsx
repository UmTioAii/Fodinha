import { usePveGameStore } from '@/pve/gameStore'
import { useEffect, useState, useRef } from 'react'

interface SpeechBubbleProps {
  playerId: string
}

export function SpeechBubble({ playerId }: SpeechBubbleProps) {
  const chatLog = usePveGameStore((s) => s.chatLog)
  const [activeMessage, setActiveMessage] = useState<string | null>(null)
  const lastProcessed = useRef<number>(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Find the latest chat message for this player
    const recentChat = [...chatLog].reverse().find((entry) => entry.playerId === playerId)
    
    if (recentChat && recentChat.timestamp > lastProcessed.current) {
      lastProcessed.current = recentChat.timestamp
      setActiveMessage(recentChat.message)
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        setActiveMessage(null)
      }, 4000) // Show bubble for 4 seconds
    }
  }, [chatLog, playerId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  if (!activeMessage) return null

  return (
    <div className="absolute -top-12 left-[80%] z-50 pointer-events-none animate-in zoom-in-50 fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white text-black text-xs font-bold px-3 py-2 rounded-2xl rounded-bl-sm shadow-xl whitespace-nowrap border-2 border-[var(--color-accent)] relative">
        {activeMessage}
        {/* Tail triangle */}
        <div className="absolute -bottom-2 left-1 w-0 h-0 border-l-[6px] border-l-transparent border-t-[8px] border-t-[var(--color-accent)] border-r-[6px] border-r-transparent"></div>
        <div className="absolute -bottom-[5px] left-[6px] w-0 h-0 border-l-[4px] border-l-transparent border-t-[6px] border-t-white border-r-[4px] border-r-transparent"></div>
      </div>
    </div>
  )
}
