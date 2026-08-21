import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import {
  type CodegenConfig,
  CodegenError,
  definePack,
  generate,
  type JsonValue,
  loadConfig,
  resolveConfig,
  type StepPack,
  validate,
} from '../src/index.js'

describe('generate', () => {
  let root = ''

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'gherkin-vitest-codegen-'))
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  test('generates nested readable tests from classic Gherkin', async () => {
    await put(
      'features/nested/state.feature',
      `Feature: State

  Background:
    Given a clean state

  Rule: Values
    Scenario: Set a value
      When the value becomes "A"
      And the value is persisted
      Then the value is "A"

    Scenario Outline: Read a value
      When the value becomes "<value>"
      Then the value is "<value>"

      Examples:
        | value |
        | A     |
        | B     |
`,
    )
    const pack = valuePack()
    const report = await generate(project(pack))

    expect(report).toMatchObject({ featureCount: 1, scenarioCount: 3, stepCount: 10 })
    const output = path.join(root, 'test/generated/nested/state.generated.test.ts')
    const source = await readFile(output, 'utf8')
    expect(source).toContain("import { describe, test } from 'vitest'")
    expect(source).toContain('import { valueSteps } from "../../steps/value.steps"')
    expect(source).toContain('const value = valueSteps()')
    expect(source).not.toContain('world')
    expect(source).toContain('describe("Rule: Values"')
    expect(source).toContain('// And the value is persisted')
    expect(source).toContain('await value.persist()')
    expect(source).toContain('Read a value (value=A)')
    expect(source).toContain('Read a value (value=B)')
  })

  test('supports Markdown-with-Gherkin and an indented Examples table', async () => {
    await put(
      'features/example.feature.md',
      `# Feature: Markdown

### Scenario Outline: Render

* Given a clean state
* When the value becomes "<value>"
* And the value is persisted
* Then the value is "<value>"

#### Examples:

  | value |
  | ----- |
  | MDG   |
`,
    )
    const report = await generate(project(valuePack()))
    expect(report.scenarioCount).toBe(1)
    expect(await readFile(report.files[0]?.outputPath ?? '', 'utf8')).toContain(
      'await value.set("MDG")',
    )
  })

  test('rejects bold Markdown step keywords instead of creating empty green tests', async () => {
    await put(
      'features/broken.feature.md',
      `# Feature: Broken

### Scenario: Mixed valid and malformed steps

* Given a clean state
* **THEN** the value is "A"
`,
    )
    await expect(generate(project(valuePack()))).rejects.toMatchObject({
      code: 'MALFORMED_MARKDOWN_STEP',
    })
  })

  test('validates every source before running any emitter', async () => {
    await put(
      'features/a-valid.feature',
      `Feature: Valid first
  Scenario: Valid first
    Given a clean state
`,
    )
    let emitterCalls = 0
    const pack = definePack({
      id: 'gate',
      factory: 'gateSteps',
      importPath: './test/steps/gate.ts',
    }).step(/^a clean state$/, () => {
      emitterCalls += 1
      return { method: 'clean' }
    })
    const config = project(pack)

    await expect(validate(config)).resolves.toMatchObject({
      featureCount: 1,
      scenarioCount: 1,
      stepCount: 1,
    })
    expect(emitterCalls).toBe(0)

    await put(
      'features/z-invalid.feature.md',
      `# Feature: Invalid last
### Scenario: Invalid last
* **Given** this is prose, not a step
`,
    )
    await expect(generate(config)).rejects.toMatchObject({ code: 'MALFORMED_MARKDOWN_STEP' })
    expect(emitterCalls).toBe(0)
  })

  test('rejects unindented Markdown Examples tables', async () => {
    await put(
      'features/broken.feature.md',
      `# Feature: Broken table

### Scenario Outline: Empty outline

* Given a clean state
* Then the value is "<value>"

#### Examples:

| value |
| ----- |
| A     |
`,
    )
    await expect(generate(project(valuePack()))).rejects.toMatchObject({
      code: 'MALFORMED_MARKDOWN_TABLE',
    })
  })

  test('rejects formatted or case-changed Markdown Gherkin headings', async () => {
    await put(
      'features/header.feature.md',
      `# Feature: Header validation

### **SCENARIO:** Not parsed as Gherkin

* Given a clean state
`,
    )
    await expect(generate(project(cleanPack()))).rejects.toMatchObject({
      code: 'MALFORMED_MARKDOWN_HEADER',
    })
  })

  test('rejects unrecognized bullets inside Markdown step blocks', async () => {
    await put(
      'features/typo.feature.md',
      `# Feature: Typo validation

### Scenario: Typo

* Given a clean state
* Givven a misspelled step
`,
    )
    await expect(generate(project(cleanPack()))).rejects.toMatchObject({
      code: 'UNRECOGNIZED_MARKDOWN_BULLET',
    })
  })

  test('reports undefined and ambiguous steps with their source', async () => {
    await put(
      'features/undefined.feature',
      `Feature: Undefined
  Scenario: Missing
    Given an unknown precondition
`,
    )
    await expect(generate(project(valuePack()))).rejects.toMatchObject({
      code: 'UNDEFINED_STEP',
      message: expect.stringContaining('features/undefined.feature:3'),
    })

    const first = definePack({
      id: 'first',
      factory: 'firstSteps',
      importPath: './test/steps/first.ts',
    }).step(/^an unknown precondition$/, () => ({ method: 'run' }))
    const second = definePack({
      id: 'second',
      factory: 'secondSteps',
      importPath: './test/steps/second.ts',
    }).step(/^an unknown precondition$/, () => ({ method: 'run' }))
    await expect(generate(project([first, second]))).rejects.toMatchObject({
      code: 'AMBIGUOUS_STEP',
    })
  })

  test('errors on unused emitters unless configured to warn', async () => {
    await put(
      'features/used.feature',
      `Feature: Used
  Scenario: Used
    Given a clean state
`,
    )
    const pack = definePack({
      id: 'value',
      factory: 'valueSteps',
      importPath: './test/steps/value.steps.ts',
    })
      .step(/^a clean state$/, () => ({ method: 'clean' }))
      .step(/^never used$/, () => ({ method: 'unused' }))

    await expect(generate(project(pack))).rejects.toMatchObject({ code: 'UNUSED_EMITTERS' })
    const report = await generate(project(pack, { unusedEmitters: 'warn' }))
    expect(report.warnings).toHaveLength(1)
    expect(report.warnings[0]).toContain('never used')
  })

  test('checks changed, missing and stale generated output without git', async () => {
    await put(
      'features/check.feature',
      `Feature: Check
  Scenario: Check
    Given a clean state
`,
    )
    const config = project(cleanPack())
    const report = await generate(config)
    await expect(generate(config, { check: true })).resolves.toMatchObject({ featureCount: 1 })

    const output = report.files[0]?.outputPath
    expect(output).toBeDefined()
    await rm(required(output))
    await expect(generate(config, { check: true })).rejects.toMatchObject({
      message: expect.stringContaining('missing:'),
    })

    await generate(config)
    await writeFile(required(output), '// manually changed\n')
    await expect(generate(config, { check: true })).rejects.toMatchObject({
      code: 'GENERATED_DRIFT',
      message: expect.stringContaining('changed:'),
    })

    await generate(config)
    const stale = path.join(root, 'test/generated/stale.generated.test.ts')
    await writeFile(stale, '// stale\n')
    await expect(generate(config, { check: true })).rejects.toMatchObject({
      message: expect.stringContaining('stale:'),
    })
    await generate(config)
    await expect(readFile(stale, 'utf8')).rejects.toThrow()
  })

  test('validates every feature before replacing existing output', async () => {
    await put(
      'features/broken.feature.md',
      `# Feature: Broken
### Scenario: Broken
* **Given** no parsed step
`,
    )
    const existing = path.join(root, 'test/generated/keep.generated.test.ts')
    await put('test/generated/keep.generated.test.ts', '// keep\n')

    await expect(generate(project(cleanPack()))).rejects.toBeInstanceOf(CodegenError)
    await expect(readFile(existing, 'utf8')).resolves.toBe('// keep\n')
  })

  test('detects .feature and .feature.md output collisions', async () => {
    const body = `Feature: Collision
  Scenario: Collision
    Given a clean state
`
    await put('features/same.feature', body)
    await put(
      'features/same.feature.md',
      `# Feature: Collision
### Scenario: Collision
* Given a clean state
`,
    )
    await expect(generate(project(cleanPack()))).rejects.toMatchObject({
      code: 'OUTPUT_COLLISION',
    })
  })

  test('passes DocStrings and data tables to safe structured emitters', async () => {
    await put(
      'features/arguments.feature',
      `Feature: Arguments
  Scenario: Arguments
    Given a document
      """json
      {"enabled":true}
      """
    And a table
      | name | role  |
      | Ada  | admin |
`,
    )
    const pack = definePack({
      id: 'arguments',
      factory: 'argumentSteps',
      importPath: './test/steps/arguments.ts',
    })
      .step(/^a document$/, ({ argument }) => ({
        method: 'document',
        args: [argument?.kind === 'docString' ? argument.content : ''],
      }))
      .step(/^a table$/, ({ argument }) => ({
        method: 'table',
        args: [argument?.kind === 'dataTable' ? argument.rows : []],
        await: false,
      }))

    const report = await generate(project(pack))
    const output = await readFile(required(report.files[0]?.outputPath), 'utf8')
    expect(output).toContain('await arguments.document("{\\"enabled\\":true}")')
    expect(output).toContain('arguments.table([["name","role"],["Ada","admin"]])')
  })

  test('imports a shared factory once for multiple pack instances', async () => {
    await put(
      'features/shared.feature',
      `Feature: Shared factory
  Scenario: Shared factory
    Given the first state
    And the second state
`,
    )
    const first = definePack({
      id: 'first',
      instance: 'firstState',
      factory: 'sharedSteps',
      importPath: './test/steps/shared.ts',
    }).step(/^the first state$/, () => ({ method: 'first' }))
    const second = definePack({
      id: 'second',
      instance: 'secondState',
      factory: 'sharedSteps',
      importPath: './test/steps/shared.ts',
    }).step(/^the second state$/, () => ({ method: 'delete' }))

    const report = await generate(project([first, second]))
    const output = await readFile(required(report.files[0]?.outputPath), 'utf8')
    expect(output.match(/import \{ sharedSteps \}/g)).toHaveLength(1)
    expect(output).toContain('await secondState.delete()')
  })

  test('rejects non-JSON invocation arguments', async () => {
    await put(
      'features/invalid.feature',
      `Feature: Invalid
  Scenario: Invalid
    Given a clean state
`,
    )
    const cyclic: { self?: JsonValue } = {}
    cyclic.self = cyclic
    const pack = definePack({
      id: 'invalid',
      factory: 'invalidSteps',
      importPath: './test/steps/invalid.ts',
    }).step(/^a clean state$/, () => ({ method: 'run', args: [cyclic] }))
    await expect(generate(project(pack))).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' })
  })

  function project(packs: StepPack | readonly StepPack[], overrides: Partial<CodegenConfig> = {}) {
    return resolveConfig(
      {
        rootDir: root,
        packs: Array.isArray(packs) ? packs : [packs],
        ...overrides,
      },
      '/',
    )
  }

  async function put(relative: string, contents: string): Promise<void> {
    const absolute = path.join(root, relative)
    await mkdir(path.dirname(absolute), { recursive: true })
    await writeFile(absolute, contents, 'utf8')
  }
})

