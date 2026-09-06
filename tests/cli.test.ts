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

async function invoke(args: string[], cwd = workspace) {
  return run([process.execPath, cli, ...args], cwd)
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

function run(
  [command, ...argumentsList]: readonly string[],
  cwd: string,
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
    child.on('error', reject)
    child.on('close', (code) => resolve({ code, stderr, stdout }))
  })
}
