#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { loadConfig } from './config.js'
import { generate } from './generate.js'
import type { GenerationReport } from './types.js'
import { validate } from './validate.js'
import { watch } from './watch.js'

const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { version: string }

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    strict: true,
    options: {
      check: { type: 'boolean' },
      config: { type: 'string', short: 'c' },
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
      watch: { type: 'boolean', short: 'w' },
    },
  })

  if (values.help) {
    process.stdout.write(HELP)
    return
  }
  if (values.version) {
    process.stdout.write(`${packageJson.version}\n`)
    return
  }
  const command = positionals[0] ?? 'generate'
  if (positionals.length > 1 || !['generate', 'validate'].includes(command)) {
    throw new Error(`Unknown command: ${positionals.join(' ')}`)
  }
  if (values.watch && values.check) throw new Error('--watch and --check cannot be combined.')
  if (command === 'validate' && (values.watch || values.check)) {
    throw new Error('validate cannot be combined with --watch or --check.')
  }

  if (values.watch) {
    const watcher = await watch({
      configPath: values.config,
      onReport: (report) => printReport(report, 'generated'),
      onError: (error) => process.stderr.write(`${formatError(error)}\n`),
    })
    process.stdout.write('Watching for changes…\n')
    const close = async () => {
      await watcher.close()
      process.exitCode = 0
    }
    process.once('SIGINT', () => void close())
    process.once('SIGTERM', () => void close())
    return
  }

  const loaded = await loadConfig({ configPath: values.config })
  if (command === 'validate') {
    const report = await validate(loaded.config)
    process.stdout.write(
      `✓ validated ${report.scenarioCount} tests from ${report.featureCount} features ` +
        `(${report.stepCount} steps)\n`,
    )
    return
  }
  const report = await generate(loaded.config, { check: values.check })
  printReport(report, values.check ? 'checked' : 'generated')
}

function printReport(report: GenerationReport, verb: string): void {
  process.stdout.write(
    `✓ ${verb} ${report.scenarioCount} tests from ${report.featureCount} features ` +
      `(${report.stepCount} steps)\n`,
  )
  for (const warning of report.warnings) process.stderr.write(`⚠ ${warning}\n`)
}

function formatError(error: unknown): string {
  if (!(error instanceof Error)) return String(error)
  const messages = [error.message]
  let cause = error.cause
  while (cause instanceof Error) {
    messages.push(`Caused by: ${cause.message}`)
    cause = cause.cause
  }
  return `✗ ${messages.join('\n')}`
}

const HELP = `gherkin-vitest-codegen ${packageJson.version}

Generate explicit Vitest tests from Gherkin Pickles.

Usage:
  gherkin-vitest-codegen [generate|validate] [options]

Options:
  -c, --config <path>  Config file (auto-detected by default)
      --check          Fail if generated tests differ from disk
  -w, --watch          Regenerate when project files change
  -v, --version        Print version
  -h, --help           Print help
`

main().catch((error: unknown) => {
  process.stderr.write(`${formatError(error)}\n`)
  process.exitCode = 1
})
