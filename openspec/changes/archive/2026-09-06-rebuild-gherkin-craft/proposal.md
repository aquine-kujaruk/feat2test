## Why

Gherkin Craft currently concentrates on phrasing behavior from an already established application and vocabulary. It needs to discover the domain implicit in varied source material, distinguish concepts from example values, and organize specifications around use cases without coupling the result to software, an agent, or a particular execution method.

## What Changes

- Rebuild the skill around contextual domain discovery, use-case specification, and semantic review, retaining its useful Gherkin precision and format guidance.
- Establish an internal working taxonomy and ubiquitous language from relevant available context before drafting. Distinguish source assertions, justified inferences, proposed extensions, and unresolved decisions.
- Infer the containing domain and reusable concepts by default unless the user constrains that inference. Recognize catalogs, measurement dimensions, independently variable facts, states, events, policies, and strategies when the context supports them, including concepts represented by only one current example.
- **BREAKING:** Adopt one Feature per use case as the skill's authoring convention; the current convention allows broader capabilities to collect different use cases. Review composition and shared domain relationships across Features without making scenarios depend on execution order.
- Explore missing state/event combinations, observations without mutation, semantic partitions, boundaries, and discriminating example values. Keep units, identities, time roles, and expected outcomes explicit where they are arguments.
- Make the skill useful for software requirements, real-world processes, books/articles, and transcripts. Keep implementation and evaluation machinery outside the resulting domain specifications.
- Add version-comparison and activation evaluations using varied source contexts and reserved cases. Judge domain understanding and observable output quality, not a preferred wording or a count of placeholders.

## Capabilities

### New Capabilities

- `gherkin-craft/domain-discovery`: Recover a contextual domain model and consistent terminology, separating abstractions, instances, evidence, and proposed behavior.
- `gherkin-craft/use-case-specification`: Create and review implementation-independent Gherkin, with one Feature per use case, meaningful parameters, and coverage of relevant behavior and relationships.
- `gherkin-craft/behavioral-evaluation`: Evaluate whether the skill activates appropriately and improves specification quality across independent, diverse contexts.

### Modified Capabilities

None. This repository has no existing OpenSpec capability specifications; the new deltas establish requirements for the revised skill.

## Impact

Implementation is scoped to `.agents/skills/gherkin-craft/`: its entrypoint, authoring/review references, UI metadata, and a small evaluation corpus/protocol. Preserve the skill name, supported native and Markdown Gherkin formats, current language-selection policy, and independent editorial review where available.

The change does not modify the feat2test CLI, parser, generators, runtime tests, global skill creators, or other installed skills. Existing examples are not automatically migrated. Domain models remain internal working material unless the user requests an artifact. No new runtime dependency or execution backend is required. The breaking authoring convention affects future output and requested revisions; it does not invalidate existing Gherkin syntax.
