> **Retrospective terminology migration — 2026-09-09.** This archived delta
> is restated with the later modality contract. It does not claim that the
> archived evaluation was performed under this contract.

## ADDED Requirements

### Requirement: Assess application of guidance to behavior-directed contracts

Evaluation SHALL observe the calling agent applying the guide to contextual
intent and sources. It SHALL check relevant domain selection, proposed
decomposition, Detroit use-case boundaries, and exactly one selected
verification modality per completed Feature. Cases SHALL distinguish
established intent, unresolved objective, unresolved verification route,
programmed behavior, and model/agent interpretation. Packaging, dependencies,
public software interfaces, and checker technology SHALL NOT decide the tag.

#### Scenario: A real model supplies required evidence
- **WHEN** verification exercises an application's real model to classify
  supplied text
- **THEN** evaluation expects `@ai`
- **AND** an application interface alone does not add `@code`

#### Scenario: A fixed response limits the claim
- **WHEN** verification supplies a model response to exercise programmed
  handling rules
- **THEN** evaluation expects `@code`
- **AND** it does not claim real-model classification was demonstrated

#### Scenario: Two hosts run the same agent behavior
- **WHEN** direct guidance and a host integration both exercise the same
  interpreting review agent
- **THEN** evaluation expects one `@ai` Feature
- **AND** it does not duplicate the use case or add another tag

#### Scenario: A route is not selected
- **WHEN** an established contract could be verified through programmed rules
  or an interpreting agent but context selects neither
- **THEN** evaluation preserves supported domain behavior and records the
  pending selection
- **AND** it accepts neither a combined tag nor an invented category

### Requirement: Evaluate activation separately from output quality

Evaluation SHALL distinguish actual guide loading for an appropriate
system-behavior specification request from correct application of the guide.
Activation cases SHALL include relevant prior intent, nearby source summaries,
ordinary code work, and explicit invocation. Observed loading and selected path
are recorded separately from output quality.

### Requirement: Use varied sources and reserve independent cases

The evaluation corpus SHALL cover software requirements, real-world procedure,
explanatory prose, transcripts, configurations, and unfamiliar instruction
formats. It SHALL cover both modalities, invalid combined or conflicting tags,
pending selection, custom OpenSpec configuration validation and agent workflow,
exact checks of AI behavior, AI judges of programmed behavior, real-model
applications, supplied-response handling, and deferred generation details.
Reserved cases check transfer beyond instruction-development examples.

### Requirement: Keep skill evaluation independent of system execution

Evaluation SHALL remain possible before implementing the systems described by
Features. Its report SHALL distinguish observed agent runs, parser results, and
later execution of those systems' tests. Correct modality metadata SHALL NOT
claim an adapter exists or that a system was exercised.

## MODIFIED Requirements

### Requirement: Assess semantic quality and retained compatibility

Evaluation SHALL assess fidelity, useful abstraction, terminology, whole
use-case boundaries, state/event coverage, meaningful arguments, implementation
independence, language/format, deliverable discipline, contextual intent, and
modality selection. Parser success cannot override a material semantic failure.
Markdown table compatibility remains assessed through interpreted bindings,
values, and example counts.

#### Scenario: A Markdown separator is formatting
- **WHEN** equivalent Markdown specifications use valid tables with or without
  header separators
- **THEN** evaluation gives the same result when bindings and values match
- **AND** a separator interpreted as native table data remains a format defect.
