import { type PickleStep, PickleStepType } from '@cucumber/messages'
import { CodegenError } from './errors.js'
import { findRow, findScenario, findStep, type LoadedFeature } from './gherkin.js'
import type {
  FeaturePlan,
  FeatureScenario,
  StepCallInput,
  StepMethod,
  StepRole,
  StepVariant,
  Warning,
} from './types.js'

interface DynamicInput {
  readonly end: number
  readonly name: string
  readonly placeholder?: string
  readonly quoted: boolean
  readonly start: number
  readonly value?: string
}

interface MutableMethod {
  readonly firstSeen: number
  readonly identity: string
  readonly method: string
  readonly role: StepRole
  readonly sourceLine: number
  readonly sourceText: string
  readonly variants: StepVariant[]
}

export interface PlanResult {
  readonly plan: FeaturePlan
  readonly warnings: readonly Warning[]
}

const reservedBindings = new Set([
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
  'pendingStep',
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

export function planFeature(feature: LoadedFeature, sourceLabel: string): PlanResult {
  const methods = new Map<string, MutableMethod>()
  const identitiesByMethod = new Map<string, string>()
  const scenarios: FeatureScenario[] = []
  const warnings: Warning[] = []
  const warnedSourceSteps = new Set<string>()
  let firstSeen = 0

  for (const pickle of feature.pickles) {
    const scenario = findScenario(pickle, feature.index)
    const row = findRow(pickle, feature.index)
    let previousRole: StepRole = 'Context'
    const calls = pickle.steps.map((pickleStep) => {
      const sourceStep = findStep(pickleStep.astNodeIds, feature.index)
      const role = stepRole(pickleStep, previousRole)
      previousRole = role
      const dynamic = dynamicInputs(sourceStep.text)
      const names = uniqueNames(dynamic.map((input) => input.name))
      const scalarValues = resolvedDynamicValues(
        sourceStep.text,
        pickleStep.text,
        dynamic,
        row?.cells,
      )
      const inputs: StepCallInput[] = dynamic.map((input, index) => ({
        anonymous: input.placeholder === undefined,
        name: names[index] ?? `value${index + 1}`,
        type: 'string',
        value: scalarValues[index] ?? '',
      }))

      for (const argument of stepArguments(pickleStep)) {
        const name = uniqueName(
          inputs.map((input) => input.name),
          argument.name,
        )
        inputs.push({ anonymous: false, name, type: argument.type, value: argument.value })
      }

      const identityWords = literalWords(sourceStep.text, dynamic)
      const normalizedWords = identityWords.map((word) => word.toLocaleLowerCase('en'))
      const identity = normalizedWords.join(' ') || 'step'
      const existing = methods.get(identity)
      const method = identifier(normalizedWords, 'step')
      const variant = {
        inputs: inputs.map(({ anonymous, name, type }) => ({ anonymous, name, type })),
      }
      if (existing) {
        if (existing.role !== role) {
          throw new CodegenError(
            'CONFLICTING_STEP_ROLE',
            `${sourceLabel}:${sourceStep.line} uses ${method} as both ${existing.role} and ${role}.`,
          )
        }
        if (!existing.variants.some((candidate) => sameVariant(candidate, variant))) {
          existing.variants.push(variant)
        }
      } else {
        const previousIdentity = identitiesByMethod.get(method)
        if (previousIdentity && previousIdentity !== identity) {
          throw new CodegenError(
            'STEP_NAME_COLLISION',
            `${sourceLabel}:${sourceStep.line} produces duplicate Step Name ${method}.`,
          )
        }
        identitiesByMethod.set(method, identity)
        methods.set(identity, {
          firstSeen,
          identity,
          method,
          role,
          sourceLine: sourceStep.line,
          sourceText: sourceStep.text,
          variants: [variant],
        })
        firstSeen += 1
      }

      if (
        dynamic.some((input) => input.placeholder === undefined) &&
        !warnedSourceSteps.has(sourceStep.id)
      ) {
        warnedSourceSteps.add(sourceStep.id)
        warnings.push({
          code: 'ANONYMOUS_STEP_INPUT',
          message: `${sourceLabel}:${sourceStep.line} ${method} uses value/value2 names; prefer Scenario Outline placeholders.`,
        })
      }

      return {
        inputs,
        keyword: sourceStep.keyword,
        method,
        text: pickleStep.text,
      }
    })

    const rowSuffix = row
      ? ` (${row.cells.map(({ name, value }) => `${name}=${value}`).join(', ')})`
      : ''
    scenarios.push({
      calls,
      line: row?.line ?? scenario.line,
      name: `${pickle.name.trim() || scenario.name}${rowSuffix}`,
      ...(scenario.ruleId !== undefined
        ? { ruleId: scenario.ruleId, ruleName: scenario.ruleName ?? '' }
        : {}),
      tags: pickle.tags.map((tag) => tag.name),
    })
  }

  makeScenarioNamesUnique(scenarios)
  const roleOrder: Readonly<Record<StepRole, number>> = { Context: 0, Action: 1, Outcome: 2 }
  const plannedMethods: StepMethod[] = [...methods.values()].sort(
    (left, right) =>
      roleOrder[left.role] - roleOrder[right.role] || left.firstSeen - right.firstSeen,
  )

  return {
    plan: { methods: plannedMethods, name: feature.name, scenarios },
    warnings,
  }
}

function dynamicInputs(text: string): DynamicInput[] {
  const inputs: DynamicInput[] = []
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '<') {
      const end = text.indexOf('>', index + 1)
      if (end > index + 1) {
        const placeholder = text.slice(index + 1, end)
        inputs.push({
          end: end + 1,
          name: inputName(placeholder),
          placeholder,
          quoted: false,
          start: index,
        })
        index = end
      }
      continue
    }
    if (text[index] !== '"' || isEscaped(text, index)) continue

    let end = index + 1
    while (end < text.length) {
      if (text[end] === '"' && !isEscaped(text, end)) break
      end += 1
    }
    if (end >= text.length) continue
    const rawValue = text.slice(index + 1, end)
    const placeholder = rawValue.match(/^<([^>]+)>$/)?.[1]
    inputs.push({
      end: end + 1,
      name: placeholder ? inputName(placeholder) : 'value',
      ...(placeholder ? { placeholder } : { value: unescapeQuoted(rawValue) }),
      quoted: true,
      start: index,
    })
    index = end
  }
  return inputs
}

