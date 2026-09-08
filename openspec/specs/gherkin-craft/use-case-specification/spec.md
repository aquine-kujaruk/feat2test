# gherkin-craft/use-case-specification Specification

## Purpose

Express domain behavior as precise, implementation-independent Gherkin, organizing each Feature around one use case and making its rules, meaningful variations, and observable consequences assessable.

## Requirements

### Requirement: Organize one Feature per use case

The guidance SHALL instruct the agent to organize each Feature around one complete use case of the intended executable asset. From the Detroit perspective, scenarios SHALL describe relevant prior facts, a whole action or query at the system boundary, and observable answers or changed or preserved state. Distinct purposes SHALL retain separate Features even when they share a topic or data; rules and outcome variants of one use case SHALL remain together. A human actor or business organization SHALL NOT be required when absent from the domain. Internal call sequences SHALL NOT define acceptance unless those interactions are themselves part of the requested public contract.

#### Scenario: A source describes two purposes under one topic
- **WHEN** the intended asset supports calculating a resource requirement and checking it against available capacity
- **THEN** the agent produces a Feature for each use case
- **AND** shared quantities retain consistent meanings

#### Scenario: One use case has acceptance and rejection outcomes
- **WHEN** the same action succeeds or fails under different conditions of one rule
- **THEN** both outcomes belong to that use case's Feature with distinct scenarios
- **AND** the agent does not split the Feature solely because its outcome changes

#### Scenario: A workflow implementation is reorganized
- **WHEN** the same public review use case is implemented with a different sequence of internal tools
- **THEN** its Feature still verifies the requested findings and relevant preserved files
- **AND** the scenario does not fail solely because the internal call sequence changed

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

The guidance SHALL instruct the agent to use software requirements, real-world procedures, explanatory texts, transcripts, and relevant instruction or configuration sources as knowledge for the intended system. The resulting contract SHALL describe what that system must accomplish, including guidance applied by agents, programmed software, and systems combining both. Domain consequences SHALL remain meaningful under an equivalent implementation or verification modality. Internal algorithms, test products, and execution backends SHALL NOT become domain acceptance criteria unless they are themselves the requested subject. Feature-level verification modalities SHALL remain separate metadata. The guide SHALL NOT author a proposed implementation's prompt text, instructions, configuration contents, or algorithm inside acceptance premises as a substitute for specifying its required behavior; existing text SHALL remain legitimate input when the requested use case examines that text.

#### Scenario: Equivalent domain behavior has different realizations
- **WHEN** the selected verification of an agreed use case changes from programmed software to an interpreting agent while its observable contract remains the same
- **THEN** the Feature replaces `@code` with `@ai` and preserves its still-applicable domain behavior
- **AND** it does not retain both tags, duplicate the Feature, or require generating tests or implementing either realization

#### Scenario: A recommendation is distinct from its execution
- **WHEN** a source supports an agent recommending an activity to its recipient
- **THEN** the specification verifies the relevant advice
- **AND** it does not assert that receiving advice means the recipient performed the activity or acquired a capability

#### Scenario: A transcript supplies coding principles
- **WHEN** the contextual objective is guidance for an agent changing a traditional software project using principles discussed in a transcript
- **THEN** the agent specifies the intended development use cases and observable results under those principles
- **AND** the transcript's conversational turns do not become the Feature boundaries

#### Scenario: A planned workflow has no implementation yet
- **WHEN** an agreed custom workflow defines required artifacts and their dependencies but its configuration files have not been authored
- **THEN** the agent specifies those observable obligations without inventing a complete configuration as a Given
- **AND** the missing implementation does not prevent a behavioral specification

### Requirement: Preserve semantics, syntax, and language conventions

The skill SHALL preserve subjects, negation, quantifiers, units, temporal scope, causal meaning, and distinctions between source inputs and derived results. Every Outline argument SHALL have a concrete binding. English SHALL remain the default specification language unless the user explicitly chooses another language. Native and Markdown Gherkin SHALL follow their respective syntax, including native dialect declarations and Markdown table indentation. Native `.feature` tables SHALL omit separators added only for Markdown formatting. The skill SHALL permit correctly indented `.feature.md` tables both with and without supported Markdown header separators, including alignment markers, when the intended Examples bindings and DataTable values survive parsing. It SHALL NOT claim that those Markdown formatting separators become data or reject an otherwise valid Markdown table solely because it includes them.

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

#### Scenario: Review encounters Markdown header separators
- **WHEN** the skill reviews correctly indented Markdown Examples and DataTables containing ordinary or aligned header separators that preserve the intended values
- **THEN** it does not report those separators as extra examples or data corruption
- **AND** its review still checks the complete specification for independently supported defects

#### Scenario: Native formatting adds unintended values
- **WHEN** a native Examples table or DataTable contains a row introduced only as a Markdown formatting separator
- **THEN** the skill identifies that row's unintended native data values
- **AND** a requested correction removes the formatting row while preserving the intended examples and values

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

