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
  test('prints useful help without requiring config and reports package version', async () => {
    const help = await invoke(['--help'])
    const empty = await invoke([])
    const version = await invoke(['-v'])
    const metadata = JSON.parse(await readFile(path.join(repositoryRoot, 'package.json'), 'utf8'))
    expect(help.code).toBe(0)
    expect(help.stdout).toContain('feat2test generate')
    expect(help.stdout).toContain('npx feat2test init')
    expect(help.stdout).toContain('Exit codes:')
    expect(empty.stdout).toBe(help.stdout)
    expect(version.stdout.trim()).toBe(metadata.version)
  })

  test.each([
    ['only-one'],
    ['a', 'b', 'c'],
    ['--wat'],
    ['--strategy'],
    ['init', 'extra'],
    ['init', '--check'],
    ['strategies', '--strategy', 'vitest'],
    ['--json', '--quiet'],
    ['--input='],
    ['a', 'b', '--input', 'c'],
    ['a', 'b', '--output', 'c'],
  ])('rejects invalid arguments: %j', async (...args) => {
    const result = await invoke(args)
    expect(result.code).toBe(2)
    expect(result.stdout + result.stderr).toContain('INVALID_USAGE')
    expect(result.stdout + result.stderr).toContain('feat2test --help')
  })

  test('requires an explicit strategy without config', async () => {
    const cwd = await fixture('missing-strategy')
    const result = await invoke(['payment.feature', 'out'], cwd)
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('Strategy is required')
    expect(await readdir(cwd)).toEqual(['payment.feature'])
  })

  test('lists runner strategies as text and JSON', async () => {
    expect((await invoke(['strategies'])).stdout).toContain('node:test')
    const result = await invoke(['strategies', '--json'])
    expect(JSON.parse(result.stdout)).toMatchObject({
      ok: true,
      strategies: [{ name: 'vitest' }, { name: 'node:test' }],
    })
    expect(result.stderr).toBe('')
  })

  test('initializes config, generates from it, checks from a child directory, preserves adapters', async () => {
    const cwd = await fixture('config-workflow')
    const initialized = await invoke(['init', '-i', 'payment.feature', '-o', 'out', '--json'], cwd)
    expect(initialized.code).toBe(0)
    expect(JSON.parse(initialized.stdout)).toMatchObject({ ok: true, strategy: 'vitest' })
    const config = await readFile(path.join(cwd, 'feat2test.config.json'), 'utf8')
    expect(JSON.parse(config)).toEqual({
      strategy: 'vitest',
      input: 'payment.feature',
      output: 'out',
    })
    const duplicate = await invoke(['init', '-s', 'node:test'], cwd)
    expect(duplicate.code).toBe(1)
    expect(duplicate.stderr).toContain('CONFIG_EXISTS')
    expect(await readFile(path.join(cwd, 'feat2test.config.json'), 'utf8')).toBe(config)

    const generated = await invoke(['generate', '--json'], cwd)
    expect(generated.code, generated.stderr).toBe(0)
    expect(JSON.parse(generated.stdout)).toMatchObject({
      ok: true,
      command: 'generate',
      strategy: 'vitest',
      featureCount: 1,
      scenarioCount: 1,
    })
    const output = path.join(cwd, 'out')
    expect((await readdir(output)).sort()).toEqual([
      'payment.feature.steps.ts',
      'payment.feature.test.ts',
    ])
    const adapter = path.join(output, 'payment.feature.steps.ts')
    await writeFile(adapter, '// My implementation\n')
    const checked = await invoke(['check'], output)
    expect(checked.code, checked.stderr).toBe(0)
    expect(checked.stdout).toContain('Checked')
    expect((await invoke([], cwd)).code).toBe(0)
    expect(await readFile(adapter, 'utf8')).toBe('// My implementation\n')
    await writeFile(path.join(cwd, 'payment.feature'), minimal.replace('Accepted', 'Updated'))
    const stale = await invoke(['check', '--json'], cwd)
    expect(stale.code).toBe(1)
    expect(JSON.parse(stale.stdout)).toMatchObject({ ok: false, error: { code: 'CHECK_FAILED' } })
    expect(await readFile(path.join(output, 'payment.feature.test.ts'), 'utf8')).toContain(
      "test('Accepted'",
    )
  })

  test('supports positional shorthand, flags, overrides and quiet mode', async () => {
    const cwd = await fixture('overrides')
    await invoke(['init', '-s', 'vitest'], cwd)
    const generated = await invoke(['payment.feature', 'out', '-s', 'node:test', '-q'], cwd)
    expect(generated).toMatchObject({ code: 0, stdout: '', stderr: '' })
    const output = await readFile(path.join(cwd, 'out/payment.feature.test.ts'), 'utf8')
    expect(output).toContain("from 'node:test'")
    expect(output).toContain("from './payment.feature.steps.ts'")
    expect(
      (await invoke(['-i', 'payment.feature', '-o', 'out', '-s', 'node:test', '--check'], cwd))
        .code,
    ).toBe(0)
  })

  test('reads explicit config paths relative to the config file and CLI paths relative to cwd', async () => {
    const cwd = await fixture('explicit')
    await mkdir(path.join(cwd, 'settings'))
    await invoke(
      ['init', '-c', 'settings/custom.json', '-i', '../payment.feature', '-o', '../out'],
      cwd,
    )
    const generated = await invoke(['generate', '-c', 'settings/custom.json'], cwd)
    expect(generated.code, generated.stderr).toBe(0)
    expect(
      (await invoke(['check', '-c', 'settings/custom.json', '-i', 'payment.feature'], cwd)).code,
    ).toBe(0)
  })

  test('generates directories recursively without flattening their structure', async () => {
    const cwd = await fixture('directory')
    await mkdir(path.join(cwd, 'nested'))
    await writeFile(path.join(cwd, 'nested/payment.feature'), minimal)
    const result = await invoke(['.', 'out', '-s', 'vitest', '--json'], cwd)
    expect(result.code, result.stderr).toBe(0)
    expect(JSON.parse(result.stdout).featureCount).toBe(2)
    expect(await readdir(path.join(cwd, 'out/nested'))).toContain('payment.feature.test.ts')
    expect((await invoke(['check', '.', 'out', '-s', 'vitest'], cwd)).code).toBe(0)
  })

  test('reports unknown strategy and parser errors as actionable JSON', async () => {
    const cwd = await fixture('errors')
    const unknown = await invoke(['payment.feature', 'out', '-s', 'jest', '--json'], cwd)
    expect(unknown.code).toBe(2)
    expect(JSON.parse(unknown.stdout)).toMatchObject({
      ok: false,
      error: { code: 'UNKNOWN_STRATEGY' },
    })
    const option = await invoke(['--unknown', '--json'], cwd)
    expect(JSON.parse(option.stdout).error.code).toBe('INVALID_USAGE')
    expect(option.stderr).toBe('')
    await writeFile(path.join(cwd, 'payment.feature'), 'Feature: Empty\n')
    const invalid = await invoke(['payment.feature', 'out', '-s', 'vitest'], cwd)
    expect(invalid.code).toBe(1)
    expect(invalid.stderr).toContain('Error [INVALID_GHERKIN]')
    expect(invalid.stderr).not.toContain(' at ')
    const debug = await invoke(['payment.feature', 'out', '-s', 'vitest', '--debug'], cwd)
    expect(debug.stderr).toContain(' at ')
  })

  test('keeps warnings visible in quiet mode and includes them in JSON reports', async () => {
    const cwd = await fixture('warnings')
    await writeFile(
      path.join(cwd, 'table.feature.md'),
      '# Feature: Underindented\n\n## Scenario: Order products\n\n* Given the order contains:\n | product |\n | Pencil |\n* Then the order holds one line\n',
    )
    const result = await invoke(['table.feature.md', 'out', '-s', 'vitest', '-q'], cwd)
    expect(result.code).toBe(0)
    expect(result.stdout).toBe('')
    expect(result.stderr).toMatch(/table\.feature\.md:6 .*two leading spaces/)
    const json = await invoke(['table.feature.md', 'out', '-s', 'vitest', '--json'], cwd)
    expect(JSON.parse(json.stdout).reports[0].warnings).toHaveLength(2)
    expect(json.stderr).toBe('')
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
