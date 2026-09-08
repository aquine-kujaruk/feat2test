# Prior context

Earlier context: A project policy file, rather than a skill, prompt, or plugin,
instructs an agent to review code changes. Verification exercises the agent
interpreting that policy and observes its review behavior.

# Request

Use gherkin-craft to write Markdown .feature.md specifications in output/. Do
not create the policy file, an implementation, or tests.

# Source material

Constructed policy rules. A review finding cites the changed file, the public
rule it violates, and an input that demonstrates the violation. A review with no
supported defect reports no supported finding. Review does not edit project
files. In the supplied price policy, parcels at or below 2 kg cost 4 EUR and
parcels above 2 kg cost 7 EUR. fees.ts instead uses mass below 2 kg for the
lower band, so 2 kg exposes a defect. Different units and nonpositive mass have
no defined behavior.
