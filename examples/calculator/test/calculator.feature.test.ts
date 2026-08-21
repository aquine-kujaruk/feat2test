// gherkin-vitest-codegen schema=1
// source=../features/calculator.feature.md
// Generated file. Do not edit.
import { describe, test } from 'vitest'
import { createSteps } from "./calculator.feature.steps"

describe("Feature: Calculator display", () => {
  describe("Rule: Expression and result flow", () => {
    // Source line 11
    test("View expression during entry", async () => {
      const steps = createSteps()

      // Given a calculator with an empty display
      await steps.aCalculatorWithAnEmptyDisplay()
      // When the user enters "12+3" without pressing equals
      await steps.theUserEntersWithoutPressingEquals("12+3")
      // Then the display shows "12+3"
      await steps.theDisplayShows({ value: "12+3" })
    })

    // Source line 16
    test("View result after evaluation", async () => {
      const steps = createSteps()

      // Given a calculator with an empty display
      await steps.aCalculatorWithAnEmptyDisplay()
      // When the user enters "12+3" without pressing equals
      await steps.theUserEntersWithoutPressingEquals("12+3")
      // And the user presses equals
      await steps.theUserPressesEquals()
      // Then the display shows "15"
      await steps.theDisplayShows({ value: "15" })
    })
  })

  describe("Rule: Spanish number presentation", () => {
    // Source line 33
    test("Display a grouped decimal value (value=1234.56, formatted=1.234,56)", async () => {
      const steps = createSteps()

      // Given a calculator with an empty display
      await steps.aCalculatorWithAnEmptyDisplay()
      // When the current value is 1234.56
      await steps.theCurrentValueIs("1234.56")
      // Then the display shows "1.234,56"
      await steps.theDisplayShows({ formatted: "1.234,56" })
    })

    // Source line 34
    test("Display a grouped decimal value (value=0.5, formatted=0,5)", async () => {
      const steps = createSteps()

      // Given a calculator with an empty display
      await steps.aCalculatorWithAnEmptyDisplay()
      // When the current value is 0.5
      await steps.theCurrentValueIs("0.5")
      // Then the display shows "0,5"
      await steps.theDisplayShows({ formatted: "0,5" })
    })

    // Source line 36
    test("Enter a decimal separator", async () => {
      const steps = createSteps()

      // Given a calculator with an empty display
      await steps.aCalculatorWithAnEmptyDisplay()
      // When the user presses the comma button while entering "3"
      await steps.theUserPressesTheCommaButtonWhileEntering("3")
      // Then the display shows "3,"
      await steps.theDisplayShows({ value: "3," })
    })
  })

  describe("Rule: Error presentation", () => {
    // Source line 43
    test("Display invalid result", async () => {
      const steps = createSteps()

      // Given a calculator with an empty display
      await steps.aCalculatorWithAnEmptyDisplay()
      // When the user enters "1/0" without pressing equals
      await steps.theUserEntersWithoutPressingEquals("1/0")
      // And the user presses equals
      await steps.theUserPressesEquals()
      // Then the display shows "Error"
      await steps.theDisplayShows({ value: "Error" })
    })
  })
})
