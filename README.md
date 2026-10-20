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

## Step names

Every step ends with an HTML comment naming its Step Adapter method:

```gherkin
Feature: Add units
  Scenario Outline: Add <quantity> units
    Given an empty cart <!-- emptyCart -->
    When <quantity> units are added <!-- addUnits -->
    Then the cart contains <quantity> units <!-- cartContains -->

    Examples:
      | quantity |
      | 2        |
```

The name is the method's identity; the words are documentation, printed without the comment above
each call in the Feature Test. Steps with the same name share one method whatever their words or
spoken language, and steps with different names are different methods. The comment closes the step
line in `.feature` and `.feature.md` alike; Markdown preview hides it.

A name is an ASCII camelCase identifier, `^[a-z][A-Za-z0-9]*$`, and not a JavaScript reserved word.
A step without a name fails with `MISSING_STEP_NAME`. A malformed or reserved name, a second comment,
or a comment that does not end the step fails with `INVALID_STEP_NAME`. `generate` and `validate`
report both with the source, line and step before writing anything.

## Text input and validation

Supply text using `--stdin` or `--text`, with an explicit format (`feature` or `mdg`) and
logical source identity. The identity is relative to the output root, uses `/` separators,
and is never read or written as an input file. Absolute paths and traversal are rejected.

```bash
feat2test validate --text 'Feature: Payment
  Scenario: Accepted
    Given payment is ready <!-- paymentIsReady -->' --format feature --source payments/payment.feature --runner vitest --json
```

Pipe an in-memory source from another process into either command:

```text
producer | feat2test validate --stdin --format feature --source payments/payment.feature --runner node:test --json
producer | feat2test generate test/features --stdin --format feature --source payments/payment.feature --runner node:test
```

The latter creates `test/features/payments/payment.feature.test.ts` and its `.steps.ts` adapter.
A direct physical file keeps its basename; directory inputs keep paths relative to their discovery
root. A nested text identity corresponds to a directory job, not to passing a nested file alone.
File, text and stdin are mutually exclusive; format and identity are required only for text.

`validate` parses, plans, and renders tests and initial adapters entirely in memory. It requires no
output directory, inspects no existing outputs and writes no files, including temporary sources or
caches. `--json` reports `valid`, `evidence: "generability"`, source, format, runner, scenario and step
counts, warnings and diagnostics. Failed validation returns `valid: false` with error diagnostics.

Validation does not certify freshness, generated-code type checking, implemented adapters or passing
behavior. Pending steps and stale existing tests do not prevent it from succeeding. `generate --check`
remains a separate freshness comparison and fails when outputs are missing or stale. Neither command
executes steps, a model, a test runner or a checker. Feature, Rule and Scenario tags are ignored: they do
not change the generated test, the Step Adapter or the runner. Callers explicitly select supported tools.

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

Each step name is one method. Placeholders become `string` parameters named after the placeholder,
with its first letter lower-cased and characters invalid in an identifier removed; DataTable uses
`string[][]`, and DocString uses `string`. `Given`, `When`, and `Then` group methods as Context,
Action, and Outcome. One name with two roles fails with `CONFLICTING_STEP_ROLE`, and with two input
shapes with `CONFLICTING_STEP_INPUTS`.

On every generation, the Feature determines which step methods exist:

- Same signature: preserve the existing implementation. Steps with one name share one method.
- Missing from the Feature: remove the method.
- New signature: create a method that throws `PENDING` until implemented.

A signature is the step name and its ordered parameter names and types. Changing either the name or
its parameters replaces that method; rewording the step or changing only example values preserves it.
Async methods and custom return types are preserved when the signature matches.
Renaming one occurrence of a shared step creates a new method; the old method stays until its last
occurrence is removed from the Feature.

Implementations are retained by name. Features written for feat2test 3 or earlier, which derived
methods from the step words, have no names and fail with `MISSING_STEP_NAME`. To keep an existing
implementation, name its steps with the method the adapter already declares, for example
`<!-- theShopIsOpen -->`; any other name starts a new pending method. Earlier versions read the
comment as an unbound placeholder, so named Features need the comments removed to generate there.

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

Gherkin Craft ships in the npm package at [`skills/gherkin-craft/`](./skills/gherkin-craft/SKILL.md):
guidance for writing Gherkin that generates good tests, with references for the generator's step
contract, native and Markdown formats and worked software examples, plus agent metadata. Copy that
complete directory when installing it for an agent. Development discovery in
`.agents/skills/gherkin-craft` links to this authoritative source; a source checkout is not needed by
consumers.

## License

[MIT](./LICENSE)
