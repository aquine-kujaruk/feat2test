---
name: business-gherkin
description: "Write, review, or reformulate business Gherkin — .feature and Markdown .feature.md — to validate domain behavior through business use cases and observable outcomes. Use whenever authoring or migrating Gherkin, including standalone specifications with no test runner or code generation."
---

# Business Gherkin

Write specifications a business reader owns, validating domain behavior through
its use cases.

## Scope

A specification is a finished deliverable on its own: writing one never obliges
you to generate tests, create test files, or suggest doing either. Do that only
when the task asks for it.

This skill is independent of execution and generation tools. Its instructions
must remain useful when the specification is read and reviewed without either.

## Specification language

Write specifications in **English by default**. Use another language only when
the user explicitly requests it, including an explicit request to retain a
source specification's language. The language of the conversation, source
material, or example domain does not select the output language.

Apply that choice to titles, descriptions, sentences, and argument names. Keep
domain concepts unchanged and use their established terms in the output
language; translate consistently rather than inventing synonyms. Preserve
proper names, identifiers, contractual literal text, and terminology the user
explicitly requires verbatim. Resolve material translation ambiguity from the
supplied vocabulary or ask.

For a non-English specification, use native `.feature` and put
`# language: <code>` on the first line, replacing `<code>` with the supported
Gherkin dialect code. Use that dialect's keywords throughout. The directive is
spelled `language`; it is neither a tag nor YAML metadata. English uses the
`en` dialect and needs no declaration. Keep this skill's teaching examples in
English.

If the user explicitly requires non-English Markdown Gherkin, resolve the format
constraint before drafting: Cucumber's Markdown dialect is selected externally
and does not recognize this per-file directive. Explain the limitation and
offer native `.feature` for a self-contained language declaration; do not
silently change a requested format or invent a working Markdown attribute.

## Respect the supplied domain

Treat the supplied application, use cases, taxonomy, vocabulary, and boundaries
as constraints. Trace each scenario to those requirements. Do not replace a
requested capability with a surrounding commercial or organizational workflow.
Domain behavior does not require a business organization or a human actor.

Introduce a concept, actor, document, state, or action only when the requested
behavior needs it. If removing it leaves the behavior fully specified, omit it.
Find richness in rules, boundaries, and combinations of relevant facts. Do not
complete a "typical application" with familiar but unrequested features.

Concrete example data and consequences justified by existing rules are allowed.
A material gap in the rules or taxonomy requires clarification from the supplied
context or the user; it is not permission to invent policy. Invalid input can
exercise a known rule without becoming a new supported domain category.

When the user explicitly asks you to choose or invent a domain, choose a small,
coherent example and distinguish its chosen rules from supplied requirements.
The guide's examples teach phrasing; their actors, concepts, and rules are never
requirements for the user's application.

## Creator and editor

Use two roles for every specification: a creator drafts it, then an editor
checks it against the original requirements. When delegation is available, use
different agents and give the editor a fresh review context. For a review-only
request, send the existing specification to the editor and return findings;
revise it only when requested.

- The **creator** follows [the creator brief](references/creator.md).
- The **editor** follows [the editor brief](references/editor.md). Supply the
  original requirements, source specifications, agreed vocabulary, this skill,
  the complete candidate, and its coverage map. A summary of the candidate is
  insufficient; the editor must inspect every sentence and example.
- The creator resolves actionable findings. The editor then checks the complete
  revised specification, including coverage and unchanged rules. Stop when
  ready, allowing at most two correction and recheck cycles. Report unresolved
  findings after that limit instead of extending the loop or claiming it passed.

These roles do not delegate further or restart this workflow. If delegation is
unavailable, perform separate creation and editing passes in the same session
and disclose that the review was not independent. Keep inventories, coverage
maps, and review notes in the working context unless requested as deliverables.

## Domain behavior through use cases

The testing stance is deliberately Detroit (classical): exercise a business use
case with real domain behavior and judge its observable consequences. Internal
component interactions are not acceptance criteria.

Identify the business action and the rules governing its outcome. Keep examples
concrete. Where the domain has variants, make their differing conditions and
criteria explicit while preserving the common business action. Do not invent
variants to justify an abstraction or prescribe how the system represents them.

Reason about each scenario as **prior state + business action and its inputs ->
observable result and relevant resulting state**. Each example describes one
transition or observation, not an entire state machine. A query or validation
can return a result without changing the subject's state. Do not invent a
mutation or an implementation state model to fit this reasoning aid.

Use facts available before the action and inputs accepted by that use case.
A derived fact can summarize prior state when another rule is being examined.
When the derivation itself is under examination, supply the source input: do
not assume its answer or start from an internal stage of the calculation.
Keep the business action whole; decomposing its inputs does not mean directing
its internal algorithm.

## The Feature is the client's document

It states what the business expects. Nothing else.

