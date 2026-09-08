## MODIFIED Requirements

### Requirement: Preserve semantics, syntax, and language conventions

The skill SHALL preserve subjects, negation, quantifiers, units, temporal scope, causal meaning, and distinctions between source inputs and derived results. Every Outline argument SHALL have a concrete binding. English SHALL remain the default specification language unless the user explicitly chooses another language. Native and Markdown Gherkin SHALL follow their respective syntax, including native dialect declarations and Markdown table indentation. Native `.feature` tables SHALL omit separators added only for Markdown formatting. The skill SHALL permit correctly indented `.feature.md` tables both with and without supported Markdown header separators, including alignment markers, when the intended Examples bindings and DataTable values survive parsing. It SHALL NOT claim that those Markdown formatting separators become data or reject an otherwise valid Markdown table solely because it includes them.

#### Scenario: Decomposition must preserve negation
- **WHEN** a source rejects a condition because two required facts do not both hold
- **THEN** the specification retains the distinction between either fact missing and both facts missing
- **AND** splitting the sentence does not strengthen the condition into requiring both to be absent

#### Scenario: Non-English native Gherkin is explicitly requested
- **WHEN** the user explicitly requests Spanish native Gherkin
- **THEN** titles, steps, and argument names use the selected language consistently, with the supported native language declaration
- **AND** proper names, identifiers, and contractual literal data retain their required meaning

#### Scenario: A Markdown example table is interpreted
- **WHEN** the skill produces a Markdown Gherkin Outline with a table
- **THEN** its intended rows and concrete bindings survive parsing without unintended separator or formatting values

#### Scenario: Non-English Markdown constraints are unresolved
- **WHEN** the user explicitly requires non-English Markdown Gherkin without an established dialect configuration
- **THEN** the skill explains the format constraint and resolves the intended representation before claiming a valid result
- **AND** it does not pretend that a native language header configures the Markdown dialect

#### Scenario: Review encounters Markdown header separators
- **WHEN** the skill reviews correctly indented Markdown Examples and DataTables containing ordinary or aligned header separators that preserve the intended values
- **THEN** it does not report those separators as extra examples or data corruption
- **AND** its review still checks the complete specification for independently supported defects

#### Scenario: Native formatting adds unintended values
- **WHEN** a native Examples table or DataTable contains a row introduced only as a Markdown formatting separator
- **THEN** the skill identifies that row's unintended native data values
- **AND** a requested correction removes the formatting row while preserving the intended examples and values
