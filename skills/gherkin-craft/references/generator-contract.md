# Generator step contract

Read before writing or reviewing any step. feat2test turns each Feature into a
Feature Test that only calls steps, and a Step Adapter with one method per
distinct step name. These rules are mechanical; breaking them either fails
generation or silently produces the wrong methods.

## A step's name is its method

Every step ends with one HTML comment holding its adapter method name:

```gherkin
Feature: Add units
  Scenario Outline: Add <quantity> units
    Given an empty cart <!-- emptyCart -->
    When <quantity> units are added <!-- addUnits -->
    Then the cart contains <quantity> units <!-- cartContains -->

    Examples:
      | quantity |
      | 2        |
```

The name is the step's identity; the words before it are documentation. The
comment closes the step line, after any placeholder; a DataTable or DocString
follows on the next lines. Markdown preview hides it, while the `.feature.md`
source and native `.feature` files show it.

| Step text | Method |
| --- | --- |
| `the cart holds <quantity> items <!-- cartHolds -->` | `cartHolds(quantity: string)` |
| `the cart contains <quantity> items <!-- cartHolds -->` | `cartHolds(quantity: string)` |
| `el carrito contiene <quantity> artículos <!-- cartHolds -->` | `cartHolds(quantity: string)` |
| `the cart holds <quantity> items <!-- cartStillHolds -->` | `cartStillHolds(quantity: string)` |
| `the cart holds 2 items <!-- cartHoldsTwoItems -->` | `cartHoldsTwoItems()` |

So:

- Steps with one name call one method, whatever their words or language.
  Steps with different names are different methods, even with identical words.
  Give one fact one name across the Feature.
- Rewording a step keeps its method and implementation. Renaming it creates a
  new pending method and drops the old one once no step uses it. Changing only
  Examples values keeps the method and its implementation.
- A value that varies between examples is a placeholder, not a word. A literal
  `2 items` is part of the documentation, never a parameter.
- Names are English unless the user explicitly asks otherwise, and
  representative: they state the action or fact (`confirmOrder`,
  `orderTotal`), never a position or filler (`step1`, `doIt`).

## Names the generator accepts

The generator checks only the identifier format: `^[a-z][A-Za-z0-9]*$`, and
not a JavaScript reserved word. It cannot tell whether a name is English or
representative; that judgment is the author's.

- A step without a trailing name comment fails with `MISSING_STEP_NAME`.
- A name with spaces, hyphens, accents, a leading digit or capital, or a
  reserved word such as `delete`, fails with `INVALID_STEP_NAME`. So does a
  second comment in the same step, or a comment that does not end it.

Both name the source, line and step, and are reported before any file is
written. A trailing HTML comment in a step is always read as its name; put
explanations in a description or a comment line instead.

## Inputs become parameters

- Each distinct `<name>` in the step text becomes a `string` parameter, in
  order of first occurrence. A placeholder repeated in one step is one
  parameter. The parameter name is the placeholder name with its first letter
  lower-cased and any character that cannot appear in an identifier removed.
- A DataTable becomes a final `table: string[][]` parameter: every row,
  including the header, as strings.
- A DocString becomes a final `text: string` parameter.
- Every value arrives as a string. Numbers, money and dates are parsed by the
  adapter, never by the generator.

The parameter list is part of the signature. The same name used with a
different placeholder name, or once with a DataTable and once without, fails
with `CONFLICTING_STEP_INPUTS`.

## Keywords set the role

`Given` is Context, `When` is Action and `Then` is Outcome. `And`, `But` and
`*` inherit the role of the previous step; a scenario that starts with `*`
starts in Context. Background steps run first in every scenario. The same
name with two roles, for example `<!-- orderConfirmed -->` on a Given and on a
Then, fails with `CONFLICTING_STEP_ROLE`. Rename one of them.

## Examples bind placeholders

Each Examples row becomes one test and supplies the values for every
placeholder in that expansion. Repeated titles are numbered (`#2`, `#3`). The
name comment is never a placeholder.

- A placeholder in the step text with no Examples column, or in a plain
  `Scenario`, fails with `UNKNOWN_PLACEHOLDER`.
- A placeholder in a scenario title or a DataTable cell with no column does
  **not** fail: it stays as the literal text `<name>` in the test name or the
  table value. Check those bindings by hand.

## Generated tests only call steps

The Feature Test is rewritten on every generation and contains no
assertions. Each step becomes one call, in order, with its values as string
literals, below a comment with its keyword and words but not its name. Every
check lives in the adapter method of a Then step, which receives nothing but
its parameters. A Then step therefore carries the value it checks
(`the order total is <total> <!-- orderTotal -->`), never a judgment the
method cannot compute from its inputs
(`the total is correct <!-- totalIsCorrect -->`).

## Tags are ignored

Feature, Rule and Scenario tags are parsed and discarded. They do not change
the generated test, the adapter or the runner.

## Check with the generator

```bash
npx feat2test validate <feature> --runner vitest --json
npx feat2test validate --text '<feature text>' --format feature --source draft.feature --runner vitest --json
```

Use `--format mdg` for Markdown, or `--stdin` instead of `--text`. Validation
writes nothing. It reports `scenarioCount` (expanded examples), `stepCount`
(distinct methods), warnings for table rows that will not parse as intended
(a separator row in a native file, a Markdown row without two leading spaces),
and the diagnostics above. It proves generability only, not that the
specification is right.
