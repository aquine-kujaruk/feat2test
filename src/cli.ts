#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { CodegenError } from './errors.js'
import { generate } from './generate.js'
import { collectJobs } from './inputs.js'
import { type RunnerName, resolveRunner } from './runners.js'

const { version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { version: string }

const HELP = `feat2test ${version}

Generate deterministic tests from Gherkin Features.

Usage:
  feat2test generate <feature> <output> --runner <name> [--check]

Options:
  -r, --runner <name>  Test runner: vitest, node:test
      --check          Validate generated files without writing
      --debug          Include error stack traces
  -v, --version        Print version
  -h, --help           Print help

Exit codes:
  0  Success     1  Feature/generation/check error     2  Invalid usage or runner
`

function readArgs() {
  try {
    return parseArgs({
      allowPositionals: true,
      strict: true,
      options: {
        runner: { type: 'string', short: 'r' },
        check: { type: 'boolean' },
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
  if (positionals.shift() !== 'generate') usage('Expected the generate command.')
  if (positionals.length !== 2) usage('generate requires a Feature and an output directory.')
  if (!values.runner?.trim()) usage('--runner is required. Choose vitest or node:test.')
  resolveRunner(values.runner)

  const input = path.resolve(process.cwd(), positionals[0] as string)
  const output = path.resolve(process.cwd(), positionals[1] as string)
  const jobs = await collectJobs(input, output)
  const check = values.check === true
  let scenarioCount = 0
  let stepCount = 0

  for (const job of jobs) {
    const result = await generate(job.input, job.output, {
      check,
      runner: values.runner as RunnerName,
    })
    scenarioCount += result.scenarioCount
    stepCount += result.stepCount
    for (const warning of result.warnings) process.stderr.write(`Warning: ${warning}\n`)
  }

  process.stdout.write(
    `${check ? 'Checked' : 'Generated'} ${jobs.length} Features · ${scenarioCount} scenarios · ${stepCount} steps (${values.runner})\n`,
  )
}

function usage(message: string): never {
  throw new CodegenError('INVALID_USAGE', `${message}\nRun feat2test --help.`)
}

main().catch((error: unknown) => {
  const code = error instanceof CodegenError ? error.code : 'INTERNAL_ERROR'
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`Error [${code}]: ${message}\n`)
  if (process.argv.includes('--debug') && error instanceof Error) {
    process.stderr.write(`${error.stack}\n`)
  }
  process.exitCode = ['INVALID_USAGE', 'UNKNOWN_RUNNER'].includes(code) ? 2 : 1
})
