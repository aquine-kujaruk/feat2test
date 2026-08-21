import { readFile } from 'node:fs/promises'
import path from 'node:path'
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
import { assertCodegen, CodegenError } from './errors.js'

export interface ScenarioMetadata {
  readonly id: string
  readonly line: number
  readonly name: string
  readonly ruleName?: string
}

export interface StepMetadata {
  readonly id: string
  readonly line: number
  readonly keyword: string
}

export interface RowMetadata {
  readonly id: string
  readonly line: number
  readonly cells: Readonly<Record<string, string>>
}

export interface AstIndex {
  readonly scenarios: ReadonlyMap<string, ScenarioMetadata>
  readonly steps: ReadonlyMap<string, StepMetadata>
  readonly rows: ReadonlyMap<string, RowMetadata>
}

export interface LoadedFeature {
  readonly absolutePath: string
  readonly uri: string
  readonly name: string
  readonly document: GherkinDocument
  readonly pickles: readonly Pickle[]
  readonly index: AstIndex
}

export async function loadFeature(
  absolutePath: string,
  rootDir: string,
  language: string,
): Promise<LoadedFeature> {
  const uri = slash(path.relative(rootDir, absolutePath))
  const source = await readFile(absolutePath, 'utf8')
  const newId = IdGenerator.incrementing()

  let document: GherkinDocument
  try {
    const matcher = absolutePath.endsWith('.md')
      ? new GherkinInMarkdownTokenMatcher(language)
      : new GherkinClassicTokenMatcher(language)
    const parser = new Parser(new AstBuilder(newId), matcher)
    document = parser.parse(source)
  } catch (error) {
    throw new CodegenError('GHERKIN_PARSE_FAILED', `Cannot parse ${uri}.`, { cause: error })
  }

  assertCodegen(document.feature, 'EMPTY_FEATURE', `${uri} does not contain a Feature.`)
  assertCodegen(
    document.feature.name.trim().length > 0,
    'EMPTY_FEATURE_NAME',
    `${uri}:${document.feature.location.line} has an empty Feature name.`,
  )
  if (absolutePath.endsWith('.md')) validateMarkdownSource(document, source, uri, language)

  const index = indexDocument(document, uri)
  let pickles: readonly Pickle[]
  try {
    pickles = compile(document, uri, newId)
  } catch (error) {
    throw new CodegenError('GHERKIN_COMPILE_FAILED', `Cannot compile ${uri}.`, { cause: error })
  }

  assertCodegen(
    index.scenarios.size > 0,
    'FEATURE_WITHOUT_SCENARIOS',
    `${uri} does not contain any scenarios.`,
  )

  for (const scenario of index.scenarios.values()) {
    const compiled = pickles.filter((pickle) => pickle.astNodeIds.includes(scenario.id))
    assertCodegen(
      compiled.length > 0,
      'SCENARIO_NOT_COMPILED',
      `${uri}:${scenario.line} "${scenario.name}" compiled to zero tests. Check its Examples table.`,
    )
  }

  for (const pickle of pickles) {
    const scenario = findScenario(pickle, index)
    assertCodegen(
      pickle.steps.length > 0,
      'EMPTY_PICKLE',
      `${uri}:${scenario.line} "${pickle.name}" compiled without steps. ` +
        'In Markdown-with-Gherkin, use `* Given`, not `* **Given**`.',
    )
  }

  return {
    absolutePath,
    uri,
    name: document.feature.name,
    document,
    pickles,
    index,
  }
}

