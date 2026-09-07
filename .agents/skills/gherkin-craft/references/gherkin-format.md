# Format and language

Read for all authoring and review. Preserve the requested representation;
formatting choices must not change the domain claim.

## Language

English is the default. Another language requires an explicit request, including
an explicit request to retain an existing specification's language. Apply the
choice to titles, descriptions, sentences, and argument names. Preserve proper
names, identifiers, contractual literal data, and terms required verbatim.
Use established translations consistently; resolve material ambiguity from
context or ask. Teaching examples in this skill remain English.

For non-English output, use native `.feature` unless the user explicitly
requires Markdown. Begin native output with `# language: <code>` using a
supported Gherkin dialect, then use that dialect's keywords throughout. The
directive is literally `language`, not a tag or YAML. English uses `en` and
needs no declaration.

If non-English Markdown is explicitly required, resolve the consumer's external
dialect configuration before claiming valid output. A native per-file language
directive does not configure Cucumber's Markdown dialect. Explain the constraint
and offer native `.feature` when a self-contained declaration is needed; do not
silently switch a requested format or invent a Markdown language attribute.

## Common structure

- A Feature contains one use case; Rule groups one governing rule; Scenario is
  one observable example. When writing files, give each Feature its own file.
- Given supplies prior facts; When names the whole action or query; Then states
  its answer and relevant changed or preserved facts. And/But continue the
  preceding role. But provides contrast, not automatic negation.
- Each Examples row is independent. Group rows by intent and kind of outcome;
  acceptance and rejection use different scenarios within the same use case.
- A Scenario Outline exposes meaningful scalar arguments even for one row.
  Every placeholder has a concrete Examples binding, including occurrences in
  titles, DataTables, and consequences. Plain Scenarios suit argument-free cases.
- DataTables describe a cohesive record or collection within one example;
  Examples tables describe behavioral variation. Use Doc Strings for coherent
  source text. Do not serialize an aggregate or reproduce a constructor.
- Titles state the outcome and relevant condition, understandable on their own.
  Avoid “happy path” and numbered case labels as their only meaning.
- Background contains only preconditions shared by every example in its scope,
  never varying data, actions, or assertions. Prefer repetition when it avoids
  making the reader search for essential context. Tags are metadata.
- Use concrete values, digits for numerical counts/positions, and explicit
  presence or absence. Do not use blank cells or nullish stand-ins for missing
  facts. Preserve literal source content when it is actually being examined.

## Native `.feature`

Use native keyword structure, indentation for readability, and ordinary bare
Outline placeholders. A DataTable follows its step. Do not add Markdown heading
markers, bullet steps, or Markdown separator rows.

Place bare asset tags on the line before `Feature`, for example:

```gherkin
@skill @plugin
Feature: Review a proposed change
```

For a non-English native file, keep `# language: <code>` first, then tags before
the translated Feature keyword. Target meanings and selection belong to
[verification targets](verification-targets.md).

## Markdown `.feature.md`

Use Gherkin headings and bullet steps, for example `# Feature:`, `## Rule:`,
`### Scenario Outline:`, `#### Examples:`, and `* Given ...`. Use native syntax
only in native files; a fenced native document is not Markdown Gherkin structure.
Only recognized headings, steps, tables, and backtick tags have Gherkin meaning;
other prose remains documentation.

Place each Feature tag in its **own** backtick span before the Feature heading:

```markdown
`@skill` `@plugin`
# Feature: Review a proposed change
```

A single span containing `@skill @plugin` parses as one compound tag, losing
the intended two-target classification. Native bare tag syntax in Markdown is
ordinary prose. Keep applicable unrelated tags alongside the target tags.

Two mistakes may parse successfully while corrupting the interpreted examples:

- Indent **every table row by at least two spaces**. Otherwise a table may be
  ignored.
- Never add a Markdown separator row (`| --- |`) to a Gherkin table. It becomes
  a data row, including in Examples.

Backticks around placeholders in headings or sentences protect their Markdown
rendering. Inside Examples cells, DataTable cells, and Doc String contents, use
plain values and bare placeholders. Formatting backticks there become literal
data. Ordinary explanatory Markdown tables outside specifications can use normal
Markdown separators; do not confuse them with Gherkin tables.

## Verify interpretation

Where parsing is available, inspect scenario and expanded-example counts,
Feature tags and their inheritance by expanded scenarios, bindings, selected
dialect, and resulting step/table values. Check all intended
rows survived and formatting did not become data. Successful parsing is not a
semantic review and does not demonstrate domain execution.

## References

- [Gherkin reference](https://cucumber.io/docs/gherkin/reference/)
- [Spoken languages](https://cucumber.io/docs/gherkin/reference/#spoken-languages)
- [Markdown with Gherkin](https://github.com/cucumber/gherkin/blob/main/MARKDOWN_WITH_GHERKIN.md)
- [Markdown dialect selection](https://github.com/cucumber/gherkin/blob/main/javascript/src/GherkinInMarkdownTokenMatcher.ts)
