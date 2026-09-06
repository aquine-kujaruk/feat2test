import { parse } from '@babel/parser'
import { describe, expect, test } from 'vitest'
import { renderStepAdapter } from '../src/steps.js'
import { synchronizeStepAdapter } from '../src/sync-steps.js'
import type { FeaturePlan, StepDefinition, StepParam, StepRole } from '../src/types.js'

function step(
  method: string,
  params: readonly StepParam[] = [],
  role: StepRole = 'Context',
): StepDefinition {
  return { method, params, role }
}

function plan(steps: readonly StepDefinition[]): FeaturePlan {
  return { name: 'Shop', scenarios: [], steps }
}

function sync(source: string, ...steps: StepDefinition[]): string {
  const result = synchronizeStepAdapter(plan(steps), source, 'shop.feature.steps.ts')
  // Every edited adapter must remain valid TypeScript and stable on a second run.
  expect(() => parse(result, { sourceType: 'module', plugins: ['typescript'] })).not.toThrow()
  expect(synchronizeStepAdapter(plan(steps), result, 'shop.feature.steps.ts')).toBe(result)
  return result
}

describe('step synchronization', () => {
  const quantity = { name: 'quantity', type: 'string' } as const
  const product = { name: 'product', type: 'string' } as const

  test('inserts new methods in their role and Feature order with one heading per role', () => {
    const existing = [
      step('shopIsOpen'),
      step('customerBrowses', [], 'Action'),
      step('productsAreListed', [], 'Outcome'),
    ] as const
    const desired = [
      step('customerIsRegistered'),
      existing[0],
      step('customerSearches', [], 'Action'),
      existing[1],
      step('productsAreAvailable', [], 'Outcome'),
      existing[2],
    ]
    const source = renderStepAdapter(plan(existing)).replaceAll(
      /throw new Error\('PENDING: ([^']+)'\)/g,
      'assert("$1")',
    )
    const result = sync(source, ...desired)
    for (const role of ['Context', 'Action', 'Outcome']) {
      expect(result.match(new RegExp(`^    // ${role}$`, 'gm'))).toHaveLength(1)
    }
    for (const method of existing) expect(result).toContain(`assert("${method.method}")`)
    const positions = desired.map((method) => result.indexOf(`${method.method}(`))
    expect(positions).toEqual([...positions].sort((left, right) => left - right))
  })

  test('repairs duplicate headings even when every signature is already current', () => {
    const source = `export function createSteps() {
  return {
    // Outcome
    first() {},
    // Outcome
    second() {},
  }
}`
    const result = sync(source, step('first', [], 'Outcome'), step('second', [], 'Outcome'))
    expect(result.match(/\/\/ Outcome/g)).toHaveLength(1)
    expect(result).toContain('first() {}')
    expect(result).toContain('second() {}')
  })

  test('removes empty group headings and moves a retained implementation when its role changes', () => {
    const source = renderStepAdapter(plan([step('first'), step('second', [], 'Action')])).replace(
      "throw new Error('PENDING: first')",
      "assert('tested implementation')",
    )
    const result = sync(source, step('second', [], 'Action'), step('first', [], 'Outcome'))
    expect(result).not.toContain('// Context')
    expect(result.match(/\/\/ Action/g)).toHaveLength(1)
    expect(result.match(/\/\/ Outcome/g)).toHaveLength(1)
    expect(result.indexOf('second()')).toBeLessThan(result.indexOf('first()'))
    expect(result).toContain("assert('tested implementation')")
  })

  test('keeps method comments and heading-like text inside implementations when regrouping', () => {
    const implementation = `first() {
      // Outcome
      const literal = \`// Context\`
      return literal
    }`
    const source = `export function createSteps() {
  return {
    // Outcome
    /** Tested behavior. */
    ${implementation}, // Keep with first.
    // Outcome
    second() {},
    // Keep this final note.
  }
}`
    const result = sync(source, step('second', [], 'Outcome'), step('first', [], 'Outcome'))
    expect(result).toContain(implementation)
    expect(result).toContain('/** Tested behavior. */\n    first()')
    expect(result).toContain('// Keep with first.')
    expect(result).toContain('// Keep this final note.')
    expect(result.match(/^ {4}\/\/ Outcome$/gm)).toHaveLength(1)
  })

  test('survives repeated additions, removals, renames, parameter changes and role changes', () => {
    const roles: readonly StepRole[] = ['Context', 'Action', 'Outcome']
    let desired = Array.from({ length: 12 }, (_, index) =>
      step(`step${index}`, [], roles[index % 3]),
    )
    const order = () =>
      desired.sort((left, right) => roles.indexOf(left.role) - roles.indexOf(right.role))
    order()
    let source = renderStepAdapter(plan(desired)).replaceAll(
      /throw new Error\('PENDING: ([^']+)'\)/g,
      'assert("tested $1")',
    )
    const methodTexts = (text: string) => {
      const ast = parse(text, { sourceType: 'module', plugins: ['typescript'] })
      const exported = ast.program.body.find((node) => node.type === 'ExportNamedDeclaration')
      if (
        exported?.type !== 'ExportNamedDeclaration' ||
        exported.declaration?.type !== 'FunctionDeclaration'
      )
        throw new Error('missing factory')
      const returned = exported.declaration.body.body.find(
        (node) => node.type === 'ReturnStatement',
      )
      if (returned?.type !== 'ReturnStatement' || returned.argument?.type !== 'ObjectExpression')
        throw new Error('missing object')
      return new Map(
        returned.argument.properties.map((method) => {
          if (method.type !== 'ObjectMethod' || method.key.type !== 'Identifier')
            throw new Error('unexpected method')
          return [method.key.name, text.slice(method.start as number, method.end as number)]
        }),
      )
    }
    for (let round = 0; round < 90; round++) {
      const before = new Map(desired.map((method) => [method.method, method.params]))
      const implementations = methodTexts(source)
      const index = round % desired.length
      const current = desired[index] as StepDefinition
      switch (round % 6) {
        case 0:
          desired.splice(index, 0, step(`added${round}`, [], roles[round % 3]))
          break
        case 1:
          desired.splice(index, 1)
          break
        case 2:
          desired[index] = { ...current, method: `renamed${round}` }
          break
        case 3:
          desired[index] = { ...current, params: [{ name: `value${round}`, type: 'string' }] }
          break
        case 4:
          desired[index] = {
            ...current,
            role: roles[(roles.indexOf(current.role) + 1) % 3] as StepRole,
          }
          break
        case 5:
          desired = [...desired.slice(index), ...desired.slice(0, index)]
          break
      }
      order()
      source = sync(source, ...desired)
      const after = methodTexts(source)
      expect([...after.keys()]).toEqual(desired.map((method) => method.method))
      for (const method of desired) {
        if (JSON.stringify(before.get(method.method)) === JSON.stringify(method.params)) {
          expect(after.get(method.method)).toBe(implementations.get(method.method))
        } else {
          expect(after.get(method.method)).toContain(`throw new Error('PENDING: ${method.method}')`)
        }
      }
      for (const role of roles) {
        expect(source.match(new RegExp(`^    // ${role}$`, 'gm')) ?? []).toHaveLength(
          desired.some((method) => method.role === role) ? 1 : 0,
        )
      }
      source = source.replaceAll(
        /throw new Error\('PENDING: ([^']+)'\)/g,
        `assert("tested in round ${round}: $1")`,
      )
    }
  })

  test('preserves large implementations containing nested code, templates and group-like comments', () => {
    const block = `      {
        // Outcome
        const text = \`// Context { return { nested() {} } }\`
        const nested = { action: () => ({ value: text, verify() { return /[{},]/.test(text) } }) }
        if (!nested.action().verify()) throw new Error(text)
      }
`
    const body = block.repeat(80)
    const names = Array.from({ length: 40 }, (_, index) => `largeStep${index}`)
    const implementations = new Map(names.map((name) => [name, `${name}(): void {\n${body}    }`]))
    const source = `export function createSteps() {\n  return {\n    // Context\n${[...implementations.values()].map((method) => `    ${method},`).join('\n')}\n  }\n}\n`
    expect(source.length).toBeGreaterThan(800_000)
    const retained = names.filter((_name, index) => index % 4 !== 0)
    const result = sync(source, ...retained.map((name) => step(name)), step('added', [], 'Outcome'))
    for (const name of names) {
      expect(result.includes(implementations.get(name) as string)).toBe(retained.includes(name))
    }
    expect(result.match(/^ {4}\/\/ Context$/gm)).toHaveLength(1)
    expect(result.match(/^ {4}\/\/ Outcome$/gm)).toHaveLength(1)
    expect(result).toContain("throw new Error('PENDING: added')")
  }, 15_000)

  test('leaves matching implementations, imports, state, helpers and formatting byte-for-byte intact', () => {
    const source = `import { strict as assert } from 'node:assert'

export function createSteps() {
  const entries: string[] = []
  function label(value: string) { return \`[\${value}]\` }
  const nested = () => { return { unused() {} } }
  return {
    // Proven against the catalog.
    async productsAreListed(product : string): Promise<void> {
      entries.push(label(product))
      assert.deepEqual(entries, [label(product)])
    }
  }
}
`
    expect(sync(source, step('productsAreListed', [product]))).toBe(source)
  })

  test('adds a new pending method while preserving the full implementation of a retained method', () => {
    const implementation = `productsAreListed(): void {
      const marker = '}, // ,'
      const pattern = /[{},]/
      const nested = { label: \`value: \${marker}\`, match() { return pattern.test(marker) } }
      if (!nested.match()) throw new Error('catalog mismatch')
    }`
    const source = `export function createSteps() {
  const state = new Map<string, number>()
  return {
    // Keep this explanation.
    ${implementation} // Keep this trailing comment, too.
  }
}
// Keep the helper.
function helper() { return 42 }
`
    const result = sync(source, step('productsAreListed'), step('theCustomerBrowses'))
    expect(result).toContain(implementation)
    expect(result).toContain('// Keep this explanation.')
    expect(result).toContain('// Keep this trailing comment, too.')
    expect(result).toContain('const state = new Map<string, number>()')
    expect(result).toContain('function helper() { return 42 }')
    expect(result).toContain("throw new Error('PENDING: theCustomerBrowses')")
  })

  test('replaces a renamed step even when its parameters are unchanged', () => {
    const source = renderStepAdapter(plan([step('theShopIsOpen')])).replace(
      "throw new Error('PENDING: theShopIsOpen')",
      "throw new Error('old implementation')",
    )
    const result = sync(source, step('theShopIsClosed'))
    expect(result).not.toContain('theShopIsOpen')
    expect(result).not.toContain('old implementation')
    expect(result).toContain("throw new Error('PENDING: theShopIsClosed')")
  })

  test.each([
    ['add a parameter', [quantity], [quantity, product]],
    ['remove a parameter', [quantity, product], [quantity]],
    ['rename a parameter', [quantity], [product]],
    ['reorder parameters', [quantity, product], [product, quantity]],
    ['change a type', [quantity], [{ name: 'quantity', type: 'string[][]' }]],
  ] as const)('replaces the implementation when inputs %s', (_label, before, after) => {
    const source = renderStepAdapter(plan([step('theCustomerOrders', before)])).replace(
      "throw new Error('PENDING: theCustomerOrders')",
      "throw new Error('old implementation')",
    )
    const result = sync(source, step('theCustomerOrders', after))
    expect(result).not.toContain('old implementation')
    expect(result).toContain("throw new Error('PENDING: theCustomerOrders')")
    expect(result.match(/theCustomerOrders\(/g)).toHaveLength(1)
    for (const param of after) expect(result).toContain(`${param.name}: ${param.type}`)
  })

  test('keeps equivalent type formatting, async bodies, defaults and return types', () => {
    const source = `export function createSteps() {
  return {
    async theOrderContains(table: (string) [ ] [ ] = []): Promise<number> {
      return table.length
    }
  }
}`
    expect(sync(source, step('theOrderContains', [{ name: 'table', type: 'string[][]' }]))).toBe(
      source,
    )
  })

  test.each(['number', 'string[]'])(
    'replaces a parameter type that no longer matches: %s',
    (type) => {
      const source = `export function createSteps() { return {
      theCustomerOrders(quantity: ${type}) { throw new Error('old implementation') }
    } }`
      const result = sync(source, step('theCustomerOrders', [quantity]))
      expect(result).not.toContain('old implementation')
      expect(result).toContain('quantity: string')
    },
  )

  test.each(['', ','])('removes any combination of methods, with trailing comma %j', (trailing) => {
    const source = `export function createSteps() { return {
      first() { return 'first implementation' },
      second() { return 'second implementation' },
      third() { return 'third implementation' }${trailing}
    } }`
    const names = ['first', 'second', 'third']
    for (let mask = 0; mask < 8; mask++) {
      const retained = names.filter((_name, index) => mask & (1 << index))
      const result = sync(source, ...retained.map((name) => step(name)))
      for (const name of names) {
        expect(result.includes(`${name} implementation`)).toBe(retained.includes(name))
      }
      const withNew = sync(source, ...retained.map((name) => step(name)), step('added'))
      expect(withNew).toContain("throw new Error('PENDING: added')")
    }
  })

  test('does not mistake commas inside comments for object separators', () => {
    const source = `export function createSteps() { return {
      first() {} /* comma , inside comment */,
      second() {} // another , comment
      , third() {} /* trailing , comment */
    } }`
    expect(sync(source, step('first'), step('newStep'))).not.toContain('second()')
    expect(sync(source, step('second'))).not.toContain('third()')
  })

  test('creates one method per distinct signature even if the plan repeats it', () => {
    const result = sync('export function createSteps() { return {} }', step('first'), step('first'))
    expect(result.match(/first\(/g)).toHaveLength(1)
  })

  test('removes duplicate methods from the adapter', () => {
    const result = sync(
      'export function createSteps() { return { first() {}, first() {} } }',
      step('first'),
    )
    expect(result.match(/first\(/g)).toHaveLength(1)
  })

  test('preserves CRLF when adding methods', () => {
    const source = 'export function createSteps() {\r\n  return {}\r\n}\r\n'
    const result = sync(source, step('first'))
    expect(result.replaceAll('\r\n', '')).not.toContain('\n')
  })

  test('adds a separator to a compact object with no trailing whitespace or comma', () => {
    const result = sync(
      'export function createSteps(){return{first(){}}}',
      step('first'),
      step('second'),
    )
    expect(result).toContain('first(){},')
    expect(result).toContain("throw new Error('PENDING: second')")
  })

  test('updates the old ownership notice only when methods change', () => {
    const source =
      '// Scaffolded by feat2test. Yours to edit: it is never overwritten.\nexport function createSteps() { return { first() {} } }'
    expect(sync(source, step('first'))).toBe(source)
    const result = sync(source, step('second'))
    expect(result).toMatch(/^\/\/ Synced by feat2test\./)
    expect(result).not.toContain('never overwritten')
  })

  test.each([
    'export const createSteps = () => ({ "first": (quantity: string) => quantity })',
    'export const createSteps = function () { return { first: function (quantity: string) { return quantity } } }',
    'export const createSteps = (() => ({ first(quantity: string) {} } as const))',
    'export function createSteps() { return { first(quantity: string) {} } satisfies Record<string, unknown> }',
    'export function createSteps() { return <Record<string, unknown>>{ first(quantity: string) {} } }',
  ])('supports editable factory and method syntax: %s', (source) => {
    expect(sync(source, step('first', [quantity]))).toBe(source)
    const result = sync(source, step('first', [quantity]), step('second'))
    expect(result).toContain("throw new Error('PENDING: second')")
  })

  test.each([
    '// no factory',
    'export const createSteps = externalFactory',
    'export const { createSteps } = helpers',
    'export function createSteps() {}',
    'export function createSteps() { return }',
    'export function createSteps() { return steps }',
    'export function createSteps() { if (ready) return {}; return {} }',
    'export function createSteps() { return { ...steps } }',
    'export function createSteps() { return { [method]() {} } }',
    'export function createSteps() { return { 42() {} } }',
    'export function createSteps() { return { first } }',
    'export function createSteps() { return { get first() { return () => {} } } }',
  ])('reports unsupported structures instead of discarding code: %s', (source) => {
    expect(() =>
      synchronizeStepAdapter(plan([step('first')]), source, 'shop.feature.steps.ts'),
    ).toThrowError(expect.objectContaining({ code: 'UNSUPPORTED_STEP_ADAPTER' }))
  })

  test('reports invalid TypeScript with the adapter filename', () => {
    expect(() =>
      synchronizeStepAdapter(plan([]), 'export function createSteps( {', 'shop.feature.steps.ts'),
    ).toThrowError(
      expect.objectContaining({
        code: 'INVALID_STEP_ADAPTER',
        message: expect.stringContaining('shop.feature.steps.ts'),
      }),
    )
  })
})
