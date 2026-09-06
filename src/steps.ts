import type { FeaturePlan, StepDefinition, StepRole } from './types.js'

export const ADAPTER_HEADER = '// Synced by feat2test. Matching step implementations are preserved.'

/**
 * New steps start pending. Existing implementations are retained by the
 * synchronizer while their signatures still occur in the Feature.
 */
export function renderStepAdapter(plan: FeaturePlan): string {
  return [
    ADAPTER_HEADER,
    '',
    'export function createSteps() {',
    '  return {',
    renderStepMethods(plan.steps),
    '  }',
    '}',
    '',
  ].join('\n')
}

export function renderStepMethods(
  steps: readonly StepDefinition[],
  implementations?: ReadonlyMap<string, string>,
  newline = '\n',
): string {
  const lines: string[] = []
  let openRole: StepRole | undefined
  for (const step of steps) {
    if (step.role !== openRole) {
      if (openRole !== undefined) lines.push('')
      openRole = step.role
      lines.push(`    // ${openRole}`)
    }
    lines.push(
      implementations?.get(step.method) ?? renderStepMethod(step).replaceAll('\n', newline),
    )
  }

  return lines.join(newline)
}

function renderStepMethod(step: StepDefinition): string {
  return [
    `    ${step.method}(${parameters(step)}): void {`,
    `      throw new Error('PENDING: ${step.method}')`,
    '    },',
  ].join('\n')
}

function parameters(step: StepDefinition): string {
  return step.params.map((param) => `${param.name}: ${param.type}`).join(', ')
}
