import { methodContract } from './contracts.js'
import type { FeaturePlan, FeatureScenario, StepCall, StepMethod, StepValue } from './types.js'

export function renderFeatureTest(
  plan: FeaturePlan,
  metadata: string,
  stepAdapterImport: string,
): string {
  const methods = new Map(plan.methods.map((method) => [method.method, method]))
  const groups: Array<
    | { readonly kind: 'scenario'; readonly scenario: FeatureScenario }
    | {
        readonly kind: 'rule'
        readonly ruleId: string
        readonly ruleName: string
        readonly scenarios: FeatureScenario[]
      }
  > = []
  for (const scenario of plan.scenarios) {
    if (scenario.ruleId === undefined) {
      groups.push({ kind: 'scenario', scenario })
      continue
    }
    const previous = groups.at(-1)
    if (previous?.kind === 'rule' && previous.ruleId === scenario.ruleId) {
      previous.scenarios.push(scenario)
      continue
    }
    groups.push({
      kind: 'rule',
      ruleId: scenario.ruleId,
      ruleName: scenario.ruleName ?? '',
      scenarios: [scenario],
    })
  }

  const body = groups.map((group) => {
    if (group.kind === 'scenario') return indent(renderScenario(group.scenario, methods), 1)
    const children = group.scenarios
      .map((scenario) => indent(renderScenario(scenario, methods), 2))
      .join('\n\n')
    return `  describe(${literal(`Rule: ${group.ruleName}`)}, () => {\n${children}\n  })`
  })

  return [
    metadata,
    '// Generated file. Do not edit.',
    "import { describe, test } from 'vitest'",
    `import { createSteps } from ${literal(stepAdapterImport)}`,
    '',
    `describe(${literal(`Feature: ${plan.name}`)}, () => {`,
    body.join('\n\n'),
    '})',
    '',
  ].join('\n')
}

function renderScenario(
  scenario: FeatureScenario,
  methods: ReadonlyMap<string, StepMethod>,
): string {
  const lines = [`// Source line ${scenario.line}`]
  if (scenario.tags.length > 0) lines.push(`// Tags: ${scenario.tags.join(' ')}`)
  lines.push(`test(${literal(scenario.name)}, async () => {`, '  const steps = createSteps()', '')
  for (const call of scenario.calls) {
    const method = methods.get(call.method)
    if (!method) throw new Error(`Missing planned method: ${call.method}`)
    lines.push(`  // ${call.keyword} ${call.text}`)
    lines.push(`  await steps.${call.method}(${renderArguments(call, method)})`)
  }
  lines.push('})')
  return lines.join('\n')
}

function renderArguments(call: StepCall, method: StepMethod): string {
  const contract = methodContract(method)
  if (call.inputs.length === 0) return contract.objectArgument ? '{}' : ''
  if (!contract.objectArgument) return renderValue(call.inputs[0]?.value ?? '')
  const fields = call.inputs.map((input) => `${input.name}: ${renderValue(input.value)}`).join(', ')
  return `{ ${fields} }`
}

function renderValue(value: StepValue): string {
  if (typeof value === 'string') return literal(value)
  if (value.kind === 'dataTable') return JSON.stringify(value.rows)
  return JSON.stringify({
    content: value.content,
    ...(value.mediaType ? { mediaType: value.mediaType } : {}),
  })
}

function literal(value: string): string {
  return JSON.stringify(value)
}

function indent(value: string, levels: number): string {
  const indentation = '  '.repeat(levels)
  return value
    .split('\n')
    .map((line) => (line.length > 0 ? `${indentation}${line}` : ''))
    .join('\n')
}
