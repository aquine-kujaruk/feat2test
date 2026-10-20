# Contributing to feat2test

Use Node 22.18+ and pnpm 11.

```bash
pnpm install
pnpm verify
```

Commits must follow Conventional Commits. Use `feat:` for additive behavior, `fix:` for corrections and
`!` or a `BREAKING CHANGE:` footer for incompatible CLI changes. Do not edit generated Feature Tests or
release metadata manually.

Pull requests should include tests for behavior changes and keep generation fail-closed.

Runners live in `src/runners.ts`. Keep runner-specific rendering there; the parser, scenario
planner and Step Adapter scaffold must remain runner-independent. A new runner needs CLI help,
documentation and a test that executes its generated output.

`pnpm verify` installs the packed CLI in a temporary consumer project and tests npm/npx. It requires
registry access. `pnpm test:package` runs that check independently.

feat2test stops at red: it generates tests and pending Step Adapters, never domain code. Its
regression Features live in `tests/regression/` at the limits of the step contract; their generated
output is compared with the committed `expected/` files. After an intended output change, regenerate
them with `pnpm exec vitest run tests/regression.test.ts -u` and review the diff.
