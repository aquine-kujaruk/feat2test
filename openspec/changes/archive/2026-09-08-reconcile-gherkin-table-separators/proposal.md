## Why

Gherkin Craft and feat2test's linter claim that Markdown table separators become data, but the installed Cucumber 42.0.1 Markdown parser discards them while preserving Examples and DataTables. The claim confuses native `.feature` behavior with `.feature.md`, producing false warnings and an evaluation criterion that penalizes valid Markdown.

## What Changes

- Distinguish native and Markdown table guidance: native tables omit formatting separators; Markdown tables may include them without adding examples or DataTable values.
- Stop emitting the separator-as-data warning for Markdown inputs, while retaining the native warning and the existing Markdown indentation diagnostic.
- Replace the warning-only Markdown test with checks of example counts, bindings, DataTable values, generated test behavior, and diagnostics, with and without ordinary or aligned separators.
- Reconcile the skill's format guidance, current specification, and affected evaluation criteria around the parsed data rather than a blanket separator ban.

## Capabilities

### New Capabilities

- `feature-parsing`: Specify format-aware table-separator interpretation and diagnostics for feat2test's existing parsing and generation behavior.

### Modified Capabilities

- `gherkin-craft/use-case-specification`: Restrict the separator prohibition to native formatting and permit Markdown separators when intended values and examples survive parsing.
- `gherkin-craft/behavioral-evaluation`: Assess Markdown separator compatibility through preserved values and examples rather than separator absence.

## Impact

Implementation affects `src/parse.ts`, relevant parsing/generation tests, `.agents/skills/gherkin-craft/references/gherkin-format.md`, and affected skill evaluation criteria. Main specs are reconciled through these deltas during synchronization or archival; archived changes remain historical evidence.

The existing `@cucumber/gherkin` dependency and matcher selection remain sufficient. No dependency upgrade, source rewriting, CLI option, or generated-test API change is needed. Work is local to feat2test; opsx-gherkin supplied corroborating evidence and requires no change here.
