import { parse } from '@babel/parser'
import type {
  Comment,
  Node,
  ObjectExpression,
  ObjectMethod,
  ObjectProperty,
  TSType,
} from '@babel/types'
import { CodegenError } from './errors.js'
import { ADAPTER_HEADER, renderStepMethods } from './steps.js'
import type { FeaturePlan, StepDefinition } from './types.js'

type StepMember = ObjectMethod | ObjectProperty

/** Rebuild the method list in Feature order, copying retained implementations verbatim. */
export function synchronizeStepAdapter(plan: FeaturePlan, source: string, label: string): string {
  const { object, comments } = stepObject(source, label)
  const expected = new Map(plan.steps.map((step) => [step.method, step]))
  const retained = new Map<string, StepMember>()

  for (const member of object.properties) {
    if (
      member.type === 'SpreadElement' ||
      member.computed ||
      (member.key.type !== 'Identifier' && member.key.type !== 'StringLiteral')
    ) {
      unsupported(label, 'Use explicit, named step methods in the returned object.')
    }
    const name = member.key.type === 'Identifier' ? member.key.name : member.key.value
    const callable = member.type === 'ObjectMethod' ? member : member.value
    if (
      (callable.type !== 'ObjectMethod' &&
        callable.type !== 'FunctionExpression' &&
        callable.type !== 'ArrowFunctionExpression') ||
      (callable.type === 'ObjectMethod' && callable.kind !== 'method')
    ) {
      unsupported(label, `Step "${name}" must be an inline method or function.`)
    }

    const step = expected.get(name)
    if (step && !retained.has(name) && matchesParameters(callable.params, step)) {
      retained.set(name, member)
    }
  }

  const steps = [...expected.values()]
  const headings = comments.filter(isGroupHeading)
  const signaturesMatch =
    retained.size === expected.size && retained.size === object.properties.length
  if (
    signaturesMatch &&
    (headings.length === 0 || groupsMatch(steps, object, retained, headings))
  ) {
    return source
  }

  const newline = source.includes('\r\n') ? '\r\n' : '\n'
  const implementations = new Map<string, string>()
  const trailing: Comment[] = []
  const leadingByMember = new Map<Node, Comment[]>()
  const trailingByMember = new Map<Node, Comment[]>()
  for (const comment of comments) {
    if (isGroupHeading(comment)) continue
    const previous = object.properties.findLast(
      (member) => (member.end as number) <= (comment.start as number),
    )
    const next = object.properties.find(
      (member) => (member.start as number) >= (comment.end as number),
    )
    if (previous && previous.loc?.end.line === comment.loc?.start.line) {
      trailingByMember.set(previous, [...(trailingByMember.get(previous) ?? []), comment])
    } else if (next) {
      leadingByMember.set(next, [...(leadingByMember.get(next) ?? []), comment])
    } else {
      trailing.push(comment)
    }
  }
  for (const [name, member] of retained) {
    const leading = (leadingByMember.get(member) ?? [])
      .map((comment) => `    ${textOf(source, comment)}${newline}`)
      .join('')
    const tail = (trailingByMember.get(member) ?? [])
      .map((comment) => ` ${textOf(source, comment)}`)
      .join('')
    implementations.set(name, `${leading}    ${textOf(source, member)},${tail}`)
  }
  const methods = renderStepMethods(steps, implementations, newline)
  const notes = trailing.map((comment) => `    ${textOf(source, comment)}`).join(newline)
  const contents = [methods, notes].filter(Boolean).join(newline)
  const close = (object.end as number) - 1
  const lastLine = source.slice(source.lastIndexOf('\n', close - 1) + 1, close)
  const indent = /^[\t ]*$/.test(lastLine) ? lastLine : '  '
  const updated =
    source.slice(0, (object.start as number) + 1) +
    `${newline}${contents}${newline}${indent}` +
    source.slice(close)
  const legacyHeader = '// Scaffolded by feat2test. Yours to edit: it is never overwritten.'
  return updated.startsWith(legacyHeader)
    ? ADAPTER_HEADER + updated.slice(legacyHeader.length)
    : updated
}

function isGroupHeading(comment: Comment): boolean {
  return (
    comment.type === 'CommentLine' &&
    ['Context', 'Action', 'Outcome'].includes(comment.value.trim())
  )
}

