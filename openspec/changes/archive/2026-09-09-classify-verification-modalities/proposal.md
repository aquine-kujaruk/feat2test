## Why

Gherkin Craft classifies verification by artifact kind, so a custom OpenSpec configuration and schema do not fit without expanding the taxonomy. Classifying the evidence required to verify a use case lets new instruction formats reuse the same modalities and keeps domain understanding independent of packaging.

## What Changes

- **BREAKING:** Replace the artifact-kind taxonomy with exactly one Feature-level verification modality: either `@code` for programmed behavior or `@ai` for model or agent behavior under instructions and context. Rules and scenarios inherit that selection. Reassess existing `@code` classifications as well as replacing retired tags.
- Start from the intended system, observable behavior, and evidence needed to demonstrate its contract. Treat software, skills, prompts, plugins, configurations, and schemas as contextual examples, never a closed eligibility catalog.
- Keep modality independent of exact versus semantic checks, determinism, evaluator technology, and execution products. A model used only as a judge does not add `@ai`.
- Require a single verification route per Feature. Reject both modality tags together; preserve a pending selection when context does not choose a route. Repeated AI execution through different packaging keeps `@ai`, and internal dependencies do not add a second modality.
- Leave test language, framework, runner, and the number and organization of generated files to later decisions. The selected modality guides future generation without choosing its implementation or requiring it to be settled now.
- Migrate references throughout the project, including hidden skill resources, examples, evaluation cases and criteria, main specifications, and archived OpenSpec planning documents. Review surrounding assertions and metadata rather than applying a token substitution. Preserve immutable run evidence as historical evidence, never relabel an observed past result as a new run.
- Add behavioral coverage for custom OpenSpec configuration/schema verification, AI execution with exact assertions, software assessed by an AI judge, model-backed application behavior, packaging equivalence, exclusive selection, and generation details deliberately deferred.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `gherkin-craft/domain-discovery`: Establish intended behavior without requiring a recognized artifact category; support custom instruction and configuration systems.
- `gherkin-craft/use-case-specification`: Define, select, and render one verification modality per Feature independently of packaging, checkers, and later generation choices.
- `gherkin-craft/behavioral-evaluation`: Assess modality selection and generalization, preserve existing semantic coverage, and require a complete migration of project-owned taxonomy references.

## Impact

- Gherkin Craft's entrypoint, agent metadata, references, evaluation protocol, rubric, case criteria, fixtures, and manifest.
- The three existing Gherkin Craft specification capabilities and all project-owned documents or examples referring to the previous taxonomy, including `openspec/changes/archive/`.
- Existing consumers of the tag convention face a semantic migration; no compatibility aliases retain the previous classification. Unrelated metadata and literal artifact descriptions retain their meanings.
- The current CLI chooses its renderer with `--runner`; this change does not introduce tag-based dispatch, an AI execution adapter, a new dependency, or a custom OpenSpec implementation. The OpenSpec customization is an evaluation fixture for the guide.
