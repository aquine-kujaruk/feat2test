import { mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { generate, generateSource } from '../src/generate.js'
import { prepareFeature, validationReport } from '../src/prepare.js'
import { runners } from '../src/runners.js'
import { readSource, textSource } from '../src/source.js'

const feature = `Feature: Add units
  Scenario Outline: Add units
    Given an empty cart
    When <quantity> units are added
    Then the cart contains <quantity> units
    Examples:
      | quantity |
      | 2 |
      | 5 |
`
const mdg = `# Feature: Add units
## Scenario Outline: Add units
* Given an empty cart
* When <quantity> units are added
* Then the cart contains <quantity> units
### Examples:
  | quantity |
  | 2 |
  | 5 |
`
let workspace = ''
beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), 'feat2test-workflow-'))
})
afterEach(async () => {
  vi.restoreAllMocks()
  await rm(workspace, { recursive: true, force: true })
})

test.each(['vitest', 'node:test'] as const)(
  'text and file produce identical outputs for %s',
  async (runner) => {
    for (const [format, text, identity] of [
      ['feature', feature, 'add.feature'],
      ['mdg', mdg, 'add.feature.md'],
    ] as const) {
      const input = path.join(workspace, identity)
      await writeFile(input, text)
      const disk = await generate(input, path.join(workspace, 'disk', format), { runner })
      const virtual = await generateSource(
        textSource(text, format, `cart/${identity}`),
        path.join(workspace, 'text', format),
        { runner },
      )
      expect(virtual.testPath).toBe(
        path.join(workspace, 'text', format, 'cart/add.feature.test.ts'),
      )
      expect(await readFile(virtual.testPath, 'utf8')).toBe(await readFile(disk.testPath, 'utf8'))
      expect(await readFile(virtual.stepAdapterPath, 'utf8')).toBe(
        await readFile(disk.stepAdapterPath, 'utf8'),
      )
      expect(
        validationReport(prepareFeature(await readSource(input, identity), runner)),
      ).toMatchObject({ valid: true, scenarioCount: 2, stepCount: 3, evidence: 'generability' })
    }
  },
)

test('retains parameterized implementations, separates nested identities and checks freshness', async () => {
  const source = textSource(feature, 'feature', 'cart/add.feature')
  const first = await generateSource(source, workspace, { runner: 'vitest' })
  const implementation = (await readFile(first.stepAdapterPath, 'utf8')).replaceAll(
    /throw new Error\('PENDING: [^']+'\)/g,
    'return',
  )
  await writeFile(first.stepAdapterPath, implementation)
  const revised = { ...source, text: feature.replace('| 5 |', '| 9 |') }
  await expect(
    generateSource(revised, workspace, { runner: 'vitest', check: true }),
  ).rejects.toMatchObject({ code: 'CHECK_FAILED' })
  await generateSource(revised, workspace, { runner: 'vitest' })
  expect(await readFile(first.stepAdapterPath, 'utf8')).toBe(implementation)
  expect(await readFile(first.testPath, 'utf8')).toContain("unitsAreAdded('9')")
  await generateSource({ ...source, identity: 'returns/add.feature' }, workspace, {
    runner: 'vitest',
  })
  await expect(
    generateSource(revised, workspace, { runner: 'vitest', check: true }),
  ).resolves.toMatchObject({ stepAdapterWritten: false })
  expect(await readdir(workspace)).toEqual(['cart', 'returns'])
  expect(await readdir(path.join(workspace, 'cart'))).toEqual([
    'add.feature.steps.ts',
    'add.feature.test.ts',
  ])
})

test.each([
  '../outside.feature',
  '/outside.feature',
  'a/../../x',
  'a/../b',
  'C:\\x.feature',
  'C:x.feature',
  'a\\b.feature',
  '',
  'a/',
  './a',
  'a//b',
  'a\0b',
])('rejects unsafe identity %j before writes', async (identity) => {
  await expect(
    generateSource({ text: feature, format: 'feature', identity }, workspace, { runner: 'vitest' }),
  ).rejects.toMatchObject({ code: 'INVALID_USAGE' })
  expect(await readdir(workspace)).toEqual([])
})

test('rejects symlink destinations and preserves output ownership', async () => {
  const outside = path.join(workspace, 'outside')
  const output = path.join(workspace, 'out')
  await mkdir(outside)
  await mkdir(output)
  await symlink(outside, path.join(output, 'cart'))
  await expect(
    generateSource(textSource(feature, 'feature', 'cart/add.feature'), output, {
      runner: 'vitest',
    }),
  ).rejects.toMatchObject({ code: 'OUTPUT_CONFLICT' })
  expect(await readdir(outside)).toEqual([])
  await writeFile(path.join(output, 'add.feature.test.ts'), 'user content')
  await expect(
    generateSource(textSource(feature, 'feature', 'add.feature'), output, { runner: 'vitest' }),
  ).rejects.toMatchObject({ code: 'OUTPUT_CONFLICT' })
  expect(await readFile(path.join(output, 'add.feature.test.ts'), 'utf8')).toBe('user content')
})

test.each(['@ai', '@code'])('does not select a runner from %s', async (tag) => {
  const result = await generateSource(
    textSource(`${tag}\n${feature}`, 'feature', 'add.feature'),
    workspace,
    { runner: 'vitest' },
  )
  expect(await readFile(result.testPath, 'utf8')).toContain("from 'vitest'")
})

test('validation exercises renderer failures and rejects missing format', () => {
  expect(() => textSource(feature, 'unknown', 'add.feature')).toThrow('--format')
  vi.spyOn(runners[0], 'render').mockImplementation(() => {
    throw new Error('renderer failure')
  })
  expect(() => prepareFeature(textSource(feature, 'feature', 'add.feature'), 'vitest')).toThrow(
    'renderer failure',
  )
})
