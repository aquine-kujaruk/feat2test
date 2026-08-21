import path from 'node:path'
import type { Pickle, PickleStep, PickleStepType } from '@cucumber/messages'
import { assertCodegen, CodegenError } from './errors.js'
import { findRow, findScenario, type LoadedFeature, type StepMetadata } from './gherkin.js'
import { assertIdentifier } from './pack.js'
import type {
  JsonValue,
  PickleArgument,
  ResolvedCodegenConfig,
  StepDefinition,
  StepEmitterContext,
  StepInvocation,
  StepPack,
} from './types.js'

interface RegisteredStep {
  readonly pack: StepPack
  readonly definition: StepDefinition
}

interface ResolvedStep {
  readonly pack: StepPack
  readonly invocation: StepInvocation
  readonly source: StepMetadata
}

interface RenderedScenario {
  readonly code: string
  readonly ruleName?: string
  readonly packs: readonly StepPack[]
}

export interface RenderState {
  readonly usedDefinitions: Set<StepDefinition>
}

export function renderFeature(
  feature: LoadedFeature,
  outputPath: string,
  config: ResolvedCodegenConfig,
  state: RenderState,
): string {
  const registry = config.packs.flatMap((pack) =>
    pack.definitions.map((definition) => ({ pack, definition })),
  )
  const titleCounts = countTitles(feature.pickles)
  const seenTitles = new Map<string, number>()
  const rendered = feature.pickles.map((pickle) => {
    const baseTitle = titleFor(pickle, feature, (titleCounts.get(pickle.name) ?? 0) > 1)
    const count = (seenTitles.get(baseTitle) ?? 0) + 1
    seenTitles.set(baseTitle, count)
    const title = count === 1 ? baseTitle : `${baseTitle} #${count}`
    return renderScenario(pickle, feature, registry, title, state)
  })

  const packs = uniquePacks(rendered.flatMap((scenario) => scenario.packs))
  const frameworkImports =
    config.test.importPath === 'vitest' && config.test.exportName === 'test'
      ? ["import { describe, test } from 'vitest'"]
      : [
          "import { describe } from 'vitest'",
          renderNamedImport(
            config.test.importPath,
            config.test.exportName,
            'test',
            outputPath,
            config.rootDir,
          ),
        ]
  const packImports = uniqueFactoryPacks(packs).map((pack) =>
    renderNamedImport(
      pack.options.importPath,
      pack.options.factory,
      pack.options.factory,
      outputPath,
      config.rootDir,
    ),
  )

  const direct = rendered.filter((scenario) => !scenario.ruleName)
  const byRule = new Map<string, RenderedScenario[]>()
  for (const scenario of rendered) {
    if (!scenario.ruleName) continue
    const group = byRule.get(scenario.ruleName) ?? []
    group.push(scenario)
    byRule.set(scenario.ruleName, group)
  }

  const body: string[] = direct.map((scenario) => indent(scenario.code, 1))
  for (const [ruleName, scenarios] of byRule) {
    const children = scenarios.map((scenario) => indent(scenario.code, 2)).join('\n\n')
    body.push(`  describe(${literal(`Rule: ${ruleName}`)}, () => {\n${children}\n  })`)
  }

  return [
    `// Generated from ${feature.uri} by gherkin-vitest-codegen.`,
    '// Do not edit by hand.',
    ...frameworkImports,
    ...packImports,
    '',
    `describe(${literal(`Feature: ${feature.name}`)}, () => {`,
    body.join('\n\n'),
    '})',
    '',
  ].join('\n')
}

