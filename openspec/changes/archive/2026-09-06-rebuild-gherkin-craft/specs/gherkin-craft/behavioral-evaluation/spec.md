## Purpose

Provide evidence that changes to Gherkin Craft improve domain understanding and specification quality across varied contexts, while keeping activation behavior, semantic quality, and evaluation limitations visible.

## ADDED Requirements

### Requirement: Evaluate activation separately from output quality

Evaluation SHALL distinguish whether the skill is selected for an appropriate request from whether it produces a sound specification after selection. Activation cases SHALL include varied relevant requests and nearby requests that do not ask for domain specification or structured behavioral analysis. Explicit invocation SHALL remain available independently of automatic selection.

#### Scenario: A request expresses the skill's purpose without naming Gherkin
- **WHEN** a user asks to reconstruct an article's domain rules as concrete behavioral examples
- **THEN** the activation evaluation treats the request as relevant to the skill
- **AND** selection is assessed separately from the quality of the resulting examples

#### Scenario: An adjacent request only asks for a summary
- **WHEN** a user asks for a plain summary of an article without requesting domain modeling or specifications
- **THEN** the activation evaluation treats a forced specification workflow as a false positive
- **AND** merely mentioning an article or a domain term is not sufficient evidence of appropriate activation

### Requirement: Use varied sources and reserve independent cases

The evaluation corpus SHALL cover software requirements, a real-world process, explanatory prose from a book or article, and a transcript. It SHALL include cases exposing single-instance abstractions, independently variable facts, state/event gaps, use-case composition, and explicit scope constraints. Cases reserved from instruction development SHALL be used to check transfer beyond examples that shaped the skill.

#### Scenario: General guidance is assessed on an unrelated source
- **WHEN** a revised skill is evaluated on a reserved source whose subject was not used to write its examples
- **THEN** the resulting specification is assessed using that source's own concepts and rules
- **AND** terminology or policies imported from the development examples count as unsupported contamination

#### Scenario: The user limits generalization
- **WHEN** an evaluation request explicitly fixes a category or prohibits expanding the supported behavior
- **THEN** successful output preserves that constraint while expressing the relevant domain relationships
- **AND** catalog discovery is not rewarded for inventing excluded capabilities

### Requirement: Compare versions under equivalent conditions

The evaluation SHALL compare the revised skill with the preserved prior version on equivalent prompts and source inputs, using independent contexts and recorded execution conditions. Evaluators SHALL assess observable artifacts against predeclared criteria and supporting evidence. Candidate runs SHALL NOT receive reference answers or the evaluator's case-specific expected findings.

#### Scenario: The candidate succeeds on a case the prior version misses
- **WHEN** both versions are evaluated on the same source and request under comparable conditions
- **THEN** the report identifies the behavioral difference and the evidence supporting the assessment
- **AND** a longer output or a larger number of Features or arguments does not by itself count as improvement

#### Scenario: Results vary between repeated evaluations
- **WHEN** repeated runs disagree on a material criterion
- **THEN** the report retains the disagreement and investigates or reports its uncertainty
- **AND** it does not select only the favorable run to claim a reliable improvement

### Requirement: Assess semantic quality and retained compatibility

Evaluation SHALL assess fidelity to the source, useful contextual abstractions, consistent terminology, one-use-case Feature boundaries, relevant coverage, meaningful argument decomposition, and independence from implementation. It SHALL also verify retained language and Gherkin-format behavior. Syntax acceptance alone SHALL NOT establish semantic correctness. Material unsupported policies, lost explicit constraints, or changed meanings SHALL be reported as failures regardless of aggregate scores.

#### Scenario: A valid specification changes a source quantifier
- **WHEN** a generated specification parses but changes "not both" into "neither"
- **THEN** the evaluation records a semantic failure with the affected source and consequence
- **AND** passing format checks does not override the failure

#### Scenario: A larger taxonomy adds unsupported requirements
- **WHEN** a candidate introduces additional states or categories and assigns behavior that the source and request do not support
- **THEN** the evaluation records the unsupported behavior
- **AND** the additional taxonomy entries are not treated as domain richness merely because they increase the model's size

### Requirement: Keep skill evaluation independent of specification execution

The evaluation SHALL be possible without implementing the domains described by the generated Features. Its report SHALL identify compared versions, corpus coverage, criteria, observed outcomes, review findings, and unexecuted checks. Improving or evaluating the skill SHALL NOT make test generation, domain execution, or publishing a glossary a prerequisite for ordinary specification requests.

#### Scenario: The domain has no executable implementation
- **WHEN** a reserved article describes a real-world process with no software implementation
- **THEN** the skill's output is assessable through its source traceability, domain meaning, scenarios, and applicable format checks
- **AND** the report does not claim that the real-world process itself was executed or empirically validated

#### Scenario: A required behavioral evaluation could not run
- **WHEN** an evaluation environment cannot execute a planned comparison
- **THEN** the report marks that comparison as unexecuted and states the limitation
- **AND** it does not claim that the revised skill has demonstrated superiority on that comparison
