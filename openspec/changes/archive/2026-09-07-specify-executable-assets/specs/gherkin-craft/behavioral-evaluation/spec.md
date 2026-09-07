## ADDED Requirements

### Requirement: Assess application of guidance to asset-directed contracts

Evaluation SHALL observe the calling agent applying the guide to contextual intent and sources. It SHALL check relevant domain selection, proposed decomposition, Detroit use-case boundaries, and correct Feature-level asset tags. Merely mentioning principles or labels in the skill document SHALL NOT establish the agent behavior. Cases SHALL distinguish intent already present in earlier context from a genuinely unresolved objective. Mixed-asset cases SHALL distinguish verification targets from internal dependencies.

#### Scenario: A source is rewritten without specifying the intended asset
- **WHEN** an agent turns a negotiation book into chapter-based Features although the contextual goal is a proposal-evaluation skill
- **THEN** evaluation records a purpose and decomposition failure even if all Features parse
- **AND** it identifies the requested use case missing from the result

#### Scenario: Asset tags follow verification boundaries
- **WHEN** an agent specifies an application's public classification operation that internally calls a model
- **THEN** evaluation expects `@code` for that target
- **AND** it rejects an extra `@prompt` tag justified only by the internal dependency

#### Scenario: Multiple targets share an observable contract
- **WHEN** requested coverage exercises the same review contract through a skill and a plugin
- **THEN** evaluation expects one Feature with `@skill @plugin`
- **AND** it checks that the domain outcomes remain applicable through both targets

#### Scenario: An unresolved objective is handled by the caller
- **WHEN** source material admits incompatible executable objectives and the supplied context selects none
- **THEN** evaluation expects the agent to identify the pending objective without presenting an invented system as agreed
- **AND** identifying the gap is distinguished from successfully delivering a complete target specification

## MODIFIED Requirements

### Requirement: Evaluate activation separately from output quality

Evaluation SHALL distinguish whether the agent loads the guide for an appropriate executable-asset specification request from whether it applies the guidance correctly. Activation cases SHALL include relevant intent in prior context and nearby requests that only ask for source summaries. Explicit invocation SHALL remain available independently of automatic selection, including when the guide helps the calling agent recognize a missing objective.

#### Scenario: A request expresses the skill's purpose without naming Gherkin
- **WHEN** prior context establishes a development skill as the target and the user supplies an article's rules to define its behavior
- **THEN** activation evaluation treats the contextual request as relevant to the guide
- **AND** loading is assessed separately from the correctness of the resulting specification

#### Scenario: An adjacent request only asks for a summary
- **WHEN** the user requests a plain article summary without executable-asset specification intent
- **THEN** activation evaluation treats a forced specification workflow as a false positive
- **AND** merely mentioning an article or domain term is insufficient evidence of appropriate activation

### Requirement: Use varied sources and reserve independent cases

The evaluation corpus SHALL cover software requirements, a real-world procedure, explanatory prose, and a transcript, paired with intended executable assets or an explicit unresolved-intent case. It SHALL cover the four common asset kinds and a mixed-target contract, alongside single-instance abstractions, independent facts, state/event gaps, use-case composition, and explicit scope constraints. Cases reserved from instruction development SHALL check transfer beyond the examples used to write the guide.

#### Scenario: General guidance is assessed on an unrelated source
- **WHEN** the revised guide is applied to a reserved source and asset objective absent from its development examples
- **THEN** the resulting specification is assessed against that target's purpose and relevant source concepts and rules
- **AND** imported terminology or policies count as unsupported contamination

#### Scenario: The user limits generalization
- **WHEN** an evaluation request fixes a category or excludes capabilities from the target asset
- **THEN** successful output preserves the constraint while expressing relevant domain relationships
- **AND** discovery is not rewarded for introducing excluded capabilities

### Requirement: Keep skill evaluation independent of specification execution

Evaluation of the guide SHALL remain possible before implementing the target assets described by the resulting Features. Its report SHALL distinguish the observed agent run from later execution of those assets' tests, identifying compared versions, corpus coverage, criteria, outcomes, review findings, and unexecuted checks. An executable objective SHALL be required for a completed specification; an existing implementation, generated tests, or a published glossary SHALL NOT be a prerequisite for authoring it.

#### Scenario: The domain has no executable implementation
- **WHEN** a reserved article is supplied to specify a planned development skill that does not yet exist
- **THEN** the agent's output is assessable through its intended purpose, relevant domain rules, use cases, target labels, and format
- **AND** the evaluation does not claim that the future skill or its tests have been executed

#### Scenario: A required behavioral evaluation could not run
- **WHEN** the evaluation environment cannot execute a planned agent comparison
- **THEN** the report marks that comparison as unexecuted and states the limitation
- **AND** it does not claim demonstrated superiority of the revised guide on that comparison