function literalWords(text: string, inputs: readonly DynamicInput[]): string[] {
  let cursor = 0
  let literal = ''
  for (const input of inputs) {
    literal += `${text.slice(cursor, input.start)} `
    cursor = input.end
  }
  literal += text.slice(cursor)
  return words(literal)
}

function resolvedDynamicValues(
  sourceText: string,
  resolvedText: string,
  inputs: readonly DynamicInput[],
  row:
    | readonly {
        readonly name: string
        readonly value: string
      }[]
    | undefined,
): string[] {
  const fallback = matchResolvedText(sourceText, resolvedText, inputs)
  return inputs.map((input, index) => {
    if (input.placeholder !== undefined) {
      return row?.find((cell) => cell.name === input.placeholder)?.value ?? fallback[index] ?? ''
    }
    const fallbackValue = fallback[index]
    return (
      input.value ??
      (fallbackValue === undefined
        ? ''
        : input.quoted
          ? unescapeQuoted(fallbackValue)
          : fallbackValue)
    )
  })
}

function matchResolvedText(
  sourceText: string,
  resolvedText: string,
  inputs: readonly DynamicInput[],
): readonly string[] {
  let cursor = 0
  let pattern = '^'
  for (const input of inputs) {
    pattern += escapeRegex(sourceText.slice(cursor, input.start))
    pattern += input.quoted ? '"((?:\\\\.|[^"\\\\\\r\\n])*)"' : '([\\s\\S]*?)'
    cursor = input.end
  }
  pattern += `${escapeRegex(sourceText.slice(cursor))}$`
  return new RegExp(pattern).exec(resolvedText)?.slice(1) ?? []
}

