# Authoring guide

These constructed examples teach decisions and formulations. Their concepts,
values, and rules are not requirements for the user's domain. Apply
[domain discovery](domain-discovery.md) first and
[format and language](gherkin-format.md) to the chosen representation. Unless
another target is stated, the examples specify planned software through its
public use-case interface and therefore carry `@code`.

## Let the objective select the relevant source knowledge

Consider a constructed incident handbook: preserve reported symptoms; suggest a
next diagnostic without claiming it ran; summarize the supplied incident record
without adding facts. A separate chapter describes organizing staff training.

| Contextual objective | Relevant use case and observable outcome | Target |
| --- | --- | --- |
| A skill guiding an agent through investigation planning | Propose a next diagnostic grounded in the reported symptoms; retain what is still unknown and do not claim execution. | `@skill` |
| A prompt executed by a model to summarize an incident | Summarize the supplied record faithfully; unknown causes remain unknown. | `@prompt` |

The same source supplies different contracts. Neither objective authorizes a
training-management Feature. If neither objective is established, the calling
agent exposes that choice; the guide does not select one or conduct an interview.
Once a purpose is known, a missing diagnostic policy can remain open without
blocking supported behavior. Source knowledge is evidence, not an asset by itself.

## Software calling a model remains a software target

Suppose an application's public operation answers an eligibility query and calls
a model internally. If tests invoke that application, its Feature is `@code`.
Examples describe input facts and the required eligibility answer; they do not
require a model call count, provider, or deterministic result merely from the
tag. Testing a prompt directly would be a separate verification boundary. For a
planned prompt, do not write its implementation into a Background as a condition
of acceptance: the contract states what its response must accomplish.

## One review contract through a skill and a plugin

This constructed review contract requires evidence for an incompatible public
interface change and leaves files intact. The requested verification exercises
both an agent applying a review skill and the hosting plugin's exposed review.
The same domain examples apply to both targets:

````markdown
`@skill` `@plugin`
# Feature: Review a public interface change

## Rule: A finding identifies a supported compatibility defect and preserves files

### Scenario Outline: Report removal of a required public function

* Given the public contract requires exporting the function "`<functionName>`"
* And the proposed change to "`<changedFile>`" is:
  ```diff
  - export function <functionName>() { return "ok"; }
  + function <functionName>() { return "ok"; }
  ```
* When the change is reviewed against its public contract
* Then a finding identifies "`<changedFile>`" and the missing public export "`<functionName>`"
* And the finding explains that clients can no longer import "`<functionName>`"
* And the review leaves the project files unchanged

#### Examples:

  | functionName | changedFile |
  | formatEntry | public.ts |
````

The changed code is the review's input, not its implementation. Reading a diff,
consulting a script, and fetching rules are possible internal steps; they do not
become separate Features or a required call order. Do not duplicate this contract
or add an Examples column choosing the test harness. If only the plugin's public
operation were tested, it would carry only `@plugin`, despite bundling the skill.
A review that finds no supported defect belongs to this same use case with its
own example; a separate request to apply a fix has another purpose and contract.

## Relationships, arguments, and roles

Separate facts that can vary independently. A collection's number of distinct
items, each item's quantity, and a chosen handling category are different facts.
A subject identity and its quantity can be arguments of one cohesive relationship:
`the tray contains <quantity> samples of <material>`. Keep the subject explicit;
do not add a selection action to establish an implicit current subject.

Inspect words as well as digits: “third” and “three” can hide example arguments.
Inspect names too: a duration argument named `days` can obscure both quantity
and unit. A horizon, reporting interval, and recurrence interval remain different
roles even if all currently use the same unit and value. A named category such
as “double room” stays a category; do not reinterpret its name as a room count.

Separate reusable relationships from their values without dissolving them into
`the entity has <property> equal to <value>` or `the actor performs <action>`.
A profile identity can select a strategy; changing that identity does not make
it a new lifecycle state. Infer the concept without inventing other profiles'
behavior or catalog administration.

