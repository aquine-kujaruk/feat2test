import { expect } from 'vitest'
import { Calculator } from '../../src/calculator'
import type { World } from '../support/world'

export function calculatorSteps(world: World) {
  const calculator = () => {
    if (!world.calculator) throw new Error('Calculator has not been started.')
    return world.calculator
  }

  return {
    start(): void {
      world.calculator = new Calculator()
    },
    enter(input: string): void {
      for (const character of input) calculator().press(character)
    },
    pressEquals(): void {
      calculator().equals()
    },
    setCurrentValue(value: number): void {
      calculator().setValue(value)
    },
    pressCommaAfter(digits: string): void {
      for (const digit of digits) calculator().press(digit)
      calculator().press(',')
    },
    displayShows(expected: string): void {
      expect(calculator().display).toBe(expected)
    },
  }
}
