# Prior context

Earlier context: A programmed incident-report generator is the behavior under
test. A model may judge whether a generated report is clear, but the test does
not exercise a model or agent as the report generator.

# Request

Use gherkin-craft to write native .feature specifications in output/. Do not
implement the generator, judge, or tests.

# Source material

Constructed report requirement. Given an incident ID, severity, and stated
symptom, the generator produces a report containing all three facts. A critical
incident report also contains the escalation instruction. A noncritical report
does not contain an escalation instruction. Generating a report does not change
the incident. The exact prose is not contractual. The source defines no other
severity levels and no report delivery workflow.
