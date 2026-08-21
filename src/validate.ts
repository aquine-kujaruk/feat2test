import path from 'node:path'
import { glob } from 'glob'
import { assertCodegen } from './errors.js'
import { type LoadedFeature, loadFeature } from './gherkin.js'
import type { ResolvedCodegenConfig, ValidationReport } from './types.js'

export interface ValidatedProject {
  readonly features: readonly LoadedFeature[]
  readonly report: ValidationReport
}

/**
 * Parses and compiles every feature without running emitters or touching output.
 */
export async function validate(config: ResolvedCodegenConfig): Promise<ValidationReport> {
  return (await validateProject(config)).report
}

/** @internal */
export async function validateProject(config: ResolvedCodegenConfig): Promise<ValidatedProject> {
  const featurePaths = await glob([...config.features], {
    cwd: config.rootDir,
    absolute: true,
    nodir: true,
  })
  const sortedPaths = [...new Set(featurePaths.map((value) => path.resolve(value)))].sort()
  assertCodegen(
    sortedPaths.length > 0,
    'NO_FEATURES',
    `No feature files matched: ${config.features.join(', ')}`,
  )

  const features: LoadedFeature[] = []
  for (const featurePath of sortedPaths) {
    assertInsideFeatureRoot(featurePath, config.featureRoot)
    assertCodegen(
      featurePath.endsWith('.feature') || featurePath.endsWith('.feature.md'),
      'UNSUPPORTED_FEATURE_EXTENSION',
      `Unsupported feature extension: ${featurePath}`,
    )
    features.push(await loadFeature(featurePath, config.rootDir, config.language))
  }

  return {
    features,
    report: {
      featureCount: features.length,
      scenarioCount: features.reduce((total, feature) => total + feature.pickles.length, 0),
      stepCount: features.reduce(
        (total, feature) =>
          total + feature.pickles.reduce((count, pickle) => count + pickle.steps.length, 0),
        0,
      ),
    },
  }
}

function assertInsideFeatureRoot(featurePath: string, featureRoot: string): void {
  const relative = path.relative(featureRoot, featurePath)
  assertCodegen(
    relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative),
    'FEATURE_OUTSIDE_ROOT',
    `${featurePath} is outside featureRoot ${featureRoot}.`,
  )
}
