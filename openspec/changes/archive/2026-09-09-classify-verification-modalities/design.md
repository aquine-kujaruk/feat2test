## Context

See [proposal.md](proposal.md) for motivation and scope. The three delta specifications define the behavior contract.

The superseded selection convention is repeated in the skill's entrypoint, briefs, worked examples, rubric, case-specific criteria, main specifications, and the archived `specify-executable-assets` change. Some examples currently require a software application's Feature to remain `@code` even when verification needs the real model's behavior. The shared skill/plugin review case currently treats two AI execution contexts as different categories. Both require semantic revision.

`src/parse.ts` retains Cucumber pickle metadata; `src/plan.ts` does not use tags to route generation. `src/cli.ts` selects an existing renderer with `--runner`. The convention can change without adding dispatch or changing generated test APIs.

The evaluation manifest identifies inputs and some criteria by digest and records previous freezes and reserved-case provenance. Its published cases are regression material. Historical raw evaluation evidence is stored separately from normal skill discovery, including ignored `.artifacts/` workspaces.

A design artifact is required because the migration crosses guidance, specifications, evaluation expectations, and archived authored documents, and because unchanged tag spellings can acquire different meanings.

## Goals / Non-Goals

**Goals:** Give modality selection one authoritative instruction reference; preserve the established domain and Gherkin guarantees; make migration completeness and behavioral improvement independently reviewable.

**Non-Goals:** Build a verification engine, introduce execution configuration or tag aliases, select test languages/frameworks/generated file layouts, or implement the motivating OpenSpec customization. Keep the existing runner interface and artifact-format support. Product names remain examples, not selection rules.

## Decisions

### 1. Classify the evidence required by the complete use case

Use this guidance sequence:

```text
Contextual intent → intended system and observable behavior
                  → relevant domain → complete use cases
                  → one selected verification modality per Feature
```

The calling agent identifies the intended execution and selects one route for the complete Feature: programmed behavior or model/agent interpretation. Its Rules and scenarios inherit the selection. Packaging provides context but cannot answer that question alone. A real model behind an application API can supply the essential evidence for `@ai`; a model used only as an output judge cannot.

Exactly one of the two modality tags is permitted per completed Feature. If alternative verification routes are mentioned without a selection, keep that decision pending instead of attaching both tags or creating duplicate Features. If the selected route later changes, replace the modality tag and preserve still-applicable domain rules. A Rule or scenario cannot override the Feature with the other modality.

If verification only supplies a fixed model response, its claim is limited to the programmed behavior exercised. It cannot establish interpretation by the real model. Keep a material unresolved choice visible without reopening an established objective or inventing a category. Preserve the distinction between missing implementation and missing intent.

Alternative considered: rename all retired tags to `@ai` while retaining the old selection rule. Rejected because programmed plugins and real-model applications would still be misclassified, and two AI contexts would retain a false distinction.

### 2. Keep modality, execution context, and checker separate

`@code` and `@ai` describe the required behavior execution. An execution context identifies how that behavior is exposed, such as direct guidance or a host integration. A checker judges the output. No new mandatory metadata schema is needed for those latter details.

The selected modality is an input to future test generation. Language, framework, runner, and test/support file layout are deferred choices: `@code` does not choose Python, TypeScript, Vitest, or an output-file count. A language or framework change does not relabel the Feature, and undecided generation details do not prevent a known modality from being assigned. This change specifies that separation without designing a generation configuration format or adding support for another backend.

| Verification claim | Modality | Consequence for migration |
| --- | --- | --- |
| Programmed configuration loader rejects an unresolved reference | `@code` | Configuration is a valid subject without another category. |
| Agent follows a custom configuration/schema to produce agreed artifacts | `@ai` | Exact file checks do not change modality. |
| Application classifies text using its real model | `@ai` | Reassess the existing model-application example and expected finding. |
| Programmed handling of a supplied model response | `@code` | Preserve the limited contract; do not claim real-model effectiveness. |
| Same agent review directly and through its plugin host | `@ai` | Keep both execution contexts and one complete Feature. |
| Programmed and agent review are both possible, with no selected route | Selection pending | Preserve the domain contract and resolve one route; do not combine tags or duplicate the Feature. |
| Programmed report generation assessed by an AI judge | `@code` | Checker technology does not add another modality. |

Alternatives considered: classification by determinism or exact versus semantic assertions would conflate checking with execution. Allowing both modalities on a Feature would leave its test-generation route ambiguous and is excluded by the user's refinement. Use one selected modality; introduce neither a combined tag nor a third hybrid category.

