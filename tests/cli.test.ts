import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url))
const cli = path.join(repositoryRoot, 'dist/cli.mjs')

describe('CLI', () => {
  let temporary = ''

  beforeAll(async () => {
    const { npm_execpath: packageManager } = process.env
    const build = packageManager
      ? await run(process.execPath, [packageManager, 'build'], repositoryRoot)
      : await run('pnpm', ['build'], repositoryRoot)
    expect(build.code).toBe(0)
    temporary = await mkdtemp(path.join(tmpdir(), 'gherkin-vitest-codegen-cli-'))
  }, 30_000)

  afterAll(async () => {
    if (temporary) await rm(temporary, { recursive: true, force: true })
  })

  test('prints help from the packaged executable', async () => {
    const result = await run(process.execPath, [cli, '--help'], repositoryRoot)

    expect(result.code).toBe(0)
    expect(result.stdout).toContain(
      'gherkin-vitest-codegen <input-file> <output-directory> [--check]',
    )
  })

  test('generates exactly two files and reports domain errors without a stack', async () => {
    const input = path.join(temporary, 'payment.feature')
    const output = path.join(temporary, 'generated')
    await mkdir(path.dirname(input), { recursive: true })
    await writeFile(
      input,
      `Feature: Payment
  Scenario: Accepted
    Given payment is ready
`,
      'utf8',
    )

    const generated = await run(process.execPath, [cli, input, output], repositoryRoot)
    const checked = await run(process.execPath, [cli, input, output, '--check'], repositoryRoot)

    expect(generated.code).toBe(0)
    expect((await readdir(output)).sort()).toEqual([
      'payment.feature.steps.ts',
      'payment.feature.test.ts',
    ])
    expect(checked.code).toBe(1)
    expect(checked.stderr).toContain('✗ CHECK_FAILED:')
    expect(checked.stderr).not.toContain(' at ')
  })
})

function run(
  command: string,
  argumentsList: readonly string[],
  cwd: string,
): Promise<{ readonly code: number | null; readonly stderr: string; readonly stdout: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, argumentsList, { cwd })
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
