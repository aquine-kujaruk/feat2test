import { readFile } from 'node:fs/promises'
import {
  AstBuilder,
  compile,
  dialects,
  GherkinClassicTokenMatcher,
  GherkinInMarkdownTokenMatcher,
  Parser,
} from '@cucumber/gherkin'
import {
  type GherkinDocument,
  IdGenerator,
  type Pickle,
  type Scenario,
  type Step,
} from '@cucumber/messages'
import { CodegenError } from './errors.js'

const LANGUAGE_HEADER_TAG = '@__gherkin_vitest_language_header__'

export interface ScenarioMetadata {
  readonly id: string
  readonly line: number
  readonly name: string
  readonly ruleId?: string
  readonly ruleName?: string
}

export interface StepMetadata {
  readonly id: string
  readonly keyword: string
  readonly line: number
  readonly text: string
}

export interface RowMetadata {
  readonly cells: readonly {
    readonly name: string
    readonly value: string
  }[]
  readonly id: string
  readonly line: number
}

export interface AstIndex {
  readonly rows: ReadonlyMap<string, RowMetadata>
  readonly scenarios: ReadonlyMap<string, ScenarioMetadata>
  readonly steps: ReadonlyMap<string, StepMetadata>
}

export interface LoadedFeature {
  readonly document: GherkinDocument
  readonly index: AstIndex
  readonly name: string
  readonly pickles: readonly Pickle[]
}

export async function loadFeature(
  absolutePath: string,
  displayPath: string,
): Promise<LoadedFeature> {
  let source: string
  try {
    source = await readFile(absolutePath, 'utf8')
  } catch {
    throw new CodegenError('INPUT_READ_FAILED', `Cannot read input file: ${displayPath}`)
  }

  const languageHeader = findLanguageHeader(source)
  if (!(languageHeader.language in dialects)) {
    throw invalidGherkin(displayPath)
  }

  const attempts = [
    () => parseCandidate(source, displayPath, new GherkinClassicTokenMatcher('en')),
    () => {
      const markdownSource =
        languageHeader.lineIndex === undefined
          ? source
          : replaceLine(source, languageHeader.lineIndex, `\`${LANGUAGE_HEADER_TAG}\``)
      const parsed = parseCandidate(
        markdownSource,
        displayPath,
        new GherkinInMarkdownTokenMatcher(languageHeader.language),
      )
      return languageHeader.lineIndex === undefined
        ? parsed
        : removeLanguageHeaderTag(parsed, languageHeader.lineIndex + 1)
    },
  ]

  for (const attempt of attempts) {
    try {
      const parsed = attempt()
      return parsed
    } catch {
      // The public diagnostic deliberately hides parser-selection details.
    }
  }

  throw invalidGherkin(displayPath)
}

function parseCandidate(
  source: string,
  uri: string,
  matcher: GherkinClassicTokenMatcher | GherkinInMarkdownTokenMatcher,
): LoadedFeature {
  const newId = IdGenerator.incrementing()
  const document = new Parser(new AstBuilder(newId), matcher).parse(source)
  const feature = document.feature
  if (!feature || feature.name.trim().length === 0) throw new Error('Feature missing')

  const index = indexDocument(document)
  if (index.scenarios.size === 0) throw new Error('Scenarios missing')

  const pickles = compile(document, uri, newId)
  if (pickles.length === 0) throw new Error('Pickles missing')

  for (const scenario of index.scenarios.values()) {
    if (!pickles.some((pickle) => pickle.astNodeIds.includes(scenario.id))) {
      throw new Error('Scenario produced no Pickles')
    }
  }
  if (pickles.some((pickle) => pickle.steps.length === 0)) {
    throw new Error('Pickle has no steps')
  }

  return { document, index, name: feature.name.trim(), pickles }
}