Banned: architecture, layers, classes, methods, implementation names for use
cases, ports, adapters, fakes, mocks, databases, storage tables, queues, endpoints,
HTTP verbs, status codes, DOM selectors, vendor names, framework names. Name the
business action using the client's domain vocabulary. A Feature must survive a full rewrite
of the implementation unchanged.
These exclusions concern implementation machinery, not concepts that are the
subject of the application itself.

Use the project's existing domain vocabulary, applying the specification-language
policy above when translation is needed. Never invent a synonym for variety.
Resolve material missing or ambiguous terms from the supplied context or ask.
For an explicitly invented example domain, establish only the terms it needs.
Use consistent wording for the same domain fact and make its subject clear.

## Reformulating existing specs strips implementation by default

When asked to reformulate, migrate, or "make these specs fit this project", the
user does not have to tell you to drop the technical parts.

1. Find the business intent behind each spec.
2. Discard every step describing mechanism — clicks, requests, SQL, config,
   infrastructure, test doubles, internal APIs.
3. Rewrite what remains as business behavior.
4. Keep the coverage: every equivalence class, boundary, and failure the original
   exercised still needs a scenario.
5. Where mechanism was the only content, express the observable business result
   as the scenario. Keep the mechanism outside the specification.
6. Report what you dropped, so nothing disappears silently.

Do not preserve technical steps out of caution. They are the thing being removed.

## Decompose facts and identify their arguments

Before drafting scenarios, identify the subjects, domain relationships,
argument values, business action, and observable consequences. Use this working
inventory to keep the language consistent; it need not become another document.

1. **Separate independently variable facts.** Ask whether one property could
   change while another stays the same. Order quantity, delivery address, and
   payment status are separate facts even when one example involves all three.
2. **Separate the relationship from its values.** Quantities, identities,
   positions, measurements, categories, and expected values are arguments when
   replacing them preserves the relationship's meaning. A product's identity
   and its ordered quantity are two arguments of the same fact. Inspect words
   as well as digits: "ten", "tenth", and "fourth" can hide arguments. Keep named
   domain concepts intact: "double room" names a room type, not a room count.
3. **Keep a stable formulation.** Reuse the same domain wording and argument
   names for the same meaning across scenarios. Changing a value must not
   create a new phrase. Distinguish a relationship's argument roles from the
   local names that identify its instances within an example. Keep those local
   names distinct when their values must coexist; make their correspondence to
   the relationship clear. Give different semantic roles distinct names even
   when their values happen to match.
4. **Keep the subject explicit.** Include the identity or position when it
   matters. Do not introduce a selection action merely to make later facts
   depend on an implicit "current" subject.
5. **Stop at a meaningful domain fact.** Preserve units, scope, and qualifiers
   that define the measurement. Keep cohesive records, collections, and named
   domain concepts together. Do not fragment a fact into procedural operations.

Parameterize values while retaining specific domain relationships. Avoid
universal phrases such as `the entity has <property> equal to <value>` or
`the actor performs <action>`. Distinct business actions and rejection reasons
must remain recognizable. Reuse must preserve the distinctions being specified.
Do not put whole condition or diagnostic sentences into an argument such as
`<reason>`; that moves hidden relationships and values into the data table.
Named domain categories can be arguments when their meaning is already defined.

Treat relative positions as arguments too: `<itemPosition>` can bind `last`.
Preserve their relative meaning; do not replace "last" with 10 because a list
is expected to contain ten items. Rejected inputs may have another
length. Use an absolute position only when the example establishes equivalence.

Read the [authoring guide](references/authoring-guide.md) for decomposition,
explicit arguments, and the boundary between prior facts and computed results.

## Express arguments with Gherkin

Use a `Scenario Outline` with named `<arguments>` and concrete `Examples` values
to make reusable relationships explicit. This skill deliberately favors explicit
arguments even when there is only one meaningful example. A parameter need not
vary within its table; never invent rows merely to justify an Outline.

Apply this to prior facts, action inputs, expected results, negations, and
rejection diagnostics. A value does not stop being an argument after "no",
"missing", or "because". Every placeholder must have an `Examples` column;
reuse it for repeated references to the same value. Write numerical counts and
positions as digits in `Examples`. Quoting a literal alone does not declare an
Outline argument. A plain `Scenario` suits examples whose facts and action need
no scalar arguments; a DataTable or Doc String can supply a cohesive collection
or source text.

Keep rule constants in the rule. A four-digit PIN requirement is fixed, while
the submitted PIN's length is an argument, even in the four-digit example.
When a consequence names the required count, parameterize that expected value
too and bind it to the rule's constant. This makes the sentence reusable without
turning a mandatory criterion into a selectable input. Omit incidental values
rather than adding parameters for them.

Group rows that share intent and the kind of outcome. A boundary that changes
acceptance into rejection belongs in its own scenario under the same `Rule`;
retain the same formulations and arguments wherever the relationship is unchanged.

## Concise, descriptive sentences

