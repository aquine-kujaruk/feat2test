# Generator step contract

Read before writing or reviewing any step. feat2test turns each Feature into a
Feature Test that only calls steps, and a Step Adapter with one method per
distinct step. These rules are mechanical; breaking them either fails
generation or silently produces the wrong methods.

## A step's words are its method

The literal words of a step, with its `<placeholders>` removed, become the
adapter method name in camelCase. Letters and digits count; punctuation,
quotes, backticks, accents and the case of each word's first letter do not.

| Step text | Method |
| --- | --- |
| `the cart holds <quantity> items` | `theCartHoldsItems(quantity: string)` |
| ``The cart, holds "`<quantity>`" items`` | `theCartHoldsItems(quantity: string)` |
| `the cart holds 2 items` | `theCartHolds2Items()` |
| `the cart contains <quantity> items` | `theCartContainsItems(quantity: string)` |

So:

- One fact keeps one wording everywhere in the Feature. Two wordings of the
  same fact become two methods, each implemented separately.
- A value that varies between examples is a placeholder, not a word. A literal
  digit in the text is part of the method name; `2 items` and `3 items` are two
  methods with no parameters.
- Rewording a step creates a new pending method and drops the old one once no
  step uses it. Changing only Examples values keeps the method and its
  implementation.

## Inputs become parameters

- Each distinct `<name>` in the step text becomes a `string` parameter, in
  order of first occurrence. A placeholder repeated in one step is one
  parameter. The parameter name comes from the placeholder name.
- A DataTable becomes a final `table: string[][]` parameter: every row,
  including the header, as strings.
- A DocString becomes a final `text: string` parameter.
- Every value arrives as a string. Numbers, money and dates are parsed by the
  adapter, never by the generator.

The parameter list is part of the signature. The same words used with a
different placeholder name, or once with a DataTable and once without, fail
with `CONFLICTING_STEP_INPUTS`.

## Keywords set the role

`Given` is Context, `When` is Action and `Then` is Outcome. `And`, `But` and
`*` inherit the role of the previous step; a scenario that starts with `*`
starts in Context. Background steps run first in every scenario. The same
words with two roles, for example `the order is confirmed` as a Given and as a
Then, fail with `CONFLICTING_STEP_ROLE`. Reword one of them.

## Examples bind placeholders

Each Examples row becomes one test and supplies the values for every
placeholder in that expansion. Repeated titles are numbered (`#2`, `#3`).

- A placeholder in the step text with no Examples column, or in a plain
  `Scenario`, fails with `UNKNOWN_PLACEHOLDER`.
- A placeholder in a scenario title or a DataTable cell with no column does
  **not** fail: it stays as the literal text `<name>` in the test name or the
  table value. Check those bindings by hand.

## Generated tests only call steps

The Feature Test is rewritten on every generation and contains no
assertions. Each step becomes one call, in order, with its values as string
literals. Every check lives in the adapter method of a Then step, which
receives nothing but its parameters. A Then step therefore carries the value
it checks (`the order total is <total>`), never a judgment the method cannot
compute from its inputs (`the total is correct`).

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
