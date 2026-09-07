## Context

See [proposal.md](proposal.md) for motivation and scope. The current skill has one long entrypoint, creator/editor briefs, an authoring guide, and Codex UI metadata. It already preserves useful invariants: explicit arguments, coherent collections, independent examples, semantic rejection reasons, source inputs for computations, and native/Markdown dialect rules. Its discovery guidance chiefly preserves a supplied application and taxonomy; its testing vocabulary includes a particular software-testing stance.

The changed conceptual model and its effects across the entrypoint, both roles, worked examples, and evaluation justify a design document. These planning artifacts use the configured OpenSpec requirement format. The one-Feature-per-use-case convention governs the Gherkin produced by the skill, not the structure of OpenSpec capability deltas.

The current built-in skill creator is not assumed obsolete. Its principles can inform this work, but neither that creator nor any global skill is a dependency to modify. The revision will be judged by its behavior against the three capability specifications.

## Goals / Non-Goals

**Goals:**

- Make conceptual discovery a first-class part of authoring and review while preserving user constraints and source meaning.
- Keep the entrypoint compact and move detailed discovery, format, and evaluation guidance to resources with clear read conditions.
- Maintain a single contextual vocabulary across all generated Features and their review.
- Produce evidence of transfer to unfamiliar domains using a reproducible comparison with the old skill.

**Non-Goals:**

- Defining a universal ontology, a required module/project hierarchy, or an application for managing catalogs.
- Requiring a persisted glossary, exposing private reasoning, or turning a working model into an extra default deliverable.
- Prescribing an enum, strategy-pattern implementation, state-machine engine, test framework, or model provider for the domains being specified.
- Building a generic skill-creation platform or automatically rewriting the repository's example Features.

## Decisions

### 1. Rebuild the instruction structure around the domain contract

Use an instruction-first skill with one entrypoint and purpose-specific references. The intended organization is:

```text
.agents/skills/gherkin-craft/
  SKILL.md
  agents/openai.yaml
  references/
    domain-discovery.md
    creator.md
    editor.md
    authoring-guide.md
    gherkin-format.md
    evaluation.md
  evals/
    manifest.json
    activation.json
    cases/
```

`SKILL.md` will state purpose, scope, the domain-first expectation, one use case per Feature, mode selection, and essential output constraints. `domain-discovery.md` will hold the contextual modeling lenses; the creator and editor will apply the same meanings. The authoring guide will contain a small set of contrasting examples from unrelated domains. Format and language details will be loaded for the selected output format. The evaluation protocol will be read for skill maintenance, not automatically for every specification request. Required semantic constraints remain reachable from the normal authoring and review paths.

The directory structure is a maintenance decision, not a mandated shape for user deliverables. The implementation can avoid a reference if its content proves small enough to remain clear in the entrypoint; it must retain the routing responsibilities above and avoid duplicated or contradictory rules.

**Alternatives considered:** appending discovery exceptions to the current instructions would leave conflicting defaults; flattening everything into one document would increase irrelevant context; modifying a system-wide creator would expand scope and would not establish better domain behavior.

### 2. Use a contextual working model with evidence labels

The internal model will record, where relevant:

- Terms, meanings, contexts, representative values, and aliases that genuinely refer to the same concept.
- Relationships and their distinct argument roles, including quantities, dimensions, units, temporal roles, and identities.
- Categories/catalogs, independent state dimensions, events, guards, outcomes, policies, and strategies supported or suggested by the context.
- Use-case purposes, boundaries, shared facts, prerequisites, and observable relationships between use cases.
- Source support, justified inference, proposed extension, and unresolved decision for claims that require that distinction.

This is a set of modeling lenses, not a required checklist of entities for every source. Read relevant context supplied or made available for the task; resolve missing definitions from that context before asking the user. Additional discovery does not authorize unrelated application features or external actions.

A source's single example can establish a category or a reusable relationship. It cannot by itself establish arbitrary behavior for every possible member. Preserve fixed criteria while making example arguments explicit. An amount and its currency, a horizon and its unit, and a strategy and its identity are different kinds of facts; do not flatten all of them into interchangeable strings.

The model remains working material. Its observable effect is consistency and correct distinctions in the requested output. When inspection is requested, provide a concise glossary or relationship map with evidence labels; do not expose a reasoning transcript. No automatic dependency on another installed modeling skill will be introduced.

**Alternatives considered:** treating every literal as an unchangeable requirement misses abstractions; making every noun a configurable catalog manufactures irrelevant behavior; persisting a model on every run creates unrequested artifacts.

### 3. Make use-case boundaries and composition explicit