describe('configuration', () => {
  test('loads and auto-detects a config through jiti', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'gherkin-vitest-config-'))
    const configPath = path.join(root, 'gherkin-vitest.config.mjs')
    await writeFile(
      configPath,
      `export default {
        packs: [],
        unusedEmitters: 'ignore'
      }\n`,
    )
    try {
      const loaded = await loadConfig({ cwd: root })
      expect(loaded.configPath).toBe(configPath)
      expect(loaded.config.rootDir).toBe(root)
      expect(loaded.config.test).toEqual({ importPath: 'vitest', exportName: 'test' })
      expect(loaded.config.unusedEmitters).toBe('ignore')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  test('rejects unsafe paths, identifiers and regexes', () => {
    expect(() =>
      resolveConfig({
        rootDir: '/tmp/project',
        outDir: '..',
        packs: [],
      }),
    ).toThrowError(expect.objectContaining({ code: 'PATH_OUTSIDE_ROOT' }))

    expect(() =>
      definePack({ id: 'not valid', factory: 'steps', importPath: './steps.ts' }),
    ).toThrowError(expect.objectContaining({ code: 'INVALID_IDENTIFIER' }))

    expect(() =>
      definePack({ id: 'delete', factory: 'steps', importPath: './steps.ts' }),
    ).toThrowError(expect.objectContaining({ code: 'INVALID_IDENTIFIER' }))

    expect(() =>
      definePack({ id: 'valid', factory: 'steps', importPath: './steps.ts' }).step(
        /not anchored/,
        () => ({ method: 'run' }),
      ),
    ).toThrowError(expect.objectContaining({ code: 'INVALID_PATTERN' }))
  })
})

function cleanPack(): StepPack {
  return definePack({
    id: 'value',
    factory: 'valueSteps',
    importPath: './test/steps/value.steps.ts',
  }).step(/^a clean state$/, () => ({ method: 'clean' }))
}

function valuePack(): StepPack {
  return cleanPack()
    .step(/^the value becomes "(.+)"$/, ({ captures }) => ({
      method: 'set',
      args: [required(captures[0])],
    }))
    .step(/^the value is persisted$/, () => ({ method: 'persist' }))
    .step(/^the value is "(.+)"$/, ({ captures }) => ({
      method: 'expectValue',
      args: [required(captures[0])],
    }))
}

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Expected value.')
  return value
}
