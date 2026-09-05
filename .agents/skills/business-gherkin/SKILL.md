---
name: business-gherkin
description: "Write, review, or reformulate business Gherkin — .feature and Markdown .feature.md — as specifications a business reader owns: declarative behavior, Rules and Scenarios, Examples and DataTables, and stripping implementation detail out of existing specs. Use whenever authoring or migrating Gherkin, with or without a test runner."
---

# Business Gherkin

Write specifications a business reader owns and a developer can execute.

## Scope

Everything in this file is Gherkin craft. It holds for any runner, or for none.
A specification is a finished deliverable on its own: writing one never obliges
you to generate tests, create test files, or suggest doing either. Do that only
when the task asks for it.

This skill decides how the specification reads. It never decides how a runner,
generator, or step library works, and it is not a reason to change one.

Some projects add a generator with its own input contract. When one is present
as `references/<tool>.md`, its rules are additive and not optional for that
project: read it before writing. Delete that reference and this skill still
stands whole.

## The Feature is the client's document

It states what the business expects. Nothing else.

Banned: architecture, layers, classes, methods, use-case names, ports, adapters,
fakes, mocks, databases, tables, queues, endpoints, HTTP verbs, status codes, DOM
selectors, vendor names, framework names. A Feature must survive a full rewrite
of the implementation unchanged.

Use the project's existing domain vocabulary exactly. Never invent a synonym. If
a term is missing or ambiguous, ask — do not fill it in.

## Reformulating existing specs strips implementation by default

When asked to reformulate, migrate, or "make these specs fit this project", the
user does not have to tell you to drop the technical parts.

1. Find the business intent behind each spec.
2. Discard every step describing mechanism — clicks, requests, SQL, config,
   infrastructure, test doubles, internal APIs.
3. Rewrite what remains as business behavior.
4. Keep the coverage: every equivalence class, boundary, and failure the original
   exercised still needs a scenario.
5. Where mechanism was the only content, the observable business result becomes
   the scenario and the mechanism becomes the step implementation's problem.
6. Report what you dropped, so nothing disappears silently.

Do not preserve technical steps out of caution. They are the thing being removed.

## Shape

`Feature` is a capability, `Rule` one business rule, `Scenario` one observable
example of it. `Given` is prior state, `When` the single action, `Then` the
result.

- One observable fact per step; split the rest with `And` / `But`. A table
  holding one cohesive record or collection is still one fact.
- Every scenario stands alone. None may depend on another having run.
- Each `Examples` row is an independent example with its own result. A
  step-attached DataTable is one argument to one step, whatever its row count.
  Use Examples for behavioral variation, a DataTable for one cohesive record or
  collection.
- Titles are read on their own, in a runner report or a review: describe the
  outcome and its condition, never "happy path" or "case 1".
- `Background` only for a precondition shared by every scenario in its scope, and
  never for variable data, actions, or assertions. If a reader must scroll away
  to understand a scenario, repeat the condition instead.
- Tags are metadata. Do not assume they trigger behavior.

## Minimal inputs, complete coverage

Expose only values that drive or verify the behavior. Everything else is the step
implementation's job.

- Presence is a zero-input step: `Given the customer has a billing address`.
- Verify the relevant leaf only: `Then the billing address has postal code
  <postalCode>`.
- Never serialize an aggregate or reproduce a constructor in Gherkin.
- Never write blank cells, `null`, or `undefined`. Say it: `Given the customer
  has no billing address`.
- Express rejections semantically: `Then adding the product is rejected because
  the purchase limit is reached`. Use exact message text only when the wording is
  itself contractual.

Rows sharing intent and outcome belong in one Outline. A boundary that flips the
outcome belongs in its own Scenario under the same Rule.

## Markdown Gherkin

In `.feature.md`, Cucumber gives meaning only to `Feature`, `Background`, `Rule`,
`Scenario`, `Scenario Outline` and `Examples` headings, to `Given` / `When` /
`Then` / `And` / `But` steps, and to tags in backticks. Everything else stays
ordinary Markdown, so the file renders as a document.

Two mistakes are accepted silently and corrupt the specification:

- **Indent every table row by at least two spaces.** Without it Cucumber ignores
  the table entirely.
- **Never write a Markdown separator row** (`| --- |`). Cucumber reads it as a
  data row, in `Examples` too.

Backticks around a placeholder protect Markdown rendering. They never declare a
type, and neither do quotes.

See [the authoring guide](references/authoring-guide.md) for worked examples.

## Foundations

- [Cucumber: Better Gherkin](https://cucumber.io/docs/bdd/better-gherkin/)
- [Cucumber: Markdown with Gherkin](https://github.com/cucumber/gherkin/blob/main/MARKDOWN_WITH_GHERKIN.md)
- [Andre de Sousa: Gherkin Best Practices](https://github.com/andredesousa/gherkin-best-practices)
- [Robert C. Martin: Pickled State](https://blog.cleancoder.com/uncle-bob/2018/06/06/PickledState.html)
