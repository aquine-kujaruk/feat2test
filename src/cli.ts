#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { CodegenError } from './errors.js'
import { generate } from './generate.js'

const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { version: string }

const USAGE = 'gherkin-vitest-codegen <input-file> <output-directory> [--check]'

async function main(): Promise<void> {
  const parsed = parseCliArgs()

  if (parsed.values.help) {
    process.stdout.write(HELP)
    return
  }
  if (parsed.values.version) {
    process.stdout.write(`${packageJson.version}\n`)
    return
  }
  if (parsed.positionals.length !== 2) throw new CodegenError('INVALID_USAGE', USAGE)

  const [input, output] = parsed.positionals
  if (!input || !output) throw new CodegenError('INVALID_USAGE', USAGE)
  const check = parsed.values.check === true
  const report = await generate(input, output, check ? { check: true } : {})
  const verb = check ? 'checked' : 'generated'
  process.stdout.write(
    `✓ ${verb} ${report.scenarioCount} Feature Tests and ${report.stepCount} Steps\n` +
      `  ${relative(report.featureTestPath)}\n` +
      `  ${relative(report.stepAdapterPath)}\n`,
  )
  for (const warning of report.warnings) {
    process.stderr.write(`⚠ ${warning.code}: ${warning.message}\n`)
  }
}

function parseCliArgs() {
  try {
    return parseArgs({
      allowPositionals: true,
      strict: true,
      options: {
        check: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean', short: 'v' },
      },
    })
  } catch {
    throw new CodegenError('INVALID_USAGE', USAGE)
  }
}

function relative(filePath: string): string {
  return path.relative(process.cwd(), filePath) || path.basename(filePath)
}

const HELP = `gherkin-vitest-codegen ${packageJson.version}

Generate one Vitest Feature Test and reconcile its Step Adapter.

Usage:
  ${USAGE}

Options:
      --check    Verify outputs and Step state without writing
  -v, --version  Print version
  -h, --help     Print help
`

main().catch((error: unknown) => {
  if (error instanceof CodegenError) {
    process.stderr.write(`✗ ${error.code}: ${error.message}\n`)
  } else {
    process.stderr.write('✗ INTERNAL_ERROR: Unexpected generator failure.\n')
  }
  process.exitCode = 1
})
