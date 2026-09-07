## Why

Gherkin Craft can turn source material into well-formed scenarios without establishing the executable asset the user intends to build. Its guidance needs to connect intent, domain, use cases, and verification while preserving the distinction between an instructional skill and the agent applying it.

## What Changes

- **BREAKING:** Make an intended executable asset the purpose of specification work. Books, transcripts, and other sources supply knowledge for that purpose; the calling agent resolves missing intent from context or with the user.
- Define Gherkin Craft as guidance: it instructs the agent to discover domains, propose decompositions, and expose decisions. The agent performs those actions and manages the conversation.
- Restore the Detroit perspective: one Feature describes one complete use case through observable behavior at the system boundary. Apply DDD and Clean Architecture as modeling principles without imposing a directory layout.
- **BREAKING:** Introduce common Feature tags `@code`, `@skill`, `@prompt`, and `@plugin` for the assets to exercise when verifying that contract. Permit multiple applicable tags without duplicating the Feature. Tags describe test targets, not whether outcomes are deterministic.
- Keep asset classification separate from runners, repetitions, and scoring. Tags establish metadata for future scaffolding selection; this change does not implement that selection.
- Evaluate whether agents applying the guide produce purpose-directed contracts and correct target labels, retaining existing semantic and format checks.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `gherkin-craft/domain-discovery`: Guide the calling agent from contextual intent to the target asset, relevant domain, and proposed decomposition.
- `gherkin-craft/use-case-specification`: Specify executable-asset use cases from a Detroit perspective and label their verification targets.
- `gherkin-craft/behavioral-evaluation`: Check the agent's application of that guidance against explicit asset goals, including composed assets and tag interpretation.

## Impact

The eventual implementation concerns `.agents/skills/gherkin-craft/`: instructions, references, discovery metadata, and evaluation cases. Preserve its identity, language defaults, native/Markdown formats, and justified semantic constraints.

The planning package comprises this proposal, delta specifications, design, and implementation tasks. Implementation remains limited to the skill and its evaluation resources; `src/`, test generators, runner adapters, and project dependencies are outside the change. Tag-driven scaffolding belongs to a subsequent generator change; no particular evaluation or optimization product is mandated here.
