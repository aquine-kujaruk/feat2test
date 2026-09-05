import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { CodegenError } from './errors.js'
import { outputPrefix } from './generate.js'

export interface GenerationJob {
  readonly input: string
  readonly output: string
}

/** Directory input preserves relative folders and refuses ambiguous output names. */
export async function collectJobs(input: string, output: string): Promise<GenerationJob[]> {
  let directory: boolean
  try {
    directory = (await stat(input)).isDirectory()
  } catch {
    throw new CodegenError('INPUT_UNREADABLE', `Cannot read ${input}`)
  }
  if (!directory) return [{ input, output }]

  const jobs: GenerationJob[] = []
  const destinations = new Set<string>()
  async function visit(folder: string): Promise<void> {
    const entries = await readdir(folder, { withFileTypes: true })
    entries.sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0))
    for (const entry of entries) {
      const source = path.join(folder, entry.name)
      if (entry.isDirectory() && !['node_modules', '.git'].includes(entry.name)) {
        await visit(source)
      } else if (entry.isFile() && /\.feature(?:\.md)?$/i.test(entry.name)) {
        const destination = path.join(output, path.relative(input, folder))
        const key = path.join(destination, outputPrefix(entry.name)).toLowerCase()
        if (destinations.has(key)) {
          throw new CodegenError(
            'OUTPUT_CONFLICT',
            `Multiple Features map to ${path.join(destination, outputPrefix(entry.name))}. Rename one input.`,
          )
        }
        destinations.add(key)
        jobs.push({ input: source, output: destination })
      }
    }
  }
  await visit(input)
  if (jobs.length === 0) {
    throw new CodegenError('NO_INPUTS', `No .feature or .feature.md files found in ${input}`)
  }
  return jobs
}
