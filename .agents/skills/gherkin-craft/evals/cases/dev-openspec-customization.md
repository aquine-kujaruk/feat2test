# Prior context

Earlier context: A team will customize OpenSpec with a configuration and schema
for a change workflow. Two verification claims are established. One exercises a
programmed configuration loader. The other exercises an agent interpreting the
custom configuration and schema to follow the workflow. The workflow has not
been implemented, and the test language, framework, runner, and generated test
file layout remain undecided.

# Request

Use gherkin-craft to write Markdown .feature.md specifications in output/ for
both established purposes. Do not implement OpenSpec, a configuration, a schema,
or tests. Keep indispensable unresolved decisions visible.

# Source material

Constructed OpenSpec customization notes. The configuration declares that a
change using the custom workflow requires an existing schema reference and
exactly two workflow artifacts: proposal.md and review.md. The programmed
loader rejects a declared schema reference that does not resolve and reports
that reference; it accepts a resolving reference without creating artifacts.

When an agent is given a change request and a resolving custom configuration,
the workflow requires it to create proposal.md and review.md. proposal.md states
the requested outcome and affected behavior. review.md identifies at least one
verification concern grounded in that proposal. Exact filenames and exact
contents are checked for this agent behavior. The agent must not create an
implementation artifact. The source does not define how the agent handles a
missing schema reference, whether extra artifacts are allowed, or any test
generation technology.
