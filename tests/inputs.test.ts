import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, expect, test } from 'vitest'
import { collectJobs } from '../src/inputs.js'

let workspace = ''
beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), 'feat2test-inputs-'))
})
afterEach(async () => {
  await rm(workspace, { recursive: true, force: true })
})

test('accepts explicit files of any extension and reports missing inputs', async () => {
  const input = path.join(workspace, 'source.txt')
  await writeFile(input, '')
  expect(await collectJobs(input, 'out')).toEqual([{ input, output: 'out' }])
  await expect(collectJobs(path.join(workspace, 'missing'), 'out')).rejects.toMatchObject({
    code: 'INPUT_UNREADABLE',
  })
})

test('rejects empty directories', async () => {
  await expect(collectJobs(workspace, 'out')).rejects.toMatchObject({ code: 'NO_INPUTS' })
})

test('discovers only Features in deterministic order, preserves folders, skips dependencies and symlinks', async () => {
  for (const name of [
    'z.feature.md',
    'a.feature',
    'notes.md',
    'b/same.feature',
    'c/same.feature',
    'node_modules/ignore.feature',
    '.git/ignore.feature',
  ]) {
    const target = path.join(workspace, name)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, '')
  }
  await symlink(workspace, path.join(workspace, 'loop'), 'dir')
  const result = await collectJobs(workspace, path.join(workspace, 'out'))
  expect(result.map((item) => path.relative(workspace, item.input))).toEqual([
    'a.feature',
    'b/same.feature',
    'c/same.feature',
    'z.feature.md',
  ])
  expect(result[1]?.output).toBe(path.join(workspace, 'out/b'))
})

test('rejects colliding output names before generation', async () => {
  await writeFile(path.join(workspace, 'same.feature'), '')
  await writeFile(path.join(workspace, 'same.feature.md'), '')
  await expect(collectJobs(workspace, 'out')).rejects.toMatchObject({ code: 'OUTPUT_CONFLICT' })
})
