# Authoring guide

These constructed software examples teach decisions and formulations. Their
concepts, values, and rules are not requirements for the user's domain. Apply
[the generator contract](generator-contract.md) to every step and
[format and language](gherkin-format.md) to the chosen representation.

## Relationships, arguments, and roles

Separate facts that can vary independently. A collection's number of distinct
items, each item's quantity, and a chosen handling category are different facts.
A subject identity and its quantity can be arguments of one cohesive relationship:
`the tray contains <quantity> samples of <material> <!-- trayContains -->`. Keep
the subject explicit; do not add a selection action to establish an implicit
current subject.

Inspect words as well as digits: “third” and “three” can hide example arguments.
Inspect names too: a duration argument named `days` can obscure both quantity
and unit. A horizon, reporting interval, and recurrence interval remain different
roles even if all currently use the same unit and value. A named category such
as “double room” stays a category; do not reinterpret its name as a room count.

Separate reusable relationships from their values without dissolving them into
`the entity has <property> equal to <value> <!-- entityHas -->` or
`the actor performs <action> <!-- actorPerforms -->`.
A profile identity can select a strategy; changing that identity does not make
it a new lifecycle state. Infer the concept without inventing other profiles'
behavior or catalog administration.

## Fixed rules, source inputs, and diagnostic arguments

In this constructed form, submission requires a ten-digit phone number and an
answer to question 4. Rejection identifies its cause and preserves answers.

```markdown
# Feature: Submit a form

## Rule: Submission requires a ten-digit phone number and an answer to question 4

### Scenario Outline: Accept a complete submission with a valid phone number

* Given the form contains the phone number "`<phoneNumber>`" <!-- formHasPhoneNumber -->
* And question `<questionNumber>` has the answer "`<answer>`" <!-- questionHasAnswer -->
* When the user submits the form <!-- submitForm -->
* Then the submission is accepted <!-- submissionAccepted -->

#### Examples:

  | phoneNumber | questionNumber | answer |
  | 1234567890 | 4 | Yes |

### Scenario Outline: Reject a phone number with the wrong length

* Given the form contains the phone number "`<phoneNumber>`" <!-- formHasPhoneNumber -->
* And question `<questionNumber>` has the answer "`<answer>`" <!-- questionHasAnswer -->
* When the user submits the form <!-- submitForm -->
* Then the submission is rejected <!-- submissionRejected -->
* And the rejection is due to the phone number not having `<requiredDigits>` digits <!-- rejectedForPhoneDigits -->
* And the form preserves its answers <!-- formPreservesAnswers -->

#### Examples:

  | phoneNumber | requiredDigits | questionNumber | answer |
  | 123456789 | 10 | 4 | Yes |
  | 12345678901 | 10 | 4 | Yes |

### Scenario Outline: Reject a missing required answer

* Given the form contains the phone number "`<phoneNumber>`" <!-- formHasPhoneNumber -->
* But question `<questionNumber>` has no answer <!-- questionHasNoAnswer -->
* When the user submits the form <!-- submitForm -->
* Then the submission is rejected <!-- submissionRejected -->
* And the rejection is due to a missing answer to question `<questionNumber>` <!-- rejectedForMissingAnswer -->
* And the form preserves its answers <!-- formPreservesAnswers -->

#### Examples:

  | phoneNumber | questionNumber |
  | 1234567890 | 4 |
```

The fixed counts stay in the rule. `requiredDigits` binds the expected diagnostic,
not a selectable policy. `phoneNumber` supplies what the use case must examine;
“the number has the wrong length” would precompute the decision. Positive and
negative answer facts share their argument role. But does not replace `no`.
Acceptance and rejection remain one use case with different scenario outcomes.
The unspecified priority when both requirements fail is not invented here.

Never hide “question 4 has no answer” inside `<reason>`. Keep the missing-answer
relationship and its position visible. Named diagnostic categories may be
arguments when defined, but relevant values within a diagnosis remain explicit.
Exact message text matters only when its wording is contractual.

## Relative selectors and cohesive collections

This constructed operation removes the selected bead and preserves the others'
order. The collection describes one example; its rows are not separate scenarios.

