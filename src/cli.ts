#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { CONFIG_FILENAME, initConfig, loadConfig } from './config.js'
import { CodegenError } from './errors.js'
import { generate } from './generate.js'
import { collectJobs } from './inputs.js'
import { resolveStrategy, type StrategyName, strategies } from './strategies.js'
import type { GenerationReport } from './types.js'

const { version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { version: string }

const HELP = `feat2test ${version}

Turn Gherkin Features into tests. Keep your Step Adapters yours.

Usage:
  feat2test init [--strategy <name>]
  feat2test generate [input] [output] [options]
  feat2test check [input] [output] [options]
  feat2test <input> <output> [options]
  feat2test strategies

Commands:
  init          Create feat2test.config.json without overwriting existing files
  generate      Generate tests and scaffold missing Step Adapters (default)
  check         Verify generated files without writing; suitable for CI
  strategies    List supported test runners

Options:
  -c, --config <file>    Use an explicit JSON config
  -i, --input <path>     Feature file or directory (recursive)
  -o, --output <dir>     Destination directory
  -s, --strategy <name>  Override the configured strategy: vitest, node:test
      --check           Alias for the check command
      --json            Machine-readable result or error on stdout
  -q, --quiet           Suppress success output; keep warnings and errors
      --debug           Include error stack traces on stderr
  -v, --version         Print version
  -h, --help            Print help

Configuration:
  Finds the closest feat2test.config.json in this directory or its parents.
  Config paths are relative to that file; CLI paths are relative to your shell.
  CLI options override config. Strategy must be explicit; init writes vitest.

Examples:
  npx feat2test init --strategy vitest
  npx feat2test generate
  npx feat2test check --json
  npx feat2test features test/features --strategy node:test

Exit codes:
  0  Success     1  Generation/check failure     2  Invalid usage/configuration
`

function readArgs() {
  try {
    return parseArgs({
      allowPositionals: true,
      strict: true,
      options: {
        config: { type: 'string', short: 'c' },
        input: { type: 'string', short: 'i' },
        output: { type: 'string', short: 'o' },
        strategy: { type: 'string', short: 's' },
        check: { type: 'boolean' },
        json: { type: 'boolean' },
        quiet: { type: 'boolean', short: 'q' },
        debug: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean', short: 'v' },
      },
    })
  } catch (error) {
    throw new CodegenError('INVALID_USAGE', `${(error as Error).message}\nRun feat2test --help.`)
  }
}

async function main(): Promise<void> {
  const { values, positionals } = readArgs()
  if (values.help) return void process.stdout.write(HELP)
  if (values.version) return void process.stdout.write(`${version}\n`)

  const commands = ['generate', 'check', 'init', 'strategies']
  const command = commands.includes(positionals[0] ?? '') ? positionals.shift() : 'generate'
  if (
    positionals.length > 2 ||
    (['init', 'strategies'].includes(command ?? '') && positionals.length)
  ) {
    usage('Unexpected arguments.')
  }
  if (values.json && values.quiet) usage('--json and --quiet cannot be combined.')
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === 'string' && !value.trim()) usage(`--${key} must not be empty.`)
  }
  if (command === 'init' || command === 'strategies') {
    if (values.check) usage(`--check cannot be used with ${command}.`)
  }
  if (command === 'strategies') {
    if (values.config || values.input || values.output || values.strategy) {
      usage('strategies does not accept config, input, output or strategy options.')
    }
    const available = strategies.map(({ name, description }) => ({ name, description }))
    return report(
      values,
      { command, strategies: available },
      available.map((item) => `  ${item.name.padEnd(12)} ${item.description}`).join('\n'),
    )
  }

  const cwd = process.cwd()
  if (command === 'init') {
    const strategy = values.strategy ?? 'vitest'
    resolveStrategy(strategy)
    const filename = path.resolve(cwd, values.config ?? CONFIG_FILENAME)
    await initConfig(filename, {
      strategy: strategy as StrategyName,
      input: values.input ?? 'features',
      output: values.output ?? 'test/features',
    })
    return report(
      values,
      { command, configPath: filename, strategy },
      `Created ${relative(filename)}\nNext: add Features, then run feat2test generate.`,
    )
  }

  if (positionals[0] && values.input) usage('Specify input once: positional or --input.')
  if (positionals[1] && values.output) usage('Specify output once: positional or --output.')
  const loaded = await loadConfig(cwd, values.config)
  if (process.argv.length === 2 && !loaded) return void process.stdout.write(HELP)
  const configDirectory = loaded ? path.dirname(loaded.path) : cwd
  const cliInput = positionals[0] ?? values.input
  const cliOutput = positionals[1] ?? values.output
  const input = cliInput
    ? path.resolve(cwd, cliInput)
    : resolvePath(configDirectory, loaded?.config.input)
  const output = cliOutput
    ? path.resolve(cwd, cliOutput)
    : resolvePath(configDirectory, loaded?.config.output)
  const strategy = values.strategy ?? loaded?.config.strategy
  if (!input || !output)
    usage('Input and output are required. Run feat2test init or provide both paths.')
  if (!strategy) usage('Strategy is required. Run feat2test init or pass --strategy <name>.')
  resolveStrategy(strategy)

  const check = command === 'check' || values.check === true
  const jobs = await collectJobs(input, output)
  const reports: GenerationReport[] = []
  for (const job of jobs) {
    const result = await generate(job.input, job.output, {
      check,
      strategy: strategy as StrategyName,
    })
    reports.push(result)
    if (!values.json) {
      for (const warning of result.warnings) process.stderr.write(`Warning: ${warning}\n`)
    }
  }
  const scenarioCount = reports.reduce((sum, item) => sum + item.scenarioCount, 0)
  const stepCount = reports.reduce((sum, item) => sum + item.stepCount, 0)
  report(
    values,
    {
      command: check ? 'check' : 'generate',
      strategy,
      featureCount: reports.length,
      scenarioCount,
      stepCount,
      reports,
    },
    [
      `${check ? 'Checked' : 'Generated'} ${reports.length} Features · ${scenarioCount} scenarios · ${stepCount} steps (${strategy})`,
      ...reports.flatMap((item) => [
        `  ${relative(item.testPath)}`,
        `  ${relative(item.stepAdapterPath)} (${check ? 'present' : item.stepAdapterWritten ? 'created' : 'kept'})`,
      ]),
    ].join('\n'),
  )
}

