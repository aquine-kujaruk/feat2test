#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { CodegenError } from './errors.js'
import { generatePrepared, generateSource } from './generate.js'
import { collectJobs } from './inputs.js'
import { prepareFeature, validationReport } from './prepare.js'
import { type RunnerName, resolveRunner } from './runners.js'
import { type FeatureSource, readSource, textSource } from './source.js'
import type { GenerationReport } from './types.js'

const { version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { version: string }

const HELP = `feat2test ${version}

Generate deterministic tests from Gherkin Features.

Usage:
  feat2test generate <feature> <output> --runner <name> [--check]
  feat2test generate <output> --stdin|--text <text> --format <format> --source <id> --runner <name>
  feat2test validate <feature> --runner <name> [--json]
  feat2test validate --stdin|--text <text> --format <format> --source <id> --runner <name> [--json]

Options:
  -r, --runner <name>  Test runner: vitest, node:test
      --check          Check freshness of existing generated files without writing
      --stdin          Read Feature text from stdin, without an input file
      --text <text>    Supply Feature text directly
      --format <name>  Text format: feature, mdg (required for text)
      --source <id>    Relative logical source identity (required for text)
      --json           Print a structured validation report
      --debug          Include error stack traces
  -v, --version        Print version
  -h, --help           Print help

Validation checks parsing, planning and rendering in memory. It does not check
freshness, type checking, implemented adapters or behavior, and executes no tests.

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
        stdin: { type: 'boolean' },
        text: { type: 'string' },
        format: { type: 'string' },
        source: { type: 'string' },
        json: { type: 'boolean' },
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
  const command = positionals.shift()
  if (command !== 'generate' && command !== 'validate') usage('Expected generate or validate.')
  const isText = values.stdin === true || values.text !== undefined
  if (values.stdin && values.text !== undefined) usage('--stdin and --text are mutually exclusive.')
  const expected = command === 'generate' ? (isText ? 1 : 2) : isText ? 0 : 1
  if (positionals.length !== expected) {
    usage(
      `${command}: provide exactly one source and ${command === 'generate' ? 'one' : 'no'} output directory.`,
    )
  }
  if (command === 'validate' && values.check) usage('--check belongs to generate, not validate.')
  if (command === 'generate' && values.json) usage('--json belongs to validate.')
  if (!isText && (values.format !== undefined || values.source !== undefined)) {
    usage('--format and --source belong to text input, not a physical source.')
  }
  if (!values.runner?.trim()) usage('--runner is required. Choose vitest or node:test.')
  resolveRunner(values.runner)

  const runner = values.runner as RunnerName
  const check = values.check === true
  let source: FeatureSource | undefined
  if (isText) {
    // Validate metadata before waiting for stdin or touching any output.
    source = textSource(values.text ?? '', values.format ?? '', values.source ?? '')
    if (values.stdin) {
      process.stdin.setEncoding('utf8')
      let text = ''
      for await (const chunk of process.stdin) text += chunk
      source = { ...source, text }
    }
  }

  if (command === 'validate') {
    source ??= await readSource(path.resolve(positionals[0] as string), positionals[0] as string)
    const report = validationReport(prepareFeature(source, runner))
    if (values.json) process.stdout.write(`${JSON.stringify(report)}\n`)
    else {
      for (const warning of report.warnings) process.stderr.write(`Warning: ${warning}\n`)
      process.stdout.write(
        `Valid generation: ${report.source} · ${report.scenarioCount} scenarios · ${report.stepCount} steps (${runner}); generability only\n`,
      )
    }
    return
  }

  let results: GenerationReport[]
  if (source) {
    results = [await generateSource(source, positionals[0] as string, { check, runner })]
  } else {
    const jobs = await collectJobs(
      path.resolve(positionals[0] as string),
      path.resolve(positionals[1] as string),
    )
    const prepared = []
    for (const job of jobs) {
      const input = await readSource(job.input, path.relative(process.cwd(), job.input))
      prepared.push({ feature: prepareFeature(input, runner), output: job.output })
    }
    results = []
    for (const job of prepared)
      results.push(await generatePrepared(job.feature, job.output, { check, runner }))
  }
  let scenarioCount = 0
  let stepCount = 0
  for (const result of results) {
    scenarioCount += result.scenarioCount
    stepCount += result.stepCount
    for (const warning of result.warnings) process.stderr.write(`Warning: ${warning}\n`)
  }

  process.stdout.write(
    `${check ? 'Checked' : 'Generated'} ${results.length} Features · ${scenarioCount} scenarios · ${stepCount} steps (${values.runner})\n`,
  )
}

function usage(message: string): never {
  throw new CodegenError('INVALID_USAGE', `${message}\nRun feat2test --help.`)
}

main().catch((error: unknown) => {
  const code = error instanceof CodegenError ? error.code : 'INTERNAL_ERROR'
  const message = error instanceof Error ? error.message : String(error)
  if (process.argv[2] === 'validate' && process.argv.includes('--json')) {
    process.stdout.write(
      `${JSON.stringify({ valid: false, evidence: 'generability', diagnostics: [{ code, message }] })}\n`,
    )
  }
  process.stderr.write(`Error [${code}]: ${message}\n`)
  if (process.argv.includes('--debug') && error instanceof Error) {
    process.stderr.write(`${error.stack}\n`)
  }
  process.exitCode = ['INVALID_USAGE', 'UNKNOWN_RUNNER'].includes(code) ? 2 : 1
})
