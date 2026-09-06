# Authoring Guide

Worked examples for [the skill](../SKILL.md). They teach sentence structure and
reasoning, not a taxonomy to copy. The supplied specification and its established
vocabulary always take precedence over the example domains.

## Decomposition — relationships and their values

A compound fact hides several independently variable properties. This fragment
bundles product count, quantity per product, and delivery method:

```markdown
* Given the order contains three distinct products, five units of each, with standard delivery
```

Separate the properties and identify their arguments before writing the example:

| Relationship template | Example argument values |
| --- | --- |
| the order contains `<productCount>` distinct products | productCount = 3 |
| the order contains `<unitsPerProduct>` units of each product | unitsPerProduct = 5 |
| the order uses `<deliveryMethod>` delivery | deliveryMethod = standard |

This is an explanatory Markdown table, not a Gherkin DataTable. The three
relationships become separate conditions when all are relevant. In an Outline,
bind their arguments through `Examples`, even if a value stays constant.

When a particular product matters, use "the order contains `<quantity>` units
of product `<product>`". Product identity and quantity are arguments. Changing
Pencil to Notebook preserves the wording. Keep the subject in the fact instead
of adding a "select product" action.

Units and the qualifier "distinct" belong to their relationships. Keep them:
three distinct products are not three units. If the use case must discover a
count, supply the collection to count. If it accepts an existing order with
quantities, those quantities are valid prior facts. Decomposing them does not
justify directing an internal counting procedure.

## Written numbers — negatives and rejection reasons

Scan whole sentences for values, including numbers written as words. `ten`
and `fourth` carry the same example data as `10` and `4`. Negating a fact or
explaining a rejection does not make its arguments part of the relationship.

These fragments show the relevant transformations:

| Before | After |
| --- | --- |
| the fourth question has no answer | question `<questionNumber>` has no answer |
| the submission is rejected because the phone number does not have ten digits | the submission is rejected; the rejection is due to the phone number not having `<requiredDigits>` digits |
| the submission is rejected because the fourth question has no answer | the submission is rejected; the rejection is due to a missing answer to question `<questionNumber>` |

The semicolons above separate two proposed assertions, not clauses to put into
one Gherkin sentence. Bind the arguments and keep the cause observable:

```markdown
# Feature: Form submission

This form requires a ten-digit phone number and an answer to the fourth question.
A rejection reports its cause and preserves the entered answers.

## Rule: The phone number must have ten digits

### Scenario Outline: Reject a submission because "`<phoneNumber>`" has the wrong length

* Given the form contains the phone number "`<phoneNumber>`"
* And question `<questionNumber>` has the answer "`<answer>`"
* When the user submits the form
* Then the submission is rejected
* And the rejection is due to the phone number not having `<requiredDigits>` digits
* And the form preserves its answers

#### Examples:

  | phoneNumber | requiredDigits | questionNumber | answer |
  | 123456789 | 10 | 4 | Yes |
  | 12345678901 | 10 | 4 | Yes |

## Rule: The fourth question requires an answer

### Scenario Outline: Reject a submission without an answer to question `<questionNumber>`

* Given the form contains the phone number "`<phoneNumber>`"
* But question `<questionNumber>` has no answer
* When the user submits the form
* Then the submission is rejected
* And the rejection is due to a missing answer to question `<questionNumber>`
* And the form preserves its answers

#### Examples:

  | phoneNumber | questionNumber |
  | 1234567890 | 4 |
```

The required ten and the question position four remain fixed by their rules.
`requiredDigits` describes the expected diagnostic, not a configurable policy;
`phoneNumber` is the source text the form must examine. Positive and negative
answer facts use the same question argument. `But` does not replace the explicit `no`.
Rejecting without the diagnostic would no longer cover the same behavior. Merely
listing the required length is insufficient: the rejection must identify the
length violation as its cause, not attach an unrelated policy reminder.

Do not specialize a fact because its data violates a rule. A phone number with
nine digits still uses `the form contains the phone number "<phoneNumber>"`.
Adding "not ten" to this prior fact repeats a conclusion the use case must reach.
Keep the failed requirement in the rejection's cause. `But` can introduce a
positive fact when it expresses a contrast; it does not require extra negation.

## Relative positions — preserve the selector

`last` selects an item relative to its collection. It is not a fixed ordinal.
Use an argument for that selector without changing its meaning:

```markdown
# Feature: Shopping list items

## Rule: Removing an item preserves the other items and their order

### Scenario Outline: Remove the `<position>` item

* Given the shopping list contains, in order:
  | item |
  | <firstItem> |
  | <middleItem> |
  | <lastItem> |
* When the customer removes the `<position>` item
* Then the shopping list contains, in order:
  | item |
  | <remainingFirst> |
  | <remainingLast> |

#### Examples:

  | position | firstItem | middleItem | lastItem | remainingFirst | remainingLast |
  | last | Milk | Bread | Eggs | Milk | Bread |
  | first | Milk | Bread | Eggs | Bread | Eggs |
```

