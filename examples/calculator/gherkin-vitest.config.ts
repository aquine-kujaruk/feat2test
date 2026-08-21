import { defineConfig, definePack } from '../../src/index.ts'

const calculator = definePack({
  id: 'calc',
  factory: 'calculatorSteps',
  importPath: './test/steps/calculator.steps.ts',
})

calculator
  .step(/^a calculator with an empty display$/, () => ({ method: 'start' }))
  .step(/^the user enters "(.+)" without pressing equals$/, ({ captures }) => ({
    method: 'enter',
    args: [required(captures[0])],
  }))
  .step(/^the user presses equals$/, () => ({ method: 'pressEquals' }))
  .step(/^the current value is ([\d.]+)$/, ({ captures }) => ({
    method: 'setCurrentValue',
    args: [Number(required(captures[0]))],
  }))
  .step(/^the user presses the comma button while entering "(.+)"$/, ({ captures }) => ({
    method: 'pressCommaAfter',
    args: [required(captures[0])],
  }))
  .step(/^the display shows "(.*)"$/, ({ captures }) => ({
    method: 'displayShows',
    args: [required(captures[0])],
  }))

export default defineConfig({
  packs: [calculator],
})

function required(value: string | undefined): string {
  if (value === undefined) throw new Error('Expected a regex capture.')
  return value
}