function usage(message: string): never {
  throw new CodegenError('INVALID_USAGE', `${message}\nRun feat2test --help.`)
}

function resolvePath(directory: string, value?: string): string | undefined {
  return value === undefined ? undefined : path.resolve(directory, value)
}

function report(options: { json?: boolean; quiet?: boolean }, data: object, message: string): void {
  if (options.json) process.stdout.write(`${JSON.stringify({ ok: true, ...data })}\n`)
  else if (!options.quiet) process.stdout.write(`${message}\n`)
}

function relative(target: string): string {
  return path.relative(process.cwd(), target) || path.basename(target)
}

main().catch((error: unknown) => {
  const code = error instanceof CodegenError ? error.code : 'INTERNAL_ERROR'
  const message = error instanceof Error ? error.message : String(error)
  // parseArgs can fail before values are available. Ignore paths after the -- separator.
  const rawArgs = process.argv.slice(2)
  const separator = rawArgs.indexOf('--')
  const args = separator < 0 ? rawArgs : rawArgs.slice(0, separator)
  if (args.includes('--json')) {
    process.stdout.write(`${JSON.stringify({ ok: false, error: { code, message } })}\n`)
  } else process.stderr.write(`Error [${code}]: ${message}\n`)
  if (args.includes('--debug') && error instanceof Error) process.stderr.write(`${error.stack}\n`)
  process.exitCode = [
    'INVALID_USAGE',
    'INVALID_CONFIG',
    'CONFIG_UNREADABLE',
    'UNKNOWN_STRATEGY',
  ].includes(code)
    ? 2
    : 1
})
