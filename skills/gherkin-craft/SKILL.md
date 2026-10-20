---
name: gherkin-craft
description: "Write, review, or revise native .feature and Markdown .feature.md Gherkin that specifies software behavior and generates good tests with feat2test. Use when turning software requirements into Gherkin, reviewing existing Features, or fixing Features that feat2test rejects. Ordinary summaries, prose editing, and implementation alone do not need this skill."
---

# Gherkin Craft

Input: requirements for programmed software. Output: Gherkin whose steps map to
stable Step Adapter signatures and whose examples drive the tests feat2test
generates. Read [the generator contract](references/generator-contract.md) and
[format and language](references/gherkin-format.md) before writing or
reviewing. Use [the authoring guide](references/authoring-guide.md) for worked
examples when choosing a formulation.

## Steps are signatures

A step's literal words, without placeholders, are its adapter method. Keep one
wording and one keyword role per fact across the whole Feature; rewording a step
replaces its implementation. Put every value that varies between examples in a
placeholder, never in the words. Bind every placeholder in every row, including
those in titles and DataTables, which the generator does not catch. The
generated test only calls steps, so each Then step carries the value it checks
(`the order total is <total>`), not a verdict (`the total is correct`).

## One Feature per use case

Each Feature is one complete use case at the software's boundary: relevant prior
facts, one whole action or query, and the observable answer or changed or
preserved state. Rules and outcome variants of that use case, acceptance and
rejection included, stay together in distinct scenarios. Distinct purposes get
separate Features even when they share data; shared quantities keep one meaning.
No human actor is required when the domain has none.

Specify what the software answers, changes or preserves, not how. Replace a step
that describes implementation (`the repository save method is called`) with its
observable result. Internal call order, algorithms, runners, languages and
output layout are not acceptance criteria and never become steps or Examples
columns.

## Meaningful arguments

- Expose identities, quantities, units, categories, relative positions,
  negative facts and expected results as named arguments in a
  `Scenario Outline`, even with one justified row.
- Keep independently variable roles apart even when their values coincide: a
  horizon, a reporting interval and a recurrence interval of seven days are
  three arguments with explicit units, not one `days`.
- Keep a cohesive record or collection as one DataTable, not many scalar
  columns. To vary whole records, give each an identity in the table and select
  it from Examples.
- Keep fixed rule criteria fixed. A diagnostic may bind the fixed value without
  making the criterion configurable. Never replace actions, conditions or
  diagnostics with prose-valued arguments such as `<reason>`.
- Preserve subjects, negation, quantifiers, units, timing, relative selectors
  and causes. Use explicit absence, not blank cells or `null`. Supply raw input
  when its derivation is what the use case examines.

## Discriminating examples

Ask whether each example would still pass if a factor or rule were ignored; a
factor of one hides a missing multiplication. Cover meaningful partitions,
boundaries and failures, and keep unknown, absent, zero and invalid distinct.
Recognize coverage already present and keep it on revision.

A boundary belongs here when the domain expert would recognize it as their rule:
a zero price, a repeated item, an amount shown with two decimals. A value that
matters only because of machine representation (binary floating point, time
zones, text normalization, overflow) is left out and named as a candidate for
downstream programmatic tests, which are not written in Gherkin.

Inspect relevant state/event pairs, repeated requests, missing information and
mixed independent dimensions. A rejection states what was preserved; a query
checks its answer without inventing a mutation. Each scenario supplies its own
context and never depends on another having run. Parsing or a small
cross-product does not prove exhaustive coverage.

## Unresolved rules stay out of tables

Separate what the requirements assert, what is justifiably inferred and what is
undecided. When a row's expected outcome depends on an undecided rule, such as a
rounding or validity policy, omit that row, state the open decision and deliver
the supported rows. One supplied instance exposes a relationship's arguments; it
does not establish behavior for members the source does not support.

## Tags

Tags are metadata the generator does not interpret. None is required, including
`@code`; they only serve the project's own runner filters or conventions.
Preserve tags already present when revising.

## Validate with the generator

When feat2test is installed, run `feat2test validate` on the delivered Feature
through its file, `--text` or `--stdin`, with the project's runner and `--json`.
Report the example count and diagnostics; it writes nothing. When it is not
installed, check the format reference and say generator validation was not run.
Validation proves generability, not semantic review.

Write in English unless the user explicitly asks for another language.

## Review checklist

Apply to the complete specification against the requirements and the user's
constraints, whether or not another agent is available. Cite the scenario and
evidence for each finding, and separate wording defects from undecided domain
rules.

- [ ] Each Feature is one use case; distinct purposes are separate Features.
- [ ] Each fact has one wording and one role; no conflicting inputs.
- [ ] Every placeholder is bound in every row, including titles and DataTables.
- [ ] Every Then step carries the expected value it checks.
- [ ] No prose-valued arguments; roles, units and fixed criteria are explicit.
- [ ] Examples discriminate factors, boundaries and failures; prior coverage kept.
- [ ] No invented rules; open decisions are stated, not tabled.
- [ ] Steps describe observable behavior, not implementation or tooling.
- [ ] Syntax matches the format reference; `feat2test validate` passes when available.

A review-only request returns findings and edits nothing. A revision fixes every
affected occurrence of a shared step or argument and keeps justified behavior.