## Fixed rules, source inputs, and diagnostic arguments

In this constructed form, submission requires a ten-digit phone number and an
answer to question 4. Rejection identifies its cause and preserves answers.

```markdown
`@code`
# Feature: Submit a form

## Rule: Submission requires a ten-digit phone number and an answer to question 4

### Scenario Outline: Accept a complete submission with a valid phone number

* Given the form contains the phone number "`<phoneNumber>`"
* And question `<questionNumber>` has the answer "`<answer>`"
* When the user submits the form
* Then the submission is accepted

#### Examples:

  | phoneNumber | questionNumber | answer |
  | 1234567890 | 4 | Yes |

### Scenario Outline: Reject a phone number with the wrong length

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

### Scenario Outline: Reject a missing required answer

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
`@code`
# Feature: Remove a bead from a strand

## Rule: Removing a selected bead preserves the other beads and their order

### Scenario Outline: Remove the `<position>` bead

* Given the strand contains, in order:
  | bead |
  | <firstBead> |
  | <middleBead> |
  | <lastBead> |
* When the `<position>` bead is removed from the strand
* Then the strand contains, in order:
  | bead |
  | <remainingFirst> |
  | <remainingLast> |

#### Examples:

  | position | firstBead | middleBead | lastBead | remainingFirst | remainingLast |
  | last | Amber | Glass | Shell | Amber | Glass |
  | first | Amber | Glass | Shell | Glass | Shell |
```

`position` can bind `last` without fixing the collection's length. Distinct local
bindings identify simultaneous values of the `bead` field. Renaming all of them
`<bead>` would force different records to share one value. Preserve known sets
as collections when that expresses the example best; these local scalar bindings
make the varying expected collection explicit, not a universal table schema.
For a fixed collection with no meaningful scalar variation, a plain Scenario
with a concrete DataTable can be clearer than many artificial columns.

A negative selector remains explicit: `the <position> item has no answer`, with
`position = last`. Do not substitute an expected fixed ordinal or a blank cell.
When accepted inputs can have different lengths, vary lengths to exercise that
relative meaning where the source supports it.

## Different purposes, shared quantities

In this constructed coating model, material volume is area multiplied by
consumption per area; the factors use matching units. There is no conversion or
rounding policy. The whole use case estimates required material:

```gherkin
@code
Feature: Estimate coating volume

  Rule: Required volume equals area multiplied by consumption per area

    Scenario Outline: Estimate <requiredVolume> <volumeUnit> for a surface
      Given the surface area is <area> <areaUnit>
      And coating consumption is <consumption> <volumeUnit> per <areaUnit>
      When required coating volume is estimated
      Then required coating volume is <requiredVolume> <volumeUnit>

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
@code
Feature: Check coating availability

  Rule: Available coating is sufficient when it meets the required volume

    Scenario Outline: Enough coating is available
      Given required coating volume is <requiredVolume> <volumeUnit>
      And available coating volume is <availableVolume> <volumeUnit>
      When coating sufficiency is assessed
      Then available coating is sufficient
      And available coating volume remains <availableVolume> <volumeUnit>

      Examples:
        | requiredVolume | availableVolume | volumeUnit |
        | 6              | 6               | L          |
        | 6              | 7               | L          |

    Scenario Outline: Available coating is insufficient
      Given required coating volume is <requiredVolume> <volumeUnit>
      And available coating volume is <availableVolume> <volumeUnit>
      When coating sufficiency is assessed
      Then available coating is insufficient
      And available coating volume remains <availableVolume> <volumeUnit>

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
@code
Feature: Count words in a comment

  Rule: Words are nonempty groups of characters separated by spaces

    Scenario Outline: Report <wordCount> words in a comment
      Given the comment contains "<text>"
      When the comment word count is requested
      Then the word count is <wordCount>

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
part of its contract. A recommendation is observed as advice, not as proof of
compliance. Complete supported cases while identifying a missing conversion,
rounding, or transition rule separately. Do not invent a policy to fill the
sketch or claim exhaustiveness from the number of combinations.
