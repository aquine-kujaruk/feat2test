## MODIFIED Requirements

### Requirement: Assess semantic quality and retained compatibility

Evaluation SHALL assess fidelity to the source, useful contextual abstractions, consistent terminology, one-use-case Feature boundaries, relevant coverage, meaningful argument decomposition, and independence from implementation. It SHALL also verify retained language and Gherkin-format behavior. Markdown table compatibility SHALL be assessed through preserved intended Examples bindings, DataTable values, and executable example counts; a supported formatting separator alone SHALL NOT constitute a failure. A separator interpreted as unintended data in native Gherkin SHALL remain a format defect. Syntax acceptance alone SHALL NOT establish semantic correctness. Material unsupported policies, lost explicit constraints, or changed meanings SHALL be reported as failures regardless of aggregate scores.

#### Scenario: A valid specification changes a source quantifier
- **WHEN** a generated specification parses but changes "not both" into "neither"
- **THEN** the evaluation records a semantic failure with the affected source and consequence
- **AND** passing format checks does not override the failure

#### Scenario: A larger taxonomy adds unsupported requirements
- **WHEN** a candidate introduces additional states or categories and assigns behavior that the source and request do not support
- **THEN** the evaluation records the unsupported behavior
- **AND** the additional taxonomy entries are not treated as domain richness merely because they increase the model's size

#### Scenario: Equivalent Markdown tables use different formatting
- **WHEN** otherwise equivalent Markdown specifications use correctly indented tables with and without supported header separators
- **THEN** evaluation gives the same table-compatibility result when the intended bindings, values, and executable example counts match
- **AND** it does not require separator absence as an independent criterion

#### Scenario: A native separator creates an unintended example
- **WHEN** a native Outline intended to contain two examples produces a third example from a formatting separator
- **THEN** evaluation records the extra example as a format failure
- **AND** successful parsing does not override that failure
