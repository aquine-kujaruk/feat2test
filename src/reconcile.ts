import ts from 'typescript'
import { methodContract, standardTypeDeclarations } from './contracts.js'
import { CodegenError } from './errors.js'
import type { StepMethod, StepRole } from './types.js'

const TYPES_START = '// gherkin-vitest-codegen:types:start'
const TYPES_END = '// gherkin-vitest-codegen:types:end'
const PENDING_HELPER_MARKER = '// gherkin-vitest-codegen:pending-helper'
const PENDING_HELPER = `${PENDING_HELPER_MARKER}
function pendingStep(stepName: string): void {
  throw new Error(\`PENDING_STEP: \${stepName}\`)
}`

interface ExistingMethod {
  readonly name: string
  readonly node: ts.MethodDeclaration
  readonly pending: boolean
  readonly text: string
}

interface RenderedMethod {
  readonly name: string
  readonly role: StepRole | 'Obsolete'
  readonly text: string
}

export interface ReconcileResult {
  readonly contents: string
  readonly obsoleteMethods: readonly string[]
  readonly pendingMethods: readonly string[]
}

export function reconcileStepAdapter(
  existing: string | undefined,
  methods: readonly StepMethod[],
  metadata: string,
  fileLabel: string,
): ReconcileResult {
  if (existing === undefined) return createStepAdapter(methods, metadata)

  const canonicalSource = replaceMetadata(existing, metadata)
  const structure = parseStructure(canonicalSource, fileLabel)
  const expectedNames = new Set(methods.map((method) => method.method))
  const rendered: RenderedMethod[] = []
  const pendingMethods: string[] = []

  for (const method of methods) {
    const current = structure.methods.get(method.method)
    if (!current) {
      rendered.push({ name: method.method, role: method.role, text: renderPendingMethod(method) })
      pendingMethods.push(method.method)
      continue
    }

    const contract = methodContract(method)
    const parametersChanged = !contractMatches(current.node, contract, structure.sourceFile)
    let text = current.text
    if (parametersChanged) {
      if (!current.pending)
        text = insertPendingGuard(canonicalSource, current.node, text, method.method)
      text = patchParameters(current.node, text, contract.parameterCode)
    }
    if (current.pending || parametersChanged) pendingMethods.push(method.method)
    rendered.push({ name: method.method, role: method.role, text })
  }

  const obsolete = [...structure.methods.values()].filter(
    (method) => !expectedNames.has(method.name),
  )
  for (const method of obsolete) {
    rendered.push({ name: method.name, role: 'Obsolete', text: method.text })
    if (method.pending) pendingMethods.push(method.name)
  }

  let contents = replaceObjectProperties(canonicalSource, structure.object, rendered)
  contents = updateManagedTypes(
    contents,
    canonicalSource,
    structure.sourceFile,
    methods,
    obsolete.length > 0,
  )
  contents = updatePendingHelper(contents, pendingMethods.length > 0, fileLabel)
  contents = ensureTrailingNewline(contents)

  return {
    contents,
    obsoleteMethods: obsolete.map((method) => method.name),
    pendingMethods: [...new Set(pendingMethods)],
  }
}

function createStepAdapter(methods: readonly StepMethod[], metadata: string): ReconcileResult {
  const rendered = methods.map((method) => ({
    name: method.method,
    role: method.role,
    text: renderPendingMethod(method),
  }))
  const typeDeclarations = expectedTypeDeclarations(methods)
  const parts = [metadata]
  if (typeDeclarations.length > 0) parts.push('', renderTypeBlock(typeDeclarations))
  parts.push(
    '',
    'export function createSteps() {',
    '  return {',
    renderSections(rendered, '    '),
    '  }',
    '}',
    '',
    PENDING_HELPER,
    '',
  )
  return {
    contents: parts.join('\n'),
    obsoleteMethods: [],
    pendingMethods: methods.map((method) => method.method),
  }
}

