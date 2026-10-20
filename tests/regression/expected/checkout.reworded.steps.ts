// Synced by feat2test. Matching step implementations are preserved.

export function createSteps() {
  return {
    // Context
    theShopSells(table: string[][]): void {
      // theShopSells implemented
    },
    theBasketHoldsOf(quantity: string, product: string): void {
      // theBasketHoldsOf implemented
    },
    isOutOfStock(product: string): void {
      // isOutOfStock implemented
    },
    theBasketHolds3Pencils(): void {
      // theBasketHolds3Pencils implemented
    },
    theCustomerSCafeCardIs(card: string): void {
      // theCustomerSCafeCardIs implemented
    },
    deliveryClassIs(classStep: string): void {
      // deliveryClassIs implemented
    },

    // Action
    theCustomerChecksOut(): void {
      // theCustomerChecksOut implemented
    },
    theCustomerAsksForTheTotal(): void {
      // theCustomerAsksForTheTotal implemented
    },

    // Outcome
    theReceiptReadsEURAndTheCardIsChargedEUR(total: string): void {
      // theReceiptReadsEURAndTheCardIsChargedEUR implemented
    },
    theBasketIsEmpty(): void {
      // theBasketIsEmpty implemented
    },
    checkoutIsRejectedWith(text: string): void {
      // checkoutIsRejectedWith implemented
    },
    theBasketStillHoldsOf(quantity: string, product: string): void {
      // theBasketStillHoldsOf implemented
    },
    theTotalDisplayedIs450EUR(): void {
      throw new Error('PENDING: theTotalDisplayedIs450EUR')
    },
    theBasketStillHolds3Pencils(): void {
      // theBasketStillHolds3Pencils implemented
    },
    theDeliveryFeeIsEUR(fee: string): void {
      // theDeliveryFeeIsEUR implemented
    },
  }
}
