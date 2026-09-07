# Contextual domain discovery

Read before authoring or reviewing. These are lenses for understanding the
provided context, not an ontology that every source must contain.

## Start from the intended asset

Recover what the user wants to build and accomplish from the entire available
context, including an earlier proposal or agreed objective. A book about review
can inform a review skill, a prompt, or a software application; its table of
contents does not choose between them. A planned asset is sufficient.

Select the source concepts and rules relevant to that purpose. If context leaves
incompatible objectives open, name the alternatives and the decision needed;
the calling agent decides how to resolve it with the user. A list of source
behaviors is not a completed system specification while its purpose is unknown.
An unresolved rule within an established purpose need not block other supported
use cases. Reusing clear intent takes precedence over asking for it again.

## Establish meanings and evidence

Read the request, its corrections, relevant supplied or available sources,
existing specifications, and agreed vocabulary. Resolve definitions from that
context before asking the user. More context does not authorize unrelated work.

Maintain a compact working model of purpose, target boundary, terms, meanings,
representative values, relationships, use cases, and evidence. Distinguish these
claim statuses:

| Status | Treatment |
| --- | --- |
| Source assertion | Preserve its conditions, scope, and status as the source's claim. |
| Justified inference | Explain the supporting relationship when it matters; do not present invented behavior as quoted fact. |
| Proposed extension | Label it as a proposal; keep it outside established acceptance behavior until accepted. |
| Unresolved decision | Identify exactly which outcome depends on the missing rule. |

Use one term for one meaning in a context. Preserve genuine aliases; do not
rotate synonyms for variety. The same word in two contexts may name different
concepts. Qualify those meanings instead of merging their properties. Translate
consistently under the language policy, preserving required literal terms.

The model is internal working material. If requested, expose a concise glossary
or relationship map with evidence status, not a reasoning transcript. Its normal
observable effect is consistent, well-factored specifications.

## Inspect examples for reusable concepts

Systematically inspect specific names, categories, units, states, events, and
behavior variants, even when there is only one example. Ask what kind of thing
each names and which relationship would remain meaningful with another value.
A named instance need not become the name of a whole use case.

A catalog is a meaningful set of domain alternatives, whether currently one
member, several members, or only partly known. Recognizing it does not require
catalog-management use cases or prescribe an enum, database, or class hierarchy.
Distinguish a concept's identity, its supported values, and rules about each
value. A category can be inferred while behavior for other members remains
undefined. Do not enumerate arbitrary variants to make the domain look richer.

Respect explicit scope restrictions: a fixed supported category stays fixed.
An incidental example alone is not that restriction. Keep actual rule constants
fixed; abstracting an example is different from making a mandatory policy an
input. Invalid examples can exercise a rule without adding supported categories.

## Separate quantities and roles

For each relationship identify subject, quantity, unit/dimension, scope,
qualifiers, and temporal role where relevant. Inspect consequences, table
headings, and argument names as well as prior facts: a name embedding a unit can
hide a domain dimension. Do not merely replace a number while leaving its unit
implicitly welded to the relationship.

Distinguish a horizon from a reporting interval, a recurrence interval from a
duration, and a total from a per-item amount. Equal example values do not make
these the same argument. Preserve named concepts that happen to contain numbers;
their name may designate a category rather than a count.

Make units explicit without inventing conversion rules. Calendar periods are
not fixed durations unless the context defines that relationship. Unknown,
absent, zero, and invalid are different facts when the domain distinguishes them.
Do not choose rounding, validity ranges, defaults, or precedence merely to
finish expected results.

## Distinguish behavior dimensions

| Concept | What it identifies |
| --- | --- |
| State | A relevant condition that can hold before or after a request. |
| Event/action | What happens or is requested in that situation. |
| Guard | A condition governing whether a response or transition is allowed. |
| Outcome | An observable answer, change, refusal, or relevant preserved fact. |
| Policy | A domain criterion governing a decision. |
| Strategy | A way of choosing, ordering, or combining behavior toward a purpose. |

Discover domain-meaningful states instead of defaulting to active/inactive.
Keep orthogonal dimensions separate: possession, knowledge, authorization, and
completion need not imply each other. Use only dimensions justified here; this
list is illustrative. A strategy identity is not a lifecycle state. A profile or
named persona can select a strategy that composes otherwise stable use cases.

Sketch relevant `prior facts × event → answer and resulting/preserved facts`.
Inspect omitted pairs, mixed independent conditions, guards, rejection, and
repeated requests where applicable. For a query, check the answer and only the
preservation relevant to its contract. No mutation is required. Do not assert
idempotence, failure priority, or handling of an unspecified event without support.
An undefined pair is a question, not permission to invent its result.

## Find whole use cases and their containing contexts

Use the intended asset's access patterns to identify relevant domains and parts
of a domain: which whole actions or queries can be requested, with what inputs,
prior facts, and observable outcomes? Propose separate specifications for distinct
purposes or contexts, explaining their shared meanings and relationships. Keep
one Feature per use case. Acceptance and rejection of the same
action belong together; several purposes sharing a topic need separate Features.
A low-level step or internal computation does not become a use case merely
because it has a name. It needs a meaningful independently requested purpose.

Infer the containing area or context needed to understand these purposes. Do
not impose a universal project/module hierarchy or require a human actor or a
business organization. Preserve relationships: shared concepts, prerequisites,
an outcome accepted by another use case, and strategies that condition their
composition. State those relationships in domain terms with consistent roles.

Use DDD and Clean Architecture to distinguish domain concepts and policies,
application use cases and orchestration, and external mechanisms. These are
responsibilities, not mandatory directories, classes, or a Feature per reference,
script, CLI command, MCP call, or invoked skill. From the Detroit perspective,
reorganizing internal calls should preserve acceptance when the public behavior
is unchanged. An interaction itself belongs in acceptance only when that exposed
interaction is part of the requested contract.

A composition can itself have a distinct purpose and Feature. Specify its
observable effect without narrating internal call sequences. Each example
supplies its own necessary facts; relationships between Features never require
scenarios to run in a particular order or remember earlier conversations.

## Turn the model into assessable examples

For each rule, ask whether a relevant factor could be ignored while every
example still passes. Use supported or explicitly derived examples that reveal
the difference: nontrivial factors, semantic partitions, equality boundaries,
missing information, and relevant preserved state. Inspect existing coverage
before declaring a class absent. A larger cross-product is not proof of
completeness, and a longer taxonomy is not proof of understanding.

Use source inputs when examining a derivation; a derived prior fact is acceptable
when a different use case actually accepts it. Distinguish recommending an
activity from carrying it out and predicting a result from establishing it.
In explanatory texts, retain assumptions and attribution; do not transform a
conditional claim into a universal guarantee.

Complete independently supported behavior when another outcome needs a missing
decision. Keep that gap visible in the requested artifact's description or a
concise accompanying note; do not emit an invented passing example. Clarify a
material dependency when needed. Do not block unrelated supported use cases or
publish an extra taxonomy file just to record the gap.
