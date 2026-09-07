## 1. Freeze the baseline and evaluation contract

- [x] 1.1 Snapshot the current `.agents/skills/gherkin-craft/` entrypoint, references, and metadata in an ignored evaluation workspace before editing; verify the snapshot against recorded file hashes and confirm that it can be selected independently of the candidate.
- [x] 1.2 Create the evaluation manifest, four development source cases, and the semantic rubric; have an independent evaluator reserve two additional cases without exposing their source-specific criteria to the instruction author. Verify that the manifest covers all four source families and the required abstraction, composition, constraint, review-only, language, and format cases from the three capability specs.
- [x] 1.3 Define positive activation requests and nearby negative requests in `evals/activation.json`; verify that each has an expected selection outcome and includes requests without the word Gherkin, ordinary summaries, and explicit invocation.
- [x] 1.4 Run the preserved skill on development cases using isolated inputs; verify that baseline artifacts, exact skill/model settings, effective instruction sources, and evidence-based findings are recorded before rewriting. Record any isolation limitation without claiming a controlled comparison.

## 2. Rebuild domain discovery and use-case authoring

- [x] 2.1 Write the contextual discovery reference, covering taxonomy, ubiquitous language, concepts versus instances, units and semantic roles, state dimensions, events, strategies, containing contexts, and evidence status; verify that it permits justified one-instance abstraction while preserving explicit scope and keeps the model internal by default.
- [x] 2.2 Rewrite `SKILL.md` and the creator brief around the shared domain contract and one Feature per use case; verify their consistency against the domain-discovery and use-case-specification requirements and remove conflicting application-only, supplied-taxonomy-only, or execution-specific defaults.
- [x] 2.3 Define use-case boundary and composition guidance, including independent scenarios, observations without mutation, and missing state/event combinations; verify that the guidance distinguishes a whole use case from a low-level step and preserves relationships between separate Features.

## 3. Preserve precision, review, and compatibility

- [x] 3.1 Revise the authoring guide with a small set of unrelated domain examples and organize format-specific guidance; verify explicit arguments, distinct bindings, coherent tables, rule constants, relative selectors, quantifiers, diagnostic meaning, and source inputs against the preserved guarantees.
- [x] 3.2 Update the editor brief to review the complete candidate and contextual model for discovery quality, use-case boundaries, composition, unsupported policy, and retained coverage; verify the independent-review route, bounded correction/recheck behavior, same-agent disclosure, and read-only review handling.
- [x] 3.3 Update the skill description and applicable UI text to include domain understanding from varied source contexts; verify that the skill name, invocation policy, language-selection policy, and unrelated metadata remain intact and all reference links resolve.

## 4. Compare candidate behavior and activation

- [x] 4.1 Write the evaluation protocol for version-isolated authoring, evaluator-only criteria, evidence-based comparison, reserved-case handling, and separate activation observation; verify that it requires neither a domain implementation nor a particular provider, runner, or viewer.
- [x] 4.2 Run the revised skill on the development cases under conditions equivalent to the baseline and obtain independent semantic review; verify each applicable rubric criterion with source/output evidence and inspect interpreted Gherkin examples where parsing applies.
- [x] 4.3 Resolve supported development findings across the entrypoint and affected references; verify fixes with the affected cases and recheck shared rules and retained compatibility, recording remaining disagreements rather than selecting favorable outcomes.
- [x] 4.4 Freeze the candidate and compare the preserved and revised skills on the two reserved cases; verify transfer without imported domain concepts or lost constraints. If results drive further edits, promote those cases to development and replace them before another reserved-case comparison.
- [x] 4.5 Run the activation cases in the target host and observe actual skill loading and selected paths; verify relevant selection and near-miss rejection separately from output quality, or report unavailable observations as unexecuted rather than simulated passes.

## 5. Validate and hand over the revision

- [x] 5.1 Validate skill metadata and reference integrity, then run focused native/Markdown and language compatibility checks on generated artifacts; verify preserved rows, bindings, and meaning without generating or executing an implementation of the example domains.
- [x] 5.2 Produce the comparison report with version/source identities, conditions, evidence, reviewer findings, available costs, and limitations; verify the design's acceptance conditions, including a demonstrated discovery correction, no material regression, and explicit treatment of every unexecuted required check.
- [x] 5.3 Review the final change scope and migration notes; verify that authored implementation changes remain within the skill, evaluation outputs remain outside normal skill-loading paths, and CLI code, global skill creators, and existing example Features are unchanged.
