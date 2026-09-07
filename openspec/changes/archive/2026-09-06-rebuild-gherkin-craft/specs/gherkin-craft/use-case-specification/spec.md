## Purpose

Express domain behavior as precise, implementation-independent Gherkin, organizing each Feature around one use case and making its rules, meaningful variations, and observable consequences assessable.

## ADDED Requirements

### Requirement: Organize one Feature per use case

The skill SHALL organize each generated Feature around one use case with a recognizable purpose, relevant prior facts, a whole action or query, and observable outcomes. Distinct use cases SHALL remain separate even when they belong to the same topic or share domain facts. Related rules and variants of the same use case SHALL remain together when appropriate. A human actor or business organization SHALL NOT be required when the domain does not contain one.

#### Scenario: A source describes two purposes under one topic
- **WHEN** a source describes calculating a resource requirement and checking whether that requirement fits an available capacity
- **THEN** the output contains a Feature for each use case
- **AND** shared quantities retain consistent meanings across them

#### Scenario: One use case has acceptance and rejection outcomes
- **WHEN** the same action succeeds or fails under different conditions of one rule
- **THEN** both outcomes belong to that use case's Feature with separately recognizable scenarios
- **AND** the skill does not split the use case solely because its outcome changes

### Requirement: Express meaningful arguments without erasing relationships

The skill SHALL expose relevant example values through named arguments, including identities, quantities, units, categories, relative positions, negative facts, and expected results. It SHALL separate independently variable facts while preserving cohesive records, collections, named concepts, and the meaning of each relationship. It SHALL keep fixed rule criteria fixed and SHALL NOT replace domain actions or diagnostics with generic prose-valued arguments.

#### Scenario: Expected values must vary with the example
- **WHEN** different input rows require different expected quantities or temporal positions
- **THEN** the corresponding consequences and tables bind the expected values to those rows
- **AND** an output left over from the first example is not applied to every row

#### Scenario: A collection describes one example
- **WHEN** a scenario requires a coherent ordered collection of activities
- **THEN** the collection can remain a DataTable with meaningful fields
- **AND** the skill does not fragment it into arbitrary scalar columns merely to increase the number of parameters

#### Scenario: One example instantiates a reusable relationship
- **WHEN** only one justified example exists but its relationship has meaningful scalar arguments
- **THEN** an Outline with one concrete Examples row can expose those arguments
- **AND** the skill does not invent additional domain categories to justify using an Outline

#### Scenario: A missing item is identified relatively
- **WHEN** a rule refers to a missing answer in the last position of a variable-length collection
- **THEN** the specification preserves the relative selector and the explicit absence
- **AND** it does not substitute a fixed ordinal or a blank example cell

### Requirement: Choose discriminating behavioral examples

The skill SHALL examine whether an example would still pass if a relevant factor or rule were ignored. It SHALL use source-supported or explicitly identified derived examples to distinguish such factors, semantic partitions, meaningful boundaries, and failures. Unknown, absent, zero, and invalid SHALL remain distinct where relevant. Undefined validity or rounding policies SHALL NOT be silently chosen to complete a table.

#### Scenario: Unit-valued factors hide a missing calculation
- **WHEN** all current examples multiply a quantity by a factor of one and the supplied relationship also permits another factor
- **THEN** the specification includes a justified example whose expected result distinguishes applying the factor from ignoring it
- **AND** the expected values are consistent with the stated relationship

#### Scenario: A boundary is already covered
- **WHEN** existing examples distinguish below, equal to, and above a capacity threshold
- **THEN** a review recognizes that coverage and preserves it during revision
- **AND** it does not report those same boundary classes as absent

### Requirement: Explore state and event combinations without forcing mutation

The skill SHALL inspect relevant state/event pairs and transition conditions for omitted behavior. Each scenario SHALL describe a transition or observation with its relevant consequence. Repeated requests, missing information, and combinations of independent state dimensions SHALL be considered when applicable. The skill SHALL NOT claim exhaustive coverage merely because listed examples parse or because a small cross-product was enumerated.

#### Scenario: An event conserves state but changes the response
- **WHEN** the domain rejects an action without changing the subject's state
- **THEN** the scenario states the rejection and the relevant preserved state
- **AND** the skill does not invent a mutation to fit a transition diagram

