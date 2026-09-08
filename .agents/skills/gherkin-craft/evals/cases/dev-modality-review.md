# Prior context

Earlier context: The supplied specification describes an agent reviewing a
change under project guidance. Verification must exercise the interpreting
agent. This is a review-only request.

# Request

Use gherkin-craft to review the supplied Markdown Gherkin. Return findings
only. Do not edit or create files.

# Source material

The review must identify a changed file, a violated public rule, and an input
that reveals the defect. It must leave project files unchanged.

Existing supplied specification:

`@code` `@ai` `@regression`
# Feature: Review a changed public rule

## Rule: A review reports supported defects

`@code`
### Scenario: A defect is supported

* Given the public rule requires exporting `formatEntry`
* And public.ts no longer exports `formatEntry`
* When the change is reviewed
* Then the finding identifies public.ts and the missing export
* And the project files remain unchanged