Identify a use case by its purpose, the whole action or query it accepts, and its relevant outcomes. Place that use case in one Feature; group its rules and examples there. Different outcomes alone do not create different use cases. Conversely, shared subject matter alone does not justify grouping distinct purposes.

Represent containing contexts only to the degree needed to understand those purposes and their relationships. Preserve common concepts across Features. A strategy can choose, order, or condition several available use cases without becoming a lifecycle state. A scenario can exercise a composition when that composition has a distinct domain purpose, but it must not narrate internal orchestration or depend on another scenario's execution. Related simple use cases can still have their own Features.

Use contextual state/event sketches as a discovery aid. For queries, record an answer and any relevant preserved state. For incomplete information, distinguish what can be answered from what remains undefined. Check independent conditions in useful combinations rather than enumerating every imaginable state.

**Alternatives considered:** retaining broad topic Features hides distinct purposes; one Feature per low-level step prescribes an algorithm; a single universal state enum hides orthogonal dimensions; forcing every query to mutate state misrepresents the domain.

### 4. Preserve precision while removing implementation-specific defaults

Keep the current language-selection policy: English by default, another language only on explicit request, native dialect declaration where applicable, and resolution of non-English Markdown configuration before claiming support. Preserve the skill name and current implicit invocation policy; update only the UI description needed to describe its expanded purpose.

Retain semantic and format constraints that prevented actual defects: explicit meaningful arguments even for one-row Outlines, concrete bindings, correct quantifiers, relative selectors, units and scope, rule constants, cohesive tables, useful rejection reasons, independent scenarios, and source inputs when a derivation is being examined. Keep known collection values as data when that shape best expresses the example.

Replace the universal Detroit/testing framing and exclusively commercial reader framing with domain-observable behavior. A concept related to software can still appear when software mechanisms are themselves the subject of the source; a label-based ban must not erase that domain. Remove examples or instructions that specialize the skill to a named persona, particular commercial calculations, or one implementation medium.

**Alternatives considered:** discarding all existing guidance would lose valuable correctness constraints; preserving a specific execution stance would conflict with the new cross-medium purpose; changing the default language at the same time would introduce an unrelated compatibility change.

### 5. Preserve independent editorial review with the new criteria

The creator passes the original request, relevant raw context, complete candidate specifications, concise working vocabulary, coverage claims, and open decisions to the editor. The editor checks meaning, use-case boundaries and composition, useful abstraction, missing state/event cases, argument consistency, and format. Supplied evidence and complete text take precedence over the creator's claims.

Retain the current bounded correction/recheck workflow and same-agent fallback disclosure. Recheck the complete candidate after a correction, including shared relationships and unchanged examples. For review-only requests, return findings; do not create or rewrite files without the requested deliverable scope. Missing policy is reported distinctly from a wording defect.

**Alternatives considered:** relying on parsing alone misses semantic failures; using the editor to forbid any inference would preserve the old limitation; reviewing only changed lines can miss inconsistent shared terms.

### 6. Establish a small comparison corpus before rewriting instructions

Create and freeze a raw-context evaluation manifest before changing the skill. Record each case's request, source material and provenance, requested language/format, allowed deliverables, applicable criteria, and development/reserved designation. Keep evaluator-only criteria and reference observations separate from inputs supplied to candidate runs.

Start with six cases: four development cases spanning software requirements, a real-world procedure, a book/article-style explanatory source, and a transcript; reserve two additional unrelated contexts for transfer checks. An independent evaluator selects and retains the reserved sources and case-specific criteria; the instruction author receives only their coverage categories until the candidate is frozen. Include explicit scope restriction, review-only behavior, one-instance abstraction, distinct temporal or measurement roles, independent state dimensions, and composition across the set. Use available source texts or clearly labeled constructed fixtures; never claim a constructed source is a published book. Include both native and Markdown Gherkin and an explicit non-English native request. Case selection must not make a particular name, domain, or exact sentence part of general skill instructions.

Capture an exact snapshot of the pre-change skill, including references and metadata, before editing. Run the development baseline before rewriting; compare both versions on reserved cases only after freezing the candidate. Evaluate old and revised versions with the same prompts, raw inputs, model, reasoning settings, and tool availability in clean contexts. Supply only the version under evaluation and its referenced resources. Do not pass this conversation's diagnoses or the evaluator's expected answers into authoring runs. Record the effective instruction sources; if the harness cannot isolate versions, report that limitation rather than making a causal improvement claim.

