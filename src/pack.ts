import { assertCodegen } from './errors.js'
import type { PackOptions, StepDefinition, StepEmitter, StepPack } from './types.js'

const identifierPattern = /^[$A-Z_a-z][$\w]*$/
const reservedBindings = new Set([
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
])

class StepPackImplementation implements StepPack {
  readonly options: Readonly<Required<PackOptions>>
  readonly #definitions: StepDefinition[] = []

  constructor(options: PackOptions) {
    const instance = options.instance ?? options.id
    assertIdentifier(options.id, 'pack id')
    assertIdentifier(options.factory, `factory for pack "${options.id}"`)
    assertIdentifier(instance, `instance for pack "${options.id}"`)
    assertCodegen(
      options.importPath.trim().length > 0,
      'INVALID_PACK',
      `Pack "${options.id}" needs a non-empty importPath.`,
    )

    this.options = Object.freeze({ ...options, instance })
  }

  get definitions(): readonly StepDefinition[] {
    return [...this.#definitions]
  }

  step(pattern: RegExp, emit: StepEmitter): StepPack {
    assertCodegen(
      !pattern.global && !pattern.sticky,
      'INVALID_PATTERN',
      `Pattern ${String(pattern)} in pack "${this.options.id}" cannot use g or y flags.`,
    )
    assertCodegen(
      pattern.source.startsWith('^') && pattern.source.endsWith('$'),
      'INVALID_PATTERN',
      `Pattern ${String(pattern)} in pack "${this.options.id}" must be anchored with ^ and $.`,
    )
    this.#definitions.push(Object.freeze({ pattern, emit }))
    return this
  }
}

export function definePack(options: PackOptions): StepPack {
  return new StepPackImplementation(options)
}

export function assertIdentifier(value: string, label: string, allowReserved = false): void {
  assertCodegen(
    identifierPattern.test(value) && (allowReserved || !reservedBindings.has(value)),
    'INVALID_IDENTIFIER',
    `Invalid JavaScript identifier "${value}" used as ${label}.`,
  )
}
