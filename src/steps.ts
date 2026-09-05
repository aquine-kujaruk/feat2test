import type { FeaturePlan, StepDefinition, StepRole } from './types.js'

export const ADAPTER_HEADER = '// Scaffolded by feat2test. Yours to edit: it is never overwritten.'

/**
 * The Step Adapter is written once and then belongs to the developer. When the
 * Feature changes, TypeScript and the failing test report the drift.
 */
export function renderStepAdapter(plan: FeaturePlan): string {
  const lines = [ADAPTER_HEADER, '', 'export function createSteps() {', '  return {']

  let openRole: StepRole | undefined
  for (const step of plan.steps) {
    if (step.role !== openRole) {
      if (openRole !== undefined) lines.push('')
      openRole = step.role
      lines.push(`    // ${openRole}`)
    }
    lines.push(
      `    ${step.method}(${parameters(step)}): void {`,
      `      throw new Error('PENDING: ${step.method}')`,
      '    },',
    )
  }

  lines.push('  }', '}', '')
  return lines.join('\n')
}

function parameters(step: StepDefinition): string {
  return step.params.map((param) => `${param.name}: ${param.type}`).join(', ')
}
