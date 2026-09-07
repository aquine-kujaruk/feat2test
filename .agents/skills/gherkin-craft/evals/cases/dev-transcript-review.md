# Prior context

Earlier context: The requested asset is a prompt that a model executes to advise on workshop preparation and assess the described readiness, checklists and session qualification. The draft below is meant to specify those outputs. Evaluate the prompt through its inputs and responses.

# Request

Use gherkin-craft to review the supplied Markdown Gherkin against the transcript. Findings only: do not edit or create files. Check the whole supplied specification. I want an eventual rewrite in Spanish Markdown .feature.md, but no external Markdown dialect configuration has been established; state what needs resolving before that rewrite can be called valid. Do the current review now.

# Source material

Constructed workshop transcript, not a recording of real people.

Facilitator: A kit can contain every required component while its owner does not yet know how to assemble it. Knowing assembly is separate from component completeness.
Learner: What should preparation advice do?
Facilitator: If a component is missing, recommend acquiring that component. If assembly knowledge is missing, recommend a practice session. If both are missing, recommend both. Preparation is ready only when components are complete AND assembly is understood. Advice does not supply components or teach assembly by itself. Repeating the advice request under unchanged facts gives the same advice and leaves those facts unchanged.
Learner: And the checklist?
Facilitator: A checklist can have any positive number of checks. Every required check needs an answer; if the last check lacks an answer, identify the missing answer by that relative position. Never substitute an arbitrary fixed ordinal for “last”.
Learner: How does the short session qualify?
Facilitator: A session qualifies when its available duration is at least 10 minutes. Comparing the duration does not book the session. No other session rule is stated.

Existing supplied specification follows. Its intended behavior must be reviewed, not silently repaired:

# Feature: Workshop preparation

## Scenario Outline: Advice completes assembly knowledge
* Given the kit has all required components
* And its owner does not understand assembly
* When preparation advice is requested
* Then a practice session is recommended
* And its owner understands assembly

## Scenario: Preparation is unready only when neither condition holds
* Given a required component is missing
* And its owner does not understand assembly
* When preparation readiness is assessed
* Then preparation is unready because neither required condition holds

## Scenario: A missing final answer is identified
* Given a checklist has 5 required checks
* And the last required check has no answer
* When checklist completeness is assessed
* Then the missing answer is identified at position 3

## Scenario Outline: Enough session time qualifies
* Given a session has <availableMinutes> minutes available
* When session qualification is assessed
* Then the session qualifies

### Examples:
  | availableMinutes |
  | 10 |
  | 11 |

## Scenario Outline: Too little session time does not qualify
* Given a session has <availableMinutes> minutes available
* When session qualification is assessed
* Then the session does not qualify because less than <requiredMinutes> minutes are available

### Examples:
  | availableMinutes | requiredMinutes |
  | 9 | 10 |
