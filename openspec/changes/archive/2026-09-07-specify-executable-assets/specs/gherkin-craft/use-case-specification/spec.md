## ADDED Requirements

### Requirement: Label verification targets at Feature scope

The guidance SHALL instruct the agent to label each completed Feature with the common asset categories exercised when verifying its use case. The initial vocabulary SHALL be `@code`, `@skill`, `@prompt`, and `@plugin`, with the meanings below. Labels SHALL apply to the whole Feature and describe the selected system-under-test boundary, not inventory its implementation dependencies. Existing unrelated metadata SHALL be retained when still applicable. An asset that cannot be classified from context SHALL be reported as a pending decision rather than assigned an invented category.

| Tag | Asset exercised to verify the contract |
| --- | --- |
| `@code` | Executable software through its use-case interface, including software that calls a model |
| `@skill` | An agent applying the skill's guidance to perform the use case |
| `@prompt` | A model executing the prompt with the use case's inputs |
| `@plugin` | The plugin's exposed behavior exercised through its host integration |

#### Scenario: Software calls a production model
- **WHEN** the specified use case is a classification application's public operation that internally calls a model
- **THEN** the agent labels that application's Feature `@code`
- **AND** the internal model call alone does not add `@prompt` or assert that execution is deterministic

#### Scenario: An agent applies a development skill
- **WHEN** the intended test exercises an agent reviewing code under a skill's guidance
- **THEN** the agent labels the Feature `@skill`
- **AND** the expected outcomes concern the review rather than whether particular sentences occur in the instruction file

#### Scenario: A prompt is the verification target
- **WHEN** the intended test supplies source text to a model executing a summarization prompt
- **THEN** the agent labels that prompt's use-case Feature `@prompt`
- **AND** acceptance criteria describe the required summary behavior

#### Scenario: A plugin is tested through its host
- **WHEN** the intended test exercises a plugin's exposed review operation through the host
- **THEN** the agent labels that Feature `@plugin`
- **AND** bundled skills or code do not automatically become additional targets

### Requirement: Preserve one contract across applicable verification strategies

The guidance SHALL allow multiple asset tags on a Feature when the requested verification exercises that same complete use-case contract through those asset boundaries. A separate Feature SHALL NOT be introduced solely for another test strategy. Multiple strategies for one asset kind SHALL NOT require duplicate tags. Distinct use cases or materially different contracts SHALL retain separate Features, even when their implementations cooperate.

#### Scenario: The same contract is verified through a skill and its host plugin
- **WHEN** the requested coverage verifies the same review use case both with an agent applying the skill and through the hosting plugin
- **THEN** the agent retains one Feature labeled `@skill @plugin`
- **AND** its domain steps remain a single contract applicable to both targets

#### Scenario: A shared implementation has different public purposes
- **WHEN** one asset prepares a negotiation and another evaluates an offer
- **THEN** the agent proposes separate Features for those use cases
- **AND** multiple tags do not merge the distinct contracts

### Requirement: Keep target labels independent of verification products

The guidance SHALL explain that asset tags provide metadata for selecting target-appropriate test scaffolding. They SHALL NOT prescribe a runner, provider, judge, optimizer, repetition count, or deterministic/stochastic classification. Assertions and domain acceptance criteria SHALL remain meaningful independently of those choices. The guide SHALL distinguish an intended scaffolding route from a generator capability actually available in the calling environment; labeling alone SHALL NOT be reported as having generated or run tests.

#### Scenario: Test generation is requested from labeled Features
- **WHEN** the caller requests tests for `@code` and `@skill` Features
- **THEN** the guide directs the agent to distinguish their required execution adapters and check available generator support
- **AND** unsupported target scaffolding is identified without claiming it was generated

#### Scenario: An asset retains its kind under different checks
- **WHEN** a skill's outcome can be checked with exact file comparisons in one test and semantic criteria in another
- **THEN** its verification target remains `@skill`
- **AND** the choice of checker does not relabel the asset

#### Scenario: Native and Markdown Features carry the same classification
- **WHEN** the agent renders an equivalent Feature in native and Markdown Gherkin
- **THEN** each representation preserves the intended Feature-level asset tags under its syntax
- **AND** parsing retains those tags as metadata rather than ordinary descriptive prose

## MODIFIED Requirements

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

### Requirement: Specify observable domain consequences across media

The guidance SHALL instruct the agent to use software requirements, real-world procedures, explanatory texts, and transcripts as sources for the intended executable asset. The resulting contract SHALL describe what that asset must accomplish, including skills guiding traditional development or agent workflows and software using models. Domain consequences SHALL remain meaningful under an equivalent implementation or verification method. Internal algorithms, test products, and execution backends SHALL NOT become domain acceptance criteria unless they are themselves the requested subject. Feature-level asset tags SHALL remain separate metadata.

#### Scenario: Equivalent domain behavior has different realizations
- **WHEN** the same agreed use case is to be implemented as software and as a skill applied by an agent
- **THEN** the domain contract remains applicable to both realizations with their applicable target tags
- **AND** specifying that contract does not require generating tests or implementing either asset

#### Scenario: A recommendation is distinct from its execution
- **WHEN** a source supports a skill recommending an activity to its recipient
- **THEN** the agent's specification verifies the relevant advice
- **AND** it does not assert that receiving advice means the recipient performed the activity or acquired a capability

#### Scenario: A transcript supplies coding principles
- **WHEN** the contextual objective is a skill guiding changes to a traditional software project using principles discussed in a transcript
- **THEN** the agent specifies the intended development use cases and observable results under those principles
- **AND** the transcript's conversational turns do not become the Feature boundaries