### 3. Replace the reference and reconcile all its consumers

Rename the selection guide to `references/verification-modalities.md` and update every link. Keep definitions and decisions there; briefs link to the rule and examples demonstrate it. Review entrypoint and agent metadata for language that makes a finite artifact catalog sound mandatory.

The initial migration inventory is a starting point; a repository-wide scan must discover additional matches, including ignored authored examples and hidden files.

The deltas explicitly remove four artifact-taxonomy requirements and add their modality-based replacements, with a reason and coverage-preserving migration for each. Other changed requirements remain full `MODIFIED` blocks. This allows obsolete scenario terminology to be replaced while preserving coverage; the installed OpenSpec validator requires a `MODIFIED` block to retain every current scenario title. Sync must apply the explicit removals as well as additions and modifications, rather than leaving both classification systems in the main specs.

| Surface | Required migration |
| --- | --- |
| `.agents/skills/gherkin-craft/SKILL.md`, `agents/openai.yaml`, domain discovery | Behavior-first objective and open-ended packaging examples. |
| Selection reference, creator/editor briefs, authoring guide | Exclusive modality selection, inherited scope, boundary evidence, unresolved route choices, deferred generation details, and implementation-independent acceptance. |
| `references/gherkin-format.md` and authored Gherkin examples | Current tag values, separate Markdown code spans, inherited metadata; preserve scenario meaning and values. |
| Evaluation protocol, rubric, criteria, cases, activation cases, manifest | Reassessed expectations, retained coverage, new contrasts, accurate identities and provenance. |
| `openspec/specs/gherkin-craft/` | Apply all three deltas before the final taxonomy audit. |
| `openspec/changes/archive/` | Replace authored taxonomy rules, examples, and associated descriptions with explicit retrospective migration notes. |
| Other authored docs, examples, metadata, fixtures, active changes | Replace any discovered taxonomy dependency regardless of directory or Git ignore status. |

Keep legitimate mentions of prompts, skills, plugins, code, and determinism when they describe an actual subject or an independent execution property. For example, README statements about deterministic test generation are not automatically taxonomy references. Do not rewrite unrelated tool workflows or dependency files on keyword coincidence.

Alternative considered: update only the live skill and main specs. Rejected by the user's explicit project-wide replacement requirement and because old evaluation expectations and archived examples would keep teaching the retired taxonomy.

### 4. Migrate archived guidance without falsifying execution history

All authored project references are in scope, including archived proposals, designs, tasks, and deltas. Add a concise dated note to each affected archived document identifying a retrospective terminology migration and linking this change. Preserve archive identity, dates, unrelated decisions, and historical completion status; the note makes clear that revised examples are not evidence that the new contract was already tested.

Separate those authored references from immutable snapshots, raw model output, logs, reports of observed runs, Git history, and third-party files. Never edit evidence to make an old run satisfy a new contract. Inventory historical matches separately with their provenance and excluded-from-guidance status. Store new comparison evidence outside normal instruction discovery and record its actual paths. This is an evidence-integrity boundary, not an exemption for archived planning documents or ignored authored examples.

Alternative considered: blindly replace every token in every file. Rejected because it would alter historical observations, invalidate their hashes, and still miss obsolete semantics attached to `@code`.

### 5. Reassess the corpus before changing guidance

Follow the current evaluation protocol: snapshot the entire prior skill before changing its guidance or evaluation resources; freeze the comparison inputs and current criteria before baseline execution; isolate exact-version runs and keep evaluator-only findings out of authoring inputs.

Preserve existing sources and domain coverage. Clarify an execution request only where needed to distinguish the evidence under test, record that revision, and use the same clarified input for baseline and candidate. In particular:

- Revise `dev-model-app.md`'s prior context to explicitly require execution with the real model before expecting `@ai`. Its current wording establishes the public interface and production dependency, not the verification's model selection. Use that same clarified fixture for both versions, retain its source-domain rules, and add a contrasting programmed response-handling case.
- Keep `dev-mixed-review` as two AI contexts for one review contract; add cases rejecting both tags on one Feature and a conflicting tag on a Rule or scenario. Include a separate case whose available routes require one selection.
- Add the custom OpenSpec configuration/schema fixture with explicit supplied obligations and separate validation/workflow purposes. It is a constructed evaluation input, not a request to build a customization.
- Cover exact AI assertions, an AI judge of programmed output, unfamiliar instruction packaging, and unresolved modality evidence. Contrast unresolved route selection with an established `@code` route whose language, framework, and output files remain open; changing those generation choices must preserve the modality. Preserve input language, deliverable scope, and existing semantic edge cases.

