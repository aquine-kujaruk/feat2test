import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { generate, generateSource } from '../src/generate.js'
import { textSource } from '../src/source.js'

// Regression Features sit at the limits of the step contract. feat2test stops at red, so the
// committed expected files are the whole result: tests that only call steps and pending adapters.
const fixtures = path.join(import.meta.dirname, 'regression')

let workspace = ''
beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), 'feat2test-regression-'))
})
afterEach(async () => {
  await rm(workspace, { recursive: true, force: true })
})

describe.each(['checkout.feature', 'orders.feature.md'])('%s', (name) => {
  test('generates the expected test and Step Adapter', async () => {
    const result = await generate(path.join(fixtures, name), workspace, { runner: 'vitest' })
    await expect(await readFile(result.testPath, 'utf8')).toMatchFileSnapshot(
      `regression/expected/${path.basename(result.testPath)}`,
    )
    await expect(await readFile(result.stepAdapterPath, 'utf8')).toMatchFileSnapshot(
      `regression/expected/${path.basename(result.stepAdapterPath)}`,
    )
  })

  test('runs red: every scenario fails on a pending step', async () => {
    const result = await generate(path.join(fixtures, name), workspace, { runner: 'node:test' })
    const run = spawnSync(process.execPath, ['--test', result.testPath], { encoding: 'utf8' })
    expect(run.status).toBe(1)
    expect(run.stdout).toContain('# pass 0')
    expect(run.stdout).toContain(`# fail ${result.scenarioCount}`)
    expect(run.stdout).toContain('PENDING')
  })
})

describe('revising checkout.feature one word at a time', () => {
  let feature = ''
  const generateText = (text: string) =>
    generateSource(textSource(text, 'feature', 'checkout.feature'), workspace, {
      runner: 'vitest',
    })

  // Implement every step first so retained and replaced methods can be told apart.
  async function implemented(): Promise<string> {
    const result = await generateText(feature)
    const adapter = (await readFile(result.stepAdapterPath, 'utf8')).replaceAll(
      /throw new Error\('PENDING: (\w+)'\)/g,
      '// $1 implemented',
    )
    await writeFile(result.stepAdapterPath, adapter)
    return adapter
  }

  beforeEach(async () => {
    feature = await readFile(path.join(fixtures, 'checkout.feature'), 'utf8')
  })

  test('rewording a step replaces only its method', async () => {
    await implemented()
    const result = await generateText(
      feature.replace('Then the total shown is', 'Then the total displayed is'),
    )
    const adapter = await readFile(result.stepAdapterPath, 'utf8')
    await expect(adapter).toMatchFileSnapshot('regression/expected/checkout.reworded.steps.ts')
    expect(adapter).toContain("throw new Error('PENDING: theTotalDisplayedIs450EUR')")
    expect(adapter).not.toContain('theTotalShownIs450EUR')
    expect(adapter.match(/PENDING/g)).toHaveLength(1)
  })

  test('changing only Examples values keeps every implementation', async () => {
    const before = await implemented()
    const result = await generateText(
      feature.replace('| 4        | Pencil  | 6.00  |', '| 6        | Pencil  | 9.00  |'),
    )
    expect(await readFile(result.stepAdapterPath, 'utf8')).toBe(before)
    expect(await readFile(result.testPath, 'utf8')).toContain(
      "test('Charge 9.00 EUR for 6 × Pencil'",
    )
  })

  test.each([
    ['And the basket still holds', 'And the basket holds', 'CONFLICTING_STEP_ROLE'],
    [
      'Then the delivery fee is <fee> EUR',
      'Then the delivery fee is <card> EUR',
      'CONFLICTING_STEP_INPUTS',
    ],
    ['The basket, holds <quantity>', 'The basket, holds <count>', 'UNKNOWN_PLACEHOLDER'],
  ])('replacing "%s" with "%s" fails with %s', async (from, to, code) => {
    await expect(generateText(feature.replace(from, to))).rejects.toMatchObject({ code })
  })

  test('an unbound placeholder in a title stays literal', async () => {
    const result = await generateText(feature.replace('Charge <total> EUR', 'Charge <amount> EUR'))
    expect(await readFile(result.testPath, 'utf8')).toContain(
      "test('Charge <amount> EUR for 4 × Pencil'",
    )
  })
})