Here `position` binds a relative position and `lastItem` identifies an item in
the initial collection. The last item happens to be third in these examples;
a longer list would have another last position. Use an absolute position only
when that is the relationship the example needs. A named concept such as
"standard delivery" likewise remains a domain concept, even if its definition
contains a duration; do not replace the concept with an incidental number.

The table heading `item` names a field of the collection. Bindings such as
`firstItem`, `lastItem`, and `remainingFirst` identify values within this example;
they all supply that same field without becoming new relationships. Replacing
them all with `<item>` would force distinct entries to share one Examples value.
Stable table headings make this correspondence explicit while preserving the
different bindings. Use a table when the records form a cohesive collection.
Equivalent scalar facts can also retain distinct local names when needed;
review their meanings and correspondence rather than requiring identical names.

## Concise wording — preserve the claim

Use the shortest grammatical sentence that preserves the domain relationship.
Prefer a direct verb and a specific subject. Review nested clauses, repeated
context, and explanations that merely expand a term already defined in a rule.
The literal wording should identify the fact or action when its argument values
are hidden; a reader should not need to decode abbreviations or generic labels.

| Before | After, when supported by the existing rule and vocabulary |
| --- | --- |
| the order is rejected because the delivery address does not include both a street and a house number | the order is rejected for an incomplete delivery address |
| the form indicates that all required fields have answers | the form indicates that it is complete |

The first rewrite applies only when "incomplete delivery address" already means
that the address lacks a street, a house number, or both. Keep separate examples
for a missing street with a house number present, and a missing house number
with a street present. "Does not include both a street and a house number"
negates their conjunction; it must not become two assertions demanding that both
be missing. The rejection still names its cause.

In the second rewrite, "complete" must already mean that every required field
has a response. It says nothing about the format of those responses. Keep the
length check for the phone number separate: a complete form can still contain an
invalid phone number. If this meaning is not established, retain the explicit
claim; do not invent a "valid form" status to shorten the sentence.

Do not move a whole proposition into an argument just to shorten the wording.
For example, `the submission is rejected because <reason>` with the value
"the fourth question has no answer" still hides a relation and its position
inside prose. A named reason can be an argument when the domain already defines
that category; any relevant quantity or location remains a separate argument.

Precision takes priority over length. Retain `no`, `only`, `all`, `except`,
units, temporal scope, and required causes. Articles and necessary prepositions
keep the sentence grammatical. Never change domain terms, erase diacritics,
or concatenate words to make the specification resemble code.

## A single example — explicit arguments

One concrete example can instantiate a reusable relationship. The quantity is
an argument in both the action and its result.

```markdown
# Feature: Cart quantities

## Rule: A cart line accepts at most ten units

### Scenario Outline: Accept `<quantity>` units within the purchase limit

* Given the cart is empty
* When the customer adds `<quantity>` units of the product
* Then the cart contains `<quantity>` units of the product

#### Examples:

  | quantity |
  | 5 |
```

The example exercises a business action and observes its result. A single row
is enough; extra cases need a behavioral reason. The product's identity is
omitted because it does not affect this rule. A plain Scenario remains suitable
when no scalar arguments are needed, such as emptying an already empty cart.

## Variations — Scenario Outline

Add rows when several examples share the same intent and kind of outcome.

```markdown
# Feature: Number formatting

## Rule: Values follow the selected language conventions

### Scenario Outline: Display `<value>` using `<language>`

* When value `<value>` is formatted for language `<language>`
* Then display shows `<formatted>`

#### Examples:

  | value | language | formatted |
  | 1234.56 | Spanish | 1.234,56 |
  | 1234.56 | English | 1,234.56 |
```

The action stays the same while the applicable language convention changes.
These examples expose the variation without prescribing its implementation.
Formatting is an observation: it does not require a business-state mutation.

## Boundaries — same Rule, different Scenario

Rows sharing an outcome stay together; the example that flips it gets its own
Outline. Ten stays fixed in the rule; the requested quantity is an argument,
including the row whose value is ten. The customer does not choose the limit.
The prior quantity also matters: the limit applies to the resulting cart line.