function validateMarkdownSource(
  document: GherkinDocument,
  source: string,
  uri: string,
  language: string,
): void {
  const dialect = dialects[language]
  assertCodegen(dialect, 'UNKNOWN_DIALECT', `Unknown Gherkin dialect: ${language}`)

  const structuralLines = new Set<number>()
  const parsedStepLines = new Set<number>()
  const stepContainers: number[] = []
  const examplesStarts: number[] = []
  if (document.feature) {
    structuralLines.add(document.feature.location.line)
    for (const child of document.feature.children) {
      if (child.background) {
        structuralLines.add(child.background.location.line)
        stepContainers.push(child.background.location.line)
        for (const step of child.background.steps) parsedStepLines.add(step.location.line)
      }
      if (child.scenario) collectScenarioLines(child.scenario)
      if (child.rule) {
        structuralLines.add(child.rule.location.line)
        for (const ruleChild of child.rule.children) {
          if (ruleChild.background) {
            structuralLines.add(ruleChild.background.location.line)
            stepContainers.push(ruleChild.background.location.line)
            for (const step of ruleChild.background.steps) parsedStepLines.add(step.location.line)
          }
          if (ruleChild.scenario) collectScenarioLines(ruleChild.scenario)
        }
      }
    }
  }

  const structureKeywords = uniqueKeywords([
    ...dialect.feature,
    ...dialect.background,
    ...dialect.rule,
    ...dialect.scenario,
    ...dialect.scenarioOutline,
    ...dialect.examples,
  ])
  const stepKeywords = uniqueKeywords([
    ...dialect.given,
    ...dialect.when,
    ...dialect.then,
    ...dialect.and,
    ...dialect.but,
  ]).filter((keyword) => keyword !== '*')
  const structureLocations = [...structuralLines].sort((left, right) => left - right)
  const sourceLines = source.split(/\r?\n/)

  sourceLines.forEach((line, zeroBasedLine) => {
    const lineNumber = zeroBasedLine + 1
    const heading = line.match(/^\s*#{1,6}\s+(.+)$/)?.[1]
    if (heading && !structuralLines.has(lineNumber)) {
      const candidate = heading.replace(/^[*_`~]+/, '')
      const malformedKeyword = structureKeywords.find((keyword) =>
        new RegExp(`^${escapeRegex(keyword)}(?:[*_\`~]+)?\\s*:`, 'i').test(candidate),
      )
      assertCodegen(
        !malformedKeyword,
        'MALFORMED_MARKDOWN_HEADER',
        `${uri}:${lineNumber} looks like a malformed ${malformedKeyword} heading. ` +
          `Use a literal heading such as \`### ${malformedKeyword}: Name\`.`,
      )
    }

    const bullet = line.match(/^\s*[*+-]\s+(.+)$/)?.[1]
    if (
      bullet &&
      !parsedStepLines.has(lineNumber) &&
      isWithinAnyBlock(lineNumber, stepContainers, structureLocations, sourceLines.length)
    ) {
      const candidate = bullet.replace(/^[*_`~]+/, '')
      const malformedKeyword = stepKeywords.find((keyword) =>
        new RegExp(`^${escapeRegex(keyword)}(?:[*_\`~]+)?(?:\\s+|$)`, 'i').test(candidate),
      )
      assertCodegen(
        !malformedKeyword,
        'MALFORMED_MARKDOWN_STEP',
        `${uri}:${lineNumber} looks like a malformed ${malformedKeyword} step. ` +
          `Use the literal form \`* ${malformedKeyword} ...\` without bold, code formatting or changed case.`,
      )
      throw new CodegenError(
        'UNRECOGNIZED_MARKDOWN_BULLET',
        `${uri}:${lineNumber} contains an unrecognized bullet inside a Gherkin step block: ` +
          `"${bullet}". Fix the keyword, or use a paragraph when the line is documentation.`,
      )
    }

    const tableIndent = line.match(/^([ \t]*)\|/)?.[1]
    if (
      tableIndent !== undefined &&
      isWithinAnyBlock(lineNumber, examplesStarts, structureLocations, sourceLines.length)
    ) {
      assertCodegen(
        !tableIndent.includes('\t') && tableIndent.length >= 2 && tableIndent.length <= 5,
        'MALFORMED_MARKDOWN_TABLE',
        `${uri}:${lineNumber} has an invalid Examples table indent. Use 2–5 spaces.`,
      )
    }
  })

  function collectScenarioLines(scenario: Scenario): void {
    structuralLines.add(scenario.location.line)
    stepContainers.push(scenario.location.line)
    for (const step of scenario.steps) parsedStepLines.add(step.location.line)
    for (const examples of scenario.examples) {
      structuralLines.add(examples.location.line)
      examplesStarts.push(examples.location.line)
    }
  }
}

function uniqueKeywords(keywords: readonly string[]): string[] {
  return [...new Set(keywords.map((keyword) => keyword.trim()).filter(Boolean))].sort(
    (left, right) => right.length - left.length,
  )
}

function isWithinAnyBlock(
  line: number,
  starts: readonly number[],
  structuralLines: readonly number[],
  lastLine: number,
): boolean {
  return starts.some((start) => {
    const end = structuralLines.find((candidate) => candidate > start) ?? lastLine + 1
    return line > start && line < end
  })
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function findScenario(pickle: Pickle, index: AstIndex): ScenarioMetadata {
  const id = pickle.astNodeIds.find((candidate) => index.scenarios.has(candidate))
  const scenario = id ? index.scenarios.get(id) : undefined
  assertCodegen(
    scenario,
    'AST_LINK_MISSING',
    `Cannot link compiled scenario "${pickle.name}" back to the Gherkin AST.`,
  )
  return scenario
}

export function findRow(pickle: Pickle, index: AstIndex): RowMetadata | undefined {
  const id = pickle.astNodeIds.find((candidate) => index.rows.has(candidate))
  return id ? index.rows.get(id) : undefined
}

function indexDocument(document: GherkinDocument, uri: string): AstIndex {
  const scenarios = new Map<string, ScenarioMetadata>()
  const steps = new Map<string, StepMetadata>()
  const rows = new Map<string, RowMetadata>()

  const visitStep = (step: Step) => {
    steps.set(step.id, {
      id: step.id,
      line: step.location.line,
      keyword: step.keyword.trim(),
    })
  }

  const visitScenario = (scenario: Scenario, ruleName?: string) => {
    assertCodegen(
      scenario.name.trim().length > 0,
      'EMPTY_SCENARIO_NAME',
      `${uri}:${scenario.location.line} has an empty Scenario name.`,
    )
    assertCodegen(
      scenario.steps.length > 0,
      'EMPTY_SCENARIO',
      `${uri}:${scenario.location.line} "${scenario.name}" has no parsed steps. ` +
        'In Markdown-with-Gherkin, keywords must not be bold.',
    )
    scenarios.set(scenario.id, {
      id: scenario.id,
      line: scenario.location.line,
      name: scenario.name,
      ...(ruleName ? { ruleName } : {}),
    })
    for (const step of scenario.steps) visitStep(step)

    for (const examples of scenario.examples) {
      assertCodegen(
        examples.tableHeader,
        'EXAMPLES_WITHOUT_HEADER',
        `${uri}:${examples.location.line} Examples for "${scenario.name}" has no parsed table. ` +
          'Markdown tables must be indented by 2–5 spaces.',
      )
      assertCodegen(
        examples.tableBody.length > 0,
        'EXAMPLES_WITHOUT_ROWS',
        `${uri}:${examples.location.line} Examples for "${scenario.name}" has no data rows.`,
      )
      const headers = examples.tableHeader.cells.map((cell) => cell.value)
      assertCodegen(
        new Set(headers).size === headers.length,
        'DUPLICATE_EXAMPLE_HEADER',
        `${uri}:${examples.tableHeader.location.line} has duplicate Examples columns.`,
      )
      for (const row of examples.tableBody) {
        assertCodegen(
          row.cells.length === headers.length,
          'EXAMPLES_COLUMN_MISMATCH',
          `${uri}:${row.location.line} has ${row.cells.length} cells; expected ${headers.length}.`,
        )
        rows.set(row.id, {
          id: row.id,
          line: row.location.line,
          cells: Object.freeze(
            Object.fromEntries(row.cells.map((cell, index) => [headers[index], cell.value])),
          ),
        })
      }
    }
  }

  for (const child of document.feature?.children ?? []) {
    if (child.background) {
      for (const step of child.background.steps) visitStep(step)
    }
    if (child.scenario) visitScenario(child.scenario)
    if (child.rule) {
      for (const ruleChild of child.rule.children) {
        if (ruleChild.background) {
          for (const step of ruleChild.background.steps) visitStep(step)
        }
        if (ruleChild.scenario) visitScenario(ruleChild.scenario, child.rule.name)
      }
    }
  }

  return { scenarios, steps, rows }
}

function slash(value: string): string {
  return value.replaceAll(path.sep, '/')
}
