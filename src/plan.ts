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
const NAME_COMMENT = /<!--(.*?)-->/gs
const STEP_NAME = /^[a-z][A-Za-z0-9]*$/
const RESERVED = new Set([
  'arguments',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'eval',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
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
      const where = `${label}:${source.line}`
      const { name: method, words } = splitStepName(source.text, where)

      const params: StepParam[] = []
      const values: StepValue[] = []
      for (const name of placeholderNames(words)) {
        const value = row?.get(name)
        if (value === undefined) {
          throw new CodegenError(
            'UNKNOWN_PLACEHOLDER',
            `${where} step "${words}" uses <${name}>, which no Examples column provides.`,
          )
        }
        params.push({ name: paramName(name), type: 'string' })
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

      define(steps, { method, params, role }, words, where)
      // The name was validated as the final comment, so it is also the pickle text's last one.
      const text = pickleStep.text.slice(0, pickleStep.text.lastIndexOf('<!--')).trimEnd()
      calls.push({ keyword: source.keyword, method, text, values })
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

/**
 * A step ends with one HTML comment naming its adapter method, as in
 * `<quantity> units are added <!-- addUnits -->`. The words before it are documentation.
 */
function splitStepName(text: string, where: string): { name: string; words: string } {
  const start = text.lastIndexOf('<!--')
  if (start === -1) {
    throw new CodegenError(
      'MISSING_STEP_NAME',
      `${where} step "${text}" has no method name. End it with one, such as <!-- addUnits -->.`,
    )
  }
  const words = text.slice(0, start).trimEnd()
  const marker = /^<!--(.*)-->$/s.exec(text.slice(start))
  if (!marker || words.includes('<!--')) {
    const found = [...text.matchAll(NAME_COMMENT)].map(([, name]) => `"${name?.trim()}"`)
    throw new CodegenError(
      'INVALID_STEP_NAME',
      `${where} step "${text}" must end with exactly one <!-- name --> comment; found ${found.join(', ') || 'an unclosed comment'}.`,
    )
  }
  const name = marker[1]?.trim() ?? ''
  if (!STEP_NAME.test(name) || RESERVED.has(name)) {
    throw new CodegenError(
      'INVALID_STEP_NAME',
      `${where} step "${words}" names its method "${name}", which ${
        RESERVED.has(name)
          ? 'is a reserved word'
          : 'is not a camelCase identifier: a lowercase ASCII letter, then ASCII letters or digits'
      }.`,
    )
  }
  return { name, words }
}

/** A step's name is its identity, so every step with that name calls the same method. */
function define(
  steps: Map<string, StepDefinition>,
  step: StepDefinition,
  words: string,
  where: string,
): void {
  const existing = steps.get(step.method)
  if (!existing) {
    steps.set(step.method, step)
    return
  }
  if (existing.role !== step.role) {
    throw new CodegenError(
      'CONFLICTING_STEP_ROLE',
      `${where} uses ${step.method} ("${words}") as both ${existing.role} and ${step.role}.`,
    )
  }
  if (signature(existing.params) !== signature(step.params)) {
    throw new CodegenError(
      'CONFLICTING_STEP_INPUTS',
      `${where} uses ${step.method} ("${words}") with different inputs: (${signature(existing.params)}) and (${signature(step.params)}).`,
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

/** Placeholder names are Examples headers the author controls; only make them valid parameters. */
function paramName(placeholder: string): string {
  const name = placeholder.normalize('NFKD').replaceAll(/[^\p{L}\p{N}_$]/gu, '')
  const safe = /^[\p{L}_$]/u.test(name)
    ? `${name[0]?.toLowerCase()}${name.slice(1)}`
    : `step${name}`
  return RESERVED.has(safe) ? `${safe}Step` : safe
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