Name the subject and its domain relationship directly. Prefer a precise verb to
phrases such as "performs the process of" or "recognizes the fact that". Keep one
meaning per term and one cohesive fact or action per sentence. Reuse that wording
across the feature; do not shorten it with a new synonym or an invented acronym.

For each long sentence, first expose its arguments, then separate independent
facts, then remove words that add no meaning. A concise outcome and its cause
may be separate consequences only if their causal link remains explicit. Do
not repeat the whole rule inside every consequence or hide a specific diagnosis
behind "the result is correct". A named verdict can summarize criteria already
defined by the domain; its rule-specific examples must still distinguish failures.

Preserve grammar, explicit subjects, domain terms, negation, quantities, units,
quantifiers, comparisons, scope, timing, and causal meaning. In particular,
"not both" must not become "neither" when splitting a compound condition.
Keep a necessary longer sentence when a shorter one changes its truth conditions.
Sentence length is a review signal, not a word limit or an acceptance metric.

## Shape

`Feature` is a capability, `Rule` one business rule, `Scenario` one observable
example of it. `Given` is prior state, `When` the single action, `Then` the
result.

- `And` / `But` continue the preceding `Given`, `When`, or `Then`. Use `But` for
  a meaningful contrast, and express any negation in the sentence itself.
  `But` can contrast a positive fact; do not add a redundant negative just to
  use that keyword.
- All prior conditions must be simultaneously possible. A later condition must
  not silently invalidate an earlier one.
- Every scenario stands alone. None may depend on another having run.
- Each `Examples` row is an independent example with its own result. A DataTable
  describes one cohesive record or collection within an example. Use Examples
  for behavioral variation and a DataTable for the facts of a single example.
- Titles are read on their own, in a runner report or a review: describe the
  outcome and its condition, never "happy path" or "case 1".
- `Background` only for a precondition shared by every scenario in its scope, and
  never for variable data, actions, or assertions. If a reader must scroll away
  to understand a scenario, repeat the condition instead.
- Tags are metadata. Do not assume they trigger behavior.

## Relevant facts, complete coverage

Expose only values that explain the rule or verify its outcome. Omit incidental
details that do not affect the behavior.

- Express presence directly: `Given the customer has a billing address`.
- Verify only the relevant property: `Then the billing address has postal code
  <postalCode>`, with a concrete value in `Examples`.
- Never serialize an aggregate or reproduce a constructor in Gherkin.
- Never write blank cells, `null`, or `undefined`. Say it: `Given the customer
  has no billing address`.
- Express rejections semantically: `Then adding the product is rejected because
  the purchase limit is reached`. Use exact message text only when the wording is
  itself contractual.

## Markdown Gherkin

Use native Gherkin syntax in `.feature` and Markdown Gherkin syntax in
`.feature.md`; do not mix their structural syntax.

In `.feature.md`, Cucumber gives meaning only to `Feature`, `Background`, `Rule`,
`Scenario`, `Scenario Outline` and `Examples` headings, to `Given` / `When` /
`Then` / `And` / `But` steps (or the configured dialect's equivalents), and to
tags in backticks. Everything else stays
ordinary Markdown, so the file renders as a document.

Two mistakes are accepted silently and corrupt the specification:

- **Indent every table row by at least two spaces.** Without it Cucumber ignores
  the table entirely.
- **Never write a Markdown separator row** (`| --- |`). Cucumber reads it as a
  data row, in `Examples` too.

In Markdown headings and sentences, backticks around a placeholder protect its
rendering. Inside `Examples` cells, DataTable cells, and Doc String content, use
plain values and bare placeholders: formatting backticks become literal data.

## Foundations

- [Cucumber: Better Gherkin](https://cucumber.io/docs/bdd/better-gherkin/)
- [Cucumber: Gherkin reference](https://cucumber.io/docs/gherkin/reference/)
- [Cucumber: Spoken languages](https://cucumber.io/docs/gherkin/reference/#spoken-languages)
- [Cucumber: Markdown with Gherkin](https://github.com/cucumber/gherkin/blob/main/MARKDOWN_WITH_GHERKIN.md)
- [Cucumber: Markdown dialect selection](https://github.com/cucumber/gherkin/blob/main/javascript/src/GherkinInMarkdownTokenMatcher.ts)
- [Andre de Sousa: Gherkin Best Practices](https://github.com/andredesousa/gherkin-best-practices)
- [Robert C. Martin: Pickled State](https://blog.cleancoder.com/uncle-bob/2018/06/06/PickledState.html)

The sentence-editing guidance adapts clarity principles from
[ASD-STE100 skill](https://github.com/danyuchn/asd-ste100-skill/blob/master/SKILL.md)
and filler removal from
[Caveman's lite mode](https://github.com/JuliusBrussee/caveman/blob/main/skills/caveman/SKILL.md).
It keeps grammatical business language and semantic precision; it does not
require either skill or claim STE compliance.
