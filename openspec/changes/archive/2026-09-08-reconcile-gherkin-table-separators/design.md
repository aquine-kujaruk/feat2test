## Context

See [proposal.md](proposal.md) for motivation. This design is warranted because the correction spans runtime diagnostics, skill guidance, evaluation criteria, and two existing specification capabilities.

`parseFeature` already selects the Markdown matcher for `.md` inputs and the classic matcher otherwise. Cucumber 42.0.1's Markdown matcher excludes recognized separators from table rows. The source-level linter independently recognizes separator-looking lines and warns in both formats; its current Markdown test asserts only that warning.

Exploration compared the installed parser in feat2test and opsx-gherkin. With two Examples rows and a DataTable, ordinary, left/right-aligned, and centered separators left Markdown values and two expanded scenarios unchanged. Native parsing retained the separator as a third Examples row and an additional DataTable row. The official [Markdown with Gherkin guide](https://github.com/cucumber/gherkin/blob/main/MARKDOWN_WITH_GHERKIN.md) also includes formatting separators. These observations establish the format distinction, not support for every parser version or malformed table.

## Goals / Non-Goals

**Goals:**

- Make diagnostics and guidance agree with the already selected parser.
- Verify actual interpreted data and generated behavior, independently of warning text.
- Preserve existing input compatibility, native warnings, and Markdown indentation diagnostics.

**Non-Goals:**

- Changing parser versions, grammar, matcher selection, or preprocessing source text.
- Broadening lint coverage, redesigning context detection, or solving literal dash-only cells that a parser may interpret as separators.
- Reformatting existing Features, changing opsx-gherkin, or rewriting archived change artifacts.
- Claiming general skill-quality, activation, or unseen-case transfer improvements from this bounded syntax correction.

## Decisions

### 1. Correct the diagnostic at the format boundary

Use the existing Markdown/native decision to restrict the separator-as-data diagnostic to native input. Keep parsing untouched and retain the warning's source location and native behavior. Preserve the existing Markdown indentation check; this change does not make unindented tables valid.

Deleting the warning in all formats would hide the real native issue. Stripping separator-looking lines before parsing would change native data, damage source locations, and duplicate grammar decisions already owned by the parser. Neither is needed.

### 2. Permit both accepted Markdown table forms

Explain that `.feature.md` formatting separators do not become Examples or DataTable values under the supported parser, while `.feature` tables omit formatting separators. Show or describe correctly indented Markdown tables, using two leading spaces for the focused cases. Keep separator-free Markdown compatible; do not introduce a mandatory separator rule or automatic rewrite.

Replace the unconditional prohibition in the current skill requirement through the delta spec. Reconcile `dev-prose.json`'s blanket absence criterion and inspect other separator references: wording that forbids formatting values in parsed data remains valid. Preserve unrelated language, tags, placeholders, and semantic criteria. A universal ban for portability would retain the false claim and conflict with the actual consumer.

### 3. Compare semantics rather than whole serialized outputs

Use a compact matrix across native and Markdown, Examples and DataTables, and no separator versus plain, left/right-aligned, or centered separators. Supply at least two distinct Examples bindings so an extra or missing case is detectable.

For Markdown, assert equal ordered Examples bindings, DataTable headers and values, expanded step values, and executable case counts; assert no separator-as-data diagnostic. Exercise the public generation path and verify the intended test cases and adapter arguments. For native input, assert that separator values remain visible and are warned about; generation must not silently discard them. Retain the existing indentation regression.

Source line numbers, comments that report those lines, and generated identifiers may change when a source row is inserted. Compare the meaningful fields or emitted calls; do not require byte-for-byte equality of whole ASTs or generated files. A warning-only test would continue to validate the original false assumption.

### 4. Keep skill evidence separate from parser evidence

Before changing the skill, preserve the exact current version and predeclare focused review cases: valid Markdown with and without separators, aligned separators, and native separators that really add values. Compare baseline and candidate review behavior under equivalent fresh contexts, with evaluation criteria hidden from the authoring runs. Have an independent evaluator inspect complete outputs when available; record actual isolation and review limits.

The focused result must distinguish absence of a false Markdown finding from retention of a justified native finding and unrelated supplied defects. Parser assertions establish table compatibility; agent outputs establish application of the revised guidance. Record unexecuted checks rather than inferring behavioral success from edited sentences. Keep evaluation evidence in an ignored workspace and limit claims to these cases; broader skill assessment remains governed by the existing evaluation protocol.

## Risks / Trade-offs

- **Parser changes can alter edge cases** → Pin acceptance evidence to the installed dependency and keep semantic regression tests with the normal suite.
- **Separator removal or native filtering can hide real data** → Do not preprocess input; explicitly test native row retention.
- **Metadata differences can cause brittle comparisons** → Compare bindings, values, case counts, and calls while allowing source locations and IDs to differ.
- **A stale rubric can continue penalizing valid output** → Audit active separator guidance and criteria together; preserve historical artifacts as history.
- **Agent comparisons may vary or lack isolation** → Record execution conditions and discrepancies; do not claim general improvement or unobserved behavior.

## Migration Plan

Add regression coverage, then update diagnostics and the affected skill guidance and criteria. Run the repository verification command and strict OpenSpec validation. Synchronize these deltas into main specs through the normal sync/archive workflow when requested. No data migration or dependency change is needed. Rollback would revert the bounded implementation and guidance changes together, restoring the prior diagnostic behavior.