function indexDocument(document: GherkinDocument): AstIndex {
  const rows = new Map<string, RowMetadata>()
  const scenarios = new Map<string, ScenarioMetadata>()
  const steps = new Map<string, StepMetadata>()

  const visitStep = (step: Step): void => {
    steps.set(step.id, {
      id: step.id,
      keyword: step.keyword.trim(),
      line: step.location.line,
      text: step.text,
    })
  }

  const visitScenario = (
    scenario: Scenario,
    rule?: { readonly id: string; readonly name: string },
  ): void => {
    scenarios.set(scenario.id, {
      id: scenario.id,
      line: scenario.location.line,
      name: scenario.name.trim() || `Scenario at line ${scenario.location.line}`,
      ...(rule ? { ruleId: rule.id, ruleName: rule.name } : {}),
    })
    for (const step of scenario.steps) visitStep(step)

    for (const examples of scenario.examples) {
      const headers = examples.tableHeader?.cells.map((cell) => cell.value) ?? []
      for (const row of examples.tableBody) {
        rows.set(row.id, {
          cells: row.cells.map((cell, index) => ({
            name: headers[index] ?? `value${index + 1}`,
            value: cell.value,
          })),
          id: row.id,
          line: row.location.line,
        })
      }
    }
  }

  for (const child of document.feature?.children ?? []) {
    if (child.background) for (const step of child.background.steps) visitStep(step)
    if (child.scenario) visitScenario(child.scenario)
    if (child.rule) {
      for (const ruleChild of child.rule.children) {
        if (ruleChild.background) for (const step of ruleChild.background.steps) visitStep(step)
        if (ruleChild.scenario) {
          visitScenario(ruleChild.scenario, {
            id: child.rule.id,
            name: child.rule.name.trim(),
          })
        }
      }
    }
  }

  return { rows, scenarios, steps }
}

export function findScenario(pickle: Pickle, index: AstIndex): ScenarioMetadata {
  const id = pickle.astNodeIds.find((candidate) => index.scenarios.has(candidate))
  const scenario = id ? index.scenarios.get(id) : undefined
  if (!scenario) throw new CodegenError('INVALID_GHERKIN', 'Cannot link a Pickle to its Scenario.')
  return scenario
}

export function findRow(pickle: Pickle, index: AstIndex): RowMetadata | undefined {
  const id = pickle.astNodeIds.find((candidate) => index.rows.has(candidate))
  return id ? index.rows.get(id) : undefined
}

export function findStep(ids: readonly string[], index: AstIndex): StepMetadata {
  const id = ids.find((candidate) => index.steps.has(candidate))
  const step = id ? index.steps.get(id) : undefined
  if (!step) throw new CodegenError('INVALID_GHERKIN', 'Cannot link a Pickle step to its source.')
  return step
}

function findLanguageHeader(source: string): {
  readonly language: string
  readonly lineIndex?: number
} {
  const lines = source.split(/\r?\n/)
  for (const [lineIndex, line] of lines.entries()) {
    if (line.trim().length === 0) continue
    const match = line.replace(/^\uFEFF/, '').match(/^\s*#\s*language\s*:\s*([a-zA-Z_-]+)\s*$/)
    return match?.[1] ? { language: match[1], lineIndex } : { language: 'en' }
  }
  return { language: 'en' }
}

function replaceLine(source: string, lineIndex: number, replacement: string): string {
  const lines = source.split(/\r?\n/)
  lines[lineIndex] = replacement
  return lines.join('\n')
}

function removeLanguageHeaderTag(parsed: LoadedFeature, line: number): LoadedFeature {
  if (!parsed.document.feature) return parsed
  const languageTagIds = new Set(
    parsed.document.feature.tags
      .filter((tag) => tag.name === LANGUAGE_HEADER_TAG && tag.location.line === line)
      .map((tag) => tag.id),
  )
  const document: GherkinDocument = {
    ...parsed.document,
    feature: {
      ...parsed.document.feature,
      tags: parsed.document.feature.tags.filter(
        (tag) => !(tag.name === LANGUAGE_HEADER_TAG && tag.location.line === line),
      ),
    },
  }
  return {
    ...parsed,
    document,
    pickles: parsed.pickles.map((pickle) => ({
      ...pickle,
      tags: pickle.tags.filter((tag) => !languageTagIds.has(tag.astNodeId)),
    })),
  }
}

function invalidGherkin(displayPath: string): CodegenError {
  return new CodegenError(
    'INVALID_GHERKIN',
    `${displayPath} must contain a named Feature with executable scenarios and valid Pickles.`,
  )
}
