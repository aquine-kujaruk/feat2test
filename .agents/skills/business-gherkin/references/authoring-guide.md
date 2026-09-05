# Authoring Guide

Worked examples for [the skill](../SKILL.md). Adapt the shape, not the domain
terms.

## Zero inputs — plain Scenario

```markdown
# Feature: Order confirmation

## Rule: An eligible order can be confirmed

### Scenario: Confirm an eligible order

* Given an order is eligible for confirmation
* When the customer confirms the order
* Then the order is confirmed
```

The step implementation supplies whatever the rule does not care about.

## Scalar inputs — Outline, even with one row

```markdown
# Feature: Number formatting

## Rule: Values follow the selected language conventions

### Scenario Outline: Display <value> using <language>

* When value `<value>` is formatted for language `<language>`
* Then display shows `<formatted>`

#### Examples:

  | value | language | formatted |
  | 1234.56 | Spanish | 1.234,56 |
```

Language is data, not a second Feature. Keeping the variation in `Examples` is
what stops one behavior from being written twice.

## Boundaries — same Rule, different Scenario

Rows sharing an outcome stay together; the row that flips it gets its own
Scenario. The product needs no input, because its identity cannot change the
result.

```markdown
# Feature: Cart quantities

## Rule: A cart line accepts at most ten units

### Scenario Outline: Accept quantity <quantity> within the purchase limit

* Given the cart is empty
* When the customer adds `<quantity>` units of the product
* Then the cart contains `<quantity>` units of the product

#### Examples:

  | quantity |
  | 9 |
  | 10 |

### Scenario Outline: Reject quantity <quantity> above the purchase limit

* Given the cart is empty
* When the customer adds `<quantity>` units of the product
* Then adding the product is rejected because the purchase limit is reached

#### Examples:

  | quantity |
  | 11 |
```

## Presence, absence, and the relevant leaf

```markdown
* Given the customer has a billing address
* Given the customer has no billing address
* Then the billing address has postal code `<postalCode>`
```

The first two take no input at all: the implementation builds a valid customer,
with or without an address. The third names only the value the rule verifies —
never the whole address, and never a blank cell standing in for "missing".

## Collections — a DataTable of one cohesive set

```markdown
### Scenario Outline: Reject an order requesting unavailable <unavailableProduct>

* Given the order contains:
  | product | quantity |
  | <orderedProduct> | <orderedQuantity> |
* And product <unavailableProduct> is unavailable
* When the customer confirms the order
* Then order confirmation is rejected because a requested product is unavailable

#### Examples:

  | orderedProduct | orderedQuantity | unavailableProduct |
  | Pencil | 2 | Notebook |
```

Name the leaf that matters (`unavailableProduct`), not a path into the object
graph. Rebuilding lines, products and prices from the table is the step
implementation's job — that structure is not the business reader's problem.

## One observable fact per step

```markdown
* Then the order is confirmed
* And payment is recorded
* And the customer receives confirmation
```

Not `Then the order is confirmed, payment is recorded, and the customer receives
confirmation`. A single table holding one address, or one collection of order
lines, is still one fact.

## Intent, never mechanism

```markdown
* When the customer confirms the order
* Then the order is confirmed
```

Not:

```markdown
* When the customer clicks the confirm button
* And a POST request is sent
* Then the orders table contains a confirmed row
```

Naming the use-case class is mechanism too. The business sentence carries the
intent; the step implementation connects it to the system.

## Coverage sketch

Optional. When coverage feels incomplete, sketch business states against the
action to find the missing scenarios — not to document them, and not to generate
every permutation.

```text
Pending   x Confirm order -> Confirmed
Confirmed x Confirm order -> Unchanged
Cancelled x Confirm order -> Rejected
```
