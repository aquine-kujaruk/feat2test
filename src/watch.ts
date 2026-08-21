import path from 'node:path'
import { type FSWatcher, watch as watchFiles } from 'chokidar'
import { loadConfig } from './config.js'
import { generate } from './generate.js'
import type { GenerationReport } from './types.js'

export interface WatchOptions {
  readonly cwd?: string | undefined
  readonly configPath?: string | undefined
  readonly debounceMs?: number | undefined
  readonly onReport?: ((report: GenerationReport) => void) | undefined
  readonly onError?: ((error: unknown) => void) | undefined
}

export async function watch(options: WatchOptions = {}): Promise<FSWatcher> {
  const loaded = await loadConfig({ cwd: options.cwd, configPath: options.configPath })
  const onReport = options.onReport ?? (() => undefined)
  const onError = options.onError ?? (() => undefined)
  onReport(await generate(loaded.config))

  let timer: NodeJS.Timeout | undefined
  let running = false
  let queued = false
  const ignoredRoots = [
    loaded.config.outDir,
    path.join(loaded.config.rootDir, 'node_modules'),
    path.join(loaded.config.rootDir, '.git'),
    path.join(loaded.config.rootDir, 'coverage'),
    path.join(loaded.config.rootDir, 'dist'),
  ]

  const regenerate = async () => {
    if (running) {
      queued = true
      return
    }
    running = true
    try {
      const current = await loadConfig({ cwd: options.cwd, configPath: options.configPath })
      onReport(await generate(current.config))
    } catch (error) {
      onError(error)
    } finally {
      running = false
      if (queued) {
        queued = false
        await regenerate()
      }
    }
  }

  const watcher = watchFiles([loaded.config.rootDir, loaded.configPath], {
    ignoreInitial: true,
    ignored: (candidate) => ignoredRoots.some((root) => isInside(candidate, root)),
  })
  watcher.on('all', () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => void regenerate(), options.debounceMs ?? 80)
  })
  return watcher
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}
