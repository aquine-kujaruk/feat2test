## Purpose

Preserve the intended executable examples and table values when consuming native and Markdown Gherkin, with diagnostics that reflect each format's interpretation.

## ADDED Requirements

### Requirement: Preserve Markdown examples and table values across separator formatting

For valid `.feature.md` tables, adding or removing a Markdown header separator SHALL preserve the ordered Examples bindings, DataTable header and data values, and resulting executable scenarios and step arguments. This SHALL hold for ordinary separators and separators with left, right, or centered alignment markers. A formatting separator SHALL NOT create an executable example or a DataTable value. Source locations and derived identifiers are not part of this equivalence.

#### Scenario: An Examples table includes an ordinary separator
- **WHEN** test generation consumes a Markdown Outline with quantity bindings `2` and `5` and a `| --- |` separator after the Examples header
- **THEN** it produces exactly the two intended executable cases with their corresponding quantity arguments
- **AND** the cases have the same behavior as generation from the equivalent table without the separator

#### Scenario: A DataTable includes aligned separators
- **WHEN** test generation consumes equivalent Markdown DataTables with a header and two product records, with and without valid left, right, or centered header separators
- **THEN** the generated step arguments retain the same ordered header and product values
- **AND** the separator contributes no record or value

### Requirement: Diagnose table separators according to the input format

The system SHALL NOT issue a separator-as-data warning for a valid Markdown formatting separator in a correctly indented `.feature.md` table. For `.feature` tables containing separator-looking rows such as `| --- |`, the system SHALL retain the native row values and issue the existing warning with the source label and line number. It SHALL NOT silently remove native rows to make them behave like Markdown separators. Existing Markdown indentation diagnostics SHALL remain available.

#### Scenario: Valid Markdown formatting produces no corruption warning
- **WHEN** a correctly indented Markdown Examples table or DataTable contains an ordinary or aligned formatting separator
- **THEN** parsing and generation emit no separator-as-data warning for that row
- **AND** generation succeeds with the intended values

#### Scenario: A native Examples separator becomes an additional case
- **WHEN** a native Outline has a quantity header followed by `| --- |`, `| 2 |`, and `| 5 |`
- **THEN** the interpreted Examples retain three bindings, including `---`
- **AND** the system warns at the separator row's source location instead of silently dropping that binding

#### Scenario: A native DataTable separator remains a value
- **WHEN** a native scenario contains a DataTable with a header, a `| --- |` row, and a product row
- **THEN** its step argument retains the header, separator value, and product value
- **AND** the system warns at the separator row's source location

#### Scenario: A Markdown data row lacks the required indentation
- **WHEN** an otherwise runnable Markdown scenario contains a table data row with fewer than two leading spaces
- **THEN** the system retains the existing warning that the row needs two leading spaces to be parsed
