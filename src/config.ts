import { existsSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createJiti } from 'jiti'
import { assertCodegen, CodegenError } from './errors.js'
import { assertIdentifier } from './pack.js'
import type { CodegenConfig, ResolvedCodegenConfig, StepPack } from './types.js'

export const CONFIG_FILENAMES = [
  'gherkin-vitest.config.ts',
  'gherkin-vitest.config.mts',
  'gherkin-vitest.config.js',
  'gherkin-vitest.config.mjs',
  'gherkin-vitest.config.cts',
  'gherkin-vitest.config.cjs',
] as const

export interface LoadedCodegenConfig {
  readonly config: ResolvedCodegenConfig
  readonly configPath: string
}

export function defineConfig(config: CodegenConfig): CodegenConfig {
  return config
}

export function resolveConfig(config: CodegenConfig, cwd = process.cwd()): ResolvedCodegenConfig {
  const rootDir = path.resolve(cwd, config.rootDir ?? '.')
  const featureRoot = resolveInside(rootDir, config.featureRoot ?? 'features', 'featureRoot')
  const outDir = resolveInside(rootDir, config.outDir ?? 'test/generated', 'outDir')
  assertCodegen(outDir !== rootDir, 'UNSAFE_OUT_DIR', 'outDir cannot be the project root.')
  const test = config.test ?? { importPath: 'vitest' }
  assertCodegen(
    test.importPath.trim().length > 0,
    'INVALID_CONFIG',
    'test.importPath cannot be empty.',
  )

  const exportName = test.exportName ?? 'test'
  assertIdentifier(exportName, 'test.exportName')

  const packs = [...config.packs]
  validatePacks(packs)

  const relativeFeatureRoot = slash(path.relative(rootDir, featureRoot))
  const defaultPatterns = [
    `${relativeFeatureRoot}/**/*.feature`,
    `${relativeFeatureRoot}/**/*.feature.md`,
  ]
  const features = [...(config.features ?? defaultPatterns)]
  assertCodegen(features.length > 0, 'INVALID_CONFIG', 'features cannot be empty.')

  return Object.freeze({
    rootDir,
    featureRoot,
    features,
    outDir,
    language: config.language ?? 'en',
    test: Object.freeze({
      importPath: test.importPath,
      exportName,
    }),
    packs: Object.freeze(packs),
    unusedEmitters: config.unusedEmitters ?? 'error',
  })
}

export async function loadConfig(
  options: { readonly cwd?: string | undefined; readonly configPath?: string | undefined } = {},
): Promise<LoadedCodegenConfig> {
  const cwd = path.resolve(options.cwd ?? process.cwd())
  const configPath = findConfig(cwd, options.configPath)
  const jiti = createJiti(pathToFileURL(configPath).href, {
    moduleCache: false,
    interopDefault: true,
  })

  let imported: unknown
  try {
    imported = await jiti.import(configPath, { default: true })
  } catch (error) {
    throw new CodegenError('CONFIG_LOAD_FAILED', `Cannot load ${configPath}.`, {
      cause: error,
    })
  }

  assertCodegen(
    isCodegenConfig(imported),
    'INVALID_CONFIG',
    `${configPath} must export a configuration created with defineConfig().`,
  )
  return {
    config: resolveConfig(imported, path.dirname(configPath)),
    configPath,
  }
}

function findConfig(cwd: string, configuredPath?: string): string {
  if (configuredPath) {
    const absolute = path.resolve(cwd, configuredPath)
    assertCodegen(existsSync(absolute), 'CONFIG_NOT_FOUND', `Config file not found: ${absolute}`)
    return absolute
  }

  for (const filename of CONFIG_FILENAMES) {
    const candidate = path.join(cwd, filename)
    if (existsSync(candidate)) return candidate
  }
  throw new CodegenError(
    'CONFIG_NOT_FOUND',
    `No config found in ${cwd}. Expected one of: ${CONFIG_FILENAMES.join(', ')}`,
  )
}

function isCodegenConfig(value: unknown): value is CodegenConfig {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<CodegenConfig>
  return Array.isArray(candidate.packs)
}

function resolveInside(root: string, value: string, label: string): string {
  const absolute = path.resolve(root, value)
  const relative = path.relative(root, absolute)
  assertCodegen(
    relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative)),
    'PATH_OUTSIDE_ROOT',
    `${label} must stay inside rootDir: ${absolute}`,
  )
  return absolute
}

function validatePacks(packs: readonly StepPack[]): void {
  const ids = new Set<string>()
  const instances = new Set<string>()
  const factories = new Map<string, string>()
  for (const pack of packs) {
    assertCodegen(
      !!pack?.options && Array.isArray(pack.definitions),
      'INVALID_PACK',
      'Every packs entry must be created with definePack().',
    )
    assertCodegen(
      !ids.has(pack.options.id),
      'DUPLICATE_PACK',
      `Duplicate pack id: ${pack.options.id}`,
    )
    assertCodegen(
      !instances.has(pack.options.instance),
      'DUPLICATE_PACK',
      `Duplicate pack instance: ${pack.options.instance}`,
    )
    const previousPath = factories.get(pack.options.factory)
    assertCodegen(
      previousPath === undefined || previousPath === pack.options.importPath,
      'DUPLICATE_FACTORY',
      `Factory "${pack.options.factory}" is imported from multiple modules.`,
    )
    ids.add(pack.options.id)
    instances.add(pack.options.instance)
    factories.set(pack.options.factory, pack.options.importPath)
  }
}

function slash(value: string): string {
  return value.replaceAll(path.sep, '/')
}
