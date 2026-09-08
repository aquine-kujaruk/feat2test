## ADDED Requirements

### Requirement: Assess application of guidance to behavior-directed contracts

Evaluation SHALL observe the calling agent applying the guide to contextual intent and sources. It SHALL check relevant domain selection, proposed decomposition, Detroit use-case boundaries, and exactly one selected verification modality per completed Feature. Merely mentioning principles or labels in the skill document SHALL NOT establish the agent behavior. Cases SHALL distinguish intent already present in earlier context from a genuinely unresolved objective or verification choice, and from generation details intentionally deferred. Cases combining software and AI SHALL distinguish the behavior whose execution supplies evidence from packaging, internal dependencies, and checkers. Evaluation SHALL reject both modality tags on one Feature, a conflicting modality on its Rules or scenarios, and automatic classification based solely on a public software interface or on a skill, prompt, plugin, configuration, or schema name.

#### Scenario: A source is rewritten without specifying the intended system
- **WHEN** an agent turns a negotiation book into chapter-based Features although the contextual goal is an agent evaluating proposals
- **THEN** evaluation records a purpose and decomposition failure even if all Features parse
- **AND** it identifies the requested use case missing from the result

#### Scenario: A model-backed application's actual behavior is evaluated
- **WHEN** an agent specifies requested verification of an application's classification behavior using its real model
- **THEN** evaluation expects `@ai` for that Feature
- **AND** it rejects `@code` justified only by the application's public software interface

#### Scenario: Programmed response handling is a different verification claim
- **WHEN** verification supplies a model response to demonstrate programmed response-handling rules without executing the model
- **THEN** evaluation expects `@code` for that contract
- **AND** it rejects a claim that the test demonstrates real model classification behavior

#### Scenario: Multiple AI execution contexts share an observable contract
- **WHEN** requested coverage exercises the same review contract through an agent applying a skill and through a plugin applying the same guidance
- **THEN** evaluation expects one Feature labeled only `@ai`
- **AND** it checks that the domain outcomes remain applicable in both execution contexts

#### Scenario: Both modality tags are proposed for one contract
- **WHEN** a candidate places both modality tags on a Feature whose selected verification exercises an interpreting agent
- **THEN** evaluation records a classification failure and expects only `@ai`
- **AND** a claim that both routes can verify the entire contract does not make the combined classification valid

#### Scenario: A Rule conflicts with the Feature's selection
- **WHEN** a Feature is labeled `@ai` and one of its Rules or scenarios declares `@code`
- **THEN** evaluation records a conflicting classification within the use case
- **AND** it does not accept the conflict as a way to route only that part of the Feature to a different generator

#### Scenario: An unresolved objective is handled by the caller
- **WHEN** source material admits incompatible executable objectives and the supplied context selects none
- **THEN** evaluation expects the agent to identify the pending objective without presenting an invented system as agreed
- **AND** identifying the gap is distinguished from successfully delivering a complete system specification

#### Scenario: An unresolved modality preserves the established objective
- **WHEN** the intended behavior is established but the evidence needed to select a modality is absent
- **THEN** evaluation expects the agent to preserve supported domain behavior and identify the specific verification decision
- **AND** it rejects guessing from packaging or requiring the user to repeat an already-known objective

### Requirement: Keep verification terminology consistent throughout the project

All project-maintained references to the verification taxonomy SHALL use the two mutually exclusive modalities and their current meanings. This SHALL include hidden skill resources, documentation and examples, evaluation instructions and expected findings, metadata, main specifications, active changes, and archived OpenSpec planning documents. Migration SHALL reassess existing classifications and explanatory claims, preserve unrelated tags and valid domain coverage, and remove obsolete category tags, artifact-kind selection rules, and acceptance of both modalities on a Feature without compatibility aliases. Archived planning text SHALL identify retrospective terminology updates and SHALL NOT present them as evidence of past execution under the revised contract. Immutable raw runs, version snapshots, and historical observations SHALL retain their original evidence and SHALL NOT be reused as current instructions or expected answers. Acceptance SHALL include a project-wide inventory and an audit that distinguishes authored references from immutable evidence; updating only the primary tag table SHALL NOT establish completion.

#### Scenario: An archived document repeats the old classification
- **WHEN** a project-wide inventory finds an archived planning example or requirement using the retired artifact taxonomy
- **THEN** that authored reference is migrated with its surrounding meaning and identified as retrospectively updated
- **AND** the archive path alone does not exempt it from the migration

#### Scenario: A retained tag has an obsolete meaning
- **WHEN** a current expected finding assigns `@code` to a real-model classification solely because verification calls an application interface
- **THEN** the finding is reassessed against the required evidence and changed to `@ai`
- **AND** a search limited to removed tag spellings is insufficient to establish migration completeness

#### Scenario: An example and its manifest are updated
- **WHEN** migration changes an evaluation input or a criteria file identified by a manifest digest
- **THEN** the current manifest identifies the new content accurately and preserves provenance of the revision
- **AND** previously published cases are not described as unseen reserved inputs

