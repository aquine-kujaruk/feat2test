# feat2test

Turn Gherkin Features into deterministic TypeScript tests and editable Step Adapters.

## Usage

Requires Node.js 22.18+.

```bash
npx feat2test generate features test/features --runner vitest
npx vitest run
```

The input can be a `.feature` file, a `.feature.md` file, or a directory. Directories are traversed
recursively, and their structure is preserved in the output directory.

```text
feat2test generate <feature> <output> --runner <vitest|node:test> [--check]
```

Options:

- `-r, --runner`: required test runner.
- `--check`: validates without writing; fails if the test or Step Adapter is missing or out of date.
- `--debug`: includes the stack trace.
- `--help`, `--version`: displays help or version information.

Exit codes: `0` success, `1` Feature/generation/check error, `2` invalid usage or runner.

## Runners

| Runner | Requirement | Adapter import |
| --- | --- | --- |
| `vitest` | Vitest installed in the project | `*.steps.js` |
| `node:test` | Node.js, with no additional dependency | `*.steps.ts` |

feat2test generates tests; it does not run the test runner.

```bash
npx feat2test generate features test/features --runner node:test
node --test test/features/example.feature.test.ts
```

## Output

For `features/payment.feature.md`:

```text
test/features/
├── payment.feature.test.ts    # generated; updated automatically
└── payment.feature.steps.ts   # synchronized; matching implementations preserved
```

The Step Adapter exports `createSteps()`:

```ts
export function createSteps() {
  return {
    paymentIsReady(): void {
      // Project implementation
    },
  }
}
```

Each step is converted literally to `camelCase`. Placeholders become `string` parameters;
DataTable uses `string[][]`, and DocString uses `string`. `Given`, `When`, and `Then` group methods as
Context, Action, and Outcome.

On every generation, the Feature determines which step methods exist:

- Same signature: preserve the existing implementation. Repeated steps share one method.
- Missing from the Feature: remove the method.
- New signature: create a method that throws `PENDING` until implemented.

A signature is the method name and its ordered parameter names and types. Changing either the
method name or its parameters replaces that method; changing only example values preserves it.
Async methods and custom return types are preserved when the signature matches.
Renaming one occurrence of a shared step creates a new method; the old method stays until its last
occurrence is removed from the Feature.

Methods remain in a flat object. Synchronization orders them by role and first occurrence in the
Feature, with one generated heading per nonempty group. Existing duplicate headings are repaired;
retained implementations and their comments are copied without rewriting their code.

Keep step methods in the object returned by `createSteps()`. Imports, factory state, helpers outside
that object, and retained methods are preserved. Inline methods and function-valued properties are
supported; dynamic structures such as spreads, computed keys, or multiple returned objects produce
an error before this Feature's files are written. `--check` detects signature drift without modifying
either output; it does not execute implementations or fail merely because a step is `PENDING`.

## CI

```json
{
  "scripts": {
    "features": "feat2test generate features test/features --runner vitest",
    "test": "npm run features && vitest run",
    "test:ci": "feat2test generate features test/features --runner vitest --check && vitest run"
  }
}
```

## Development

```bash
pnpm install
pnpm verify
```

Complete examples: [`examples/calculator`](./examples/calculator) and
[`examples/order-confirmation`](./examples/order-confirmation).

Business Gherkin guide: [`.agents/skills/business-gherkin`](./.agents/skills/business-gherkin).

## License

[MIT](./LICENSE)
