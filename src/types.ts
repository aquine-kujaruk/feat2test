export type JsonPrimitive = boolean | null | number | string

export type JsonValue = JsonPrimitive | readonly JsonValue[] | { readonly [key: string]: JsonValue }

export type PickleArgument =
  | {
      readonly kind: 'dataTable'
      readonly rows: readonly (readonly string[])[]
    }
  | {
      readonly kind: 'docString'
      readonly content: string
      readonly mediaType?: string
    }

export interface StepSource {
  readonly uri: string
  readonly line: number
  readonly keyword: string
}

export interface StepEmitterContext {
  readonly text: string
  readonly captures: readonly string[]
  readonly argument?: PickleArgument
  readonly source: StepSource
  readonly type: 'Action' | 'Context' | 'Outcome' | 'Unknown'
}

export interface StepInvocation {
  /** Method exposed by the pack factory. */
  readonly method: string
  /** JSON-safe arguments rendered as literals in the generated test. */
  readonly args?: readonly JsonValue[]
  /** Generated calls are awaited by default. */
  readonly await?: boolean
}

export type StepEmitter = (context: StepEmitterContext) => StepInvocation

export interface PackOptions {
  /** Stable identifier used in diagnostics. */
  readonly id: string
  /** Named factory export used by the generated test. */
  readonly factory: string
  /** Root-relative local path or bare package specifier. */
  readonly importPath: string
  /** Local variable in the generated test. Defaults to `id`. */
  readonly instance?: string
}

export interface VitestBinding {
  /** Root-relative local path or bare package specifier. */
  readonly importPath: string
  /** Named test export. Defaults to `test`. */
  readonly exportName?: string
  /** Fixture passed to every pack factory. Defaults to `world`. */
  readonly fixtureName?: string
}

export type UnusedEmitterPolicy = 'error' | 'ignore' | 'warn'

export interface CodegenConfig {
  /** Base for every relative path. Defaults to `process.cwd()`. */
  readonly rootDir?: string
  /** Root mirrored below `outDir`. Defaults to `features`. */
  readonly featureRoot?: string
  /** Glob patterns relative to `rootDir`. */
  readonly features?: readonly string[]
  /** Generated test directory. Defaults to `test/generated`. */
  readonly outDir?: string
  /** Default Gherkin dialect. Defaults to `en`. */
  readonly language?: string
  readonly test: VitestBinding
  readonly packs: readonly StepPack[]
  /** Unused emitters are errors by default. */
  readonly unusedEmitters?: UnusedEmitterPolicy
}

export interface ResolvedCodegenConfig {
  readonly rootDir: string
  readonly featureRoot: string
  readonly features: readonly string[]
  readonly outDir: string
  readonly language: string
  readonly test: Required<VitestBinding>
  readonly packs: readonly StepPack[]
  readonly unusedEmitters: UnusedEmitterPolicy
}

export interface GeneratedFile {
  readonly sourcePath: string
  readonly outputPath: string
  readonly contents: string
}

export interface GenerationReport {
  readonly files: readonly GeneratedFile[]
  readonly featureCount: number
  readonly scenarioCount: number
  readonly stepCount: number
  readonly warnings: readonly string[]
}

export interface ValidationReport {
  readonly featureCount: number
  readonly scenarioCount: number
  readonly stepCount: number
}

export interface GenerateOptions {
  /** Compare generated output with disk without writing. */
  readonly check?: boolean | undefined
}

export interface StepDefinition {
  readonly pattern: RegExp
  readonly emit: StepEmitter
}

export interface StepPack {
  readonly options: Readonly<Required<PackOptions>>
  readonly definitions: readonly StepDefinition[]
  step(pattern: RegExp, emit: StepEmitter): StepPack
}
