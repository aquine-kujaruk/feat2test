## Context

See [proposal.md](proposal.md) for motivation and the three delta specifications for the behavior contract. The existing skill separates its entrypoint, domain discovery, authoring, editing, formatting, and evaluation guidance. Those routes need a consistent definition of the intended executable asset and its verification boundary.

The CLI currently selects a renderer through `--runner`. Its generation plan does not use asset tags to choose scaffolding. This change supplies a labeling convention for future consumers without modifying that interface.

## Goals / Non-Goals

**Goals:** Keep the instruction flow small; give each rule one authoritative home; preserve useful discovery and Gherkin guidance; demonstrate changed agent behavior with a comparable baseline.

**Non-Goals:** Introduce a new authoring API, a compulsory interview, or a test execution platform. Architecture concepts organize responsibilities; they do not mandate directories in the systems being specified.

## Decisions

### 1. Organize the guide around the intended asset

Use one sequence throughout the instructions:

```text
Contextual intent → target asset → relevant domain → use cases → verification targets
```

The agent applies that sequence. The skill supplies criteria and examples, not an independent decision-maker. Intent can already exist in earlier conversation, a proposal, or an existing specification. Guide the agent to reuse it before reporting missing information. A material gap remains a decision for the calling agent; it does not trigger a prescribed interview or an invented purpose.

Keep the working model internal: purpose, target boundary, concepts, rules, use cases, and unresolved decisions. Do not introduce a required JSON structure or extra output document. Existing source-evidence distinctions still apply: a target's purpose does not authorize inventing its policies.

Alternative considered: an extraction-first workflow would keep selecting behavior from the source before knowing what the user wants to build. A formal input schema would add an unnecessary calling convention.

### 2. Separate guidance responsibilities without duplicating rules

| Resource | Responsibility after the change |
| --- | --- |
| `SKILL.md` and `agents/openai.yaml` | Purpose, activation, agent/guide distinction, short workflow, resource routing |
| `references/domain-discovery.md` | Relevant domains, contextual language, responsibility boundaries, use-case decomposition |
| New `references/verification-targets.md` | Common asset tags, boundary selection, multiple targets, pending classifications, future scaffolding limits |
| `references/creator.md` | Apply the sequence and produce complete use-case Features |
| `references/editor.md` | Review intent fit, Detroit boundaries, labels, and retained semantic coverage |
| `references/authoring-guide.md` | Contrasting examples connecting source knowledge to executable objectives |
| `references/gherkin-format.md` | Native and Markdown tag placement and interpretation; link to tag meanings |
| `references/evaluation.md` and `evals/` | Evidence that agents apply the revised guidance |

Paths above are relative to `.agents/skills/gherkin-craft/`. Both authoring and review routes load the target-label reference. Remove or reconcile old instructions that make source transformation sufficient without an executable objective. Preserve argument precision, language defaults, evidence handling, independent examples, and review-only scope.

Alternative considered: repeating the tag table in every brief would create conflicting definitions during maintenance. Extending the already broad discovery reference would mix domain modeling with verification metadata.

### 3. Classify the tested boundary, not the implementation inventory

Use the vocabulary defined in the use-case delta: `@code`, `@skill`, `@prompt`, `@plugin`. Keep it in the target-label reference rather than creating a registry or generator configuration in this change.

The guide asks the agent to identify what the requested test will exercise. A software operation calling a model remains `@code`; a plugin containing a skill receives both tags only when the same contract is deliberately verified through both boundaries. A script inside a skill does not automatically get another Feature. Distinct public purposes still require distinct Features.

Tags are emitted at Feature scope. Use native tag lines for `.feature` and backtick tags for `.feature.md`, preserving applicable unrelated metadata. Multiple verification strategies for the same asset kind share its tag. Runner choice, repetition, and scoring remain separate from this classification.

Alternative considered: deterministic/stochastic labels conflate the target with execution properties. Framework-name labels bind specifications to products and still fail to identify the asset under test.

### 4. Develop against agent behavior before refining the prose

Apply Red–Green–Refactor to the guide using the existing evaluation approach:

- **Red:** Freeze relevant cases and the current complete skill, then record the baseline failures against the new contract. Include purpose/decomposition failures as well as missing labels.
- **Green:** Revise the guide and compare agent outputs on the same development cases and execution conditions.
- **Refactor:** Consolidate repeated guidance and simplify examples while retaining the demonstrated behavior. Recheck affected cases after material edits.

The corpus pairs each source with a target objective or an explicit missing-intent case. Cover all four asset kinds, a shared contract with two targets, internal dependencies that must not add tags, and distinct use cases that must stay separate. Retain the existing semantic boundary cases; add objectives without replacing their original constraints.

Use the installed Gherkin parser to inspect generated tags, scenario expansion, and data in native and Markdown outputs. Inspect the agent's artifacts against source and intent for semantic correctness. Neither instruction-text checks nor successful parsing establish that behavior alone. Evaluate discovery separately from forced loading.

Previously published reserved cases are regression material. Use fresh reserved cases for another transfer claim, held apart from instruction development. Record model, context, tools, versions, outcomes, and material variability using the current protocol. No particular provider, optimizer, or additional project dependency is needed.

Alternative considered: a static wording checklist could pass a guide that still produces chapter-based Features. Building the future scaffolder would expand scope without establishing better modeling behavior.

## Risks / Trade-offs

- **An objective check becomes repetitive questioning** → Include a case whose objective exists only in earlier context and assess reuse of that intent.
- **A book's rules become invented system policy** → Retain evidence distinctions and report unresolved design decisions.
- **Packaging adds spurious tags** → Contrast a plugin tested alone with the same contract deliberately tested through plugin and skill boundaries.
- **Labels imply unsupported generation** → Explain the current CLI limitation and report unavailable scaffolding when tests are requested.
- **A small corpus hides regressions** → Preserve existing semantic cases, use independent review, and report the limits of the evidence.

## Migration Plan

1. Snapshot the complete working skill before implementation, including its current uncommitted content. Capture baseline evidence against the selected cases.
2. Update its guidance, examples, metadata, and evaluation resources together. Preserve existing example coverage; do not bulk-migrate project Features.
3. Run the scoped comparisons, parser checks, activation checks, and independent editorial review. Report any unavailable check rather than claiming it passed.
4. Accept only after required new checks pass, retained guarantees have no material regression, and at least one supported behavioral correction is evidenced against the baseline. Labels alone do not establish the modeling improvement.
5. If the revision fails, restore only the affected skill files from that snapshot. Leave unrelated working changes intact. Generator support remains a separate change.
