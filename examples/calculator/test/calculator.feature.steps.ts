// gherkin-vitest-codegen schema=1
// source=../features/calculator.feature.md
import { expect } from 'vitest'
import { Calculator } from '../src/calculator'

// gherkin-vitest-codegen:types:start
type TheDisplayShowsType = { value: string } | { formatted: string }
// gherkin-vitest-codegen:types:end

export function createSteps() {
  let calculatorInstance: Calculator | undefined
  const calculator = (): Calculator => {
    if (!calculatorInstance) throw new Error('Calculator has not been started.')
    return calculatorInstance
  }

  return {
    // Context Steps
    aCalculatorWithAnEmptyDisplay(): void {
      calculatorInstance = new Calculator()
    },

    // Action Steps
    theUserEntersWithoutPressingEquals(value: string): void {
      for (const character of value) calculator().press(character)
    },

    theUserPressesEquals(): void {
      calculator().equals()
    },

    theCurrentValueIs(value: string): void {
      calculator().setValue(Number(value))
    },

    theUserPressesTheCommaButtonWhileEntering(value: string): void {
      for (const digit of value) calculator().press(digit)
      calculator().press(',')
    },

    // Outcome Steps
    theDisplayShows(theDisplayShowsType: TheDisplayShowsType): void {
      const expected =
        'value' in theDisplayShowsType ? theDisplayShowsType.value : theDisplayShowsType.formatted
      expect(calculator().display).toBe(expected)
    },
  }
}
