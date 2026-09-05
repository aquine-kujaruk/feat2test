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

Runner strategies live in `src/strategies.ts`. Keep runner-specific rendering there; the parser,
scenario planner and Step Adapter scaffold must remain independent of the runner. A new strategy
also needs a schema enum, CLI help, documentation and a test that executes its generated output.

`pnpm verify` installs the packed CLI in a temporary consumer project and tests npm/npx. It requires
registry access. `pnpm test:package` runs that check independently. The two maintained examples
(`calculator` and `order-confirmation`) run in CI; local pending scaffolds do not.
