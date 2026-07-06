/**
 * Individual card rendering component.
 */
import type { Card } from '@/game-engine/types'
import type { Suit } from '@/shared/constants/cards'

const SUIT_SYMBOLS: Record<Suit, string> = {
  ZAP: '♣',
  COPAS: '♥',
  ESPADA: '♠',
  OURO: '♦',
}

const SUIT_COLORS: Record<Suit, string> = {
  ZAP: '#1a1a2e',
  COPAS: '#dc2626',
  ESPADA: '#1a1a2e',
  OURO: '#dc2626',
}

interface CardComponentProps {
  card: Card
  faceDown?: boolean
  isManilha?: boolean
  isPlayable?: boolean
  isPlayed?: boolean
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export function CardComponent({
  card,
  faceDown = false,
  isManilha = false,
  isPlayable = false,
  isPlayed = false,
  size = 'md',
  onClick,
}: CardComponentProps) {
  const dims = size === 'sm' ? 'w-12 h-18' : size === 'lg' ? 'w-20 h-30' : 'w-16 h-24'
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'

  const suitSymbol = SUIT_SYMBOLS[card.suit]
  const suitColor = SUIT_COLORS[card.suit]

  // Base classes for the card container (button or div)
  const baseClasses = `${dims} rounded-lg border-2 flex flex-col items-center justify-between shrink-0 transition-all duration-200`
  
  // Interactive classes
  const interactiveClasses = isPlayable
    ? 'hover:-translate-y-2 hover:shadow-lg hover:shadow-amber-400/20 cursor-pointer active:scale-95'
    : ''
    
  const playedClasses = isPlayed ? 'opacity-80 scale-95' : ''

  if (faceDown) {
    return (
      <button
        onClick={isPlayable ? onClick : undefined}
        disabled={!isPlayable}
        className={`${baseClasses} ${interactiveClasses} ${playedClasses} border-amber-900/60 p-0 overflow-hidden relative`}
        style={{
          background: 'linear-gradient(135deg, #1a3a5c 0%, #0d2240 50%, #1a3a5c 100%)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        <div className="absolute inset-[4px] rounded border border-amber-700/40 bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(212,175,55,0.08)_3px,rgba(212,175,55,0.08)_6px)]" />
      </button>
    )
  }

  return (
    <button
      onClick={isPlayable ? onClick : undefined}
      disabled={!isPlayable}
      className={`${baseClasses} p-1.5
        ${isManilha ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-gray-300/30'}
        ${interactiveClasses}
        ${playedClasses}
      `}
      style={{
        background: isManilha
          ? 'linear-gradient(180deg, #fffef5 0%, #fef3c7 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #f0efe8 100%)',
        boxShadow: isManilha
          ? '0 0 12px rgba(212,175,55,0.4), 0 2px 8px rgba(0,0,0,0.3)'
          : '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      <span className={`${textSize} font-bold leading-none`} style={{ color: suitColor }}>
        {card.value}
      </span>
      <span className="text-xl leading-none" style={{ color: suitColor }}>
        {suitSymbol}
      </span>
      <span className={`${textSize} font-bold leading-none rotate-180`} style={{ color: suitColor }}>
        {card.value}
      </span>
    </button>
  )
}
