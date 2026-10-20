// Synced by feat2test. Matching step implementations are preserved.

export function createSteps() {
  return {
    // Context
    shopSells(table: string[][]): void {
      // shopSells implemented
    },
    basketHolds(quantity: string, product: string): void {
      // basketHolds implemented
    },
    productOutOfStock(product: string): void {
      // productOutOfStock implemented
    },
    basketHoldsThreePencils(): void {
      // basketHoldsThreePencils implemented
    },
    customerCard(card: string): void {
      // customerCard implemented
    },
    deliveryClass(classStep: string): void {
      // deliveryClass implemented
    },

    // Action
    checkOut(): void {
      // checkOut implemented
    },
    requestTotal(): void {
      // requestTotal implemented
    },

    // Outcome
    totalCharged(total: string): void {
      // totalCharged implemented
    },
    basketIsEmpty(): void {
      // basketIsEmpty implemented
    },
    checkoutRejected(text: string): void {
      // checkoutRejected implemented
    },
    basketStillHolds(quantity: string, product: string): void {
      // basketStillHolds implemented
    },
    totalDisplayed(): void {
      throw new Error('PENDING: totalDisplayed')
    },
    basketStillHoldsThreePencils(): void {
      // basketStillHoldsThreePencils implemented
    },
    deliveryFee(fee: string): void {
      // deliveryFee implemented
    },
  }
}
