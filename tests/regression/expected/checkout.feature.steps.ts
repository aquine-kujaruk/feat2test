// Synced by feat2test. Matching step implementations are preserved.

export function createSteps() {
  return {
    // Context
    theShopSells(table: string[][]): void {
      throw new Error('PENDING: theShopSells')
    },
    theBasketHoldsOf(quantity: string, product: string): void {
      throw new Error('PENDING: theBasketHoldsOf')
    },
    isOutOfStock(product: string): void {
      throw new Error('PENDING: isOutOfStock')
    },
    theBasketHolds3Pencils(): void {
      throw new Error('PENDING: theBasketHolds3Pencils')
    },
    theCustomerSCafeCardIs(card: string): void {
      throw new Error('PENDING: theCustomerSCafeCardIs')
    },
    deliveryClassIs(classStep: string): void {
      throw new Error('PENDING: deliveryClassIs')
    },

    // Action
    theCustomerChecksOut(): void {
      throw new Error('PENDING: theCustomerChecksOut')
    },
    theCustomerAsksForTheTotal(): void {
      throw new Error('PENDING: theCustomerAsksForTheTotal')
    },

    // Outcome
    theReceiptReadsEURAndTheCardIsChargedEUR(total: string): void {
      throw new Error('PENDING: theReceiptReadsEURAndTheCardIsChargedEUR')
    },
    theBasketIsEmpty(): void {
      throw new Error('PENDING: theBasketIsEmpty')
    },
    checkoutIsRejectedWith(text: string): void {
      throw new Error('PENDING: checkoutIsRejectedWith')
    },
    theBasketStillHoldsOf(quantity: string, product: string): void {
      throw new Error('PENDING: theBasketStillHoldsOf')
    },
    theTotalShownIs450EUR(): void {
      throw new Error('PENDING: theTotalShownIs450EUR')
    },
    theBasketStillHolds3Pencils(): void {
      throw new Error('PENDING: theBasketStillHolds3Pencils')
    },
    theDeliveryFeeIsEUR(fee: string): void {
      throw new Error('PENDING: theDeliveryFeeIsEUR')
    },
  }
}
