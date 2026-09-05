import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { CodegenError } from './errors.js'
import { resolveStrategy, type StrategyName } from './strategies.js'

export const CONFIG_FILENAME = 'feat2test.config.json'

export interface Config {
  readonly strategy: StrategyName
  readonly input?: string
  readonly output?: string
  readonly $schema?: string
}

export interface LoadedConfig {
  readonly config: Config
  readonly path: string
}

/** Discover the closest config; explicit paths never fall back to another file. */
export async function loadConfig(
  cwd: string,
  explicit?: string,
): Promise<LoadedConfig | undefined> {
  let directory = cwd
  while (true) {
    const filename = explicit ? path.resolve(cwd, explicit) : path.join(directory, CONFIG_FILENAME)
    let contents: string
    try {
      contents = await readFile(filename, 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT' || explicit) {
        throw new CodegenError('CONFIG_UNREADABLE', `Cannot read config: ${filename}`)
      }
      const parent = path.dirname(directory)
      if (directory === parent) return undefined
      directory = parent
      continue
    }
    let value: unknown
    try {
      value = JSON.parse(contents)
    } catch {
      throw new CodegenError('INVALID_CONFIG', `${filename} must contain valid JSON.`)
    }
    return { config: validateConfig(value, filename), path: filename }
  }
}

export function validateConfig(value: unknown, label: string): Config {
  const fail = (message: string): never => {
    throw new CodegenError('INVALID_CONFIG', `${label}: ${message}`)
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fail('expected a JSON object.')
  }
  const record = value as Record<string, unknown>
  for (const [key, item] of Object.entries(record)) {
    if (!['$schema', 'strategy', 'input', 'output'].includes(key)) {
      fail(`unknown option "${key}". Allowed: strategy, input, output, $schema.`)
    }
    if (typeof item !== 'string' || item.trim().length === 0) {
      fail(`"${key}" must be a non-empty string.`)
    }
  }
  const { strategy } = record
  if (typeof strategy !== 'string') {
    return fail('"strategy" is required. Choose vitest or node:test.')
  }
  resolveStrategy(strategy)
  return record as unknown as Config
}

export async function initConfig(filename: string, config: Config): Promise<void> {
  validateConfig(config, filename)
  try {
    await writeFile(filename, `${JSON.stringify(config, null, 2)}\n`, {
      encoding: 'utf8',
      flag: 'wx',
    })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
      throw new CodegenError(
        'CONFIG_EXISTS',
        `${filename} already exists. Edit it to change settings.`,
      )
    }
    throw new CodegenError('CONFIG_UNWRITABLE', `Cannot create config: ${filename}`)
  }
}
