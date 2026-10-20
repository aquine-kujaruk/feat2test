// Synced by feat2test. Matching step implementations are preserved.

export function createSteps() {
  return {
    // Context
    ordersExist(table: string[][]): void {
      throw new Error('PENDING: ordersExist')
    },
    allProductsAvailable(): void {
      throw new Error('PENDING: allProductsAvailable')
    },
    productUnavailable(product: string): void {
      throw new Error('PENDING: productUnavailable')
    },

    // Action
    confirmOrder(order: string): void {
      throw new Error('PENDING: confirmOrder')
    },

    // Outcome
    orderConfirmed(): void {
      throw new Error('PENDING: orderConfirmed')
    },
    orderTotal(total: string): void {
      throw new Error('PENDING: orderTotal')
    },
    confirmationRejected(order: string): void {
      throw new Error('PENDING: confirmationRejected')
    },
    rejectionNamesProducts(table: string[][]): void {
      throw new Error('PENDING: rejectionNamesProducts')
    },
    orderStillHoldsLines(order: string, lines: string): void {
      throw new Error('PENDING: orderStillHoldsLines')
    },
  }
}
