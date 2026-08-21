import { test as base } from 'vitest'
import type { Calculator } from '../../src/calculator'

export interface World {
  calculator?: Calculator
}

export const test = base.extend<{ world: World }>({
  // biome-ignore lint/correctness/noEmptyPattern: Vitest fixtures require destructuring.
  world: async ({}, use) => {
    await use({})
  },
})
