/**
 * Calculates the forbidden bid for the dealer (pé).
 * The sum of all bids cannot equal the total number of cards in the round.
 * Therefore, dealer bid cannot equal (cardsInRound - otherBidsSum).
 */
export function getForbiddenDealerBid(cardsInRound: number, otherBidsSum: number): number | null {
  const forbidden = cardsInRound - otherBidsSum
  if (forbidden >= 0 && forbidden <= cardsInRound) {
    return forbidden
  }
  return null
}

/**
 * Returns the list of possible valid bids for a player.
 * Valid bids are between 0 and cardsInRound.
 * If the player is the dealer, the forbidden bid is excluded.
 */
export function getValidBids(
  cardsInRound: number,
  isDealer: boolean,
  otherBidsSum: number
): number[] {
  const bids: number[] = []
  const forbidden = isDealer ? getForbiddenDealerBid(cardsInRound, otherBidsSum) : null

  for (let b = 0; b <= cardsInRound; b++) {
    if (b !== forbidden) {
      bids.push(b)
    }
  }

  return bids
}

/**
 * Validates a single player's bid.
 */
export function validateBid(
  bid: number,
  cardsInRound: number,
  isDealer: boolean,
  otherBidsSum: number
): boolean {
  if (bid < 0 || bid > cardsInRound || !Number.isInteger(bid)) {
    return false
  }

  if (isDealer) {
    const forbidden = getForbiddenDealerBid(cardsInRound, otherBidsSum)
    if (bid === forbidden) {
      return false
    }
  }

  return true
}

/**
 * Validates that the total sum of all players' bids is not equal to cardsInRound.
 */
export function validateFinalBidSum(bids: number[], cardsInRound: number): boolean {
  const sum = bids.reduce((acc, val) => acc + val, 0)
  return sum !== cardsInRound
}
