import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { CONFIG_FILENAME, initConfig, loadConfig, validateConfig } from '../src/config.js'

let workspace = ''
beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), 'feat2test-config-'))
})
afterEach(async () => {
  await rm(workspace, { recursive: true, force: true })
})

describe('config discovery and validation', () => {
  test('returns undefined when no config exists up to the filesystem root', async () => {
    expect(await loadConfig(workspace)).toBeUndefined()
  })

  test('finds the closest config, without merging parent settings', async () => {
    const child = path.join(workspace, 'nested')
    const grandchild = path.join(child, 'deeper')
    await mkdir(grandchild, { recursive: true })
    await initConfig(path.join(workspace, CONFIG_FILENAME), {
      strategy: 'vitest',
      input: 'features',
    })
    expect(await loadConfig(grandchild)).toMatchObject({
      path: path.join(workspace, CONFIG_FILENAME),
      config: { strategy: 'vitest', input: 'features' },
    })
    await initConfig(path.join(child, CONFIG_FILENAME), { strategy: 'node:test' })
    expect(await loadConfig(grandchild)).toEqual({
      path: path.join(child, CONFIG_FILENAME),
      config: { strategy: 'node:test' },
    })
  })

  test('explicit config wins, including paths containing spaces', async () => {
    await initConfig(path.join(workspace, CONFIG_FILENAME), { strategy: 'vitest' })
    await initConfig(path.join(workspace, 'custom config.json'), { strategy: 'node:test' })
    expect(await loadConfig(workspace, 'custom config.json')).toMatchObject({
      config: { strategy: 'node:test' },
    })
  })

  test('never falls back from a missing, unreadable or malformed explicit config', async () => {
    await initConfig(path.join(workspace, CONFIG_FILENAME), { strategy: 'vitest' })
    await expect(loadConfig(workspace, 'absent.json')).rejects.toMatchObject({
      code: 'CONFIG_UNREADABLE',
    })
    await expect(loadConfig(workspace, '.')).rejects.toMatchObject({ code: 'CONFIG_UNREADABLE' })
    await writeFile(path.join(workspace, 'bad.json'), '{ nope')
    await expect(loadConfig(workspace, 'bad.json')).rejects.toMatchObject({
      code: 'INVALID_CONFIG',
    })
  })

  test('refuses invalid automatically discovered config', async () => {
    await mkdir(path.join(workspace, CONFIG_FILENAME))
    await expect(loadConfig(workspace)).rejects.toMatchObject({ code: 'CONFIG_UNREADABLE' })
  })

  test.each([
    null,
    [],
    1,
    'vitest',
    {},
    { input: 'features' },
    { strategy: false },
    { strategy: '' },
    { strategy: 'vitest', ouput: 'out' },
    { strategy: 'vitest', input: [] },
    { strategy: 'vitest', output: '   ' },
    { strategy: 'vitest', $schema: 1 },
  ])('rejects invalid config %j', (value) => {
    expect(() => validateConfig(value, 'config.json')).toThrow(/config.json/)
  })

  test('rejects unsupported strategies and accepts schema metadata', () => {
    expect(() => validateConfig({ strategy: 'jest' }, 'config.json')).toThrow('Unknown strategy')
    expect(validateConfig({ strategy: 'vitest', $schema: './schema.json' }, 'config.json')).toEqual(
      { strategy: 'vitest', $schema: './schema.json' },
    )
  })

  test('init never overwrites existing config and reports unwritable paths', async () => {
    const filename = path.join(workspace, CONFIG_FILENAME)
    await initConfig(filename, { strategy: 'vitest' })
    const original = await readFile(filename, 'utf8')
    await expect(initConfig(filename, { strategy: 'node:test' })).rejects.toMatchObject({
      code: 'CONFIG_EXISTS',
    })
    expect(await readFile(filename, 'utf8')).toBe(original)
    await expect(
      initConfig(path.join(workspace, 'absent/config.json'), { strategy: 'vitest' }),
    ).rejects.toMatchObject({ code: 'CONFIG_UNWRITABLE' })
  })
})
