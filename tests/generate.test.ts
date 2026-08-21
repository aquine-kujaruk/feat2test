import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { generate, outputPrefix } from '../src/generate.js'

describe('outputPrefix', () => {
  test.each([
    ['customer.feature', 'customer.feature'],
    ['customer.feature.md', 'customer.feature'],
    ['customer.txt', 'customer.feature'],
    ['customer.spec.txt', 'customer.spec.feature'],
    ['customer', 'customer.feature'],
  ])('%s -> %s', (filename, expected) => {
    expect(outputPrefix(filename)).toBe(expected)
  })
})

test('the tracked calculator example is synchronized', async () => {
  await expect(
    generate('examples/calculator/features/calculator.feature.md', 'examples/calculator/test', {
      check: true,
    }),
  ).resolves.toMatchObject({ scenarioCount: 6 })
})

describe('generate', () => {
  let root = ''

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'gherkin-vitest-codegen-'))
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  test.each([
    ['account.feature', 'account.feature'],
    ['account.feature.md', 'account.feature'],
    ['account.txt', 'account.feature'],
  ])('uses the input basename for %s', async (filename, prefix) => {
    const input = await put(`specs/${filename}`, classicFeature('Output name'))
    const output = resolve(`output-${filename.replaceAll('.', '-')}`)

    const report = await generate(input, output)

    expect(path.basename(report.featureTestPath)).toBe(`${prefix}.test.ts`)
    expect(path.basename(report.stepAdapterPath)).toBe(`${prefix}.steps.ts`)
    expect((await readdir(output)).sort()).toEqual([`${prefix}.steps.ts`, `${prefix}.test.ts`])
  })

  test.each(['odd#.feature.txt', 'odd?.feature.txt', 'odd%.feature.txt'])(
    'rejects a Vitest-unsafe output filename: %s',
    async (filename) => {
      const input = await put(filename, classicFeature('Unsafe filename'))
      const output = resolve('generated')

      await expect(generate(input, output)).rejects.toMatchObject({ code: 'INVALID_PATH' })
      await expect(readdir(output)).rejects.toThrow()
    },
  )

  test.each(['#', '?', '%'])(
    'rejects a Vitest-unsafe output directory containing %s',
    async (character) => {
      const input = await put('safe.feature', classicFeature('Unsafe output path'))
      const output = resolve(`parent${character}unsafe/generated`)

      await expect(generate(input, output)).rejects.toMatchObject({ code: 'INVALID_PATH' })
      await expect(readdir(output)).rejects.toThrow()
    },
  )

  test.runIf(path.sep === '/')(
    'rejects a POSIX output directory containing a literal backslash',
    async () => {
      const input = await put('safe.feature', classicFeature('Unsafe output path'))
      const output = resolve('parent\\unsafe/generated')

      await expect(generate(input, output)).rejects.toMatchObject({ code: 'INVALID_PATH' })
      await expect(readdir(output)).rejects.toThrow()
    },
  )

  test.each([
    [
      'classic.txt',
      `Feature: Classic
  Scenario: Runs
    Given a ready system
`,
    ],
    [
      'markdown.anything',
      `# Feature: Markdown

## Scenario: Runs

* Given a ready system
`,
    ],
  ])('accepts valid Gherkin by content: %s', async (filename, source) => {
    const input = await put(filename, source)
    const report = await generate(input, resolve('generated'))

    expect(report).toMatchObject({ scenarioCount: 1, stepCount: 1, warnings: [] })
    expect(await read(report.featureTestPath)).toContain('await steps.aReadySystem()')
  })

  test('writes only the Feature Test and Step Adapter with ownership metadata', async () => {
    const input = await put('specs/payments.feature', classicFeature('Payments'))
    const output = resolve('generated')

    const report = await generate(input, output)
    const featureTest = await read(report.featureTestPath)
    const adapter = await read(report.stepAdapterPath)

    expect(report).toMatchObject({ scenarioCount: 1, stepCount: 1 })
    expect(featureTest).toMatch(
      /^\/\/ gherkin-vitest-codegen schema=1\n\/\/ source=\.\.\/specs\/payments\.feature/,
    )
    expect(adapter).toMatch(
      /^\/\/ gherkin-vitest-codegen schema=1\n\/\/ source=\.\.\/specs\/payments\.feature/,
    )
    expect(featureTest).toContain('import { createSteps } from "./payments.feature.steps"')
    expect(featureTest).toContain('const steps = createSteps()')
    expect(adapter).toContain('export function createSteps()')
    expect(adapter).toContain('aReadySystem(): void')
    expect(adapter).toContain('pendingStep("Implement aReadySystem")')
    expect(await readdir(output)).toHaveLength(2)
  })

  test('preserves an implemented body when its Step Name and inputs are unchanged', async () => {
    const input = await put('storage.feature', classicFeature('Storage'))
    const output = resolve('generated')
    const first = await generate(input, output)
    const adapter = await read(first.stepAdapterPath)
    await writeFile(
      first.stepAdapterPath,
      adapter.replace(
        'aReadySystem(): void {\n      pendingStep("Implement aReadySystem")\n    }',
        'aReadySystem(): void {\n      const marker = "body-preserved"\n      void marker\n    }',
      ),
      'utf8',
    )

    await generate(input, output)
    const regenerated = await read(first.stepAdapterPath)

    expect(regenerated).toContain('const marker = "body-preserved"')
    expect(regenerated).not.toContain('PENDING_STEP')
  })

  test('emits zero, direct, and object-union parameter contracts', async () => {
    const input = await put(
      'parameters.feature',
      `Feature: Parameters
  Scenario Outline: Direct input
    Given a customer
    When they select "<amount>"
    Then selection succeeds
    Examples:
      | amount |
      | 10     |

  Scenario Outline: Short transfer
    When they transfer "<amount>"
    Examples:
      | amount |
      | 10     |

  Scenario Outline: Qualified transfer
    When they transfer "<amount>" "<currency>"
    Examples:
      | amount | currency |
      | 20     | EUR      |
`,
    )

    const report = await generate(input, resolve('generated'))
    const adapter = await read(report.stepAdapterPath)
    const featureTest = await read(report.featureTestPath)

    expect(adapter).toContain('aCustomer(): void')
    expect(adapter).toContain('theySelect(amount: string): void')
    expect(adapter).toContain(
      'type TheyTransferType =\n  | { amount: string }\n  | { amount: string; currency: string }',
    )
    expect(adapter).toContain('theyTransfer(theyTransferType: TheyTransferType): void')
    expect(featureTest).toContain('steps.theySelect("10")')
    expect(featureTest).toContain('steps.theyTransfer({ amount: "10" })')
    expect(featureTest).toContain('steps.theyTransfer({ amount: "20", currency: "EUR" })')
  })

  test('updates changed inputs, keeps the body, and inserts a first-statement Pending guard', async () => {
    const input = await put(
      'transfer.feature',
      outline('When they transfer "<amount>"', '| amount |\n      | 10     |'),
    )
    const output = resolve('generated')
    const first = await generate(input, output)
    const adapter = await read(first.stepAdapterPath)
    await writeFile(
      first.stepAdapterPath,
      adapter.replace(
        'theyTransfer(amount: string): void {\n      pendingStep("Implement theyTransfer")\n    }',
        'theyTransfer(amount: string): void {\n      const marker = "body-preserved"\n      void marker\n    }',
      ),
      'utf8',
    )
    await writeFile(
      input,
      outline(
        'When they transfer "<amount>" "<currency>"',
        '| amount | currency |\n      | 10     | EUR      |',
      ),
      'utf8',
    )

    await generate(input, output)
    const changed = await read(first.stepAdapterPath)
    const methodStart = changed.indexOf('theyTransfer(theyTransferType: TheyTransferType): void {')
    const guard = changed.indexOf('pendingStep("Inputs changed: adapt theyTransfer")', methodStart)
    const body = changed.indexOf('const marker = "body-preserved"', methodStart)

    expect(methodStart).toBeGreaterThan(-1)
    expect(guard).toBeGreaterThan(methodStart)
    expect(body).toBeGreaterThan(guard)
  })

  test('marks an implemented object contract Pending when only its fields change', async () => {
    const input = await put(
      'object-contract.feature',
      outline(
        'When they transfer "<amount>" "<currency>"',
        '| amount | currency |\n      | 10     | EUR      |',
      ),
    )
    const output = resolve('generated')
    const first = await generate(input, output)
    const adapter = await read(first.stepAdapterPath)
    await writeFile(
      first.stepAdapterPath,
      adapter.replace(
        'pendingStep("Implement theyTransfer")',
        'const marker = "body-preserved"\n      void marker',
      ),
      'utf8',
    )
    await writeFile(
      input,
      outline(
        'When they transfer "<amount>" "<destination>"',
        '| amount | destination |\n      | 10     | savings     |',
      ),
      'utf8',
    )

    await generate(input, output)
    const changed = await read(first.stepAdapterPath)

    expect(changed).toContain(
      'type TheyTransferType = {\n  amount: string\n  destination: string\n}',
    )
    expect(changed).toContain('pendingStep("Inputs changed: adapt theyTransfer")')
    expect(changed).toContain('const marker = "body-preserved"')
  })

  test('passes an empty object for a zero-input variant of an object contract', async () => {
    const input = await put(
      'optional-shape.feature',
      `Feature: Variant shapes
  Scenario: No code
    When they confirm

  Scenario Outline: With code
    When they confirm "<code>"
    Examples:
      | code |
      | 1234 |
`,
    )

    const report = await generate(input, resolve('generated'))
    const adapter = await read(report.stepAdapterPath)
    const featureTest = await read(report.featureTestPath)

    expect(adapter).toContain(
      'type TheyConfirmType =\n  | Record<string, never>\n  | { code: string }',
    )
    expect(featureTest).toContain('steps.theyConfirm({})')
    expect(featureTest).toContain('steps.theyConfirm({ code: "1234" })')
  })

  test('normalizes Step Name casing for all equivalent Step calls', async () => {
    const input = await put(
      'casing.feature',
      `Feature: Casing
  Scenario: Uppercase acronym
    Given the API is ready

  Scenario: Lowercase acronym
    Given the api is ready
`,
    )

    const report = await generate(input, resolve('generated'))
    const adapter = await read(report.stepAdapterPath)
    const featureTest = await read(report.featureTestPath)

    expect(adapter.match(/theApiIsReady\(\): void/g)).toHaveLength(1)
    expect(featureTest.match(/steps\.theApiIsReady\(\)/g)).toHaveLength(2)
  })

  test('preserves an implementation when only Step Name casing changes', async () => {
    const input = await put(
      'casing-regeneration.feature',
      classicFeature('Casing regeneration', 'Given the API is ready'),
    )
    const output = resolve('generated')
    const first = await generate(input, output)
    const adapter = await read(first.stepAdapterPath)
    await writeFile(
      first.stepAdapterPath,
      adapter.replace(
        'pendingStep("Implement theApiIsReady")',
        'const marker = "body-preserved"\n      void marker',
      ),
      'utf8',
    )
    await writeFile(input, classicFeature('Casing regeneration', 'Given the api is ready'), 'utf8')

    const report = await generate(input, output)
    const regenerated = await read(first.stepAdapterPath)

    expect(report.warnings).toEqual([])
    expect(regenerated).toContain('const marker = "body-preserved"')
    expect(regenerated).not.toContain('// Obsolete Steps')
    expect(regenerated).not.toContain('PENDING_STEP')
  })

  test('keeps disappeared methods as Obsolete and makes check fail', async () => {
    const input = await put('evolution.feature', classicFeature('Evolution', 'Given old behavior'))
    const output = resolve('generated')
    const first = await generate(input, output)
    await writeFile(input, classicFeature('Evolution', 'Given new behavior'), 'utf8')

    const report = await generate(input, output)
    const adapter = await read(first.stepAdapterPath)

    expect(report.warnings).toContainEqual({
      code: 'OBSOLETE_STEP',
      message: expect.stringContaining('oldBehavior'),
    })
    expect(adapter).toContain('// Obsolete Steps')
    expect(adapter).toContain('oldBehavior(): void')
    await expect(generate(input, output, { check: true })).rejects.toMatchObject({
      code: 'CHECK_FAILED',
      message: expect.stringContaining('obsolete: oldBehavior'),
    })
  })

  test('groups Step methods by inherited Context, Action, and Outcome roles', async () => {
    const input = await put(
      'roles.feature',
      `Feature: Roles
  Scenario: Ordered adapter
    Given first context
    And second context
    When first action
    And second action
    Then first outcome
    And second outcome
`,
    )
    const report = await generate(input, resolve('generated'))
    const adapter = await read(report.stepAdapterPath)
    const context = adapter.indexOf('// Context Steps')
    const action = adapter.indexOf('// Action Steps')
    const outcome = adapter.indexOf('// Outcome Steps')

    expect(context).toBeGreaterThan(-1)
    expect(action).toBeGreaterThan(context)
    expect(outcome).toBeGreaterThan(action)
    expect(adapter.slice(context, action)).toContain('secondContext(): void')
    expect(adapter.slice(action, outcome)).toContain('secondAction(): void')
    expect(adapter.slice(outcome)).toContain('secondOutcome(): void')
  })

  test('rejects one Step Name used in conflicting roles without writing outputs', async () => {
    const input = await put(
      'conflict.feature',
      `Feature: Conflict
  Scenario: Context
    Given shared behavior
  Scenario: Outcome
    Then shared behavior
`,
    )
    const output = resolve('generated')

    await expect(generate(input, output)).rejects.toMatchObject({ code: 'CONFLICTING_STEP_ROLE' })
    await expect(readdir(output)).rejects.toThrow()
  })

  test('warns and uses generic names for anonymous quoted inputs', async () => {
    const input = await put(
      'anonymous.feature',
      `Feature: Anonymous
  Scenario: Concrete values
    Given account "A" contains "10"
`,
    )

    const report = await generate(input, resolve('generated'))
    const adapter = await read(report.stepAdapterPath)

    expect(report.warnings).toContainEqual({
      code: 'ANONYMOUS_STEP_INPUT',
      message: expect.stringContaining('accountContains'),
    })
    expect(adapter).toContain('type AccountContainsType = {\n  value: string\n  value2: string\n}')
    expect(adapter).toContain('accountContains(accountContainsType: AccountContainsType): void')
  })

  test('rejects invalid Gherkin with one domain error and no writes', async () => {
    const input = await put('broken.md', '# This is prose\n\nNothing executable.\n')
    const output = resolve('generated')

    await expect(generate(input, output)).rejects.toMatchObject({
      code: 'INVALID_GHERKIN',
      message: expect.not.stringMatching(/markdown|matcher|parser/i),
    })
    await expect(readdir(output)).rejects.toThrow()
  })

  test.each([
    [
      'an arrow property',
      (source: string) => source.replace('aReadySystem(): void {', 'aReadySystem: (): void => {'),
    ],
    [
      'a missing return annotation',
      (source: string) => source.replace('aReadySystem(): void {', 'aReadySystem() {'),
    ],
  ])('rejects %s without touching the Feature Test', async (_name, mutate) => {
    const input = await put('shape.feature', classicFeature('Shape'))
    const output = resolve('generated')
    const report = await generate(input, output)
    const featureTestBefore = await read(report.featureTestPath)
    const invalidAdapter = mutate(await read(report.stepAdapterPath))
    await writeFile(report.stepAdapterPath, invalidAdapter, 'utf8')

    await expect(generate(input, output)).rejects.toMatchObject({ code: 'UNSUPPORTED_STEP_SHAPE' })
    expect(await read(report.featureTestPath)).toBe(featureTestBefore)
    expect(await read(report.stepAdapterPath)).toBe(invalidAdapter)
  })

  test('never overwrites a target not owned by the input', async () => {
    const input = await put('conflict.feature', classicFeature('Ownership'))
    const target = await put('generated/conflict.feature.test.ts', '// handwritten\n')

    await expect(generate(input, resolve('generated'))).rejects.toMatchObject({
      code: 'OUTPUT_OWNERSHIP_CONFLICT',
    })
    expect(await read(target)).toBe('// handwritten\n')
    expect(await readdir(resolve('generated'))).toEqual(['conflict.feature.test.ts'])
  })

  test('--check detects drift and performs no writes', async () => {
    const input = await put('check.feature', classicFeature('Check'))
    const output = resolve('generated')
    const report = await generate(input, output)
    const adapter = await read(report.stepAdapterPath)
    const [schema, source] = adapter.split('\n', 2)
    await writeFile(
      report.stepAdapterPath,
      `${schema}\n${source}\n\nexport function createSteps() {\n  return {\n    // Context Steps\n    aReadySystem(): void {\n      // implemented\n    },\n  }\n}\n`,
      'utf8',
    )
    await generate(input, output)
    await expect(generate(input, output, { check: true })).resolves.toMatchObject({ warnings: [] })

    const drift = `${await read(report.featureTestPath)}// local drift\n`
    const stableAdapter = await read(report.stepAdapterPath)
    await writeFile(report.featureTestPath, drift, 'utf8')

    await expect(generate(input, output, { check: true })).rejects.toMatchObject({
      code: 'CHECK_FAILED',
      message: expect.stringContaining('changed:'),
    })
    expect(await read(report.featureTestPath)).toBe(drift)
    expect(await read(report.stepAdapterPath)).toBe(stableAdapter)
  })

  test('uses English by default and accepts other dialects only through the language header', async () => {
    const input = await put(
      'idioma.txt',
      `Característica: Idioma
  Escenario: Funciona
    Dado un sistema listo
`,
    )
    const output = resolve('generated')

    await expect(generate(input, output)).rejects.toMatchObject({ code: 'INVALID_GHERKIN' })
    await writeFile(
      input,
      `# language: es
Característica: Idioma
  Escenario: Funciona
    Dado un sistema listo
`,
      'utf8',
    )

    await expect(generate(input, output)).resolves.toMatchObject({ scenarioCount: 1 })
  })

  test('preserves inherited tags as metadata without changing Vitest semantics', async () => {
    const input = await put(
      'tags.feature',
      `@feature
Feature: Tags
  @scenario @fast
  Scenario: Tagged
    Given a ready system
`,
    )

    const report = await generate(input, resolve('generated'))
    const featureTest = await read(report.featureTestPath)

    expect(featureTest).toContain('// Tags: @feature @scenario @fast')
    expect(featureTest).not.toMatch(/test\.(?:skip|only)/)
  })

  test('passes DocStrings and DataTables through typed Step inputs', async () => {
    const input = await put(
      'arguments.feature',
      `Feature: Structured arguments
  Scenario: Consume arguments
    Given a payload
      """json
      {"ok":true}
      """
    When these rows
      | name | amount |
      | book | 10     |
    Then processing succeeds
`,
    )

    const report = await generate(input, resolve('generated'))
    const adapter = await read(report.stepAdapterPath)
    const featureTest = await read(report.featureTestPath)

    expect(adapter).toContain('type FeatureDocString = {')
    expect(adapter).toContain('type FeatureDataTable = readonly (readonly string[])[]')
    expect(adapter).toContain('aPayload(docString: FeatureDocString): void')
    expect(adapter).toContain('theseRows(dataTable: FeatureDataTable): void')
    expect(featureTest).toContain(
      'steps.aPayload({"content":"{\\"ok\\":true}","mediaType":"json"})',
    )
    expect(featureTest).toContain('steps.theseRows([["name","amount"],["book","10"]])')
  })

  test('reports outputs whose recorded source disappeared and check rejects them', async () => {
    const missing = await put('missing.feature', classicFeature('Missing'))
    const output = resolve('generated')
    await generate(missing, output)
    await rm(missing)
    const current = await put('current.feature', classicFeature('Current'))

    const report = await generate(current, output)

    expect(report.warnings).toContainEqual({
      code: 'ORPHANED_FEATURE_OUTPUT',
      message: expect.stringContaining('missing.feature'),
    })
    await expect(generate(current, output, { check: true })).rejects.toMatchObject({
      code: 'CHECK_FAILED',
      message: expect.stringContaining('orphaned:'),
    })
  })

  test('reports invalid input and output paths with stable error codes', async () => {
    await expect(generate(resolve('missing.feature'), resolve('generated'))).rejects.toMatchObject({
      code: 'INPUT_NOT_FOUND',
    })
    await expect(generate(root, resolve('generated'))).rejects.toMatchObject({
      code: 'INPUT_NOT_FILE',
    })

    const input = await put('valid.feature', classicFeature('Valid'))
    const outputFile = await put('output-file', 'not a directory')
    await expect(generate(input, outputFile)).rejects.toMatchObject({
      code: 'OUTPUT_NOT_DIRECTORY',
    })
  })

  test('--check reports both missing outputs and does not create the directory', async () => {
    const input = await put('missing-output.feature', classicFeature('Missing output'))
    const output = resolve('generated')

    await expect(generate(input, output, { check: true })).rejects.toMatchObject({
      code: 'CHECK_FAILED',
      message: expect.stringMatching(/missing:.*\.test\.ts[\s\S]*missing:.*\.steps\.ts/),
    })
    await expect(readdir(output)).rejects.toThrow()
  })

  test.each([
    ['an empty source', '\n\n'],
    ['a Feature without a name', 'Feature:\n  Scenario: Example\n    Given a step\n'],
    ['a Feature without scenarios', 'Feature: Empty\n'],
    ['a Scenario without Steps', 'Feature: Empty\n  Scenario: Empty\n'],
    [
      'an unknown language',
      '# language: nowhere\nFeature: Unknown\n  Scenario: Example\n    Given a step\n',
    ],
  ])('rejects %s as INVALID_GHERKIN', async (_name, source) => {
    const input = await put('invalid.content', source)

    await expect(generate(input, resolve('generated'))).rejects.toMatchObject({
      code: 'INVALID_GHERKIN',
    })
  })

  test('compiles Feature and Rule Backgrounds plus every Examples row', async () => {
    const input = await put(
      'rule.feature',
      `Feature: Rules
  Background:
    Given feature context

  Rule: Limits
    Background:
      Given rule context

    Scenario Outline: Check a value
      When value <value> is checked
      Then it is accepted
      Examples:
        | value |
        | A     |
        | B     |
`,
    )

    const report = await generate(input, resolve('generated'))
    const featureTest = await read(report.featureTestPath)

    expect(report.scenarioCount).toBe(2)
    expect(featureTest).toContain('describe("Rule: Limits"')
    expect(featureTest).toContain('Check a value (value=A)')
    expect(featureTest).toContain('Check a value (value=B)')
    expect(featureTest.match(/steps\.featureContext\(\)/g)).toHaveLength(2)
    expect(featureTest.match(/steps\.ruleContext\(\)/g)).toHaveLength(2)
    expect(featureTest).toContain('steps.valueIsChecked("A")')
  })

  test('keeps separate Rule blocks that share a name', async () => {
    const input = await put(
      'same-rules.feature',
      `Feature: Same rules
  Rule: Shared
    Scenario: First
      Given first state

  Rule: Shared
    Scenario: Second
      Given second state
`,
    )

    const report = await generate(input, resolve('generated'))
    const featureTest = await read(report.featureTestPath)

    expect(featureTest.match(/describe\("Rule: Shared"/g)).toHaveLength(2)
    expect(featureTest.indexOf('test("First"')).toBeLessThan(featureTest.indexOf('test("Second"'))
  })

  test('preserves Cucumber substitution semantics for duplicate Examples headers', async () => {
    const input = await put(
      'duplicate-headers.feature',
      `Feature: Duplicate headers
  Scenario Outline: Values
    When first "<value>" and second "<value>"
    Examples:
      | value | value |
      | A     | B     |
`,
    )

    const report = await generate(input, resolve('generated'))
    const featureTest = await read(report.featureTestPath)

    expect(featureTest).toContain('Values (value=A, value=B)')
    expect(featureTest).toContain('steps.firstAndSecond({ value: "A", value2: "A" })')
  })

  test('makes colliding, suffixed, and empty Scenario names readable and unique', async () => {
    const input = await put(
      'names.feature',
      `Feature: Names
  Scenario: Same
    Given first state
  Scenario: Same #2
    Given literal suffix state
  Scenario: Same
    Given second state
  Scenario:
    Given third state
`,
    )

    const report = await generate(input, resolve('generated'))
    const featureTest = await read(report.featureTestPath)

    expect(featureTest).toContain('test("Same",')
    expect(featureTest).toContain('test("Same #2",')
    expect(featureTest).toContain('test("Same #3",')
    expect(featureTest).toContain('test("Scenario at line 8",')
  })

  test('creates valid identifiers for reserved, numeric, fallback, and duplicate input names', async () => {
    const input = await put(
      'identifiers.feature',
      `Feature: Identifiers
  Scenario Outline: Names
    Given delete item
    And 123 ready
    And "literal"
    And values <value> <value>
    Examples:
      | value |
      | A     |
`,
    )

    const report = await generate(input, resolve('generated'))
    const adapter = await read(report.stepAdapterPath)

    expect(adapter).toContain('deleteItem(): void')
    expect(adapter).toContain('step123Ready(): void')
    expect(adapter).toContain('step(value: string): void')
    expect(adapter).toContain('value: string')
    expect(adapter).toContain('value2: string')
  })

  test('renames strict-mode reserved parameter bindings', async () => {
    const input = await put(
      'strict-bindings.feature',
      outline(
        'When strict "<arguments>" "<eval>"',
        '| arguments | eval |\n      | first     | second |',
      ),
    )

    const report = await generate(input, resolve('generated'))
    const adapter = await read(report.stepAdapterPath)

    expect(adapter).toContain('argumentsValue: string')
    expect(adapter).toContain('evalValue: string')
  })

  test('renames the pending helper when it appears as an input binding', async () => {
    const input = await put(
      'pending-binding.feature',
      outline('When value "<pendingStep>"', '| pendingStep |\n      | ready       |'),
    )

    const report = await generate(input, resolve('generated'))
    const adapter = await read(report.stepAdapterPath)

    expect(adapter).toContain('value(pendingStepValue: string): void')
  })

  test('parses escaped quotes and an even backslash run before the closing quote', async () => {
    const input = await put(
      'quoted-escapes.feature',
      String.raw`Feature: Quoted escapes
  Scenario: Values
    Given path "C:\\"
    And message "a \"quoted\" value"
`,
    )

    const report = await generate(input, resolve('generated'))
    const adapter = await read(report.stepAdapterPath)
    const featureTest = await read(report.featureTestPath)

    expect(adapter).toContain('path(value: string): void')
    expect(adapter).toContain('message(value: string): void')
    expect(featureTest).toContain(`steps.path(${JSON.stringify('C:\\')})`)
    expect(featureTest).toContain(`steps.message(${JSON.stringify('a "quoted" value')})`)
  })

  test('rejects distinct identities that collide as one method name', async () => {
    const input = await put(
      'collision.feature',
      `Feature: Collision
  Scenario: Reserved word
    Given delete
    And delete value
`,
    )

    await expect(generate(input, resolve('generated'))).rejects.toMatchObject({
      code: 'STEP_NAME_COLLISION',
    })
  })

  test('supports Promise<void> Step methods and no-media-type DocStrings', async () => {
    const input = await put(
      'async.feature',
      `Feature: Async
  Scenario: Async body
    Given plain text
      """
      hello
      """
`,
    )
    const output = resolve('generated')
    const report = await generate(input, output)
    const adapter = await read(report.stepAdapterPath)
    await writeFile(
      report.stepAdapterPath,
      adapter.replace(
        'plainText(docString: FeatureDocString): void {\n      pendingStep("Implement plainText")\n    }',
        'async plainText(docString: FeatureDocString): Promise<void> {\n      await Promise.resolve(docString.content)\n    }',
      ),
      'utf8',
    )

    await expect(generate(input, output)).resolves.toMatchObject({ warnings: [] })
    const featureTest = await read(report.featureTestPath)
    expect(featureTest).toContain('steps.plainText({"content":"hello"})')
  })

  test.each([
    ['invalid TypeScript', (source: string) => `${source}\nexport {`],
    [
      'no exported factory',
      (source: string) => source.replace('export function createSteps', 'function renamedSteps'),
    ],
    [
      'a factory parameter',
      (source: string) => source.replace('createSteps()', 'createSteps(seed: string)'),
    ],
    [
      'a generic factory',
      (source: string) => source.replace('createSteps()', 'createSteps<Seed>()'),
    ],
    [
      'an async factory',
      (source: string) =>
        source.replace('export function createSteps', 'export async function createSteps'),
    ],
    [
      'a generator factory',
      (source: string) =>
        source.replace('export function createSteps', 'export function* createSteps'),
    ],
    [
      'a default factory export',
      (source: string) =>
        source.replace('export function createSteps', 'export default function createSteps'),
    ],
    [
      'a non-object return',
      (source: string) => source.replace('return {', 'return undefined ?? {'),
    ],
    [
      'a computed Step name',
      (source: string) => source.replace('aReadySystem()', '["aReadySystem"]()'),
    ],
    [
      'an unsupported return type',
      (source: string) => source.replace('aReadySystem(): void', 'aReadySystem(): number'),
    ],
  ])('rejects Step Adapter shape: %s', async (_name, mutate) => {
    const input = await put('adapter.feature', classicFeature('Adapter'))
    const output = resolve('generated')
    const report = await generate(input, output)
    const before = await read(report.featureTestPath)
    await writeFile(report.stepAdapterPath, mutate(await read(report.stepAdapterPath)), 'utf8')

    await expect(generate(input, output)).rejects.toMatchObject({
      code: 'UNSUPPORTED_STEP_SHAPE',
    })
    expect(await read(report.featureTestPath)).toBe(before)
  })

  test('rejects incomplete managed type markers', async () => {
    const input = await put(
      'markers.feature',
      outline(
        'When they transfer "<amount>" "<currency>"',
        '| amount | currency |\n      | 10     | EUR      |',
      ),
    )
    const output = resolve('generated')
    const report = await generate(input, output)
    const adapter = await read(report.stepAdapterPath)
    await writeFile(
      report.stepAdapterPath,
      adapter.replace('// gherkin-vitest-codegen:types:end', ''),
      'utf8',
    )

    await expect(generate(input, output)).rejects.toMatchObject({
      code: 'UNSUPPORTED_STEP_SHAPE',
    })
  })

  test('rejects a developer type that conflicts with a newly generated Step type', async () => {
    const input = await put(
      'type-conflict.feature',
      outline('When they transfer "<amount>"', '| amount |\n      | 10     |'),
    )
    const output = resolve('generated')
    const report = await generate(input, output)
    const adapter = await read(report.stepAdapterPath)
    await writeFile(
      report.stepAdapterPath,
      adapter
        .replace(
          'export function createSteps()',
          'type TheyTransferType = { manual: string }\n\nexport function createSteps()',
        )
        .replace(
          'theyTransfer(amount: string): void {\n      pendingStep("Implement theyTransfer")\n    }',
          'theyTransfer(amount: string): void {\n      void amount\n    }',
        ),
      'utf8',
    )
    await writeFile(
      input,
      outline(
        'When they transfer "<amount>" "<currency>"',
        '| amount | currency |\n      | 10     | EUR      |',
      ),
      'utf8',
    )

    await expect(generate(input, output)).rejects.toMatchObject({
      code: 'UNSUPPORTED_STEP_SHAPE',
      message: expect.stringContaining('TheyTransferType'),
    })
  })

  test.each([
    'interface TheyTransferType { manual: string }',
    'class TheyTransferType {}',
    'import type { TheyTransferType } from "./manual"',
  ])('rejects an existing %s binding that conflicts with a managed Step type', async (binding) => {
    const input = await put(
      'managed-type-conflict.feature',
      outline(
        'When they transfer "<amount>" "<currency>"',
        '| amount | currency |\n      | 10     | EUR      |',
      ),
    )
    const output = resolve('generated')
    const report = await generate(input, output)
    const adapter = await read(report.stepAdapterPath)
    await writeFile(
      report.stepAdapterPath,
      adapter.replace(
        'export function createSteps()',
        `${binding}\n\nexport function createSteps()`,
      ),
      'utf8',
    )

    await expect(generate(input, output)).rejects.toMatchObject({
      code: 'UNSUPPORTED_STEP_SHAPE',
      message: expect.stringContaining('TheyTransferType'),
    })
  })

  test('rejects a factory-local binding that shadows the pending guard', async () => {
    const input = await put('local-helper.feature', classicFeature('Local helper'))
    const output = resolve('generated')
    const report = await generate(input, output)
    const adapter = await read(report.stepAdapterPath)
    await writeFile(
      report.stepAdapterPath,
      adapter
        .replace(
          'export function createSteps() {\n  return {',
          'export function createSteps() {\n  const pendingStep = (_message: string): void => {}\n\n  return {',
        )
        .replace(
          'aReadySystem(): void {\n      pendingStep("Implement aReadySystem")\n    }',
          'aReadySystem(): void {\n      // implemented\n    }',
        ),
      'utf8',
    )
    await writeFile(
      input,
      `Feature: Local helper
  Scenario: New Step
    Given a ready system
    When new behavior
`,
      'utf8',
    )

    await expect(generate(input, output)).rejects.toMatchObject({
      code: 'UNSUPPORTED_STEP_SHAPE',
      message: expect.stringContaining('pendingStep'),
    })
  })

  test('rejects a factory-local type that shadows a managed Step type', async () => {
    const input = await put(
      'local-type.feature',
      outline(
        'When they transfer "<amount>" "<currency>"',
        '| amount | currency |\n      | 10     | EUR      |',
      ),
    )
    const output = resolve('generated')
    const report = await generate(input, output)
    const adapter = await read(report.stepAdapterPath)
    await writeFile(
      report.stepAdapterPath,
      adapter.replace(
        'export function createSteps() {\n  return {',
        'export function createSteps() {\n  type TheyTransferType = { shadow: string }\n\n  return {',
      ),
      'utf8',
    )

    await expect(generate(input, output)).rejects.toMatchObject({
      code: 'UNSUPPORTED_STEP_SHAPE',
      message: expect.stringContaining('TheyTransferType'),
    })
  })

  test.each([
    'function pendingStep(): void {}',
    'const pendingStep = (): void => {}',
    'import { pendingStep } from "./manual"',
  ])('rejects a developer %s binding that reserves pendingStep', async (binding) => {
    const input = await put('helper.feature', classicFeature('Helper'))
    const output = resolve('generated')
    const report = await generate(input, output)
    const adapter = await read(report.stepAdapterPath)
    await writeFile(
      report.stepAdapterPath,
      adapter
        .replace(
          'aReadySystem(): void {\n      pendingStep("Implement aReadySystem")\n    }',
          'aReadySystem(): void {\n      // implemented\n    }',
        )
        .replace(/\/\/ gherkin-vitest-codegen:pending-helper[\s\S]*$/, `${binding}\n`),
      'utf8',
    )
    await writeFile(
      input,
      `Feature: Helper
  Scenario: New Step
    Given a ready system
    When new behavior
`,
      'utf8',
    )

    await expect(generate(input, output)).rejects.toMatchObject({
      code: 'UNSUPPORTED_STEP_SHAPE',
      message: expect.stringContaining('reserves pendingStep'),
    })
  })

  test('rejects an invalid generated pending helper marker', async () => {
    const input = await put('invalid-helper.feature', classicFeature('Invalid helper'))
    const output = resolve('generated')
    const report = await generate(input, output)
    const adapter = await read(report.stepAdapterPath)
    await writeFile(
      report.stepAdapterPath,
      adapter.replace('function pendingStep(', 'function renamedPendingStep('),
      'utf8',
    )

    await expect(generate(input, output)).rejects.toMatchObject({
      code: 'UNSUPPORTED_STEP_SHAPE',
      message: expect.stringContaining('invalid pending helper'),
    })
  })

  function resolve(relativePath: string): string {
    return path.join(root, relativePath)
  }

  async function put(relativePath: string, contents: string): Promise<string> {
    const absolute = resolve(relativePath)
    await mkdir(path.dirname(absolute), { recursive: true })
    await writeFile(absolute, contents, 'utf8')
    return absolute
  }
})

async function read(filePath: string): Promise<string> {
  return readFile(filePath, 'utf8')
}

function classicFeature(name: string, step = 'Given a ready system'): string {
  return `Feature: ${name}
  Scenario: Works
    ${step}
`
}

function outline(step: string, examples: string): string {
  return `Feature: Transfer
  Scenario Outline: Transfer funds
    ${step}
    Examples:
      ${examples}
`
}
