import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { CodegenError } from './errors.js'

export type SourceFormat = 'feature' | 'mdg'

export interface FeatureSource {
  readonly text: string
  readonly format: SourceFormat
  readonly identity: string
}

/** A virtual identity is metadata. It is never opened as an input file. */
export function textSource(text: string, format: string, identity: string): FeatureSource {
  if (format !== 'feature' && format !== 'mdg') {
    throw new CodegenError('INVALID_USAGE', 'Text requires --format feature or mdg.')
  }
  if (
    !identity.trim() ||
    identity.includes('\0') ||
    identity.includes('\\') ||
    path.posix.isAbsolute(identity) ||
    path.win32.isAbsolute(identity) ||
    /^[a-z]:/i.test(identity) ||
    identity.split('/').some((part) => !part || part === '.' || part === '..')
  ) {
    throw new CodegenError(
      'INVALID_USAGE',
      'Text requires --source with a relative file identity, without absolute paths or traversal.',
    )
  }
  return { text, format, identity }
}

export async function readSource(input: string, identity: string): Promise<FeatureSource> {
  try {
    return {
      text: await readFile(input, 'utf8'),
      format: input.toLowerCase().endsWith('.md') ? 'mdg' : 'feature',
      identity,
    }
  } catch {
    throw new CodegenError('INPUT_UNREADABLE', `Cannot read ${identity}`)
  }
}

/** Everything before the last extension, guaranteed to end in `.feature`. */
export function outputPrefix(filename: string): string {
  const extension = path.extname(filename)
  const stem = extension ? filename.slice(0, -extension.length) : filename
  return stem.endsWith('.feature') ? stem : `${stem}.feature`
}
