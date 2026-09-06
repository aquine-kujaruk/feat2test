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
- `--check`: validates without writing; fails if the test is outdated or the Step Adapter is missing.
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
└── payment.feature.steps.ts   # yours; never overwritten
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