```markdown
# Feature: Remove a bead from a strand

## Rule: Removing a selected bead preserves the other beads and their order

### Scenario Outline: Remove the `<position>` bead

* Given the strand contains, in order: <!-- strandContains -->
  | bead |
  | <firstBead> |
  | <middleBead> |
  | <lastBead> |
* When the `<position>` bead is removed from the strand <!-- removeBead -->
* Then the remaining strand holds, in order: <!-- remainingStrandHolds -->
  | bead |
  | <remainingFirst> |
  | <remainingLast> |

#### Examples:

  | position | firstBead | middleBead | lastBead | remainingFirst | remainingLast |
  | last | Amber | Glass | Shell | Amber | Glass |
  | first | Amber | Glass | Shell | Glass | Shell |
```

The prior and resulting collections use different names: one name on a Given
and a Then would be one adapter method with two roles, which the generator
rejects. `position` can bind `last` without fixing the collection's
length. Distinct local bindings identify simultaneous values of the `bead`
field. Renaming all of them `<bead>` would force different records to share one
value. Preserve known sets
as collections when that expresses the example best; these local scalar bindings
make the varying expected collection explicit, not a universal table schema.
For a fixed collection with no meaningful scalar variation, a plain Scenario
with a concrete DataTable can be clearer than many artificial columns.

A negative selector remains explicit:
`the <position> item has no answer <!-- itemHasNoAnswer -->`, with
`position = last`. Do not substitute an expected fixed ordinal or a blank cell.
When accepted inputs can have different lengths, vary lengths to exercise that
relative meaning where the source supports it.

## Records with identity, selected by Examples

When variation is by whole record rather than by one scalar, flattening each
record into placeholder columns (`<lines[0].product>`, `<lines[0].price>`,
`<lines[1].product>`…) fixes the record's length and makes the table unreadable
past two items. In this constructed order model, each order holds lines of a
product, a unit price, and a quantity; the total shows two decimals because it
is money; a zero price is a free sample; a repeated product adds up.

```markdown
# Feature: Confirm an order

## Rule: An order is confirmed when every requested product is available

### Scenario Outline: Confirm order <order> worth <total>

* Given these orders exist: <!-- ordersExist -->
  | order | product  | unitPrice | quantity |
  | 1     | Pencil   | 1.50      | 4        |
  | 1     | Notebook | 3.00      | 2        |
  | 2     | Pencil   | 0.10      | 3        |
  | 2     | Notebook | 0.00      | 1        |
  | 3     | Pencil   | 1.50      | 4        |
  | 3     | Pencil   | 1.50      | 4        |
* And every requested product is available <!-- allProductsAvailable -->
* When the customer confirms order `<order>` <!-- confirmOrder -->
* Then the order is confirmed <!-- orderConfirmed -->
* And the order total is `<total>` <!-- orderTotal -->

#### Examples: Usual order

  | order | total |
  | 1     | 12.00 |

#### Examples: Boundaries confirmed with the expert

  | order | total |
  | 2     | 0.30  |
  | 3     | 12.00 |
```

The DataTable keeps each order a cohesive collection with an identity; the
Examples table selects one by identity and states its outcome, so adding an
order of five lines widens nothing. Each row still supplies its own facts: the
table is part of the Given and belongs to every expanded scenario. The second
block exists for the reader: the expert checks the usual order first and then
the boundaries they answered. Order 2 binds "zero price adds nothing" and "two
decimals"; order 3 binds "a repeated product adds up". A row such as
`1.15 × 100 = 115.00` does not join them: no expert decided it, binary floating
point did, and it belongs to programmatic tests outside the specification.

## Different purposes, shared quantities

In this constructed coating model, material volume is area multiplied by
consumption per area; the factors use matching units. There is no conversion or
rounding policy. The whole use case estimates required material:

