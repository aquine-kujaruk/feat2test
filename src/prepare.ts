import path from 'node:path'
import { parseSource } from './parse.js'
import { planFeature } from './plan.js'
import { type RunnerName, resolveRunner } from './runners.js'
import { type FeatureSource, outputPrefix } from './source.js'
import { renderStepAdapter } from './steps.js'

/** Parse, plan and render both initial outputs without filesystem access or execution. */
export function prepareFeature(source: FeatureSource, runnerName: RunnerName) {
  const runner = resolveRunner(runnerName)
  const parsed = parseSource(source)
  const plan = planFeature(parsed, source.identity)
  const prefix = outputPrefix(path.basename(source.identity))
  return {
    source,
    runner: runnerName,
    prefix,
    plan,
    test: runner.render(plan, `./${prefix}.steps`),
    initialAdapter: renderStepAdapter(plan),
    warnings: parsed.warnings,
  }
}

export type PreparedFeature = ReturnType<typeof prepareFeature>

export function validationReport(prepared: PreparedFeature) {
  return {
    valid: true,
    evidence: 'generability',
    source: prepared.source.identity,
    format: prepared.source.format,
    runner: prepared.runner,
    scenarioCount: prepared.plan.scenarios.length,
    stepCount: prepared.plan.steps.length,
    warnings: prepared.warnings,
    diagnostics: [],
  }
}
