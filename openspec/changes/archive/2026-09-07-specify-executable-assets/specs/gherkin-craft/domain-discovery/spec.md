> **Retrospective terminology migration — 2026-09-09.** This archived delta
> now says “intended system” and uses the later modality terminology. It does
> not revise the historical execution evidence.

## ADDED Requirements

### Requirement: Provide guidance for a calling agent

Gherkin Craft SHALL provide principles and procedures that a calling agent
applies. The guide assigns context interpretation, domain discovery,
decomposition proposals, specification authoring, and user interaction to that
agent. It SHALL help the agent recognize pending decisions without imposing an
interview workflow.

#### Scenario: Intent is available in context
- **WHEN** the current message supplies a source and earlier context identifies
  the intended system
- **THEN** an agent applying the guide reuses that intent
- **AND** does not ask the user to repeat it.

### Requirement: Anchor modeling in an intended system and observable behavior

The guidance SHALL establish the intended system, purpose, and observable
behavior from request and context before selecting behavior to specify. A
planned system can be software, instructions interpreted by a model or agent,
a custom configuration/schema, or another established composition; these
examples are not a catalog. Source medium, chapter structure, name, or
packaging SHALL NOT determine purpose or Feature boundaries.

#### Scenario: A custom configuration has an established purpose
- **WHEN** a customized OpenSpec configuration and schema guide an agent
  through an agreed workflow
- **THEN** the guide specifies observable workflow outcomes
- **AND** it does not require another category or invent configuration
  administration.

### Requirement: Establish a contextual taxonomy and ubiquitous language

Before drafting, the guidance SHALL establish a working domain model from
request and relevant context. It SHALL cover concepts, definitions and example
values, relationships, independent dimensions, boundaries, and evidence status.
The taxonomy arises from contextual purpose and sources rather than teaching
examples or system packaging.

## MODIFIED Requirements

### Requirement: Infer containing contexts and use-case relationships

The guidance SHALL identify relevant domains through the intended system's
access patterns and complete use cases. It SHALL preserve shared concepts,
prerequisites, consumed results, and supported composition while using DDD and
Clean Architecture only as responsibility-separation principles. It SHALL not
impose directories, classes, universal hierarchy, or a Feature per dependency.

#### Scenario: An unfamiliar instruction format preserves purpose
- **WHEN** an agent follows a project policy file to perform established review
  behavior
- **THEN** the guide preserves relevant review rules and use-case boundaries
- **AND** the packaging alone does not create an unresolved objective.