### Requirement: Label verification modalities at Feature scope

The guidance SHALL instruct the agent to label each completed Feature with exactly one verification modality selected from `@code` or `@ai`, with the meanings below, for its whole use-case contract. The two tags SHALL be mutually exclusive on a Feature. Its Rules and scenarios SHALL inherit the selected modality and SHALL NOT introduce a different modality for part of the Feature. The selected tag SHALL describe how the behavior must be exercised, independently of artifact kind or packaging. Existing unrelated metadata SHALL be retained when still applicable. Internal dependencies, an artifact's name, and the technology used to judge an output SHALL NOT automatically change the selected modality. When the required verification cannot be established from context, the agent SHALL expose the specific pending decision, retain independently supported domain behavior, and refrain from inventing a tag, attaching both tags, or claiming verification metadata is complete. An unfamiliar artifact format or an undecided test language, framework, or output layout alone SHALL NOT make the modality unresolved.

| Tag | Required verification evidence |
| --- | --- |
| `@code` | Exercise programmed rules through the use-case interface and observe their results. |
| `@ai` | Exercise a model or agent interpreting instructions and context, and observe the resulting behavior required by the contract, including when invoked through a software interface. |

#### Scenario: Programmed configuration validation is the requested behavior
- **WHEN** the requested verification exercises a configuration loader's programmed rule that rejects a schema reference which does not resolve
- **THEN** the agent labels that validation Feature `@code`
- **AND** the configuration's possible use by an agent does not add `@ai`

#### Scenario: Software exposes model behavior that must be demonstrated
- **WHEN** the requested verification exercises a ticket-classification application using its real model to demonstrate classification of supplied ticket text
- **THEN** the agent labels that classification Feature `@ai`
- **AND** invoking a software interface does not by itself add `@code` or justify replacing the model behavior with a fixed response

#### Scenario: Programmed behavior is verified around a substituted model
- **WHEN** the requested contract concerns an application's programmed handling of a model response and the verification supplies that response without exercising model interpretation
- **THEN** the agent labels that Feature `@code`
- **AND** it does not claim the test demonstrates the real model's classification or reasoning behavior

#### Scenario: An agent applies a development skill
- **WHEN** the intended verification exercises an agent reviewing code under a skill's guidance
- **THEN** the agent labels the review Feature `@ai`
- **AND** the expected outcomes concern the review rather than whether particular sentences occur in the instruction file

#### Scenario: A model executes a supplied prompt
- **WHEN** the intended verification supplies source text to a model executing summarization instructions
- **THEN** the agent labels that summarization Feature `@ai`
- **AND** acceptance criteria describe the required summary behavior

#### Scenario: A plugin exposes programmed behavior
- **WHEN** the requested verification exercises a plugin's programmed record-retrieval operation through its host without requiring model or agent interpretation
- **THEN** the agent labels that retrieval Feature `@code`
- **AND** plugin packaging does not require a distinct tag or imply AI behavior

#### Scenario: A plugin exposes agent behavior
- **WHEN** the intended verification exercises an agent's review through a plugin's host integration
- **THEN** the agent labels that review Feature `@ai`
- **AND** bundled scripts do not automatically add `@code`

#### Scenario: A custom OpenSpec workflow guides an agent
- **WHEN** the intended verification observes an agent applying an agreed custom OpenSpec configuration and schema to produce the required workflow artifacts
- **THEN** the agent labels that workflow Feature `@ai`
- **AND** configuration and schema packaging do not introduce further tags

#### Scenario: Verification evidence remains undecided
- **WHEN** the review objective and acceptance rules are established but context leaves open whether this Feature's verification will exercise programmed review rules or an interpreting agent
- **THEN** the agent identifies the unresolved verification choice and preserves the supported review contract
- **AND** it does not infer a modality from the deliverable's filename or request the already-established objective again

### Requirement: Select one verification modality per Feature

The guidance SHALL require one selected verification route for each Feature, expressed by either `@code` or `@ai`. A Feature carrying both tags SHALL be a classification defect even if both routes could demonstrate its complete contract. When context selects a route, the agent SHALL use that route; when it presents alternatives without selecting one, the agent SHALL identify the pending choice rather than silently choose, combine tags, or duplicate the Feature. A later selection of a different modality SHALL replace the previous modality tag while retaining still-applicable domain behavior. Multiple executions within the selected modality SHALL use its single tag. The guide SHALL NOT split a use case, duplicate a Feature, or add Examples arguments solely to select a modality, language, execution product, host, checker, or generated file layout. Distinct use cases or materially different contracts SHALL retain separate Features, even when their implementations cooperate.