#### Scenario: Raw evidence records a previous run
- **WHEN** an immutable evaluation output contains the classification actually produced by the preserved prior skill
- **THEN** the original output and its version identity remain unchanged as historical evidence
- **AND** revised guidance and current expected findings are assessed through separately recorded runs rather than rewritten observations

## MODIFIED Requirements

### Requirement: Use varied sources and reserve independent cases

The evaluation corpus SHALL cover software requirements, a real-world procedure, explanatory prose, and a transcript, paired with intended systems or an explicit unresolved-intent case. It SHALL cover Features selecting `@code` and Features selecting `@ai`, rejection of combined or conflicting modality tags, and selection left pending when the verification route is unresolved. It SHALL include varied artifact packaging without treating packaging as an exhaustive taxonomy, custom OpenSpec configuration and schema behavior, agent behavior with exact checks, programmed behavior assessed by an AI judge, real model-backed application behavior, programmed response handling, and equivalent AI behavior exposed through different hosts. It SHALL cover completed classification with language, framework, and generated files still undecided, and preservation of that classification when those generation choices change. It SHALL retain single-instance abstractions, independent facts, state/event gaps, use-case composition, explicit scope constraints, and existing language and format coverage. Cases reserved from instruction development SHALL check transfer beyond the examples used to write the guide.

#### Scenario: Generation details remain open
- **WHEN** a request establishes programmed behavior to verify while explicitly leaving the test language, framework, and output files for a later decision
- **THEN** evaluation expects a completed Feature with `@code` and the justified domain rules
- **AND** it rejects an inferred language or framework, an output-file count inferred from the tag, or a request to settle those details before classifying the Feature

#### Scenario: General guidance is assessed on an unrelated source
- **WHEN** the revised guide is applied to a reserved source and system objective absent from its development examples
- **THEN** the resulting specification is assessed against that system's purpose and relevant source concepts and rules
- **AND** imported terminology or policies count as unsupported contamination

#### Scenario: The user limits generalization
- **WHEN** an evaluation request fixes a category or excludes capabilities from the intended system
- **THEN** successful output preserves the constraint while expressing relevant domain relationships
- **AND** discovery is not rewarded for introducing excluded capabilities

#### Scenario: OpenSpec customization distinguishes two verification purposes
- **WHEN** an evaluation fixture requests both programmed validation of configuration references and an agent following a custom artifact workflow
- **THEN** evaluation expects distinct Features for those purposes, labeled `@code` and `@ai` respectively
- **AND** neither purpose requires another artifact category or an implementation of the customization

#### Scenario: Checking technology does not select the modality
- **WHEN** evaluation compares an agent creating files checked by exact comparisons with a programmed report generator assessed by an AI judge
- **THEN** it expects `@ai` for the file-creation behavior and `@code` for the report-generation behavior
- **AND** assigning the tags from the checker technology counts as a classification failure

#### Scenario: A new instruction format tests generalization
- **WHEN** an agent must specify behavior guided by an unfamiliar project policy format whose objective and execution evidence are established
- **THEN** evaluation expects the corresponding existing modality without introducing another tag
- **AND** recognizing that format alone does not count as understanding its domain rules

### Requirement: Keep skill evaluation independent of specification execution

Evaluation of the guide SHALL remain possible before implementing the systems described by the resulting Features. Its report SHALL distinguish the observed agent run from later execution of those systems' tests, identifying compared versions, corpus coverage, criteria, outcomes, review findings, and unexecuted checks. An executable objective SHALL be required for a completed specification; an existing implementation, generated tests, or a published glossary SHALL NOT be a prerequisite for authoring it. Correct modality metadata SHALL NOT establish that an execution adapter exists or that the intended system was exercised.

#### Scenario: The domain has no executable implementation
- **WHEN** a reserved article is supplied to specify planned development guidance for an agent that does not yet exist
- **THEN** the agent's output is assessable through its intended purpose, relevant domain rules, use cases, verification modalities, and format
- **AND** the evaluation does not claim that the future system or its tests have been executed

#### Scenario: A required behavioral evaluation could not run
- **WHEN** the evaluation environment cannot execute a planned agent comparison
- **THEN** the report marks that comparison as unexecuted and states the limitation
- **AND** it does not claim demonstrated superiority of the revised guide on that comparison

## REMOVED Requirements

### Requirement: Assess application of guidance to asset-directed contracts

**Reason**: Evaluation must assess behavior-directed modality selection instead of artifact categories and boundary counts.

**Migration**: Apply "Assess application of guidance to behavior-directed contracts". Preserve purpose/decomposition failures and unresolved objectives; replace the application-interface classification rule with explicit real-model and programmed-response contrasts, retain shared AI contexts under one modality, and reject multiple modalities within a Feature while keeping later generation choices separate.