function groupsMatch(
  steps: readonly StepDefinition[],
  object: ObjectExpression,
  retained: ReadonlyMap<string, StepMember>,
  headings: readonly Comment[],
): boolean {
  const roles = [...new Set(steps.map((step) => step.role))]
  if (
    headings.length !== roles.length ||
    steps.some((step, index) => retained.get(step.method) !== object.properties[index])
  )
    return false
  return roles.every((role, index) => {
    const first = steps.findIndex((step) => step.role === role)
    const member = object.properties[first] as StepMember
    const before = object.properties[first - 1]?.end ?? (object.start as number) + 1
    const heading = headings[index] as Comment
    return (
      heading.value.trim() === role &&
      (heading.start as number) >= before &&
      (heading.end as number) <= (member.start as number)
    )
  })
}

function textOf(source: string, node: Node | Comment): string {
  return source.slice(node.start as number, node.end as number)
}

function matchesParameters(params: readonly Node[], step: StepDefinition): boolean {
  return (
    params.length === step.params.length &&
    params.every((param, index) => {
      const argument = param.type === 'AssignmentPattern' ? param.left : param
      const expected = step.params[index]
      return (
        argument.type === 'Identifier' &&
        argument.name === expected?.name &&
        argument.typeAnnotation?.type === 'TSTypeAnnotation' &&
        parameterType(argument.typeAnnotation.typeAnnotation) === expected.type
      )
    })
  )
}

function parameterType(type: TSType): string | undefined {
  if (type.type === 'TSStringKeyword') return 'string'
  if (type.type === 'TSParenthesizedType') return parameterType(type.typeAnnotation)
  if (type.type === 'TSArrayType') return `${parameterType(type.elementType)}[]`
  return undefined
}

function stepObject(
  source: string,
  label: string,
): { object: ObjectExpression; comments: readonly Comment[] } {
  let ast: ReturnType<typeof parse>
  try {
    ast = parse(source, { sourceType: 'module', plugins: ['typescript'] })
  } catch (error) {
    throw new CodegenError('INVALID_STEP_ADAPTER', `${label}: ${(error as Error).message}`)
  }
  const factories: Node[] = []
  for (const statement of ast.program.body) {
    const declaration =
      statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement
    if (declaration?.type === 'FunctionDeclaration' && declaration.id?.name === 'createSteps') {
      factories.push(declaration.body)
    } else if (declaration?.type === 'VariableDeclaration') {
      for (const variable of declaration.declarations) {
        if (variable.id.type !== 'Identifier' || variable.id.name !== 'createSteps') continue
        const value = unwrap(variable.init)
        if (value?.type === 'ArrowFunctionExpression' || value?.type === 'FunctionExpression') {
          factories.push(value.body)
        }
      }
    }
  }
  const body = factories[0]
  if (factories.length !== 1 || !body) unsupported(label, 'Expected one createSteps factory.')
  const returns = body.type === 'BlockStatement' ? returnedExpressions(body) : [body]
  const object = unwrap(returns[0])
  if (returns.length !== 1 || object?.type !== 'ObjectExpression') {
    unsupported(label, 'createSteps must return one object literal containing the step methods.')
  }
  // Only comments between members belong to the generated method list. Comments
  // inside method bodies (including text such as "// Outcome") stay untouched.
  const comments = (ast.comments ?? []).filter(
    (comment) =>
      (comment.start as number) > (object.start as number) &&
      (comment.end as number) < (object.end as number) &&
      !object.properties.some(
        (member) =>
          (comment.start as number) >= (member.start as number) &&
          (comment.end as number) <= (member.end as number),
      ),
  )
  return { object, comments }
}

function unwrap(node: Node | null | undefined): Node | undefined {
  if (
    node?.type === 'TSAsExpression' ||
    node?.type === 'TSSatisfiesExpression' ||
    node?.type === 'TSTypeAssertion'
  ) {
    return unwrap(node.expression)
  }
  return node ?? undefined
}

/** Returns in nested helpers belong to those helpers, not to createSteps. */
function returnedExpressions(node: Node): (Node | null)[] {
  if (node.type === 'ReturnStatement') return [node.argument ?? null]
  if (
    [
      'FunctionDeclaration',
      'FunctionExpression',
      'ArrowFunctionExpression',
      'ObjectMethod',
      'ClassMethod',
      'ClassPrivateMethod',
    ].includes(node.type)
  )
    return []
  return Object.values(node).flatMap((value: unknown) => {
    const children: unknown[] = Array.isArray(value) ? value : [value]
    return children.flatMap((child) =>
      child && typeof child === 'object' && 'type' in child && typeof child.type === 'string'
        ? returnedExpressions(child as Node)
        : [],
    )
  })
}

function unsupported(label: string, reason: string): never {
  throw new CodegenError('UNSUPPORTED_STEP_ADAPTER', `${label}: ${reason}`)
}
