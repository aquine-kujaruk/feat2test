import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url))
const cli = path.join(repositoryRoot, 'dist/cli.mjs')
const minimal = 'Feature: Payment\n  Scenario: Accepted\n    Given payment is ready\n'
let workspace = ''

beforeAll(async () => {
  const build = await run(
    [process.execPath, path.join(repositoryRoot, 'node_modules/tsdown/dist/run.mjs')],
    repositoryRoot,
  )
  expect(build.code, build.stderr).toBe(0)
  workspace = await mkdtemp(path.join(tmpdir(), 'feat2test-cli-'))
}, 30_000)

afterAll(async () => {
  if (workspace) await rm(workspace, { recursive: true, force: true })
})

async function invoke(args: string[], cwd = workspace, input?: string) {
  return run([process.execPath, cli, ...args], cwd, input)
}

async function fixture(name: string) {
  const cwd = path.join(workspace, name)
  await mkdir(cwd)
  await writeFile(path.join(cwd, 'payment.feature'), minimal)
  return cwd
}

describe('CLI', () => {
  test('prints concise help and package version', async () => {
    const help = await invoke(['--help'])
    const version = await invoke(['--version'])
    const metadata = JSON.parse(await readFile(path.join(repositoryRoot, 'package.json'), 'utf8'))
    expect(help.code).toBe(0)
    expect(help.stdout).toContain('feat2test generate <feature> <output> --runner <name> [--check]')
    expect(version.stdout.trim()).toBe(metadata.version)
  })

  test.each([
    [],
    ['payment.feature'],
    ['payment.feature', 'out', '--runner', 'vitest'],
    ['generate', 'payment.feature', 'out'],
    ['generate', 'payment.feature', 'out', '--runner'],
    ['generate', 'payment.feature', 'out', '--strategy', 'vitest'],
    ['generate', 'payment.feature', 'out', '--runner', 'vitest', '--dry-run'],
    ['check', 'payment.feature', 'out', '--runner', 'vitest'],
    ['init'],
    ['runners'],
  ])('rejects invalid or retired syntax: %j', async (...args) => {
    const result = await invoke(args)
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('INVALID_USAGE')
    expect(result.stderr).toContain('feat2test --help')
  })

  test('generates and checks without rewriting the adapter', async () => {
    const cwd = await fixture('workflow')
    const command = ['generate', 'payment.feature', 'out', '--runner', 'vitest']
    const generated = await invoke(command, cwd)
    expect(generated).toMatchObject({ code: 0, stderr: '' })
    expect(generated.stdout).toContain('Generated 1 Features · 1 scenarios · 1 steps (vitest)')

    const output = path.join(cwd, 'out')
    const adapter = path.join(output, 'payment.feature.steps.ts')
    const implementation =
      'export function createSteps() { return { paymentIsReady(): void {} } }\n'
    await writeFile(adapter, implementation)
    const checked = await invoke([...command, '--check'], cwd)
    expect(checked.code, checked.stderr).toBe(0)
    expect(checked.stdout).toContain('Checked 1 Features')
    expect(await readFile(adapter, 'utf8')).toBe(implementation)

    await writeFile(path.join(cwd, 'payment.feature'), minimal.replace('Accepted', 'Updated'))
    const stale = await invoke([...command, '--check'], cwd)
    expect(stale.code).toBe(1)
    expect(stale.stderr).toContain('CHECK_FAILED')
    expect(await readFile(path.join(output, 'payment.feature.test.ts'), 'utf8')).toContain(
      "test('Accepted'",
    )
  })

  test('selects the requested runner', async () => {
    const cwd = await fixture('runner')
    const result = await invoke(
      ['generate', 'payment.feature', 'out', '--runner', 'node:test'],
      cwd,
    )
    expect(result.code, result.stderr).toBe(0)
    const output = await readFile(path.join(cwd, 'out/payment.feature.test.ts'), 'utf8')
    expect(output).toContain("from 'node:test'")
    expect(output).toContain("from './payment.feature.steps.ts'")
  })

  test('synchronizes executable steps and creates pending methods instead of missing references', async () => {
    const cwd = await fixture('synchronize')
    const command = ['generate', 'payment.feature', 'out', '--runner', 'node:test']
    expect((await invoke(command, cwd)).code).toBe(0)
    const adapter = path.join(cwd, 'out/payment.feature.steps.ts')
    const implementation = `import assert from 'node:assert/strict'
export function createSteps() {
  const payment = { ready: true }
  return {
    paymentIsReady(): void { assert.equal(payment.ready, true) },
    obsolete(): void { throw new Error('obsolete implementation') }
  }
}
`
    await writeFile(adapter, implementation)
    const stale = await invoke([...command, '--check'], cwd)
    expect(stale.code).toBe(1)
    expect(stale.stderr).toContain('payment.feature.steps.ts')
    expect(await readFile(adapter, 'utf8')).toBe(implementation)

    const generated = await invoke(command, cwd)
    expect(generated.code, generated.stderr).toBe(0)
    const synchronized = await readFile(adapter, 'utf8')
    expect(synchronized).toContain('assert.equal(payment.ready, true)')
    expect(synchronized).not.toContain('obsolete()')
    const executed = await run([process.execPath, '--test', 'out/payment.feature.test.ts'], cwd)
    expect(executed.code, executed.stdout + executed.stderr).toBe(0)

    await writeFile(adapter, synchronized.replace('paymentIsReady()', 'previousPaymentIsReady()'))
    expect((await invoke(command, cwd)).code).toBe(0)
    const pending = await run([process.execPath, '--test', 'out/payment.feature.test.ts'], cwd)
    expect(pending.code).toBe(1)
    expect(pending.stdout + pending.stderr).toContain('PENDING: paymentIsReady')
    expect(pending.stdout + pending.stderr).not.toContain('is not a function')
    expect(await readFile(adapter, 'utf8')).not.toContain('previousPaymentIsReady')
    expect((await invoke([...command, '--check'], cwd)).code).toBe(0)
  })

  test('generates directories recursively', async () => {
    const cwd = await fixture('directory')
    await mkdir(path.join(cwd, 'nested'))
    await writeFile(path.join(cwd, 'nested/payment.feature'), minimal)
    const command = ['generate', '.', 'out', '--runner', 'vitest']
    const result = await invoke(command, cwd)
    expect(result.code, result.stderr).toBe(0)
    expect(result.stdout).toContain('Generated 2 Features')
    expect(await readdir(path.join(cwd, 'out/nested'))).toContain('payment.feature.test.ts')
    expect((await invoke([...command, '--check'], cwd)).code).toBe(0)
  })

  test('reports runner and parser errors with useful exit codes', async () => {
    const cwd = await fixture('errors')
    const unknown = await invoke(['generate', 'payment.feature', 'out', '-r', 'jest'], cwd)
    expect(unknown.code).toBe(2)
    expect(unknown.stderr).toContain('UNKNOWN_RUNNER')

    await writeFile(path.join(cwd, 'payment.feature'), 'Feature: Empty\n')
    const invalid = await invoke(['generate', 'payment.feature', 'out', '-r', 'vitest'], cwd)
    expect(invalid.code).toBe(1)
    expect(invalid.stderr).toContain('INVALID_GHERKIN')
    expect(invalid.stderr).not.toContain(' at ')
    const debug = await invoke(
      ['generate', 'payment.feature', 'out', '-r', 'vitest', '--debug'],
      cwd,
    )
    expect(debug.stderr).toContain(' at ')
  })

  test('prints warnings on stderr', async () => {
    const cwd = await fixture('warnings')
    await writeFile(
      path.join(cwd, 'table.feature.md'),
      '# Feature: Underindented\n\n## Scenario: Order products\n\n* Given the order contains:\n | product |\n | Pencil |\n* Then the order holds one line\n',
    )
    const result = await invoke(['generate', 'table.feature.md', 'out', '--runner', 'vitest'], cwd)
    expect(result.code).toBe(0)
    expect(result.stderr).toMatch(/table\.feature\.md:6 .*two leading spaces/)
  })
})

