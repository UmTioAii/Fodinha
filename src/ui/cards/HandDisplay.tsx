/**
 * Human player's hand display — fan of cards at the bottom.
 */
import type { Card, CardValue } from '@/game-engine/types'
import { CardComponent } from './CardComponent'

interface HandDisplayProps {
  cards: Card[]
  manilhaValue: CardValue | null
  isMyTurn: boolean
  isBlind?: boolean
  onPlayCard: (cardId: string) => void
}

export function HandDisplay({ cards, manilhaValue, isMyTurn, isBlind = false, onPlayCard }: HandDisplayProps) {
  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-28 text-[var(--color-text-muted)] text-sm">
        Sem cartas na mão
      </div>
    )
  }

  return (
    <div className="flex items-end justify-center gap-1 sm:gap-2 py-2 px-4">
      {cards.map((card, i) => {
        const isManilha = manilhaValue !== null && card.value === manilhaValue
        const rotation = cards.length > 1
          ? (i - (cards.length - 1) / 2) * 4
          : 0

        return (
          <div
            key={card.id}
            className="transition-transform duration-200"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            <CardComponent
              card={card}
              faceDown={isBlind}
              isManilha={isBlind ? false : isManilha}
              isPlayable={isMyTurn}
              size="md"
              onClick={() => onPlayCard(card.id)}
            />
          </div>
        )
      })}
    </div>
  )
}
