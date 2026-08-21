# Contributing

Use Node 22.18+ and pnpm 11.

```bash
pnpm install
pnpm verify
```

Commits must follow Conventional Commits. Use `feat:` for additive behavior, `fix:` for corrections and
`!` or a `BREAKING CHANGE:` footer for incompatible CLI changes. Do not edit generated Feature Tests or
release metadata manually.

Pull requests should include tests for behavior changes and keep generation fail-closed.
