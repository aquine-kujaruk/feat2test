import { pascalIdentifier } from './plan.js'
import type { StepInput, StepMethod } from './types.js'

const DOC_STRING_TYPE = 'FeatureDocString'
const DATA_TABLE_TYPE = 'FeatureDataTable'

export interface MethodContract {
  readonly objectArgument: boolean
  readonly parameterCode: string
  readonly parameterName?: string
  readonly parameterType?: string
  readonly typeDeclaration?: string
  readonly typeName?: string
}

export function methodContract(method: StepMethod): MethodContract {
  const [variant] = method.variants
  if (method.variants.length === 1 && variant?.inputs.length === 0) {
    return { objectArgument: false, parameterCode: '' }
  }
  if (method.variants.length === 1 && variant?.inputs.length === 1) {
    const input = variant.inputs[0]
    if (!input) return { objectArgument: false, parameterCode: '' }
    return {
      objectArgument: false,
      parameterCode: `${input.name}: ${inputType(input)}`,
      parameterName: input.name,
      parameterType: inputType(input),
    }
  }

  const typeName = `${pascalIdentifier(method.method)}Type`
  const parameterName = `${method.method}Type`
  return {
    objectArgument: true,
    parameterCode: `${parameterName}: ${typeName}`,
    parameterName,
    parameterType: typeName,
    typeDeclaration: renderObjectType(
      typeName,
      method.variants.map((item) => item.inputs),
    ),
    typeName,
  }
}

function inputType(input: StepInput): string {
  if (input.type === 'docString') return DOC_STRING_TYPE
  if (input.type === 'dataTable') return DATA_TABLE_TYPE
  return 'string'
}

export function standardTypeDeclarations(methods: readonly StepMethod[]): readonly string[] {
  const inputs = methods.flatMap((method) => method.variants.flatMap((variant) => variant.inputs))
  const result: string[] = []
  if (inputs.some((input) => input.type === 'docString')) {
    result.push(`type ${DOC_STRING_TYPE} = {\n  content: string\n  mediaType?: string\n}`)
  }
  if (inputs.some((input) => input.type === 'dataTable')) {
    result.push(`type ${DATA_TABLE_TYPE} = readonly (readonly string[])[]`)
  }
  return result
}

function renderObjectType(typeName: string, variants: readonly (readonly StepInput[])[]): string {
  if (variants.length === 1) {
    const fields =
      variants[0]?.map((input) => `  ${input.name}: ${inputType(input)}`).join('\n') ?? ''
    return `type ${typeName} = {\n${fields}\n}`
  }
  const union = variants
    .map((inputs) => {
      if (inputs.length === 0) return '  | Record<string, never>'
      const fields = inputs.map((input) => `${input.name}: ${inputType(input)}`).join('; ')
      return `  | { ${fields} }`
    })
    .join('\n')
  return `type ${typeName} =\n${union}`
}
