## Purpose

Discover a contextual domain model from available source material so that specifications express meaningful concepts, consistent terminology, and justified behavior independently of the eventual implementation medium.

## ADDED Requirements

### Requirement: Establish a contextual taxonomy and ubiquitous language

Before drafting specifications, the skill SHALL establish a working domain model from the user's request and relevant available context. It SHALL distinguish concepts, their definitions and example values, relationships, independent dimensions, and applicable boundaries. Existing agreed vocabulary SHALL be reused; ambiguous terms and meanings that differ across contexts SHALL remain distinguishable. The taxonomy SHALL arise from the supplied context rather than a fixed domain borrowed from the skill's examples.

#### Scenario: Related sources define a concept absent from the initial request
- **WHEN** a request names a single example and an available related source defines the category to which it belongs
- **THEN** the working model uses that category and its established terminology in the resulting specification
- **AND** the example remains an instance of the category rather than becoming the name of every relationship

#### Scenario: A shared word has different meanings in two contexts
- **WHEN** source material uses "edition" for a publication version and a recurring event's occurrence
- **THEN** the specification distinguishes the two meanings in their respective contexts
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

The skill SHALL identify the containing context and relationships needed to understand each use case. It SHALL recognize shared concepts, prerequisites, outcomes used by other use cases, and composition policies when supported by the source. It SHALL NOT require a universal project/module hierarchy or invent surrounding administration capabilities merely to express those relationships.

#### Scenario: A source connects two activities through a shared result
- **WHEN** a source states that assessing available resources determines the inputs to planning an activity
- **THEN** the specifications preserve that relationship and use consistent meanings for the shared result
- **AND** the relationship does not require scenarios to run in a particular order

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