Update current input and criteria digests wherever manifest content changes. Record prior identities as historical provenance; invalidate stale claims that the live corpus is the previously frozen version. Previously published transfer fixtures remain regression inputs. An independent evaluator reserves fresh cases for a new transfer claim.

Alternative considered: score the candidate against unchanged artifact-based criteria or claim success from new tag strings alone. Rejected because either can reward the old boundary mistake and neither establishes improved specification behavior.

### 6. Use separate checks for migration, syntax, and behavior

The completion report must distinguish:

1. **Migration:** Inventory project-owned authored content, search for retired tag spellings, old selection terminology, and acceptance of multiple modalities, inspect every surviving classification rule and `@code` expectation, and record every historical-evidence exclusion. Check links after the reference rename, JSON validity, and manifest digests. Acceptance requires no retired taxonomy rule or valid-example combination of both modalities in authored project material, including archives. Deliberately invalid review fixtures must identify the combination as a defect.
2. **Syntax:** Parse affected and newly produced native/Markdown examples with the installed Cucumber parser. Inspect the one selected modality alongside unrelated tags, its scenario inheritance, independent code spans in Markdown, example counts, bindings, and preserved table values. Cucumber parsing alone does not enforce the mutually exclusive modality convention; assess combined and conflicting tags as semantic defects. OpenSpec delta documents use their own scenario format and are validated with OpenSpec, not as `.feature.md` files.
3. **Behavior:** Compare preserved and candidate guides in independent contexts with the same frozen cases and conditions; have an independent evaluator assess full outputs against source and predeclared criteria. Require the new modality distinctions and a supported purpose, decomposition, or boundary correction beyond literal retagging, with no material regression in retained guarantees. Run the existing activation checks separately and report unavailable observations honestly.

Run the repository's existing checks appropriate to any changed executable fixtures. A docs-and-guidance migration does not require new CLI functionality or implementation-mirroring tests. Parser acceptance, a clean search, and OpenSpec validation cannot substitute for observed agent behavior.

Alternative considered: a single aggregate score. Rejected because successful syntax or migration can hide a material semantic regression, and unavailable behavioral checks must stay visible.

## Risks / Trade-offs

- Broad names retain implementation connotations → Define modalities by execution evidence and exercise adversarial contrasts, including unchanged `@code` spellings.
- Mixed implementation or partial assertions suggest both tags → Enforce one route for the whole Feature and reject conflicting tags on its Rules or scenarios; keep unresolved route selection explicit.
- A modality is mistaken for a language or framework → Cover known modality with deferred generation details and preserve the tag when later generation choices change.
- Migration misses hidden, ignored, or archived authored files → Inventory beyond ordinary `rg` ignore defaults and inspect every residual reference by ownership and meaning.
- Retrospective archive updates imply new historical results → Label migrated planning text; preserve actual run evidence and provenance unchanged.
- A manifest references old content after fixture edits → Recompute current digests and distinguish live corpus identity from prior freezes and reservations.
- Small or contaminated evaluations overstate improvement → Preserve exact versions, separate evaluator knowledge, record conditions and limitations, and use fresh reserved cases for transfer.

## Migration Plan

1. Inventory all authored taxonomy references and immutable evidence locations. Preserve the prior skill and affected authored content with verifiable identities before any replacement.
2. Define and freeze the revised comparison cases and criteria; run the preserved guide before instruction edits.
3. Revise the selection reference, all linked guidance and examples, evaluation resources, and metadata. Resolve classifications from the required evidence case by case.
4. Sync the three deltas into main specs, including removal of the superseded classification requirements and addition of their replacements; migrate affected archived authored documents with retrospective notes and audit all other project-owned surfaces. Do not archive this change as part of implementation.
5. Run migration integrity and parser checks, baseline/candidate comparisons, independent editorial review, reserved transfer, and activation observations under the existing protocol. Resolve supported findings across all affected occurrences, with at most two editorial correction/recheck cycles.
6. Finish with a complete residual-reference audit and an evidence report. Required unexecuted behavioral checks prevent claiming validation complete.

If the revision is rejected, restore only the files owned by this change from the recorded snapshot, preserving unrelated user edits and all raw comparison evidence. Do not use a repository-wide reset or rewrite prior execution records.
