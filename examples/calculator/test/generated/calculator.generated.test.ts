// Generated from features/calculator.feature.md by gherkin-vitest-codegen.
// Do not edit by hand.
import { describe } from 'vitest'
import { test } from "../support/world"
import { calculatorSteps } from "../steps/calculator.steps"

describe("Feature: Calculator display", () => {
  describe("Rule: Expression and result flow", () => {
    // features/calculator.feature.md:11
    test("View expression during entry", async ({ world }) => {
      const calc = calculatorSteps(world)

      // Given a calculator with an empty display
      await calc.start()
      // When the user enters "12+3" without pressing equals
      await calc.enter("12+3")
      // Then the display shows "12+3"
      await calc.displayShows("12+3")
    })

    // features/calculator.feature.md:16
    test("View result after evaluation", async ({ world }) => {
      const calc = calculatorSteps(world)

      // Given a calculator with an empty display
      await calc.start()
      // When the user enters "12+3" without pressing equals
      await calc.enter("12+3")
      // And the user presses equals
      await calc.pressEquals()
      // Then the display shows "15"
      await calc.displayShows("15")
    })
  })

  describe("Rule: Spanish number presentation", () => {
    // features/calculator.feature.md:33
    test("Display a grouped decimal value (value=1234.56, formatted=1.234,56)", async ({ world }) => {
      const calc = calculatorSteps(world)

      // Given a calculator with an empty display
      await calc.start()
      // When the current value is 1234.56
      await calc.setCurrentValue(1234.56)
      // Then the display shows "1.234,56"
      await calc.displayShows("1.234,56")
    })

    // features/calculator.feature.md:34
    test("Display a grouped decimal value (value=0.5, formatted=0,5)", async ({ world }) => {
      const calc = calculatorSteps(world)

      // Given a calculator with an empty display
      await calc.start()
      // When the current value is 0.5
      await calc.setCurrentValue(0.5)
      // Then the display shows "0,5"
      await calc.displayShows("0,5")
    })

    // features/calculator.feature.md:36
    test("Enter a decimal separator", async ({ world }) => {
      const calc = calculatorSteps(world)

      // Given a calculator with an empty display
      await calc.start()
      // When the user presses the comma button while entering "3"
      await calc.pressCommaAfter("3")
      // Then the display shows "3,"
      await calc.displayShows("3,")
    })
  })

  describe("Rule: Error presentation", () => {
    // features/calculator.feature.md:43
    test("Display invalid result", async ({ world }) => {
      const calc = calculatorSteps(world)

      // Given a calculator with an empty display
      await calc.start()
      // When the user enters "1/0" without pressing equals
      await calc.enter("1/0")
      // And the user presses equals
      await calc.pressEquals()
      // Then the display shows "Error"
      await calc.displayShows("Error")
    })
  })
})