describe('memory workflow', () => {
  const sourceArgs = [
    '--format',
    'feature',
    '--source',
    'cart/payment.feature',
    '--runner',
    'node:test',
  ]

  test.each(['text', 'stdin'])(
    'generates and validates %s without a physical source',
    async (route) => {
      const cwd = await fixture(`memory-${route}`)
      const args = route === 'text' ? ['--text', minimal] : ['--stdin']
      const validated = await invoke(['validate', ...args, ...sourceArgs, '--json'], cwd, minimal)
      expect(validated.code, validated.stderr).toBe(0)
      expect(JSON.parse(validated.stdout)).toMatchObject({
        valid: true,
        source: 'cart/payment.feature',
        format: 'feature',
        runner: 'node:test',
        scenarioCount: 1,
        stepCount: 1,
        evidence: 'generability',
        diagnostics: [],
      })
      expect(await readdir(cwd)).toEqual(['payment.feature'])
      const generated = await invoke(['generate', 'out', ...args, ...sourceArgs], cwd, minimal)
      expect(generated.code, generated.stderr).toBe(0)
      expect(await readdir(path.join(cwd, 'out/cart'))).toEqual([
        'payment.feature.steps.ts',
        'payment.feature.test.ts',
      ])
      const adapter = path.join(cwd, 'out/cart/payment.feature.steps.ts')
      await writeFile(
        adapter,
        'export function createSteps() { return { paymentIsReady(): void {} } }\n',
      )
      expect(
        (await run([process.execPath, '--test', 'out/cart/payment.feature.test.ts'], cwd)).code,
      ).toBe(0)
      expect(
        (await invoke(['generate', 'out', ...args, ...sourceArgs, '--check'], cwd, minimal)).code,
      ).toBe(0)
    },
  )

  test.each(['text', 'stdin'])('accepts explicit mdg from %s', async (route) => {
    const mdg = '# Feature: Payment\n## Scenario: Accepted\n* Given payment is ready\n'
    const args = route === 'text' ? ['--text', mdg] : ['--stdin']
    const result = await invoke(
      [
        'validate',
        ...args,
        '--format',
        'mdg',
        '--source',
        'payment.feature.md',
        '-r',
        'vitest',
        '--json',
      ],
      workspace,
      mdg,
    )
    expect(result.code, result.stderr).toBe(0)
    expect(JSON.parse(result.stdout)).toMatchObject({ format: 'mdg', scenarioCount: 1 })
  })

  test.each([
    ['--stdin', '--text', minimal, ...sourceArgs],
    ['--text', minimal, '--source', 'x.feature', '-r', 'vitest'],
    ['--stdin', '--format', 'feature', '-r', 'vitest'],
    ['--stdin', ...sourceArgs, 'unexpected.feature'],
    ['payment.feature', '--format', 'feature', '-r', 'vitest'],
    ['--text', minimal, ...sourceArgs, '--check'],
    ['--text', minimal, '--format', 'feature', '--source', 'x.feature', '-r', 'unknown'],
  ])('rejects incompatible validation options without waiting for stdin: %j', async (...args) => {
    const result = await invoke(['validate', ...args, '--json'])
    expect(result.code).toBe(2)
    expect(JSON.parse(result.stdout).valid).toBe(false)
  })

  test('rejects mixed file and text generation before mutation', async () => {
    const cwd = await fixture('conflicting-text')
    const result = await invoke(
      ['generate', 'payment.feature', 'out', '--text', minimal, ...sourceArgs],
      cwd,
    )
    expect(result.code).toBe(2)
    expect(await readdir(cwd)).toEqual(['payment.feature'])
  })

  test.each([
    ['Feature: Empty\n', 'INVALID_GHERKIN'],
    ['Feature: X\n Scenario: X\n  Given <missing> units\n', 'UNKNOWN_PLACEHOLDER'],
    ['Feature: X\n Scenario: X\n  Given empty cart\n  Then empty cart\n', 'CONFLICTING_STEP_ROLE'],
    [
      'Feature: X\n Scenario Outline: X\n  When add units\n  And add <quantity> units\n  Examples:\n   | quantity |\n   | 2 |\n',
      'CONFLICTING_STEP_INPUTS',
    ],
  ])('shares source/planning diagnostics with generation: %s', async (text, code) => {
    const cwd = await fixture(`failure-${code}`)
    const args = ['--text', text, ...sourceArgs]
    const checked = await invoke(['validate', ...args, '--json'], cwd)
    const generated = await invoke(['generate', 'out', ...args], cwd)
    expect(checked.code).toBe(1)
    expect(generated.code).toBe(1)
    expect(JSON.parse(checked.stdout).diagnostics[0]).toMatchObject({
      code,
      message: expect.stringContaining('cart/payment.feature'),
    })
    expect(generated.stderr).toContain(code)
    expect(await readdir(cwd)).toEqual(['payment.feature'])
  })

  test('validates under enforced read-only permissions without executing stale adapters', async () => {
    const cwd = await fixture('readonly')
    await mkdir(path.join(cwd, 'out'))
    await writeFile(
      path.join(cwd, 'out/payment.feature.steps.ts'),
      'throw new Error("must never execute")',
    )
    await writeFile(path.join(cwd, 'out/payment.feature.test.ts'), 'stale output')
    const before = await readFile(path.join(cwd, 'out/payment.feature.test.ts'), 'utf8')
    const permissionArgs = [process.execPath, '--experimental-permission', '--allow-fs-read=*', cli]
    for (const args of [
      ['--stdin', ...sourceArgs],
      ['--text', minimal, ...sourceArgs],
      ['payment.feature', '-r', 'node:test'],
    ]) {
      const result = await run([...permissionArgs, 'validate', ...args, '--json'], cwd, minimal)
      expect(result.code, result.stderr).toBe(0)
      expect(JSON.parse(result.stdout).evidence).toBe('generability')
    }
    const invalid = await run(
      [...permissionArgs, 'validate', '--text', 'Feature: Empty', ...sourceArgs, '--json'],
      cwd,
    )
    expect(invalid.code).toBe(1)
    expect(JSON.parse(invalid.stdout).diagnostics[0].code).toBe('INVALID_GHERKIN')
    expect(await readFile(path.join(cwd, 'out/payment.feature.test.ts'), 'utf8')).toBe(before)
    expect(await readdir(cwd)).toEqual(['out', 'payment.feature'])
    const check = await invoke(
      ['generate', 'missing', '--stdin', ...sourceArgs, '--check'],
      cwd,
      minimal,
    )
    expect(check.code).toBe(1)
    expect(check.stderr).toContain('missing:')
    expect(await readdir(cwd)).toEqual(['out', 'payment.feature'])
  })
})

function run(
  [command, ...argumentsList]: readonly string[],
  cwd: string,
  input?: string,
): Promise<{
  readonly code: number | null
  readonly stderr: string
  readonly stdout: string
}> {
  return new Promise((resolve, reject) => {
    const child = spawn(command as string, argumentsList, { cwd })
    let stdout = ''
    let stderr = ''
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk
    })
    child.stdin.end(input)
    child.on('error', reject)
    child.on('close', (code) => resolve({ code, stderr, stdout }))
  })
}