function stepArguments(step: PickleStep): Array<{
  readonly name: string
  readonly type: 'dataTable' | 'docString'
  readonly value: StepCallInput['value']
  readonly index: number
}> {
  const argumentsList: Array<{
    readonly name: string
    readonly type: 'dataTable' | 'docString'
    readonly value: StepCallInput['value']
    readonly index: number
  }> = []
  if (step.argument?.docString) {
    const { argumentIndex = Number.MAX_SAFE_INTEGER, content, mediaType } = step.argument.docString
    argumentsList.push({
      index: argumentIndex,
      name: 'docString',
      type: 'docString',
      value: { content, kind: 'docString', ...(mediaType ? { mediaType } : {}) },
    })
  }
  if (step.argument?.dataTable) {
    const { argumentIndex = Number.MAX_SAFE_INTEGER, rows } = step.argument.dataTable
    argumentsList.push({
      index: argumentIndex,
      name: 'dataTable',
      type: 'dataTable',
      value: { kind: 'dataTable', rows: rows.map((row) => row.cells.map((cell) => cell.value)) },
    })
  }
  return argumentsList.sort((left, right) => left.index - right.index)
}

function stepRole(step: PickleStep, previous: StepRole): StepRole {
  if (step.type === PickleStepType.ACTION) return 'Action'
  if (step.type === PickleStepType.OUTCOME) return 'Outcome'
  if (step.type === PickleStepType.CONTEXT) return 'Context'
  return previous
}

function sameVariant(left: StepVariant, right: StepVariant): boolean {
  return (
    left.inputs.length === right.inputs.length &&
    left.inputs.every((input, index) => {
      const candidate = right.inputs[index]
      return candidate?.name === input.name && candidate.type === input.type
    })
  )
}

function uniqueNames(names: readonly string[]): string[] {
  const result: string[] = []
  for (const name of names) result.push(uniqueName(result, name))
  return result
}

function uniqueName(existing: readonly string[], base: string): string {
  let candidate = base
  let suffix = 2
  while (existing.includes(candidate)) {
    candidate = `${base}${suffix}`
    suffix += 1
  }
  return candidate
}

function inputName(value: string): string {
  return identifier(words(value), 'value')
}

function identifier(parts: readonly string[], fallback: string): string {
  const [first, ...rest] = parts
  const base = first ? `${lowerFirst(first)}${rest.map(capitalize).join('')}` : fallback
  const prefixed = /^[$_\p{ID_Start}]/u.test(base) ? base : `${fallback}${capitalize(base)}`
  return reservedBindings.has(prefixed) ? `${prefixed}Value` : prefixed
}

export function pascalIdentifier(value: string): string {
  return capitalize(value)
}

function words(value: string): string[] {
  return (
    value
      .normalize('NFKD')
      .replaceAll(/\p{M}/gu, '')
      .match(/[\p{L}\p{N}]+/gu) ?? []
  )
}

function capitalize(value: string): string {
  return value.length === 0 ? value : `${value[0]?.toLocaleUpperCase('en')}${value.slice(1)}`
}

function lowerFirst(value: string): string {
  return value.length === 0 ? value : `${value[0]?.toLocaleLowerCase('en')}${value.slice(1)}`
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isEscaped(value: string, index: number): boolean {
  let backslashes = 0
  for (let cursor = index - 1; cursor >= 0 && value[cursor] === '\\'; cursor -= 1) {
    backslashes += 1
  }
  return backslashes % 2 === 1
}

function unescapeQuoted(value: string): string {
  return value.replace(/\\(["\\])/g, '$1')
}

function makeScenarioNamesUnique(scenarios: FeatureScenario[]): void {
  const used = new Set<string>()
  for (let index = 0; index < scenarios.length; index += 1) {
    const scenario = scenarios[index]
    if (!scenario) continue
    const base = scenario.name
    let name = base
    let suffix = 2
    while (used.has(name)) {
      name = `${base} #${suffix}`
      suffix += 1
    }
    used.add(name)
    if (name !== base) scenarios[index] = { ...scenario, name }
  }
}