function parseStructure(
  source: string,
  fileLabel: string,
): {
  readonly methods: ReadonlyMap<string, ExistingMethod>
  readonly object: ts.ObjectLiteralExpression
  readonly sourceFile: ts.SourceFile
} {
  const sourceFile = ts.createSourceFile(
    fileLabel,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const diagnostics =
    (sourceFile as ts.SourceFile & { parseDiagnostics?: readonly ts.Diagnostic[] })
      .parseDiagnostics ?? []
  unsupported(diagnostics.length === 0, fileLabel, 'contains invalid TypeScript')

  const factories = sourceFile.statements.filter(
    (statement): statement is ts.FunctionDeclaration =>
      ts.isFunctionDeclaration(statement) &&
      statement.name?.text === 'createSteps' &&
      statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ===
        true,
  )
  unsupported(factories.length === 1, fileLabel, 'must export exactly one createSteps() function')
  const factory = factories[0]
  unsupported(factory?.body, fileLabel, 'createSteps() must have a body')
  unsupported(factory.parameters.length === 0, fileLabel, 'createSteps() cannot receive parameters')
  unsupported(
    (factory.typeParameters?.length ?? 0) === 0,
    fileLabel,
    'createSteps() cannot declare type parameters',
  )
  unsupported(
    !factory.asteriskToken &&
      !factory.modifiers?.some(
        (modifier) =>
          modifier.kind === ts.SyntaxKind.AsyncKeyword ||
          modifier.kind === ts.SyntaxKind.DefaultKeyword,
      ),
    fileLabel,
    'createSteps() must be a named synchronous export and cannot be a generator',
  )

  const returns = factory.body.statements.filter(ts.isReturnStatement)
  unsupported(returns.length === 1, fileLabel, 'createSteps() must directly return one object')
  const object = returns[0]?.expression
  unsupported(
    object && ts.isObjectLiteralExpression(object),
    fileLabel,
    'createSteps() must return an object literal',
  )

  const methods = new Map<string, ExistingMethod>()
  for (const property of object.properties) {
    unsupported(
      ts.isMethodDeclaration(property),
      fileLabel,
      'returned steps must use method shorthand',
    )
    unsupported(
      ts.isIdentifier(property.name) && !property.questionToken && !property.asteriskToken,
      fileLabel,
      'step methods must use plain identifier names',
    )
    unsupported(property.body, fileLabel, 'step methods must have a body')
    unsupported(property.type, fileLabel, 'step methods require an explicit return type')
    const returnType = property.type.getText(sourceFile).replaceAll(/\s/g, '')
    unsupported(
      returnType === 'void' || returnType === 'Promise<void>',
      fileLabel,
      'step methods must return void or Promise<void>',
    )
    const name = property.name.text
    unsupported(!methods.has(name), fileLabel, `contains duplicate step method ${name}`)
    methods.set(name, {
      name,
      node: property,
      pending: property.body.statements.some(isPendingCall),
      text: source.slice(property.getStart(sourceFile), property.end),
    })
  }

  return { methods, object, sourceFile }
}

function contractMatches(
  method: ts.MethodDeclaration,
  contract: ReturnType<typeof methodContract>,
  sourceFile: ts.SourceFile,
): boolean {
  const parametersMatchContract = parametersMatch(
    method,
    contract.parameterName,
    contract.parameterType,
  )
  if (!parametersMatchContract || !contract.typeDeclaration || !contract.typeName)
    return parametersMatchContract

  const aliases = sourceFile.statements.filter(
    (statement): statement is ts.TypeAliasDeclaration =>
      ts.isTypeAliasDeclaration(statement) && statement.name.text === contract.typeName,
  )
  if (aliases.length !== 1) return false
  const expectedSource = ts.createSourceFile(
    'expected-step-contract.ts',
    contract.typeDeclaration,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const expected = expectedSource.statements.find(ts.isTypeAliasDeclaration)
  return Boolean(
    expected &&
      typeSignature(aliases[0] as ts.TypeAliasDeclaration, sourceFile) ===
        typeSignature(expected, expectedSource),
  )
}

function parametersMatch(
  method: ts.MethodDeclaration,
  expectedName: string | undefined,
  expectedType: string | undefined,
): boolean {
  if (expectedName === undefined || expectedType === undefined)
    return method.parameters.length === 0
  if (method.parameters.length !== 1) return false
  const parameter = method.parameters[0]
  return Boolean(
    parameter &&
      ts.isIdentifier(parameter.name) &&
      parameter.name.text === expectedName &&
      !parameter.dotDotDotToken &&
      !parameter.questionToken &&
      !parameter.initializer &&
      parameter.type?.getText().replaceAll(/\s/g, '') === expectedType.replaceAll(/\s/g, ''),
  )
}

function patchParameters(
  node: ts.MethodDeclaration,
  methodText: string,
  parameters: string,
): string {
  const methodStart = node.getStart(node.getSourceFile())
  const start = node.parameters.pos - methodStart
  const end = node.parameters.end - methodStart
  return `${methodText.slice(0, start)}${parameters}${methodText.slice(end)}`
}

function insertPendingGuard(
  source: string,
  node: ts.MethodDeclaration,
  methodText: string,
  methodName: string,
): string {
  const body = node.body
  if (!body) return methodText
  const methodStart = node.getStart(node.getSourceFile())
  const insertion = body.getStart(node.getSourceFile()) + 1 - methodStart
  const lineStart = source.lastIndexOf('\n', node.getStart(node.getSourceFile())) + 1
  const methodIndent = source.slice(lineStart, node.getStart(node.getSourceFile()))
  const statementIndent = `${methodIndent}  `
  const afterBrace = source[body.getStart(node.getSourceFile()) + 1]
  const suffix = afterBrace === '\n' || afterBrace === '\r' ? '' : `\n${statementIndent}`
  const guard = `\n${statementIndent}pendingStep(${JSON.stringify(`Inputs changed: adapt ${methodName}`)})${suffix}`
  return `${methodText.slice(0, insertion)}${guard}${methodText.slice(insertion)}`
}

function replaceObjectProperties(
  source: string,
  object: ts.ObjectLiteralExpression,
  methods: readonly RenderedMethod[],
): string {
  const objectStart = object.getStart(object.getSourceFile())
  const lineStart = source.lastIndexOf('\n', objectStart) + 1
  const baseIndent = source.slice(lineStart, objectStart).match(/^\s*/)?.[0] ?? '  '
  const propertyIndent = `${baseIndent}  `
  const inner = `\n${renderSections(methods, propertyIndent)}\n${baseIndent}`
  return `${source.slice(0, objectStart + 1)}${inner}${source.slice(object.end - 1)}`
}

function renderSections(methods: readonly RenderedMethod[], indent: string): string {
  const roles: readonly RenderedMethod['role'][] = ['Context', 'Action', 'Outcome', 'Obsolete']
  return roles
    .flatMap((role) => {
      const group = methods.filter((method) => method.role === role)
      if (group.length === 0) return []
      const renderedMethods = group
        .map((method) => indentFirstLine(`${method.text},`, indent))
        .join('\n\n')
      return [`${indent}// ${role} Steps\n${renderedMethods}`]
    })
    .join('\n\n')
}

function renderPendingMethod(method: StepMethod): string {
  const parameters = methodContract(method).parameterCode
  return [
    `${method.method}(${parameters}): void {`,
    `      pendingStep(${JSON.stringify(`Implement ${method.method}`)})`,
    '    }',
  ].join('\n')
}

function updateManagedTypes(
  contents: string,
  original: string,
  sourceFile: ts.SourceFile,
  methods: readonly StepMethod[],
  preserveObsoleteTypes: boolean,
): string {
  const start = original.indexOf(TYPES_START)
  const endMarker = original.indexOf(TYPES_END)
  if (start >= 0 !== endMarker >= 0 || (start >= 0 && endMarker < start)) {
    throw new CodegenError('UNSUPPORTED_STEP_SHAPE', 'Step type ownership markers are incomplete.')
  }

  const expectedAliases = new Set(
    methods.map((method) => `${method.method[0]?.toUpperCase()}${method.method.slice(1)}Type`),
  )
  const existingDeclarations = new Map<string, ts.TypeAliasDeclaration>()
  if (start >= 0 && endMarker >= 0) {
    for (const statement of sourceFile.statements) {
      if (
        ts.isTypeAliasDeclaration(statement) &&
        statement.getStart(sourceFile) > start &&
        statement.end < endMarker
      ) {
        existingDeclarations.set(statement.name.text, statement)
      }
    }
  }
  const preserved: string[] = []
  if (preserveObsoleteTypes && start >= 0 && endMarker >= 0) {
    for (const statement of existingDeclarations.values()) {
      if (!expectedAliases.has(statement.name.text)) {
        preserved.push(original.slice(statement.getStart(sourceFile, true), statement.end).trim())
      }
    }
  }

  const expected = expectedTypeDeclarations(methods)
  const declarations = dedupeTypeDeclarations([...expected, ...preserved])
  const block = declarations.length > 0 ? renderTypeBlock(declarations) : ''
  for (const declaration of declarations) {
    const name = declaration.match(/^type\s+([^\s=]+)/)?.[1]
    const managed = name ? existingDeclarations.get(name) : undefined
    if (name && bindings(sourceFile, name).some((binding) => binding !== managed)) {
      throw new CodegenError(
        'UNSUPPORTED_STEP_SHAPE',
        `Type ${name} conflicts with a generated Step type.`,
      )
    }
  }

  if (start >= 0 && endMarker >= 0) {
    const end = endMarker + TYPES_END.length
    if (block.length === 0) return `${contents.slice(0, start)}${contents.slice(end)}`
    if (managedTypesMatch(existingDeclarations, sourceFile, declarations)) return contents
    return `${contents.slice(0, start)}${block}${contents.slice(end)}`
  }
  if (block.length === 0) return contents

  const reparsed = ts.createSourceFile(
    'steps.ts',
    contents,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const factory = reparsed.statements.find(
    (statement): statement is ts.FunctionDeclaration =>
      ts.isFunctionDeclaration(statement) && statement.name?.text === 'createSteps',
  )
  if (!factory)
    throw new CodegenError('UNSUPPORTED_STEP_SHAPE', 'Cannot place generated Step types.')
  const insertion = factory.getStart(reparsed, true)
  return `${contents.slice(0, insertion)}${block}\n\n${contents.slice(insertion)}`
}

function expectedTypeDeclarations(methods: readonly StepMethod[]): string[] {
  return [
    ...standardTypeDeclarations(methods),
    ...methods.flatMap((method) => {
      const declaration = methodContract(method).typeDeclaration
      return declaration ? [declaration] : []
    }),
  ]
}

function renderTypeBlock(declarations: readonly string[]): string {
  return [TYPES_START, declarations.join('\n\n'), TYPES_END].join('\n')
}

function dedupeTypeDeclarations(declarations: readonly string[]): string[] {
  const names = new Set<string>()
  const result: string[] = []
  for (const declaration of declarations) {
    const name = declaration.match(/^type\s+([^\s=]+)/)?.[1]
    if (!name || names.has(name)) continue
    names.add(name)
    result.push(declaration)
  }
  return result
}

function managedTypesMatch(
  existing: ReadonlyMap<string, ts.TypeAliasDeclaration>,
  sourceFile: ts.SourceFile,
  expected: readonly string[],
): boolean {
  if (existing.size !== expected.length) return false
  return expected.every((declaration) => {
    const parsed = ts.createSourceFile(
      'generated-type.ts',
      declaration,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    )
    const expectedAlias = parsed.statements.find(ts.isTypeAliasDeclaration)
    if (!expectedAlias) return false
    const current = existing.get(expectedAlias.name.text)
    return current
      ? typeSignature(current, sourceFile) === typeSignature(expectedAlias, parsed)
      : false
  })
}

function typeSignature(alias: ts.TypeAliasDeclaration, sourceFile: ts.SourceFile): string {
  return ts
    .createPrinter({ removeComments: true })
    .printNode(ts.EmitHint.Unspecified, alias.type, sourceFile)
    .replaceAll(/\s/g, '')
}

function updatePendingHelper(source: string, needed: boolean, fileLabel: string): string {
  const marker = source.indexOf(PENDING_HELPER_MARKER)
  const sourceFile = ts.createSourceFile(
    fileLabel,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const helpers = sourceFile.statements.filter(
    (statement): statement is ts.FunctionDeclaration =>
      ts.isFunctionDeclaration(statement) && statement.name?.text === 'pendingStep',
  )

  if (marker >= 0) {
    const helper = helpers.find((candidate) => candidate.getStart(sourceFile, true) >= marker)
    if (!helper)
      throw new CodegenError(
        'UNSUPPORTED_STEP_SHAPE',
        `${fileLabel} has an invalid pending helper.`,
      )
    if (needed && bindings(sourceFile, 'pendingStep').some((binding) => binding !== helper)) {
      throw new CodegenError(
        'UNSUPPORTED_STEP_SHAPE',
        `${fileLabel} reserves pendingStep for generated guards.`,
      )
    }
    let end = helper.end
    while (source[end] === '\n' || source[end] === '\r') end += 1
    const replacement = needed ? `${PENDING_HELPER}\n` : ''
    return `${source.slice(0, marker)}${replacement}${source.slice(end)}`
  }

  if (!needed) return source
  if (bindings(sourceFile, 'pendingStep').length > 0) {
    throw new CodegenError(
      'UNSUPPORTED_STEP_SHAPE',
      `${fileLabel} reserves pendingStep for generated guards.`,
    )
  }
  return `${source.trimEnd()}\n\n${PENDING_HELPER}\n`
}

function bindings(sourceFile: ts.SourceFile, expectedName: string): ts.Node[] {
  const matches: ts.Node[] = []
  const addName = (name: ts.BindingName | ts.Identifier | undefined, owner: ts.Node): void => {
    if (!name) return
    if (ts.isIdentifier(name)) {
      if (name.text === expectedName) matches.push(owner)
      return
    }
    for (const element of name.elements) {
      if (!ts.isOmittedExpression(element)) addName(element.name, owner)
    }
  }

  const visit = (node: ts.Node): void => {
    if (ts.isVariableDeclaration(node) || ts.isParameter(node)) {
      addName(node.name, node)
    } else if (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isClassDeclaration(node) ||
      ts.isClassExpression(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isEnumDeclaration(node) ||
      ts.isImportEqualsDeclaration(node) ||
      ts.isTypeParameterDeclaration(node)
    ) {
      addName(node.name, node)
    } else if (ts.isModuleDeclaration(node)) {
      if (ts.isIdentifier(node.name)) addName(node.name, node)
    } else if (ts.isImportDeclaration(node)) {
      const clause = node.importClause
      addName(clause?.name, clause ?? node)
      const namedBindings = clause?.namedBindings
      if (namedBindings && ts.isNamespaceImport(namedBindings)) {
        addName(namedBindings.name, namedBindings)
      } else if (namedBindings) {
        for (const element of namedBindings.elements) addName(element.name, element)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return matches
}

function replaceMetadata(source: string, metadata: string): string {
  const lines = source.split(/\r?\n/)
  const metadataLines = metadata.split('\n')
  lines.splice(0, 2, ...metadataLines)
  return lines.join('\n')
}

function isPendingCall(statement: ts.Statement): boolean {
  return Boolean(
    ts.isExpressionStatement(statement) &&
      ts.isCallExpression(statement.expression) &&
      ts.isIdentifier(statement.expression.expression) &&
      statement.expression.expression.text === 'pendingStep',
  )
}

function indentFirstLine(value: string, indent: string): string {
  return `${indent}${value}`
}

function unsupported(condition: unknown, fileLabel: string, message: string): asserts condition {
  if (!condition) throw new CodegenError('UNSUPPORTED_STEP_SHAPE', `${fileLabel} ${message}.`)
}

function ensureTrailingNewline(value: string): string {
  return `${value.trimEnd()}\n`
}
