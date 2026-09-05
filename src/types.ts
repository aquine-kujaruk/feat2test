export type StepRole = 'Context' | 'Action' | 'Outcome'

/** A value captured from Gherkin: a placeholder scalar, or a step's DataTable. */
export type StepValue = string | readonly (readonly string[])[]

export interface StepParam {
  readonly name: string
  readonly type: 'string' | 'string[][]'
}

/** One method of the Step Adapter, identified by its literal step words. */
export interface StepDefinition {
  readonly method: string
  readonly params: readonly StepParam[]
  readonly role: StepRole
}

export interface StepCall {
  readonly keyword: string
  readonly method: string
  readonly text: string
  readonly values: readonly StepValue[]
}

export interface PlannedScenario {
  readonly calls: readonly StepCall[]
  readonly line: number
  readonly name: string
  readonly rule?: string
}

export interface FeaturePlan {
  readonly name: string
  readonly scenarios: readonly PlannedScenario[]
  readonly steps: readonly StepDefinition[]
}

export interface GenerationReport {
  readonly scenarioCount: number
  readonly stepAdapterPath: string
  readonly stepAdapterWritten: boolean
  readonly stepCount: number
  readonly testPath: string
  readonly warnings: readonly string[]
}
