import { randomUUID } from 'node:crypto'
import type { Dirent, Stats } from 'node:fs'
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { CodegenError } from './errors.js'
import { loadFeature } from './gherkin.js'
import { planFeature } from './plan.js'
import { reconcileStepAdapter } from './reconcile.js'
import { renderFeatureTest } from './render.js'
import type { GenerateOptions, GenerationReport, Warning } from './types.js'

const SCHEMA_HEADER = '// gherkin-vitest-codegen schema=1'
const SOURCE_PREFIX = '// source='

interface TargetFile {
  readonly before: string | undefined
  readonly contents: string
  readonly path: string
}

export async function generate(
  inputPath: string,
  outputDirectory: string,
  options: GenerateOptions = {},
): Promise<GenerationReport> {
  const absoluteInput = path.resolve(inputPath)
  const absoluteOutput = path.resolve(outputDirectory)
  if (absoluteOutput.split(path.sep).some((component) => /[#?%\\]/u.test(component))) {
    throw new CodegenError(
      'INVALID_PATH',
      'Output path contains characters that Vitest cannot load safely.',
    )
  }
  await validateInput(absoluteInput, inputPath)
  await validateOutputDirectory(absoluteOutput)

  const prefix = outputPrefix(path.basename(absoluteInput))
  if (/[#?%\\]/u.test(prefix)) {
    throw new CodegenError(
      'INVALID_PATH',
      'Input filename contains characters that Vitest cannot load safely.',
    )
  }
  const featureTestPath = path.join(absoluteOutput, `${prefix}.test.ts`)
  const stepAdapterPath = path.join(absoluteOutput, `${prefix}.steps.ts`)
  const relativeInput = path.relative(absoluteOutput, absoluteInput)
  if (path.isAbsolute(relativeInput)) {
    throw new CodegenError('INVALID_PATH', 'Input and output must share a filesystem root.')
  }
  const sourceReference = slash(relativeInput)
  if (sourceReference.includes('\n') || sourceReference.includes('\r')) {
    throw new CodegenError('INVALID_PATH', 'Input paths cannot contain line breaks.')
  }
  const metadata = `${SCHEMA_HEADER}\n${SOURCE_PREFIX}${sourceReference}`

  const [featureTestBefore, stepAdapterBefore] = await Promise.all([
    readOwnedTarget(featureTestPath, absoluteInput),
    readOwnedTarget(stepAdapterPath, absoluteInput),
  ])

  const displayPath =
    slash(path.relative(process.cwd(), absoluteInput)) || path.basename(absoluteInput)
  const loaded = await loadFeature(absoluteInput, displayPath)
  const planned = planFeature(loaded, displayPath)
  const reconciled = reconcileStepAdapter(
    stepAdapterBefore,
    planned.plan.methods,
    metadata,
    slash(path.relative(process.cwd(), stepAdapterPath)),
  )
  const featureTest = renderFeatureTest(planned.plan, metadata, `./${prefix}.steps`)

  const orphanWarnings = await findOrphanedOutputs(absoluteOutput)
  const obsoleteWarnings: Warning[] = reconciled.obsoleteMethods.map((method) => ({
    code: 'OBSOLETE_STEP',
    message: `${slash(path.relative(process.cwd(), stepAdapterPath))}: ${method}`,
  }))
  const warnings = [...planned.warnings, ...obsoleteWarnings, ...orphanWarnings]

  if (options.check) {
    const failures: string[] = []
    if (featureTestBefore !== featureTest) {
      failures.push(
        `${featureTestBefore === undefined ? 'missing' : 'changed'}: ${featureTestPath}`,
      )
    }
    if (stepAdapterBefore !== reconciled.contents) {
      failures.push(
        `${stepAdapterBefore === undefined ? 'missing' : 'changed'}: ${stepAdapterPath}`,
      )
    }
    if (reconciled.pendingMethods.length > 0) {
      failures.push(`pending: ${reconciled.pendingMethods.join(', ')}`)
    }
    if (reconciled.obsoleteMethods.length > 0) {
      failures.push(`obsolete: ${reconciled.obsoleteMethods.join(', ')}`)
    }
    for (const warning of orphanWarnings) failures.push(`orphaned: ${warning.message}`)
    if (failures.length > 0) {
      throw new CodegenError('CHECK_FAILED', `Feature output is not ready:\n${failures.join('\n')}`)
    }
  } else {
    await writeTransaction([
      { before: featureTestBefore, contents: featureTest, path: featureTestPath },
      { before: stepAdapterBefore, contents: reconciled.contents, path: stepAdapterPath },
    ])
  }

  return {
    featureTestPath,
    scenarioCount: planned.plan.scenarios.length,
    stepAdapterPath,
    stepCount: planned.plan.methods.length,
    warnings,
  }
}

export function outputPrefix(filename: string): string {
  const extension = path.extname(filename)
  const stem = extension.length > 0 ? filename.slice(0, -extension.length) : filename
  return stem.endsWith('.feature') ? stem : `${stem}.feature`
}

async function validateInput(absolutePath: string, displayPath: string): Promise<void> {
  let inputStats: Stats
  try {
    inputStats = await stat(absolutePath)
  } catch {
    throw new CodegenError('INPUT_NOT_FOUND', `Input file does not exist: ${displayPath}`)
  }
  if (!inputStats.isFile()) {
    throw new CodegenError('INPUT_NOT_FILE', `Input must be one file: ${displayPath}`)
  }
}

async function validateOutputDirectory(absolutePath: string): Promise<void> {
  try {
    const outputStats = await stat(absolutePath)
    if (!outputStats.isDirectory()) {
      throw new CodegenError('OUTPUT_NOT_DIRECTORY', `Output must be a directory: ${absolutePath}`)
    }
  } catch (error) {
    if (error instanceof CodegenError) throw error
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw new CodegenError(
        'OUTPUT_NOT_DIRECTORY',
        `Cannot access output directory: ${absolutePath}`,
      )
    }
  }
}

async function readOwnedTarget(
  targetPath: string,
  absoluteInput: string,
): Promise<string | undefined> {
  let contents: string
  try {
    contents = await readFile(targetPath, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    throw new CodegenError('OUTPUT_OWNERSHIP_CONFLICT', `Cannot safely read target: ${targetPath}`)
  }

  const ownership = readOwnership(contents)
  if (!ownership || path.resolve(path.dirname(targetPath), ownership.source) !== absoluteInput) {
    throw new CodegenError(
      'OUTPUT_OWNERSHIP_CONFLICT',
      `Target is not owned by this input: ${targetPath}`,
    )
  }
  return contents
}

function readOwnership(contents: string): { readonly source: string } | undefined {
  const [schema, source] = contents.split(/\r?\n/, 2)
  if (schema !== SCHEMA_HEADER || !source?.startsWith(SOURCE_PREFIX)) return undefined
  const value = source.slice(SOURCE_PREFIX.length)
  if (!value || value.includes('\n') || value.includes('\r') || path.isAbsolute(value))
    return undefined
  return { source: value }
}

async function findOrphanedOutputs(outputDirectory: string): Promise<Warning[]> {
  let entries: Dirent[]
  try {
    entries = await readdir(outputDirectory, { withFileTypes: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw new CodegenError('OUTPUT_SCAN_FAILED', `Cannot scan output directory: ${outputDirectory}`)
  }

  const orphaned = new Map<string, string[]>()
  for (const entry of entries) {
    if (!entry.isFile() || !/\.feature\.(?:steps|test)\.ts$/.test(entry.name)) continue
    const outputPath = path.join(outputDirectory, entry.name)
    let contents: string
    try {
      contents = await readFile(outputPath, 'utf8')
    } catch {
      throw new CodegenError('OUTPUT_SCAN_FAILED', `Cannot read generated output: ${outputPath}`)
    }
    const ownership = readOwnership(contents)
    if (!ownership) continue
    const source = path.resolve(outputDirectory, ownership.source)
    if (await isFile(source)) continue
    const files = orphaned.get(source) ?? []
    files.push(entry.name)
    orphaned.set(source, files)
  }

  return [...orphaned.entries()].map(([source, files]) => ({
    code: 'ORPHANED_FEATURE_OUTPUT',
    message: `${files.join(', ')} reference missing source ${slash(path.relative(process.cwd(), source))}`,
  }))
}

async function isFile(filePath: string): Promise<boolean> {
  try {
    return (await stat(filePath)).isFile()
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
    throw new CodegenError('OUTPUT_SCAN_FAILED', `Cannot inspect generated source: ${filePath}`)
  }
}

async function writeTransaction(files: readonly TargetFile[]): Promise<void> {
  const changed = files.filter((file) => file.before !== file.contents)
  if (changed.length === 0) return
  const directory = path.dirname(changed[0]?.path ?? '.')
  await mkdir(directory, { recursive: true })
  const transaction = randomUUID()
  const temporary = changed.map((file) => ({
    ...file,
    backup: path.join(directory, `.${path.basename(file.path)}.${transaction}.backup`),
    temporary: path.join(directory, `.${path.basename(file.path)}.${transaction}.temporary`),
  }))
  const backedUp: typeof temporary = []
  const installed: typeof temporary = []

  try {
    for (const file of temporary)
      await writeFile(file.temporary, file.contents, { encoding: 'utf8', flag: 'wx' })
    for (const file of temporary) {
      await assertTargetUnchanged(file.path, file.before)
      if (file.before !== undefined) {
        await rename(file.path, file.backup)
        backedUp.push(file)
      }
      await rename(file.temporary, file.path)
      installed.push(file)
    }
  } catch {
    for (const file of installed.toReversed()) {
      try {
        await rm(file.path, { force: true })
      } catch {
        // Continue restoring every target and preserve the original failure.
      }
    }
    for (const file of backedUp.toReversed()) {
      try {
        await rename(file.backup, file.path)
      } catch {
        // Best-effort rollback; the original error remains domain-safe.
      }
    }
    for (const file of temporary) {
      try {
        await rm(file.temporary, { force: true })
      } catch {
        // Continue cleaning every staged file and preserve the original failure.
      }
    }
    throw new CodegenError('WRITE_FAILED', 'Could not safely replace Feature outputs.')
  }
  for (const file of backedUp) {
    try {
      await rm(file.backup, { force: true })
    } catch {
      // Installed outputs are already committed; an internal backup may be cleaned manually.
    }
  }
}

async function assertTargetUnchanged(
  targetPath: string,
  before: string | undefined,
): Promise<void> {
  let current: string | undefined
  try {
    current = await readFile(targetPath, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
  if (current !== before) throw new Error('Target changed during generation')
}

function slash(value: string): string {
  return value.replaceAll(path.sep, '/')
}