Use a concise rubric for fidelity and evidence, useful abstractions, terminology, use-case boundaries/composition, state/event and boundary coverage, argument semantics, implementation independence, and format/language. Record pass/fail evidence and reviewer findings, not just scores. A human-readable side-by-side comparison and an independent semantic review are sufficient; a specific viewer, runner, provider API, or statistical framework is not required. Parser checks inspect interpreted rows and values as well as syntax. They do not execute the represented domain.

Run a separate small set of positive activation requests and near-miss negatives in the actual target host, recording whether the intended skill was loaded and which path was used. Cover requests for domain understanding without the word Gherkin and ordinary summary/code tasks that should not invoke this workflow. A prompted claim that a skill would activate is not evidence of actual activation. If that observation is unavailable, record the check as unexecuted.

Begin with one comparison per case and repeat when a material disagreement or variability needs resolution. Capture version identity, source-set identity, execution settings, observed artifacts, reviewer evidence, and available time/token costs. Keep run outputs and snapshots in an ignored evaluation workspace, not among instructions loaded during ordinary skill use. Keep the corpus and protocol with the skill. Do not tune instructions on reserved results and still call those cases reserved: promote a used case to development and replace it before another transfer claim.

**Acceptance:** the candidate must satisfy the predeclared mandatory semantic and compatibility checks on the selected cases, demonstrate at least one supported correction of the discovery shortcomings against the baseline, and introduce no material regression on retained guarantees. Report unresolved findings and unexecuted checks explicitly; do not declare the behavioral revision validated when required comparisons remain unexecuted. Activation and output-quality results are reported separately.

**Alternatives considered:** one familiar transcript invites overfitting; reviewing only the instruction document does not test execution; counting Features or placeholders rewards superficial expansion; a provider-specific evaluation platform would couple the skill to an unnecessary backend.

### 7. Use current primary guidance as evidence, not authority for domain policy

The research consulted on 2026-09-06 supports concise routing, progressive disclosure, and separate evaluation of activation and output. These sources guide skill construction; they do not determine the domains the skill later discovers:

- [OpenAI: Build skills](https://learn.chatgpt.com/docs/build-skills) — focused scope, precise activation descriptions, instructions by default, and resources loaded when needed.
- [Agent Skills specification](https://agentskills.io/specification) — interoperable structure and required metadata; additional resources are optional.
- [Anthropic: Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) — useful non-obvious guidance, appropriate degrees of freedom, concrete examples, and evaluation-driven iteration.
- [Agent Skills: Evaluating skills](https://agentskills.io/skill-creation/evaluating-skills) — compare outputs with a baseline using independent contexts and evidence.
- [Agent Skills: Optimizing descriptions](https://agentskills.io/skill-creation/optimizing-descriptions) — assess activation with positives and nearby negatives separately from task quality.
- [Robert C. Martin: Pickled State](https://blog.cleancoder.com/uncle-bob/2018/06/06/PickledState.html) — inspect missing state/event pairs. The observation-without-mutation treatment follows this change's domain requirements rather than asserting that every use case changes state.

These pages' availability at consultation time does not establish the date each recommendation was introduced. Different stylistic recommendations are resolved through behavior in the target host, not treated as proof that a creator is obsolete.

## Risks / Trade-offs

- **Abstraction becomes invented policy** → Track evidence status, preserve explicit scope, and include restrictive and incomplete-source cases in the evaluation.
- **Scope protection suppresses discovery again** → Evaluate single-instance categories and containing contexts where the source never enumerates a complete taxonomy.
- **Examples leak their domain into general instructions** → Use unrelated worked examples and reserved contexts; grade imported concepts as failures.
- **A glossary replaces behavior** → Keep the working model internal and judge its consequences in complete use-case specifications.
- **One Feature per use case becomes excessive fragmentation** → Define boundaries through purpose and whole actions, and test both shared-topic splitting and acceptance/rejection grouping.
- **More references make important constraints hard to find** → Provide direct read conditions, avoid duplicate rules, and inspect actual resource use during evaluations.
- **Independent agents still share confounding context** → Record effective instructions and isolate the exact skill version; disclose incomplete isolation.
- **The small corpus cannot establish universal quality** → Make claims specific to observed cases and preserve a repeatable protocol for subsequent expansion.

## Migration Plan

1. Freeze the current skill and evaluation requests/criteria before rewriting. Record baseline artifacts using the old version.
2. Implement the revised skill and references within the existing skill directory; preserve identity and relevant format/language behavior.
3. Run version comparisons, activation checks, format validation, and independent review. Correct supported findings and repeat affected checks, including the reserved-case rules above.
4. Accept the revision only with an explicit report of results and limitations. Existing example files remain unchanged unless separately requested.
5. Roll back an unsuccessful revision by restoring the captured skill files and metadata; no CLI, runtime, or external data migration is involved.