```markdown
# Feature: Cart quantities

## Rule: A cart line accepts at most ten units

### Scenario Outline: Accept `<quantity>` units with `<initialQuantity>` already in the cart

* Given the cart initially contains `<initialQuantity>` units of the product
* When the customer adds `<quantity>` units of the product
* Then the cart contains `<resultingQuantity>` units of the product

#### Examples:

  | initialQuantity | quantity | resultingQuantity |
  | 0 | 9 | 9 |
  | 0 | 10 | 10 |
  | 4 | 6 | 10 |

### Scenario Outline: Reject `<quantity>` units with `<initialQuantity>` already in the cart

* Given the cart initially contains `<initialQuantity>` units of the product
* When the customer adds `<quantity>` units of the product
* Then adding the product is rejected because the purchase limit is reached
* And the cart still contains `<initialQuantity>` units of the product

#### Examples:

  | initialQuantity | quantity |
  | 0 | 11 |
  | 4 | 7 |
```

The same action keeps the same wording and argument in both outcomes. The
rejection names the violated rule and observes the preserved state. Replacing
the two outcomes with a generic assertion such as "the result is `<result>`"
would hide these distinctions.

`initialQuantity`, `quantity`, and `resultingQuantity` have different meanings
even where their values coincide. Reusing `initialQuantity` in the rejection's
consequence expresses preservation. Zero is relevant here: it establishes an
empty initial quantity without an implicit default.

## Presence, absence, and the relevant property

```markdown
* Given the customer has a billing address
* Given the customer has no billing address
* Then the billing address has postal code `<postalCode>`
```

These are alternative examples of phrasing, not conditions to combine. The first
two state presence or absence without incidental address details. The third
is an Outline template: bind `postalCode` to a concrete value such as 28013 in
`Examples`. It names only the property the rule verifies.

## Collections — a DataTable of one cohesive set

```markdown
# Feature: Order confirmation

## Rule: Every requested product must be available for confirmation

### Scenario Outline: Reject an order containing unavailable `<unavailableProduct>`

* Given the order contains:
  | product |
  | <availableProduct> |
  | <unavailableProduct> |
* And product `<availableProduct>` is available
* But product `<unavailableProduct>` is unavailable
* When the customer confirms the order
* Then order confirmation is rejected because a requested product is unavailable

#### Examples:

  | availableProduct | unavailableProduct |
  | Pencil | Notebook |
```

The table describes the contents of one order. The unavailable product is part
of that order, so its unavailability explains the rejection. `But` contrasts the
two products' availability while continuing the prior conditions; it does not
negate the sentence automatically.

The product references stay consistent between the collection and its conditions.
Placeholders inside the DataTable are bare; adding backticks there would make
the backticks part of the product names. The `Examples` values are plain data too.

## Coherent domain facts

```markdown
* Given the parcel is oversized
* And the destination is outside the delivery area
```

Size and destination are independent conditions. Keep them separate. Conversely,
when eligibility for a service depends on a domain category such as "oversized",
use that term. Expand its defining measurements only in examples about the
category's thresholds.

Every condition must remain true alongside the others. For example, an order
cannot contain an unavailable product while all its requested products are
available. Make exceptions explicit and keep the subject of each condition clear.

## Source inputs — let the use case establish the result

When a form counts words in a comment, begin with the entered text. This example
uses native `.feature` syntax:

```gherkin
Feature: Word counts for comments

  Rule: Words are nonempty groups of characters separated by spaces

    Scenario Outline: Report <wordCount> words for "<text>"
      Given the comment contains "<text>"
      When the user requests the comment word count
      Then the word count is <wordCount>

      Examples:
        | text       | wordCount |
        | red        | 1         |
        | red blue   | 2         |
        | red   blue | 2         |
```

The rows distinguish one word, multiple words, and repeated separators. Starting
with "the comment has already been divided into words" would assume the work
being examined. Directing the user to split, filter, and count would prescribe
the algorithm. The business action remains requesting the word count.

A derived fact can still be appropriate prior state for a different rule. A saved
order total may be relevant to a delivery discount if that use case accepts an
order whose total has already been established. Check the actual boundary rather
than treating every derived property as forbidden or silently changing what the
user supplies.

## Business use cases and observable consequences

```markdown
* When the customer confirms the order
* Then the order is confirmed
```

Avoid:

```markdown
* When the customer clicks the confirm button
* And a POST request is sent
* Then the orders table contains a confirmed row
```

The first example names the business use case and its result. In the Detroit
approach, the domain's actual behavior is exercised through that use case.
Internal call sequences and component interactions are outside the specification.
Naming the class that implements the use case would also expose mechanism.

## Coverage sketch

Optional. When coverage feels incomplete, sketch business states against the
action to find the missing scenarios — not to document them, and not to generate
every permutation.

```text
Pending   x Confirm order -> Confirmed
Confirmed x Confirm order -> Unchanged
Cancelled x Confirm order -> Rejected
```

Each scenario supplies one concrete example of a transition or observation.
For rejection, include any relevant preserved state. For a query, identify the
observable answer; no mutation is needed. Independent examples never rely on
the preceding scenario to establish their initial state.