```gherkin
Feature: Estimate coating volume

  Rule: Required volume equals area multiplied by consumption per area

    Scenario Outline: Estimate <requiredVolume> <volumeUnit> for a surface
      Given the surface area is <area> <areaUnit> <!-- surfaceArea -->
      And coating consumption is <consumption> <volumeUnit> per <areaUnit> <!-- coatingConsumption -->
      When required coating volume is estimated <!-- estimateRequiredVolume -->
      Then required coating volume is <requiredVolume> <volumeUnit> <!-- requiredVolume -->

      Examples:
        | area | areaUnit | consumption | volumeUnit | requiredVolume |
        | 3    | m2       | 2           | L          | 6              |
        | 4    | m2       | 2           | L          | 8              |
```

A factor of 2 exposes an omitted multiplication that factor 1 would hide.
Units and quantity roles remain explicit, even if a unit has only one supported
value. This example does not authorize arbitrary units or conversions.

A separately requested sufficiency decision is another use case. It accepts an
already established requirement and available volume. Its comparison preserves
availability; determining the requirement is outside this particular boundary.

```gherkin
Feature: Check coating availability

  Rule: Available coating is sufficient when it meets the required volume

    Scenario Outline: Enough coating is available
      Given required coating volume is <requiredVolume> <volumeUnit> <!-- requiredVolume -->
      And available coating volume is <availableVolume> <volumeUnit> <!-- availableVolume -->
      When coating sufficiency is assessed <!-- assessSufficiency -->
      Then available coating is sufficient <!-- coatingSufficient -->
      And available coating volume remains <availableVolume> <volumeUnit> <!-- availableVolumeRemains -->

      Examples:
        | requiredVolume | availableVolume | volumeUnit |
        | 6              | 6               | L          |
        | 6              | 7               | L          |

    Scenario Outline: Available coating is insufficient
      Given required coating volume is <requiredVolume> <volumeUnit> <!-- requiredVolume -->
      And available coating volume is <availableVolume> <volumeUnit> <!-- availableVolume -->
      When coating sufficiency is assessed <!-- assessSufficiency -->
      Then available coating is insufficient <!-- coatingInsufficient -->
      And available coating volume remains <availableVolume> <volumeUnit> <!-- availableVolumeRemains -->

      Examples:
        | requiredVolume | availableVolume | volumeUnit |
        | 6              | 5               | L          |
```

Both Features share the meaning of required volume. Neither scenario relies on
another having run. Equality belongs to the accepted class; below it belongs to
rejection. The same quantity values in different roles do not justify merging
those arguments. A composition that chooses a coating plan could have its own
purpose if the source defines it; do not invent that process from these examples.

## Preserve logic and independent dimensions

“Does not include both a street and a house number” means at least one is missing.
It must not become two assertions requiring both to be absent. If “incomplete
address” already names that criterion, the shorter diagnosis can use it; retain
examples for each mixed state and both absent. Do not invent that term solely to
shorten a sentence.

Likewise, completeness does not imply validity: all required form answers can
be present while one answer violates its format. Keep those dimensions distinct.
A verdict can summarize established criteria; it cannot replace examples that
distinguish their failures. Use the shortest grammatical wording that preserves
subjects, `only`, `all`, `except`, negation, comparisons, units, timing and causes.
Length is a review signal, not an acceptance metric.

## Examine the actual input to a derivation

This constructed word-counting rule defines words as nonempty groups separated
by spaces. It does not require any particular splitting algorithm.

```gherkin
Feature: Count words in a comment

  Rule: Words are nonempty groups of characters separated by spaces

    Scenario Outline: Report <wordCount> words in a comment
      Given the comment contains "<text>" <!-- commentContains -->
      When the comment word count is requested <!-- requestWordCount -->
      Then the word count is <wordCount> <!-- wordCount -->

      Examples:
        | text       | wordCount |
        | red        | 1         |
        | red blue   | 2         |
        | red   blue | 2         |
```

Starting with an already computed word list would assume the work under
examination. For another use case that accepts a saved count, that count may be
appropriate prior state. Keep that boundary explicit.

## Discover coverage without inventing outcomes

Sketch state/event pairs from the source to find unanswered questions. Consider
mixed independent dimensions, repeated requests, refusals, observations, and
missing inputs. A query checks an answer; relevant preserved state may also be
part of its contract. Complete supported cases while identifying a missing conversion,
rounding, or transition rule separately. Do not invent a policy to fill the
sketch or claim exhaustiveness from the number of combinations.
