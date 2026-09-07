## ADDED Requirements

### Requirement: Provide guidance for a calling agent

Gherkin Craft SHALL provide principles and procedures that a calling agent applies. The guidance SHALL assign context interpretation, domain discovery, decomposition proposals, specification authoring, and user interaction to that agent. Requirements describing those activities SHALL be expressed and evaluated as guidance applied by the agent, not as autonomous operations of the skill. The guidance SHALL help the agent recognize pending decisions without imposing its own interview workflow.

#### Scenario: Intent is already available to the calling agent
- **WHEN** the current message supplies a source and earlier context identifies the executable asset to build
- **THEN** an agent applying the guide uses that existing intent
- **AND** it does not require the user to repeat the objective merely because it is absent from the latest message

#### Scenario: The source permits incompatible objectives
- **WHEN** a book is supplied without enough context to distinguish a negotiation-preparation skill from a proposal-evaluation application
- **THEN** an agent applying the guide identifies the unresolved objective and the alternative capabilities
- **AND** resolving it remains the calling agent's responsibility, without the guide prescribing a separate interview or silently choosing a system

### Requirement: Anchor modeling in an intended executable asset

The guidance SHALL instruct the agent to establish the intended executable asset and its purpose from the request and available context before selecting the behavior to specify. Supported purposes SHALL include software, prompts executed with a model, skills applied by agents, plugins exercised in their hosts, and compositions such as development workflows or software using a production model. Source material SHALL supply knowledge for the intended system; its medium or chapter structure SHALL NOT determine the system's purpose or Feature boundaries. Planned assets SHALL qualify without already having an implementation.

#### Scenario: A book supplies knowledge for a development skill
- **WHEN** the contextual objective is a skill guiding code review using principles from a supplied book
- **THEN** an agent applying the guide models the review capability, its relevant concepts, rules, and observable review outcomes
- **AND** unrelated book topics do not become additional capabilities merely because they appear in the source

#### Scenario: The same source serves different executable objectives
- **WHEN** separate requests use the same negotiation source to specify preparing a negotiation and evaluating an offer
- **THEN** each specification describes the requested asset's use cases and outcomes
- **AND** shared source concepts retain consistent meanings without forcing the two objectives into the same contract

## MODIFIED Requirements

### Requirement: Establish a contextual taxonomy and ubiquitous language

Before drafting, the guidance SHALL instruct the agent to establish a working domain model for the intended asset from the user's request and relevant context. It SHALL cover concepts, definitions and example values, relationships, independent dimensions, and applicable boundaries. The agent SHALL be guided to reuse agreed vocabulary and distinguish ambiguous terms and meanings across contexts. The taxonomy SHALL arise from that contextual purpose and its sources rather than a fixed domain borrowed from teaching examples.

#### Scenario: Related sources define a concept absent from the initial request
- **WHEN** a request for an executable asset names a single example and an available related source defines its relevant category
- **THEN** the agent's resulting specification uses that category and established terminology
- **AND** the example remains an instance rather than naming every relationship

#### Scenario: A shared word has different meanings in two contexts
- **WHEN** the intended asset covers sources using "edition" for a publication version and an event occurrence
- **THEN** the agent's specification distinguishes those contextual meanings
- **AND** it does not merge their properties or rules merely because the word matches

### Requirement: Infer containing contexts and use-case relationships

The guidance SHALL instruct the agent to identify relevant domains and parts of a domain through the intended asset's access patterns and complete use cases. It SHALL guide proposals for multiple specifications when distinct purposes or contexts require them, preserving shared concepts, prerequisites, results consumed by other use cases, and supported composition policies. DDD and Clean Architecture SHALL serve as responsibility-separation principles: domain concepts and rules, application use cases and orchestration, and external mechanisms. Their use SHALL NOT impose directories, classes, a universal hierarchy, or unrelated administration capabilities.

#### Scenario: A source connects two activities through a shared result
- **WHEN** the intended asset assesses available resources and uses that assessment to plan an activity
- **THEN** the agent proposes the relevant use-case decomposition and preserves the shared result's meaning
- **AND** the specifications do not require scenarios to execute in a particular order

#### Scenario: One domain exposes distinct access patterns
- **WHEN** an asset supports both calculating a resource requirement and checking it against available capacity
- **THEN** the agent proposes distinct use-case Features within the relevant domain
- **AND** it preserves the relationship between the calculation result and the capacity check

#### Scenario: A skill contains procedural and mechanical responsibilities
- **WHEN** the intended asset is a development skill using a script and an external service
- **THEN** the agent distinguishes domain rules, workflow responsibilities, and external mechanisms in its working model
- **AND** the guide does not require a Feature for every script, reference file, or service call
