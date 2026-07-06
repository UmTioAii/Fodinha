/**
 * Bid selection UI — shown during BIDDING phase when it's the human's turn.
 */
import { getValidBids } from '@/game-engine/bidding'

interface BidSelectorProps {
  cardsPerPlayer: number
  otherBidsSum: number
  isDealer: boolean
  onBid: (bid: number) => void
}

export function BidSelector({ cardsPerPlayer, otherBidsSum, isDealer, onBid }: BidSelectorProps) {
  const validBids = getValidBids(cardsPerPlayer, isDealer, otherBidsSum)
  const forbiddenBid = isDealer ? cardsPerPlayer - otherBidsSum : null

  return (
    <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-black/40 backdrop-blur border border-white/10">
      <span className="text-sm font-medium text-[var(--color-text-muted)]">
        Quantas vazas você vai fazer?
      </span>

      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: cardsPerPlayer + 1 }, (_, i) => {
          const isValid = validBids.includes(i)
          const isForbidden = forbiddenBid !== null && i === forbiddenBid && forbiddenBid >= 0 && forbiddenBid <= cardsPerPlayer

          return (
            <button
              key={i}
              onClick={() => isValid && onBid(i)}
              disabled={!isValid}
              className={`w-12 h-12 rounded-xl font-bold text-lg transition-all duration-200
                ${isValid
                  ? 'bg-[var(--color-accent)] text-black hover:scale-110 hover:shadow-lg hover:shadow-amber-400/30 active:scale-95'
                  : 'bg-gray-700/40 text-gray-500 cursor-not-allowed'
                }
              `}
              title={isForbidden ? 'Pé não pode completar a soma' : `Apostar ${i}`}
            >
              {i}
            </button>
          )
        })}
      </div>

      {isDealer && forbiddenBid !== null && forbiddenBid >= 0 && forbiddenBid <= cardsPerPlayer && (
        <p className="text-xs text-amber-400/70">
          Você é o pé — não pode apostar {forbiddenBid}
        </p>
      )}
    </div>
  )
}
