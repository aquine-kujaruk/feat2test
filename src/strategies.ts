import { CodegenError } from './errors.js'
import { renderTest } from './render.js'
import type { FeaturePlan } from './types.js'

export interface TestStrategy {
  readonly name: string
  readonly description: string
  render(plan: FeaturePlan, adapterStem: string): string
}

export const strategies = [
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
] as const satisfies readonly TestStrategy[]

export type StrategyName = (typeof strategies)[number]['name']

export function resolveStrategy(name: string): TestStrategy {
  const strategy = strategies.find((candidate) => candidate.name === name)
  if (!strategy) {
    throw new CodegenError(
      'UNKNOWN_STRATEGY',
      `Unknown strategy "${name}". Available: ${strategies.map((item) => item.name).join(', ')}.`,
    )
  }
  return strategy
}