#### Scenario: Two possible routes leave one selection pending
- **WHEN** context identifies programmed review rules and an interpreting agent as possible ways to verify one review contract without selecting a route for its Feature
- **THEN** the agent preserves the review contract and identifies the pending selection
- **AND** it does not attach both modality tags, duplicate the Feature, or add an Examples column selecting the modality

#### Scenario: Review finds both modality tags on a Feature
- **WHEN** a supplied review Feature carries both modality tags and the requested verification explicitly exercises an interpreting agent
- **THEN** review identifies a classification defect and a requested correction retains only `@ai`
- **AND** the correction preserves the review's domain rules and unrelated metadata

#### Scenario: A Rule attempts to change the Feature's modality
- **WHEN** a Feature selects `@ai` but one of its Rules or scenarios declares `@code`
- **THEN** review identifies a conflicting classification within the use case
- **AND** it does not accept that declaration as a separate test-generation route for part of the Feature

#### Scenario: Two AI execution contexts share the same contract
- **WHEN** the requested coverage verifies the same review contract with an agent applying a skill directly and through a hosting plugin that applies the same guidance
- **THEN** the agent retains one Feature labeled only `@ai`
- **AND** the two execution contexts do not create duplicate Features or an additional modality

#### Scenario: A shared implementation has different public purposes
- **WHEN** one system prepares a negotiation and another evaluates an offer
- **THEN** the agent proposes separate Features for those use cases
- **AND** each Feature receives its own single modality without merging the distinct contracts

#### Scenario: A programmed assertion does not add another modality
- **WHEN** one requested use case is an agent producing workflow artifacts and a programmed check only inspects the resulting filenames
- **THEN** the workflow Feature retains `@ai`
- **AND** that output assertion does not add a second modality to the workflow Feature

### Requirement: Keep verification modalities independent of execution and assessment products

The guidance SHALL explain that the selected verification modality provides metadata for a later test-generation route. It SHALL NOT prescribe a programming language, framework, runner, provider, judge, optimizer, repetition count, deterministic or stochastic classification, exact versus semantic checker, or the number, names, and organization of generated test and support files. Those generation and execution choices SHALL remain separate decisions and SHALL NOT be required to complete an otherwise established behavioral contract and modality. Assertions and domain acceptance criteria SHALL remain meaningful independently of those choices. A model used solely to judge the result SHALL NOT establish that model or agent behavior is the subject under test. The guide SHALL distinguish an intended scaffolding route from a generator capability actually available in the calling environment; labeling alone SHALL NOT be reported as having generated or run tests.

#### Scenario: The test implementation has not been selected
- **WHEN** the requested Feature exercises programmed rules but the test language, framework, and generated file layout remain undecided
- **THEN** the agent completes its behavioral specification with `@code`
- **AND** it leaves those generation decisions open without inferring TypeScript, Python, Vitest, or a number of output files from the tag

#### Scenario: A future test-generation choice changes
- **WHEN** the chosen language, framework, or generated file layout changes while the programmed behavior and its acceptance contract remain the same
- **THEN** the Feature retains `@code` and its domain scenarios
- **AND** the change does not require a new modality, duplicate Feature, or scenario argument for the test implementation

#### Scenario: Test generation is requested from labeled Features
- **WHEN** the caller requests tests for `@code` and `@ai` Features
- **THEN** the guide directs the agent to identify their required execution evidence and check available generator and adapter support
- **AND** unsupported scaffolding is identified without claiming it was generated or substituting a weaker verification silently

#### Scenario: AI behavior has exact acceptance checks
- **WHEN** an agent's required file-creation behavior is checked using exact filenames and file contents
- **THEN** its verification modality remains `@ai`
- **AND** exact assertions do not relabel the behavior as `@code` or promise repeated runs will be identical

#### Scenario: An AI judge assesses programmed behavior
- **WHEN** the requested contract exercises a programmed report generator and a model is used only to judge the generated report
- **THEN** the generator's Feature remains `@code`
- **AND** the judge does not add `@ai`

#### Scenario: A checker changes without changing the behavior exercised
- **WHEN** the same agent-generated summary is checked by an exact comparison in one evaluation and semantic criteria in another
- **THEN** the summary Feature retains `@ai` under both checking strategies
- **AND** the domain acceptance rules remain explicit rather than being replaced by a checker name

#### Scenario: Code was authored with AI assistance
- **WHEN** verification exercises a programmed calculation whose implementation was produced by an agent but does not exercise an interpreting model or agent
- **THEN** its Feature is labeled `@code`
- **AND** authorship does not add `@ai`

#### Scenario: Native and Markdown Features carry the same classification
- **WHEN** the agent renders an equivalent Feature in native and Markdown Gherkin
- **THEN** each representation preserves exactly one selected Feature-level modality tag and any applicable unrelated metadata under its syntax
- **AND** native tags appear before the Feature keyword, each Markdown tag occupies its own code span, and parsing retains the selected modality and inherited scenario metadata
