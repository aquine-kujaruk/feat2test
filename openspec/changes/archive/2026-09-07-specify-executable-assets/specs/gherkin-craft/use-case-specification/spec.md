> **Retrospective terminology migration — 2026-09-09.** This archived delta
> is restated using the later `@code`/`@ai` contract. It is archival planning
> context, not evidence that the original run validated the later contract.

## ADDED Requirements

### Requirement: Label verification modalities at Feature scope

The guide SHALL label each completed Feature with exactly one modality selected
from `@code` or `@ai` for its whole use-case contract. The tags are mutually
exclusive. Rules and scenarios inherit the Feature selection and SHALL NOT
introduce another modality. The tag describes how behavior must be exercised,
independently of system kind, packaging, dependencies, and checker technology.
Unrelated metadata remains valid.

| Tag | Required verification evidence |
| --- | --- |
| `@code` | Exercise programmed rules through the use-case interface and observe results. |
| `@ai` | Exercise a model or agent interpreting instructions and context and observe required behavior. |

#### Scenario: Programmed configuration validation is selected
- **WHEN** verification exercises a loader rejecting an unresolved schema
  reference
- **THEN** the Feature is `@code`
- **AND** a later agent use of that configuration does not add `@ai`.

#### Scenario: An agent follows a workflow
- **WHEN** verification observes an agent applying custom workflow instructions
  to produce required artifacts
- **THEN** the Feature is `@ai`
- **AND** exact file checks do not change it.

#### Scenario: A plugin exposes programmed behavior
- **WHEN** host integration exercises programmed record retrieval without model
  or agent interpretation
- **THEN** the Feature is `@code`
- **AND** host packaging does not introduce another tag.

### Requirement: Select one verification modality per Feature

The guide SHALL require one selected route per Feature. A Feature carrying both
tags is a classification defect even if both routes could demonstrate the
contract. If routes are offered without a selection, the agent preserves
supported behavior and identifies the pending choice. It SHALL NOT combine tags,
duplicate a Feature, or add Examples arguments solely for modality, language,
host, checker, or generated file layout.

#### Scenario: A Rule attempts a different modality
- **WHEN** a Feature is `@ai` and a Rule or scenario declares `@code`
- **THEN** review reports a conflicting classification
- **AND** it does not accept that declaration as a generator route.

### Requirement: Keep verification modalities independent of execution products

The guide SHALL explain that modality is metadata for later test-generation
work. It SHALL not prescribe language, framework, runner, provider, judge,
optimizer, repetition count, deterministic classification, checker kind, or
test/support-file layout. A model used solely as a judge does not establish AI
behavior under test. Labels alone do not claim generation or execution.

#### Scenario: Generation details remain open
- **WHEN** programmed behavior is established but test language, framework, and
  file layout are undecided
- **THEN** the Feature is `@code`
- **AND** those choices remain open.

## MODIFIED Requirements

### Requirement: Organize one Feature per use case

The guide SHALL organize each Feature around one complete use case of the
intended system. From the Detroit perspective, scenarios describe relevant prior
facts, a whole action/query at the system boundary, and observable answers or
changed/preserved state. Distinct purposes remain separate; outcome variants of
one purpose remain together. Internal call sequences are not acceptance unless
their interaction is the requested public contract.

### Requirement: Specify observable domain consequences across media

The guide SHALL use requirements, procedures, explanatory texts, transcripts,
and relevant instructions/configuration as knowledge for the intended system.
The contract SHALL describe observable system behavior, including programmed and
interpreting systems. Internal algorithms, test products, and execution
backends do not become acceptance criteria unless they are the requested
subject. Feature modality remains separate metadata.
