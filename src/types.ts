export type StepRole = 'Action' | 'Context' | 'Outcome'

type StepInputType = 'dataTable' | 'docString' | 'string'

export interface StepInput {
  readonly anonymous: boolean
  readonly name: string
  readonly type: StepInputType
}

export interface StepVariant {
  readonly inputs: readonly StepInput[]
}

export interface StepMethod {
  readonly firstSeen: number
  readonly identity: string
  readonly method: string
  readonly role: StepRole
  readonly sourceLine: number
  readonly sourceText: string
  readonly variants: readonly StepVariant[]
}

export type StepValue =
  | string
  | {
      readonly content: string
      readonly kind: 'docString'
      readonly mediaType?: string
    }
  | {
      readonly kind: 'dataTable'
      readonly rows: readonly (readonly string[])[]
    }

export interface StepCallInput extends StepInput {
  readonly value: StepValue
}

export interface StepCall {
  readonly inputs: readonly StepCallInput[]
  readonly keyword: string
  readonly method: string
  readonly text: string
}

export interface FeatureScenario {
  readonly calls: readonly StepCall[]
  readonly line: number
  readonly name: string
  readonly ruleId?: string
  readonly ruleName?: string
  readonly tags: readonly string[]
}

export interface FeaturePlan {
  readonly methods: readonly StepMethod[]
  readonly name: string
  readonly scenarios: readonly FeatureScenario[]
}

export interface Warning {
  readonly code: 'ANONYMOUS_STEP_INPUT' | 'OBSOLETE_STEP' | 'ORPHANED_FEATURE_OUTPUT'
  readonly message: string
}

export interface GenerationReport {
  readonly featureTestPath: string
  readonly scenarioCount: number
  readonly stepAdapterPath: string
  readonly stepCount: number
  readonly warnings: readonly Warning[]
}

export interface GenerateOptions {
  readonly check?: boolean
}
