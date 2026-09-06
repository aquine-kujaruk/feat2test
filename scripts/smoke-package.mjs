import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const workspace = await mkdtemp(path.join(tmpdir(), 'feat2test-package-'))
const metadata = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))

function run(command, args, cwd = workspace) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, npm_config_cache: path.join(workspace, '.npm-cache') },
    timeout: 120_000,
  })
  if (result.error) throw result.error
  assert.equal(result.status, 0, `${command} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`)
  return result.stdout
}

try {
  // verify builds first; pack only the actual files that npm will distribute.
  const [packed] = JSON.parse(
    run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', workspace], root),
  )
  assert.equal(packed.name, 'feat2test')
  const files = packed.files.map((entry) => entry.path)
  for (const required of ['dist/cli.mjs', 'README.md', 'LICENSE']) {
    assert.ok(files.includes(required), `Missing ${required} in tarball`)
  }
  assert.ok(files.every((name) => !/^(src|tests|examples|node_modules|\.agents)\//.test(name)))
  const tarball = path.join(workspace, packed.filename)
  await writeFile(path.join(workspace, 'package.json'), '{"private":true,"type":"module"}\n')
  run('npm', ['install', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund', tarball])
  const dependencies = await readdir(path.join(workspace, 'node_modules'))
  assert.ok(!dependencies.includes('vitest'), 'CLI must not install Vitest')
  assert.ok(!dependencies.includes('typescript'), 'CLI must not install TypeScript')
  assert.equal(run('npx', ['--no-install', 'feat2test', '--version']).trim(), metadata.version)
  assert.match(run('npx', ['--no-install', 'feat2test', '--help']), /feat2test generate/)
  await writeFile(
    path.join(workspace, 'payment.feature'),
    'Feature: Payment\n  Scenario: Accepted\n    Given payment is ready\n',
  )
  run('npx', [
    '--no-install',
    'feat2test',
    'generate',
    'payment.feature',
    'out',
    '--runner',
    'node:test',
  ])
  const adapter = path.join(workspace, 'out/payment.feature.steps.ts')
  await writeFile(
    adapter,
    'export function createSteps() { return { paymentIsReady(): void {} } }\n',
  )
  run('npx', [
    '--no-install',
    'feat2test',
    'generate',
    'payment.feature',
    'out',
    '--runner',
    'node:test',
    '--check',
  ])
  run(process.execPath, ['--test', 'out/payment.feature.test.ts'])
  // Exercise npx's package download/cache path too, without relying on a global executable.
  assert.equal(
    run('npx', ['--yes', '--package', tarball, 'feat2test', '--version'], tmpdir()).trim(),
    metadata.version,
  )
  process.stdout.write(
    'Package smoke passed: tarball, production install, npx, generate --check, native Node tests.\n',
  )
} finally {
  await rm(workspace, { recursive: true, force: true })
}
