## MODIFIED Requirements

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