#### Scenario: A query returns a result
- **WHEN** a use case observes or calculates an answer without changing the subject
- **THEN** its scenario validates the answer without requiring a fabricated lifecycle change

#### Scenario: A pending request is considered again with sufficient information
- **WHEN** a previously incomplete case is specified with the formerly missing information now present
- **THEN** the new example supplies that context independently and verifies the newly supported result
- **AND** it does not depend on another scenario having run or assume conversation memory that the domain has not defined

### Requirement: Specify observable domain consequences across media

The skill SHALL support software requirements, real-world processes, explanatory texts, and transcripts while keeping the resulting specifications about their respective domains. Domain consequences SHALL remain meaningful under a change of implementation or evaluation method. Internal algorithms, test frameworks, execution backends, and implementation interactions SHALL NOT be acceptance criteria unless they are the actual subject of the requested domain.

#### Scenario: Equivalent domain behavior has different realizations
- **WHEN** a procedure's rules can be followed by a person, a deterministic program, or an agent without changing the agreed domain behavior
- **THEN** its domain specification remains applicable to those realizations
- **AND** generating that specification does not require selecting a runner, writing tests, or defining an incentive mechanism

#### Scenario: A recommendation is distinct from its execution
- **WHEN** the source describes advising someone to perform an activity
- **THEN** the consequence verifies the relevant advice
- **AND** it does not assert that the recipient performed the activity or acquired a capability merely by receiving the advice

### Requirement: Preserve semantics, syntax, and language conventions

The skill SHALL preserve subjects, negation, quantifiers, units, temporal scope, causal meaning, and distinctions between source inputs and derived results. Every Outline argument SHALL have a concrete binding. English SHALL remain the default specification language unless the user explicitly chooses another language. Native and Markdown Gherkin SHALL follow their respective syntax, including native dialect declarations, Markdown table indentation, and the absence of separator rows in Gherkin tables.

#### Scenario: Decomposition must preserve negation
- **WHEN** a source rejects a condition because two required facts do not both hold
- **THEN** the specification retains the distinction between either fact missing and both facts missing
- **AND** splitting the sentence does not strengthen the condition into requiring both to be absent

#### Scenario: Non-English native Gherkin is explicitly requested
- **WHEN** the user explicitly requests Spanish native Gherkin
- **THEN** titles, steps, and argument names use the selected language consistently, with the supported native language declaration
- **AND** proper names, identifiers, and contractual literal data retain their required meaning

#### Scenario: A Markdown example table is interpreted
- **WHEN** the skill produces a Markdown Gherkin Outline with a table
- **THEN** its intended rows and concrete bindings survive parsing without unintended separator or formatting values

#### Scenario: Non-English Markdown constraints are unresolved
- **WHEN** the user explicitly requires non-English Markdown Gherkin without an established dialect configuration
- **THEN** the skill explains the format constraint and resolves the intended representation before claiming a valid result
- **AND** it does not pretend that a native language header configures the Markdown dialect

### Requirement: Review the complete specification and preserve coverage on revision

The skill SHALL review the complete specification against the source context, working domain model, user constraints, and claimed coverage. It SHALL use an independent editorial pass when available, or disclose a separate same-agent pass otherwise. Review findings SHALL identify their evidence and distinguish wording defects from unresolved domain decisions. A review-only request SHALL return findings without rewriting the source; a requested revision SHALL preserve existing justified behavior while addressing findings.

#### Scenario: A review finds an unsupported outcome
- **WHEN** a complete specification contains a consequence not justified by the source, accepted inference, or an explicitly identified proposal
- **THEN** the review identifies the affected scenario and missing rule or evidence
- **AND** it does not silently invent a rule to make the consequence appear valid

#### Scenario: A review is requested without edits
- **WHEN** the user asks to evaluate existing specifications and states that no files are to be edited
- **THEN** the skill reports actionable findings without modifying the specifications or creating unrequested review artifacts

#### Scenario: A revision changes a shared relationship
- **WHEN** the user requests a correction to wording or arguments shared by several scenarios
- **THEN** the revision and subsequent review cover every affected occurrence and retain unchanged rules, boundaries, and example meanings
