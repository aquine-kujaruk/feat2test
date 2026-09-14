# Prior context

Earlier context: The support application receives a model response from an
already-controlled fixture. Verification must exercise only the application's
programmed parsing and triage behavior; it does not invoke a model or claim that
the model classifies ticket text correctly.

# Request

Use gherkin-craft to write native .feature specifications in output/ for this
contract. No implementation or tests requested.

# Source material

Constructed software requirement. A model response contains a ticket ID, the
label billing, access, or unclassified, and the original ticket text. The
application records the response under that ID. Billing and access responses
are marked routed; an unclassified response is marked for triage. The original
ticket text is preserved in every result. A response whose ticket ID does not
match the requested ticket is rejected and leaves the existing record
unchanged. The source defines no model prompt, model choice, or classification
policy.
