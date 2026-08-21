import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { glob } from 'glob'
import { assertCodegen, CodegenError } from './errors.js'
import { renderFeature } from './render.js'
import type {
  GeneratedFile,
  GenerateOptions,
  GenerationReport,
  ResolvedCodegenConfig,
  StepDefinition,
} from './types.js'
import { validateProject } from './validate.js'

export async function generate(
  config: ResolvedCodegenConfig,
  options: GenerateOptions = {},
): Promise<GenerationReport> {
  // Validation is deliberately a complete first phase. No emitter runs and no
  // generated file is touched until every source has produced valid Pickles.
  const validated = await validateProject(config)

  const state = { usedDefinitions: new Set<StepDefinition>() }
  const files: GeneratedFile[] = []
  const outputs = new Map<string, string>()

  for (const feature of validated.features) {
    const outputPath = outputFor(feature.absolutePath, config.featureRoot, config.outDir)
    const previousSource = outputs.get(outputPath)
    assertCodegen(
      !previousSource,
      'OUTPUT_COLLISION',
      `${feature.absolutePath} and ${previousSource} both generate ${outputPath}.`,
    )
    outputs.set(outputPath, feature.absolutePath)
    const contents = renderFeature(feature, outputPath, config, state)
    files.push({ sourcePath: feature.absolutePath, outputPath, contents })
  }

  const warnings = validateUnusedEmitters(config, state.usedDefinitions)
  if (options.check) await checkOutput(files, config.outDir)
  else await writeOutput(files, config.outDir)

  return {
    files,
    featureCount: files.length,
    scenarioCount: validated.report.scenarioCount,
    stepCount: validated.report.stepCount,
    warnings,
  }
}

function validateUnusedEmitters(
  config: ResolvedCodegenConfig,
  used: ReadonlySet<StepDefinition>,
): string[] {
  const unused = config.packs.flatMap((pack) =>
    pack.definitions
      .filter((definition) => !used.has(definition))
      .map((definition) => `${pack.options.id}: ${String(definition.pattern)}`),
  )
  if (unused.length === 0 || config.unusedEmitters === 'ignore') return []
  const message = `Unused step emitters:\n${unused.map((entry) => `  ${entry}`).join('\n')}`
  if (config.unusedEmitters === 'error') throw new CodegenError('UNUSED_EMITTERS', message)
  return [message]
}

async function checkOutput(files: readonly GeneratedFile[], outDir: string): Promise<void> {
  const expected = new Map(files.map((file) => [file.outputPath, file.contents]))
  const existing = await generatedFiles(outDir)
  const issues: string[] = []

  for (const [outputPath, contents] of expected) {
    let current: string
    try {
      current = await readFile(outputPath, 'utf8')
    } catch (error) {
      if (isMissingFile(error)) {
        issues.push(`missing: ${outputPath}`)
        continue
      }
      throw error
    }
    if (current !== contents) issues.push(`changed: ${outputPath}`)
  }
  for (const outputPath of existing) {
    if (!expected.has(outputPath)) issues.push(`stale: ${outputPath}`)
  }

  if (issues.length > 0) {
    throw new CodegenError(
      'GENERATED_DRIFT',
      `Generated tests are out of date:\n${issues.join('\n')}`,
    )
  }
}

function isMissingFile(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT'
}

async function writeOutput(files: readonly GeneratedFile[], outDir: string): Promise<void> {
  const expected = new Set(files.map((file) => file.outputPath))
  const existing = await generatedFiles(outDir)
  await mkdir(outDir, { recursive: true })

  for (const file of files) await atomicWrite(file.outputPath, file.contents)
  for (const stale of existing) {
    if (!expected.has(stale)) await unlink(stale)
  }
}

async function atomicWrite(outputPath: string, contents: string): Promise<void> {
  await mkdir(path.dirname(outputPath), { recursive: true })
  const temporary = path.join(
    path.dirname(outputPath),
    `.${path.basename(outputPath)}.${process.pid}.${Date.now()}.tmp`,
  )
  await writeFile(temporary, contents, 'utf8')
  try {
    await rename(temporary, outputPath)
  } catch (error) {
    await unlink(temporary).catch(() => undefined)
    throw error
  }
}

async function generatedFiles(outDir: string): Promise<string[]> {
  return glob('**/*.generated.test.ts', {
    cwd: outDir,
    absolute: true,
    nodir: true,
  })
}

function outputFor(featurePath: string, featureRoot: string, outDir: string): string {
  const relative = path.relative(featureRoot, featurePath)
  const stem = relative.replace(/\.feature(?:\.md)?$/, '')
  return path.join(outDir, `${stem}.generated.test.ts`)
}