function renderScenario(
  pickle: Pickle,
  feature: LoadedFeature,
  registry: readonly RegisteredStep[],
  title: string,
  state: RenderState,
): RenderedScenario {
  const scenario = findScenario(pickle, feature.index)
  const row = findRow(pickle, feature.index)
  const resolved = pickle.steps.map((step) => resolveStep(step, feature, registry, state))
  const packs = uniquePacks(resolved.map((step) => step.pack))
  const locationLine = row?.line ?? scenario.line
  const lines = [`// ${feature.uri}:${locationLine}`, `test(${literal(title)}, async () => {`]

  for (const pack of packs) {
    lines.push(`  const ${pack.options.instance} = ${pack.options.factory}()`)
  }
  if (packs.length > 0) lines.push('')

  resolved.forEach((step, index) => {
    const original = pickle.steps[index]
    assertCodegen(original, 'AST_LINK_MISSING', 'Compiled step index is missing.')
    lines.push(`  // ${step.source.keyword} ${original.text}`)
    lines.push(`  ${renderInvocation(step.pack, step.invocation)}`)
  })
  lines.push('})')

  return {
    code: lines.join('\n'),
    ...(scenario.ruleName ? { ruleName: scenario.ruleName } : {}),
    packs,
  }
}

function resolveStep(
  step: PickleStep,
  feature: LoadedFeature,
  registry: readonly RegisteredStep[],
  state: RenderState,
): ResolvedStep {
  const sourceId = step.astNodeIds.find((id) => feature.index.steps.has(id))
  const source = sourceId ? feature.index.steps.get(sourceId) : undefined
  assertCodegen(
    source,
    'AST_LINK_MISSING',
    `Cannot link step "${step.text}" back to ${feature.uri}.`,
  )

  const matches = registry.flatMap((registered) => {
    registered.definition.pattern.lastIndex = 0
    const match = registered.definition.pattern.exec(step.text)
    return match ? [{ registered, match }] : []
  })
  if (matches.length === 0) {
    const escaped = escapeRegex(step.text)
    throw new CodegenError(
      'UNDEFINED_STEP',
      `${feature.uri}:${source.line} Undefined step: ${source.keyword} ${step.text}\n` +
        `Add an emitter such as: pack.step(/^${escaped}$/, () => ({ method: 'TODO' }))`,
    )
  }
  if (matches.length > 1) {
    const descriptions = matches
      .map(({ registered }) => `  ${registered.pack.options.id}: ${registered.definition.pattern}`)
      .join('\n')
    throw new CodegenError(
      'AMBIGUOUS_STEP',
      `${feature.uri}:${source.line} Ambiguous step: ${step.text}\n${descriptions}`,
    )
  }

  const hit = matches[0]
  assertCodegen(hit, 'UNDEFINED_STEP', `Undefined step: ${step.text}`)
  const context: StepEmitterContext = {
    text: step.text,
    captures: hit.match.slice(1),
    ...(step.argument ? { argument: mapArgument(step) } : {}),
    source: { uri: feature.uri, line: source.line, keyword: source.keyword },
    type: mapStepType(step.type),
  }

  let invocation: StepInvocation
  try {
    invocation = hit.registered.definition.emit(context)
  } catch (error) {
    throw new CodegenError(
      'EMITTER_FAILED',
      `${feature.uri}:${source.line} Emitter ${hit.registered.definition.pattern} failed.`,
      { cause: error },
    )
  }
  validateInvocation(invocation, hit.registered.pack, feature.uri, source.line)
  state.usedDefinitions.add(hit.registered.definition)
  return { pack: hit.registered.pack, invocation, source }
}

function renderInvocation(pack: StepPack, invocation: StepInvocation): string {
  const args = (invocation.args ?? []).map((argument) => literal(argument)).join(', ')
  const expression = `${pack.options.instance}.${invocation.method}(${args})`
  return invocation.await === false ? expression : `await ${expression}`
}

function validateInvocation(
  invocation: StepInvocation,
  pack: StepPack,
  uri: string,
  line: number,
): void {
  assertCodegen(
    !!invocation && typeof invocation === 'object',
    'INVALID_INVOCATION',
    `${uri}:${line} Emitter in pack "${pack.options.id}" returned no invocation.`,
  )
  assertIdentifier(invocation.method, `method returned by pack "${pack.options.id}"`, true)
  for (const argument of invocation.args ?? []) assertJsonValue(argument, uri, line)
}

