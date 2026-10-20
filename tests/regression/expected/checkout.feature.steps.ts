// Synced by feat2test. Matching step implementations are preserved.

export function createSteps() {
  return {
    // Context
    shopSells(table: string[][]): void {
      throw new Error('PENDING: shopSells')
    },
    basketHolds(quantity: string, product: string): void {
      throw new Error('PENDING: basketHolds')
    },
    productOutOfStock(product: string): void {
      throw new Error('PENDING: productOutOfStock')
    },
    basketHoldsThreePencils(): void {
      throw new Error('PENDING: basketHoldsThreePencils')
    },
    customerCard(card: string): void {
      throw new Error('PENDING: customerCard')
    },
    deliveryClass(classStep: string): void {
      throw new Error('PENDING: deliveryClass')
    },

    // Action
    checkOut(): void {
      throw new Error('PENDING: checkOut')
    },
    requestTotal(): void {
      throw new Error('PENDING: requestTotal')
    },

    // Outcome
    totalCharged(total: string): void {
      throw new Error('PENDING: totalCharged')
    },
    basketIsEmpty(): void {
      throw new Error('PENDING: basketIsEmpty')
    },
    checkoutRejected(text: string): void {
      throw new Error('PENDING: checkoutRejected')
    },
    basketStillHolds(quantity: string, product: string): void {
      throw new Error('PENDING: basketStillHolds')
    },
    totalShown(): void {
      throw new Error('PENDING: totalShown')
    },
    basketStillHoldsThreePencils(): void {
      throw new Error('PENDING: basketStillHoldsThreePencils')
    },
    deliveryFee(fee: string): void {
      throw new Error('PENDING: deliveryFee')
    },
  }
}
