# gherkin-craft/domain-discovery Specification

## Purpose

Discover a contextual domain model from available source material so that specifications express meaningful concepts, consistent terminology, and justified behavior independently of the eventual implementation medium.

## Requirements

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

The guidance SHALL instruct the agent to establish the intended system, its purpose, and its observable behavior from the request and available context before selecting the behavior to specify. An intended executable asset SHALL mean a system whose behavior can be exercised, without requiring membership in an artifact-kind catalog. Software, instructions interpreted by models or agents, custom configurations and schemas, and their compositions SHALL qualify when their intended behavior is established. These examples SHALL NOT define an exhaustive list. The guide SHALL distinguish the system's observable contract from the packaging of its instructions and from the evidence needed to verify it. Source material SHALL supply knowledge for that system; its medium or chapter structure SHALL NOT determine its purpose or Feature boundaries. Planned systems SHALL qualify without already having an implementation.

#### Scenario: A book supplies knowledge for a development skill
- **WHEN** the contextual objective is a skill guiding code review using principles from a supplied book
- **THEN** an agent applying the guide models the review capability, its relevant concepts, rules, and observable review outcomes
- **AND** unrelated book topics do not become additional capabilities merely because they appear in the source

#### Scenario: The same source serves different executable objectives
- **WHEN** separate requests use the same negotiation source to specify preparing a negotiation and evaluating an offer
- **THEN** each specification describes the requested system's use cases and outcomes
- **AND** shared source concepts retain consistent meanings without forcing the two objectives into the same contract

#### Scenario: A custom configuration supplies an executable objective
- **WHEN** the request establishes a customized OpenSpec configuration and schema whose intended behavior is to guide an agent through an agreed artifact workflow
- **THEN** the agent specifies that workflow's observable outcomes without requiring it to be called a skill, prompt, or plugin
- **AND** the specification does not invent configuration-management use cases or additional artifact categories to make the objective eligible

#### Scenario: A new instruction format preserves an established purpose
- **WHEN** an established review behavior is to be exercised by an agent using instructions delivered in a project policy file instead of a skill package
- **THEN** the guide preserves the relevant review rules and use-case boundaries
- **AND** the unfamiliar packaging alone does not create an unresolved objective or require another verification modality

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

### Requirement: Recognize reusable concepts even with one supplied instance

The skill SHALL examine identities, named categories, measurement units, states, events, and behavior variants as candidates for explicit domain concepts or catalogs, even when the source supplies one instance. It SHALL separate a reusable relationship from its argument values and distinguish identifying a possible variation from asserting that all variations are already supported. An explicit user restriction on abstraction or supported values SHALL take precedence.

#### Scenario: A named profile demonstrates a reusable decision process
- **WHEN** the source describes one named profile applying a recognizable decision strategy
- **THEN** the specification distinguishes the profile's identity, its strategy, and the use cases to which the strategy applies
- **AND** it preserves behavior specific to that profile without claiming that every possible profile shares it

#### Scenario: The user constrains the supported category
- **WHEN** the user explicitly requires a specification for one fixed category and excludes support for other categories
- **THEN** the specification respects that boundary
- **AND** it does not introduce additional supported categories or catalog-management use cases

### Requirement: Separate magnitudes, units, and semantic roles

The skill SHALL distinguish quantities from units and distinguish independent roles even when their current values coincide. It SHALL examine literal units and identities in sentences and argument names, including consequences and diagnostics. A unit's meaning and any actual fixed business criterion SHALL be preserved; making a unit explicit SHALL NOT silently introduce a conversion rule.

#### Scenario: One temporal unit serves three different roles
- **WHEN** source material projects three months ahead, groups results monthly, and specifies monthly recurrence
- **THEN** the specification distinguishes projection horizon, reporting interval, and recurrence interval
- **AND** their use of the same unit does not force them to share one argument

#### Scenario: Calendar conversion is not defined
- **WHEN** a source names months and days without defining a conversion between them
- **THEN** the specification preserves the distinction and identifies any conversion needed by a proposed calculation as unresolved
- **AND** it does not silently equate a month to thirty days

#### Scenario: A criterion is fixed by the domain
- **WHEN** a source explicitly requires a four-digit code
- **THEN** four remains the rule's required length while submitted values and relevant expected diagnostics remain explicit example arguments
- **AND** catalog discovery does not turn the required length into a user-selectable policy

### Requirement: Distinguish states, events, policies, and strategies

The skill SHALL distinguish meaningful domain states, events, transition conditions, observable outcomes, and strategies that govern behavior. It SHALL preserve independent state dimensions and distinguish domain catalogs from any programming representation. A strategy's identity SHALL NOT be treated as a lifecycle state merely because both have named values.

#### Scenario: Two state dimensions vary independently
- **WHEN** a source distinguishes having the required components from understanding how to combine them
- **THEN** the specification can represent having all components while lacking that understanding
- **AND** neither fact is lost in a generic active/inactive classification

#### Scenario: A strategy changes a decision for the same situation
- **WHEN** two supplied strategies govern different responses to the same situation and request
- **THEN** the specification identifies the relevant strategy and its observable effect
- **AND** it does not prescribe an enum, class hierarchy, or execution mechanism unless that mechanism is itself the subject being specified

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

### Requirement: Preserve evidence and expose unresolved decisions

The skill SHALL distinguish source assertions, justified inferences, proposed extensions, and unresolved decisions. It SHALL infer abstractions from examples without treating unprovided behavior as fact. Missing decisions SHALL be isolated from independently specifiable behavior; an expected outcome that materially depends on an unresolved rule SHALL remain visibly unresolved or be clarified rather than invented. Statements in explanatory sources SHALL retain their conditions and status as the source's claims.

#### Scenario: An article's example does not define the general rule
- **WHEN** an article provides one numerical example without specifying how non-integral results are handled
- **THEN** the specification preserves what the example establishes
- **AND** it identifies rounding as a decision needed for additional cases rather than attributing an invented rounding policy to the article

#### Scenario: Some use cases remain well specified despite a gap
- **WHEN** one requested use case depends on a missing rule while another has sufficient evidence
- **THEN** the skill completes the independently supported specification and identifies the specific remaining decision
- **AND** it does not describe the incomplete behavior as fully specified

### Requirement: Keep the working model internal unless requested

The skill SHALL use the contextual taxonomy and language as working material by default. Its definitions SHALL be reflected consistently in the requested specifications without requiring a separate glossary, architecture document, catalog application, or persisted model. A user request to inspect or document the model SHALL make a concise representation available.

#### Scenario: Only specifications are requested
- **WHEN** the user asks for Gherkin from a transcript without requesting additional deliverables
- **THEN** the delivered artifacts are the requested specifications
- **AND** domain discovery does not add an unsolicited glossary or architecture file

#### Scenario: The user asks to inspect the inferred taxonomy
- **WHEN** the user requests the taxonomy used to interpret the context
- **THEN** the skill presents the relevant concepts, meanings, relationships, and evidence status in a concise form
- **AND** it distinguishes inferred concepts from source-defined ones