function assertJsonValue(
  value: JsonValue,
  uri: string,
  line: number,
  seen = new Set<object>(),
): void {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return
  if (typeof value === 'number') {
    assertCodegen(
      Number.isFinite(value),
      'INVALID_ARGUMENT',
      `${uri}:${line} contains a non-finite number.`,
    )
    return
  }
  assertCodegen(
    typeof value === 'object',
    'INVALID_ARGUMENT',
    `${uri}:${line} has a non-JSON argument.`,
  )
  assertCodegen(!seen.has(value), 'INVALID_ARGUMENT', `${uri}:${line} has a cyclic argument.`)
  seen.add(value)
  if (Array.isArray(value)) {
    for (const item of value) assertJsonValue(item, uri, line, seen)
  } else {
    for (const item of Object.values(value)) assertJsonValue(item, uri, line, seen)
  }
  seen.delete(value)
}

function mapArgument(step: PickleStep): PickleArgument {
  const argument = step.argument
  assertCodegen(argument, 'INVALID_ARGUMENT', `Step "${step.text}" has no argument.`)
  if (argument.docString) {
    return {
      kind: 'docString',
      content: argument.docString.content,
      ...(argument.docString.mediaType ? { mediaType: argument.docString.mediaType } : {}),
    }
  }
  assertCodegen(
    argument.dataTable,
    'INVALID_ARGUMENT',
    `Step "${step.text}" has an unknown argument.`,
  )
  return {
    kind: 'dataTable',
    rows: argument.dataTable.rows.map((row) => row.cells.map((cell) => cell.value)),
  }
}

function mapStepType(type: PickleStepType | undefined): StepEmitterContext['type'] {
  if (type === 'Action' || type === 'Context' || type === 'Outcome') return type
  return 'Unknown'
}

function titleFor(pickle: Pickle, feature: LoadedFeature, duplicated: boolean): string {
  if (!duplicated) return pickle.name
  const row = findRow(pickle, feature.index)
  if (!row) return pickle.name
  const suffix = Object.entries(row.cells)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ')
  return `${pickle.name} (${suffix})`
}

function countTitles(pickles: readonly Pickle[]): ReadonlyMap<string, number> {
  const counts = new Map<string, number>()
  for (const pickle of pickles) counts.set(pickle.name, (counts.get(pickle.name) ?? 0) + 1)
  return counts
}

function uniquePacks(packs: readonly StepPack[]): StepPack[] {
  const seen = new Set<string>()
  return packs.filter((pack) => {
    if (seen.has(pack.options.id)) return false
    seen.add(pack.options.id)
    return true
  })
}

function uniqueFactoryPacks(packs: readonly StepPack[]): StepPack[] {
  const seen = new Set<string>()
  return packs.filter((pack) => {
    const key = `${pack.options.importPath}\0${pack.options.factory}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function renderNamedImport(
  specifier: string,
  imported: string,
  local: string,
  outputPath: string,
  rootDir: string,
): string {
  const from = resolveImportSpecifier(specifier, outputPath, rootDir)
  const binding = imported === local ? imported : `${imported} as ${local}`
  return `import { ${binding} } from ${literal(from)}`
}

function resolveImportSpecifier(specifier: string, outputPath: string, rootDir: string): string {
  if (!specifier.startsWith('.') && !path.isAbsolute(specifier)) return specifier
  const target = path.isAbsolute(specifier) ? specifier : path.resolve(rootDir, specifier)
  let relative = slash(path.relative(path.dirname(outputPath), target))
  relative = relative.replace(/\.(?:cts|mts|ts)$/, '')
  if (!relative.startsWith('.')) relative = `./${relative}`
  return relative
}

function literal(value: JsonValue): string {
  const result = JSON.stringify(value)
  assertCodegen(result !== undefined, 'INVALID_ARGUMENT', 'Cannot serialize generated value.')
  return result
}

function indent(value: string, level: number): string {
  const prefix = '  '.repeat(level)
  return value
    .split('\n')
    .map((line) => (line ? `${prefix}${line}` : ''))
    .join('\n')
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function slash(value: string): string {
  return value.replaceAll(path.sep, '/')
}
