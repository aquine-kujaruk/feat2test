> **Retrospective terminology migration — 2026-09-09.** This archived plan
> now uses the verification-modalities contract from
> `classify-verification-modalities`. The wording change does not claim that
> the 2026-09-07 execution tested the later contract.

## Why

Gherkin Craft can turn source material into well-formed scenarios without
establishing the system the user intends to build. Its guidance needs to connect
intent, domain, use cases, and verification while preserving the distinction
between guidance and the agent applying it.

## What Changes

- Make an intended system and observable behavior the purpose of specification
  work. Books, transcripts, configurations, schemas, and other sources supply
  knowledge for that purpose; the calling agent resolves missing intent from
  context or with the user.
- Define Gherkin Craft as guidance: it instructs the agent to discover domains,
  propose decompositions, and expose decisions. The agent performs those actions
  and manages the conversation.
- Restore the Detroit perspective: one Feature describes one complete use case
  through observable behavior at the system boundary. Apply DDD and Clean
  Architecture as modeling principles without imposing a directory layout.
- Use one Feature-level verification modality: `@code` for programmed
  behavior or `@ai` for model/agent interpretation. Select it from required
  execution evidence, never from packaging, dependencies, or checker
  technology. Do not combine them.
- Keep modality separate from runners, repetitions, scoring, language,
  framework, and generated-file decisions. This does not implement generation
  selection.
- Evaluate whether agents applying the guide produce purpose-directed contracts,
  correct modality selection, and retained semantic and format quality.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `gherkin-craft/domain-discovery`: Guide the calling agent from contextual
  intent to the intended system, relevant domain, and proposed decomposition.
- `gherkin-craft/use-case-specification`: Specify system use cases from a
  Detroit perspective and select one verification modality.
- `gherkin-craft/behavioral-evaluation`: Check application of that guidance
  against explicit system goals and execution evidence.

## Impact

The implementation concerns `.agents/skills/gherkin-craft/`: instructions,
references, discovery metadata, and evaluation cases. Preserve its identity,
language defaults, native/Markdown formats, and justified semantic constraints.

The original planning package was limited to the skill and its evaluation
resources; `src/`, test generators, adapters, and dependencies remained
outside its implementation. That historical scope remains unchanged by this
terminology migration.
