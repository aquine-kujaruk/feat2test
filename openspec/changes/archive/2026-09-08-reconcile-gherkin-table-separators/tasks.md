## 1. Establish focused regression evidence

- [x] 1.1 Preserve the complete current Gherkin Craft skill in an ignored evaluation workspace before editing; verify snapshot hashes, and freeze focused native/Markdown review inputs and separate evaluator criteria as described in design decision 4.
- [x] 1.2 Run the preserved skill on those inputs in fresh contexts under recorded conditions; retain complete outputs and identify whether it makes the false Markdown finding while retaining justified native and unrelated findings. Record unavailable observations explicitly.
- [x] 1.3 Replace the misleading warning-only Markdown test and add semantic regression cases for Examples and DataTables, using two distinct Examples bindings and plain, left/right-aligned, centered, and absent separators. Verify the new Markdown no-warning assertion fails before the fix while semantic row/value checks establish the parser's existing behavior.

## 2. Correct diagnostics and guidance

- [x] 2.1 Restrict `src/parse.ts`'s separator-as-data warning to native inputs and reconcile the nearby explanatory comment; verify Markdown cases retain values and produce no separator warning, native cases retain separator values and source-located warnings, and the existing indentation test still passes.
- [x] 2.2 Reconcile `.agents/skills/gherkin-craft/references/gherkin-format.md` with the format distinction, permitting supported Markdown separators without requiring them and preserving native guidance; verify complete Examples and DataTable examples with and without ordinary or aligned separators retain their intended values under the installed parser.
- [x] 2.3 Update the blanket separator ban in `evals/criteria/dev-prose.json` and audit other active separator criteria and guidance; verify no active criterion rejects valid Markdown solely for separator presence, while prohibitions on unintended parsed values and unrelated criteria remain intact. Leave historical artifacts unchanged.

## 3. Verify generated behavior and skill application

- [x] 3.1 Exercise the public generation path for the separator matrix; verify intended case counts and adapter arguments for Markdown and native inputs, allowing source-line comments and IDs to differ rather than comparing whole files byte for byte.
- [x] 3.2 Run the revised skill on the frozen focused inputs under conditions equivalent to the baseline; obtain independent evaluation of complete outputs when available, and record format findings, preserved unrelated findings, parser evidence, context limitations, and any unexecuted checks in a concise comparison report. Do not mark required behavioral observations verified unless they ran.

## 4. Check integration and planning consistency

- [x] 4.1 Run `pnpm verify` and `openspec validate reconcile-gherkin-table-separators --strict`; verify both pass, or document any pre-existing failure with evidence distinguishing it from this change.
- [x] 4.2 Review the final implementation against all three delta specs and the focused comparison report; verify the change has no parser/dependency update, source rewriting, loss of native warnings, historical rewrites, or unrelated edits, and report any unverified acceptance criterion. Keep main-spec synchronization for the normal requested sync/archive workflow.

Evidence: [acceptance report](../../../../.artifacts/gherkin-craft-eval/reconcile-gherkin-table-separators/acceptance.md) and [independent evaluation](../../../../.artifacts/gherkin-craft-eval/reconcile-gherkin-table-separators/independent-evaluation.md). All 125 tests and remaining package checks pass. `pnpm verify` retains the proven pre-existing TS2551 in ignored `examples/order-confirmation-copy/order-confirmation-copy.feature.test.ts:18`; baseline and current logs are linked in the report.
