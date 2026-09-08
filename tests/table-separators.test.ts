import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { generate } from '../src/generate.js'
import { parseFeature } from '../src/parse.js'

let workspace = ''

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), 'feat2test-tables-'))
})

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true })
})

const separators = [
  { name: 'no separator', cells: [] },
  { name: 'plain separator', cells: ['---', '---'] },
  { name: 'left/right alignment', cells: [':---', '---:'] },
  { name: 'centered alignment', cells: [':---:', ':---:'] },
]

function source(markdown: boolean, cells: readonly string[]): string {
  const separator = cells.length ? [`  | ${cells.join(' | ')} |`] : []
  return [
    `${markdown ? '# ' : ''}Feature: Shop`,
    '',
    `${markdown ? '## ' : ''}Scenario Outline: Add <quantity> <product>`,
    '',
    `${markdown ? '* ' : '  '}Given the order contains:`,
    '  | product | quantity |',
    ...separator,
    '  | <product> | <quantity> |',
    '  | Notebook | 1 |',
    `${markdown ? '* ' : '  '}When the customer adds <quantity> units`,
    `${markdown ? '* ' : '  '}Then the cart holds <quantity> units`,
    '',
    `${markdown ? '### ' : ''}Examples:`,
    '',
    '  | quantity | product |',
    ...separator,
    '  | 2 | Pencil |',
    '  | 5 | Pen |',
    '',
  ].join('\n')
}

async function consume(markdown: boolean, cells: readonly string[], output: string) {
  const filename = markdown ? 'shop.feature.md' : 'shop.feature'
  const input = path.join(workspace, filename)
  const text = source(markdown, cells)
  await writeFile(input, text)
  const parsed = await parseFeature(input, filename)
  const report = await generate(input, path.join(workspace, output), { runner: 'vitest' })
  const generated = await readFile(report.testPath, 'utf8')
  return { filename, text, parsed, report, generated }
}

describe.each([true, false])('table separators (Markdown: %s)', (markdown) => {
  test.each(separators)(
    '$name preserves the format-specific data and diagnostics',
    async ({ cells }) => {
      const baseline = await consume(markdown, [], 'baseline')
      const { filename, text, parsed, report, generated } = await consume(
        markdown,
        cells,
        'formatted',
      )
      const nativeSeparator = !markdown && cells.length > 0
      const bindings = [
        ...(nativeSeparator ? [{ quantity: cells[0], product: cells[1] }] : []),
        { quantity: '2', product: 'Pencil' },
        { quantity: '5', product: 'Pen' },
      ]

      expect([...parsed.rows.values()].map((row) => Object.fromEntries(row))).toEqual(bindings)
      expect(parsed.pickles).toHaveLength(bindings.length)
      expect(report.scenarioCount).toBe(bindings.length)
      expect([...generated.matchAll(/test\('([^']+)'/g)].map((match) => match[1])).toEqual(
        bindings.map(({ quantity, product }) => `Add ${quantity} ${product}`),
      )

      for (const [index, { quantity, product }] of bindings.entries()) {
        const rows = [
          ['product', 'quantity'],
          ...(nativeSeparator ? [cells] : []),
          [product, quantity],
          ['Notebook', '1'],
        ]
        const steps = parsed.pickles[index]?.steps
        expect(
          steps?.[0]?.argument?.dataTable?.rows.map((row) => row.cells.map((cell) => cell.value)),
        ).toEqual(rows)
        expect(steps?.map((step) => step.text)).toEqual([
          'the order contains:',
          `the customer adds ${quantity} units`,
          `the cart holds ${quantity} units`,
        ])
        expect(generated).toContain(`await steps.theCustomerAddsUnits('${quantity}')`)
        expect(generated).toContain(`await steps.theCartHoldsUnits('${quantity}')`)
        expect(generated).toContain(
          `await steps.theOrderContains([\n${rows.map((row) => `      ['${row.join("', '")}'],`).join('\n')}\n    ])`,
        )
      }

      const separatorLines = text
        .split('\n')
        .flatMap((line, index) =>
          nativeSeparator && line === `  | ${cells.join(' | ')} |` ? [index + 1] : [],
        )
      expect(parsed.warnings).toEqual(
        separatorLines.map(
          (line) => `${filename}:${line} Markdown separator row is read as data. Delete it.`,
        ),
      )
      expect(report.warnings).toEqual(
        separatorLines.map(
          (line) =>
            `${path.relative(process.cwd(), path.join(workspace, filename))}:${line} Markdown separator row is read as data. Delete it.`,
        ),
      )

      if (markdown) {
        // Compare executable calls, excluding source locations and other metadata.
        expect(generated.match(/await steps\.[\s\S]*?\)\n/g)).toEqual(
          baseline.generated.match(/await steps\.[\s\S]*?\)\n/g),
        )
      }
    },
  )
})
