## ADDED Requirements

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

## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Label verification targets at Feature scope

**Reason**: Artifact-kind classification is replaced by required verification modalities, including a changed interpretation of model-backed applications.

**Migration**: Apply "Label verification modalities at Feature scope". Its scenarios preserve coverage of software, agent guidance, prompts, and host integration while selecting labels from execution evidence and adding custom configurations and unresolved verification choices.

### Requirement: Preserve one contract across applicable verification strategies

**Reason**: Distinct artifact boundaries no longer define distinct categories. A shared agent review through a skill and its plugin requires one modality.

**Migration**: Apply "Select one verification modality per Feature". Retain the shared skill/plugin review as one AI contract and separate public-purpose coverage; require one route for each Feature and report an unresolved selection instead of combining tags or duplicating contracts.

### Requirement: Keep target labels independent of verification products

**Reason**: Checker and product independence must preserve the execution modality rather than the artifact category.

**Migration**: Apply "Keep verification modalities independent of execution and assessment products". Preserve generation-support limits, equivalent native/Markdown metadata, and checker-change coverage; distinguish exact AI checks and AI judges of programmed behavior.
