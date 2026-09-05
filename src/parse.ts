import { readFile } from 'node:fs/promises'
import {
  AstBuilder,
  compile,
  GherkinClassicTokenMatcher,
  GherkinInMarkdownTokenMatcher,
  Parser,
} from '@cucumber/gherkin'
import {
  type FeatureChild,
  IdGenerator,
  type Pickle,
  type RuleChild,
  type Scenario,
  type Step,
} from '@cucumber/messages'
import { CodegenError } from './errors.js'

export interface SourceStep {
  readonly keyword: string
  readonly text: string
}

export interface SourceScenario {
  readonly line: number
  readonly name: string
  readonly rule?: string
}

/** Everything the planner needs from the AST, keyed by the ids that pickles carry. */
export interface ParsedFeature {
  readonly name: string
  readonly pickles: readonly Pickle[]
  readonly rows: ReadonlyMap<string, ReadonlyMap<string, string>>
  readonly scenarios: ReadonlyMap<string, SourceScenario>
  readonly steps: ReadonlyMap<string, SourceStep>
  readonly warnings: readonly string[]
}

/**
 * Markdown Gherkin parses `.md` inputs, classic Gherkin everything else. Classic
 * Gherkin honours a `# language:` header on its own; Markdown Gherkin is English.
 */
export async function parseFeature(absolutePath: string, label: string): Promise<ParsedFeature> {
  let source: string
  try {
    source = await readFile(absolutePath, 'utf8')
  } catch {
    throw new CodegenError('INPUT_UNREADABLE', `Cannot read ${label}`)
  }

  const markdown = absolutePath.toLowerCase().endsWith('.md')
  const newId = IdGenerator.incrementing()
  const matcher = markdown ? new GherkinInMarkdownTokenMatcher() : new GherkinClassicTokenMatcher()

  const scenarios = new Map<string, SourceScenario>()
  const steps = new Map<string, SourceStep>()
  const rows = new Map<string, ReadonlyMap<string, string>>()

  const indexStep = (step: Step): void => {
    steps.set(step.id, { keyword: step.keyword.trim(), text: step.text })
  }

  const indexScenario = (scenario: Scenario, rule?: string): void => {
    scenarios.set(scenario.id, {
      line: scenario.location.line,
      name: scenario.name.trim() || `Scenario at line ${scenario.location.line}`,
      ...(rule ? { rule } : {}),
    })
    for (const step of scenario.steps) indexStep(step)

    for (const examples of scenario.examples) {
      const headers = examples.tableHeader?.cells.map((cell) => cell.value.trim()) ?? []
      for (const row of examples.tableBody) {
        rows.set(
          row.id,
          new Map(row.cells.map((cell, column) => [headers[column] ?? '', cell.value])),
        )
      }
    }
  }

  const indexChild = (child: FeatureChild | RuleChild, rule?: string): void => {
    for (const step of child.background?.steps ?? []) indexStep(step)
    if (child.scenario) indexScenario(child.scenario, rule)
  }

  let document: ReturnType<Parser<unknown>['parse']>
  try {
    document = new Parser(new AstBuilder(newId), matcher).parse(source)
  } catch (error) {
    throw new CodegenError('INVALID_GHERKIN', `${label} has invalid Gherkin:\n${syntax(error)}`)
  }

  const feature = document.feature
  if (!feature || feature.name.trim().length === 0) {
    throw new CodegenError(
      'INVALID_GHERKIN',
      `${label} has no named Feature. Add ${markdown ? '"# Feature: Name"' : '"Feature: Name"'}.`,
    )
  }

  for (const child of feature.children) {
    indexChild(child)
    for (const nested of child.rule?.children ?? []) indexChild(nested, child.rule?.name.trim())
  }

  const pickles = compile(document, label, newId)
  if (pickles.length === 0) {
    throw new CodegenError(
      'INVALID_GHERKIN',
      `${label} produced no runnable scenario. Every Scenario needs steps, and every Scenario Outline needs Examples rows.`,
    )
  }

  return {
    name: feature.name.trim(),
    pickles,
    rows,
    scenarios,
    steps,
    warnings: lint(source, markdown, label),
  }
}

/** Two traps that Cucumber accepts silently and that corrupt the generated data. */
function lint(source: string, markdown: boolean, label: string): string[] {
  const warnings: string[] = []
  for (const [position, line] of source.split(/\r?\n/).entries()) {
    if (/^\s*\|(?:\s*:?-{2,}:?\s*\|)+\s*$/.test(line)) {
      warnings.push(`${label}:${position + 1} Markdown separator row is read as data. Delete it.`)
    } else if (markdown && /^ ?\|/.test(line)) {
      warnings.push(`${label}:${position + 1} table row needs two leading spaces to be parsed.`)
    }
  }
  return warnings
}

function syntax(error: unknown): string {
  const nested = (error as { errors?: unknown }).errors
  const list = Array.isArray(nested) && nested.length > 0 ? nested : [error]
  return list.map((item) => `- ${String((item as Error).message ?? item).trim()}`).join('\n')
}
