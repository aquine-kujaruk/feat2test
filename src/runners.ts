import { CodegenError } from './errors.js'
import { renderTest } from './render.js'
import type { FeaturePlan } from './types.js'

export interface TestRunner {
  readonly name: string
  readonly description: string
  render(plan: FeaturePlan, adapterStem: string): string
}

export const runners = [
  {
    name: 'vitest',
    description: 'Vitest 3.2 / 4 · install vitest in your project',
    render: (plan: FeaturePlan, adapterStem: string) =>
      renderTest(plan, `${adapterStem}.js`, 'vitest'),
  },
  {
    name: 'node:test',
    description: 'Node.js built-in test runner · no runner dependency',
    render: (plan: FeaturePlan, adapterStem: string) =>
      renderTest(plan, `${adapterStem}.ts`, 'node:test'),
  },
] as const satisfies readonly TestRunner[]

export type RunnerName = (typeof runners)[number]['name']

export function resolveRunner(name: string): TestRunner {
  const runner = runners.find((candidate) => candidate.name === name)
  if (!runner) {
    throw new CodegenError(
      'UNKNOWN_RUNNER',
      `Unknown runner "${name}". Available: ${runners.map((item) => item.name).join(', ')}.`,
    )
  }
  return runner
}
