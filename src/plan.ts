import { PickleStepType } from '@cucumber/messages'
import { CodegenError } from './errors.js'
import type { ParsedFeature } from './parse.js'
import type {
  FeaturePlan,
  PlannedScenario,
  StepCall,
  StepDefinition,
  StepParam,
  StepRole,
  StepValue,
} from './types.js'

const PLACEHOLDER = /<([^<>]+)>/g
const RESERVED = new Set([
  'arguments',
  'await',
  'case',
  'catch',
  'class',
  'const',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'eval',
  'export',
  'extends',
  'false',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'let',
  'new',
  'null',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
])
const ROLE_ORDER: readonly StepRole[] = ['Context', 'Action', 'Outcome']

/**
 * Turns compiled pickles into the two things the renderers need: the ordered
 * scenarios, and the distinct step methods they call.
 */
export function planFeature(feature: ParsedFeature, label: string): FeaturePlan {
  const steps = new Map<string, StepDefinition>()
  const scenarios: PlannedScenario[] = []

  for (const pickle of feature.pickles) {
    const scenarioId = pickle.astNodeIds.find((id) => feature.scenarios.has(id))
    const scenario = scenarioId ? feature.scenarios.get(scenarioId) : undefined
    if (!scenario) throw new CodegenError('INVALID_GHERKIN', `${label} has an unlinked scenario.`)
    const row = pickle.astNodeIds.map((id) => feature.rows.get(id)).find(Boolean)

    let role: StepRole = 'Context'
    const calls: StepCall[] = []

    for (const pickleStep of pickle.steps) {
      const sourceId = pickleStep.astNodeIds.find((id) => feature.steps.has(id))
      const source = sourceId ? feature.steps.get(sourceId) : undefined
      if (!source) throw new CodegenError('INVALID_GHERKIN', `${label} has an unlinked step.`)
      role = roleOf(pickleStep.type, role)

      const params: StepParam[] = []
      const values: StepValue[] = []
      for (const name of placeholderNames(source.text)) {
        const value = row?.get(name)
        if (value === undefined) {
          throw new CodegenError(
            'UNKNOWN_PLACEHOLDER',
            `${label} step "${source.text}" uses <${name}>, which no Examples column provides.`,
          )
        }
        params.push({ name: identifier(name), type: 'string' })
        values.push(value)
      }
      const table = pickleStep.argument?.dataTable
      const docString = pickleStep.argument?.docString
      if (table) {
        params.push({ name: 'table', type: 'string[][]' })
        values.push(table.rows.map((tableRow) => tableRow.cells.map((cell) => cell.value)))
      } else if (docString) {
        params.push({ name: 'text', type: 'string' })
        values.push(docString.content)
      }

      const method = identifier(literalWords(source.text))
      define(steps, { method, params, role }, source.text, label)
      calls.push({ keyword: source.keyword, method, text: pickleStep.text, values })
    }

    scenarios.push({
      calls,
      line: scenario.line,
      name: pickle.name.trim() || scenario.name,
      ...(scenario.rule ? { rule: scenario.rule } : {}),
    })
  }

  return {
    name: feature.name,
    scenarios: withUniqueNames(scenarios),
    steps: [...steps.values()].sort(
      (left, right) => ROLE_ORDER.indexOf(left.role) - ROLE_ORDER.indexOf(right.role),
    ),
  }
}

/** A step's literal words are its identity, so the same words must mean the same method. */
function define(
  steps: Map<string, StepDefinition>,
  step: StepDefinition,
  text: string,
  label: string,
): void {
  const existing = steps.get(step.method)
  if (!existing) {
    steps.set(step.method, step)
    return
  }
  if (existing.role !== step.role) {
    throw new CodegenError(
      'CONFLICTING_STEP_ROLE',
      `${label} uses "${text}" as both ${existing.role} and ${step.role}.`,
    )
  }
  if (signature(existing.params) !== signature(step.params)) {
    throw new CodegenError(
      'CONFLICTING_STEP_INPUTS',
      `${label} uses "${text}" with different inputs: (${signature(existing.params)}) and (${signature(step.params)}).`,
    )
  }
}

function signature(params: readonly StepParam[]): string {
  return params.map((param) => `${param.name}: ${param.type}`).join(', ')
}

function placeholderNames(text: string): string[] {
  const names: string[] = []
  for (const [, name] of text.matchAll(PLACEHOLDER)) {
    if (name && !names.includes(name)) names.push(name)
  }
  return names
}

function literalWords(text: string): string {
  return text.replaceAll(PLACEHOLDER, ' ')
}

function identifier(value: string): string {
  const parts =
    value
      .normalize('NFKD')
      .replaceAll(/\p{M}/gu, '')
      .match(/[\p{L}\p{N}]+/gu) ?? []
  const [first, ...rest] = parts
  const name = first
    ? `${first[0]?.toLowerCase()}${first.slice(1)}${rest.map(capitalize).join('')}`
    : 'step'
  const safe = /^[\p{L}_$]/u.test(name) ? name : `step${name}`
  return RESERVED.has(safe) ? `${safe}Step` : safe
}

function capitalize(value: string): string {
  return `${value[0]?.toUpperCase()}${value.slice(1)}`
}

function roleOf(type: PickleStepType | undefined, previous: StepRole): StepRole {
  if (type === PickleStepType.CONTEXT) return 'Context'
  if (type === PickleStepType.ACTION) return 'Action'
  if (type === PickleStepType.OUTCOME) return 'Outcome'
  return previous
}

/** Outline rows often share a title; test reports read better with distinct names. */
function withUniqueNames(scenarios: readonly PlannedScenario[]): PlannedScenario[] {
  const seen = new Map<string, number>()
  return scenarios.map((scenario) => {
    const count = (seen.get(scenario.name) ?? 0) + 1
    seen.set(scenario.name, count)
    return count === 1 ? scenario : { ...scenario, name: `${scenario.name} #${count}` }
  })
}
