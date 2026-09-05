# Input Contract: feat2test

Project-specific. Additive to [the skill](../SKILL.md), and not optional when the
specification feeds this generator. Delete this file if the skill moves to a
project that does not use it.

The generator is a literal translator. It infers nothing: your Gherkin text *is*
the test name, the method name, and the parameter list.

## Parameters

**They come only from `<placeholder>`.** Nothing else. A quoted literal is part
of the step's words, so `When the user enters "12+3"` produces
`theUserEnters123()` with no input at all.

**Any step input requires `Scenario Outline` + `Examples`**, even with one row.
Plain `Scenario` only when every step takes zero inputs — and do not promote one
to an Outline for uniformity. A placeholder with no matching column fails with
`UNKNOWN_PLACEHOLDER`.

**Each placeholder becomes one plain parameter**, in order of appearance. A
DataTable adds `table: string[][]`, a DocString adds `text: string`. No option
objects, no generated type aliases.

**Every value arrives as `string`.** Types are never inferred, not even from a
uniformly numeric column. Conversion belongs in the step implementation.

## Method names

**The literal words with placeholders removed**, camel-cased:

```text
When value <value> is formatted for language <language>
  → valueIsFormattedForLanguage(value: string, language: string)
```

Prepositions, actors and modals all survive into the name — there is no
linguistic rewriting, so read the step aloud as a method name before committing
to it. To get a better method name, write a better step.

**Identity is the literal words.** Steps whose words normalize the same are one
method and must agree: the same wording as both `Given` and `Then` fails with
`CONFLICTING_STEP_ROLE`, and with different placeholders fails with
`CONFLICTING_STEP_INPUTS`. Rewording renames the method, and the Step Adapter is
scaffolded once and never rewritten — so the old method stays behind and
TypeScript reports the one that no longer exists. Reword deliberately.

## Traps

Silent corruption, all verified against the generator:

- **Backticks are never stripped from values.** They are safe only inside a step
  sentence — `` * Then display shows `<display>` `` — where the value comes from
  the Examples row. Inside a DataTable cell or a Scenario title they leak: the
  step receives `` '`Pencil`' `` and the test is named ``Display `1234.56` ``.
  Write the bare `<placeholder>` there.
- **Dotted paths do not build objects.** `<order.lines[0].product.name>` flattens
  to `orderLines0ProductName: string`, and the index becomes part of the
  parameter name — so reusing that step with `lines[1]` in another scenario fails
  with `CONFLICTING_STEP_INPUTS`. Name the leaf (`<unavailableProduct>`) and
  reshape a DataTable into domain objects inside the step implementation.
- **The extension picks the parser**: `.md` is Markdown Gherkin, anything else is
  classic. Markdown Gherkin is English only; a `# language:` header works only in
  classic `.feature` files.

Each of these is a deliberate omission, not a bug. Do not change generator code
to remove one unless the active task explicitly authorizes it.

## Worked output

```markdown
### Scenario Outline: Display <value> using <language>

* When value `<value>` is formatted for language `<language>`
* Then display shows `<formatted>`

#### Examples:

  | value | language | formatted |
  | 1234.56 | Spanish | 1.234,56 |
```

```ts
test('Display 1234.56 using Spanish', async () => {
  const steps = createSteps()

  // When value `1234.56` is formatted for language `Spanish`
  await steps.valueIsFormattedForLanguage('1234.56', 'Spanish')
  // Then display shows `1.234,56`
  await steps.displayShows('1.234,56')
})
```

A DataTable arrives as a header row plus data rows, all strings:

```markdown
* Given the order contains:
  | product | quantity |
  | <orderedProduct> | <orderedQuantity> |
* And product <unavailableProduct> is unavailable
```

```ts
await steps.theOrderContains([
  ['product', 'quantity'],
  ['Pencil', '2'],
])
await steps.productIsUnavailable('Notebook')
```

Turning that matrix into domain objects is the step implementation's job. See
`examples/order-confirmation` for a nested collection rebuilt this way.
