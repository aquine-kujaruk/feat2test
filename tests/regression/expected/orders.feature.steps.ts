// Synced by feat2test. Matching step implementations are preserved.

export function createSteps() {
  return {
    // Context
    theseOrdersExist(table: string[][]): void {
      throw new Error('PENDING: theseOrdersExist')
    },
    everyRequestedProductIsAvailable(): void {
      throw new Error('PENDING: everyRequestedProductIsAvailable')
    },
    productIsUnavailable(product: string): void {
      throw new Error('PENDING: productIsUnavailable')
    },

    // Action
    theCustomerConfirmsOrder(order: string): void {
      throw new Error('PENDING: theCustomerConfirmsOrder')
    },

    // Outcome
    theOrderIsConfirmed(): void {
      throw new Error('PENDING: theOrderIsConfirmed')
    },
    theOrderTotalIs(total: string): void {
      throw new Error('PENDING: theOrderTotalIs')
    },
    confirmationOfOrderIsRejected(order: string): void {
      throw new Error('PENDING: confirmationOfOrderIsRejected')
    },
    theRejectionNamesTheUnavailableProducts(table: string[][]): void {
      throw new Error('PENDING: theRejectionNamesTheUnavailableProducts')
    },
    orderStillHoldsLines(order: string, lines: string): void {
      throw new Error('PENDING: orderStillHoldsLines')
    },
  }
}
