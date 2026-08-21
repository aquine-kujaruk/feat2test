# gherkin-vitest-codegen

Fail-closed code generation from Gherkin or Markdown-with-Gherkin to explicit, readable Vitest
tests.

It uses the official Cucumber pipeline:

```text
.feature / .feature.md -> Gherkin AST -> Pickle[] -> generated .test.ts
```

Unlike a thin runtime runner, the generated tests remain useful to reviewers, debuggers and coding
agents. Invalid or incomplete specifications fail generation instead of producing empty green tests.
Every source is parsed and compiled first; emitters and output only run after the complete project is
valid.

## Requirements

- Node.js 22.18 or newer
- Vitest 3.2 or 4

## Install

```bash
pnpm add -D gherkin-vitest-codegen vitest
# npm install --save-dev gherkin-vitest-codegen vitest
# yarn add --dev gherkin-vitest-codegen vitest
```

All three commands install the same npm package. This repository uses pnpm for reproducible
development.

## Configure

Create `gherkin-vitest.config.ts`:

```ts
import { defineConfig, definePack } from 'gherkin-vitest-codegen'

const calculator = definePack({
  id: 'calc',
  factory: 'calculatorSteps',
  importPath: './test/steps/calculator.steps.ts',
})

calculator
  .step(/^a calculator with an empty display$/, () => ({ method: 'start' }))
  .step(/^the user enters "(.+)"$/, ({ captures }) => ({
    method: 'enter',
    args: [captures[0] ?? ''],
  }))
  .step(/^the display shows "(.*)"$/, ({ captures }) => ({
    method: 'displayShows',
    args: [captures[0] ?? ''],
  }))

export default defineConfig({
  packs: [calculator],
})
```

Each emitter returns structured data, not arbitrary source code. Arguments must be JSON-safe and are
escaped by the generator. Calls are awaited by default; set `await: false` only when useful.

Each scenario creates a fresh pack instance. Its closure owns test state; generated tests do not
impose a `world`, fixture shape or application architecture:

```ts
import { expect } from 'vitest'

export function calculatorSteps() {
  let display = ''

  return {
    start() {
      display = ''
    },
    enter(value: string) {
      display = value
    },
    displayShows(expected: string) {
      expect(display).toBe(expected)
    },
  }
}
```

## Write a feature

Classic `.feature` and Markdown `.feature.md` are supported. Markdown keywords must be literal, and
Examples tables require 2–5 spaces of indentation:

```markdown
# Feature: Calculator display

### Scenario Outline: Display a value

* Given a calculator with an empty display
* When the user enters "<value>"
* Then the display shows "<value>"

#### Examples:

  | value |
  | ----- |
  | 12    |
```

Do not write `* **Given**`; Cucumber treats it as prose, leaving a scenario with zero steps. This
library detects that and fails—even when the same scenario also contains valid steps. It likewise
rejects formatted/case-changed Gherkin headings and Examples tables outside the required indentation,
instead of accepting the parser's silently ignored prose. In strict step blocks, every bullet must
parse as a step; use plain paragraphs for documentation lists you do not want executed.

## Generate

```bash
pnpm exec gherkin-vitest-codegen validate
pnpm exec gherkin-vitest-codegen
pnpm exec gherkin-vitest-codegen --check
pnpm exec gherkin-vitest-codegen --watch
```

`validate` only parses, compiles and checks the Gherkin model; it neither runs emitters nor touches
generated files. `generate` and `--check` always perform that same whole-project validation as their
first phase.

Make it an execution gate, so Vitest cannot start after invalid Markdown:

```json
{
  "scripts": {
    "features:validate": "gherkin-vitest-codegen validate",
    "features:generate": "gherkin-vitest-codegen",
    "test": "gherkin-vitest-codegen && vitest run",
    "test:ci": "gherkin-vitest-codegen --check && vitest run"
  }
}
```

The `&&` is intentional: any parse, empty-step, Examples, undefined-step, ambiguity or drift error
exits non-zero, so Vitest is never launched.

Defaults:

- inputs: `features/**/*.feature` and `features/**/*.feature.md`
- output: `test/generated/**/*.generated.test.ts`
- dialect: English
- test binding: Vitest's `test` export
- unused emitters: error

Feature subdirectories are mirrored below the output directory, preventing basename collisions.
Generation validates every file before writing and only removes stale `*.generated.test.ts` files.
`--check` compares expected, missing and stale files directly; it does not depend on `git diff`.

Commit generated tests when readability and drift checks matter. Otherwise ignore them, run generation
before tests, and do not use `--check` on a clean checkout.

## Configuration

```ts
defineConfig({
  rootDir: '.',
  featureRoot: 'features',
  features: ['features/**/*.feature', 'features/**/*.feature.md'],
  outDir: 'test/generated',
  language: 'en',
  test: { importPath: 'vitest', exportName: 'test' },
  packs: [],
  unusedEmitters: 'error', // 'warn' | 'ignore'
})
```

Root-relative local imports start with `./`; bare specifiers are emitted unchanged. Regex patterns must
be fully anchored and cannot use stateful `g` or `y` flags. Undefined and ambiguous steps always fail.
Emitter context also exposes source metadata, semantic step type, regex captures, DocStrings and data
tables.

See the [calculator example](./examples/calculator) for a complete Markdown workflow.

## Development

```bash
pnpm install
pnpm verify
node dist/cli.mjs --config examples/calculator/gherkin-vitest.config.ts
```

To start in RED from one standalone specification, put exactly one `.feature.md` in an example
directory and pass either the file or its directory:

```bash
yarn run:example examples/my-example/example.feature.md
```

The command deterministically scaffolds `gherkin-vitest.config.ts`, `test/steps/*.steps.ts` and
`test/generated/*.generated.test.ts`. It never creates application `src` code or a support/world
fixture. Method names come from normalized step text; quoted values and Examples placeholders become
arguments. Step adapters initially throw `TODO`, so executing the generated test is deliberately RED.
See [`examples/tdd-task-list`](./examples/tdd-task-list); the calculator remains the implemented GREEN
reference. The repository suite excludes the deliberate-RED fixture and verifies its scaffold in
`tests/compile-example.test.ts`.

Quality gates: strict TypeScript, Biome, Vitest coverage, `publint`, Are The Types Wrong, Husky and
Commitlint.

## Releases

Use Conventional Commits (`feat:`, `fix:`, `feat!:`). Pushes to `main` run the complete verification,
then semantic-release updates the changelog/package metadata, creates the GitHub release and publishes
to npm with provenance.

Configure npm Trusted Publishing for repository `aquine-kujaruk/gherkin-vitest-codegen` and workflow
`release.yml`. The workflow uses OIDC; no long-lived `NPM_TOKEN` is required. Repository branch rules
must allow the GitHub Actions release commit, matching the versioning style used by `sfn-toolbox`.

## License

[MIT](./LICENSE)
