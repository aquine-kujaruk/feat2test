import { expect } from 'vitest'
import { Calculator } from '../../src/calculator'

export function calculatorSteps() {
  let calculatorInstance: Calculator | undefined
  const calculator = () => {
    if (!calculatorInstance) throw new Error('Calculator has not been started.')
    return calculatorInstance
  }

  return {
    start(): void {
      calculatorInstance = new Calculator()
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
