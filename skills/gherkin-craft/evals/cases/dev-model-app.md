# Prior context

Earlier context: Specify the public classify-ticket operation of a support application. Its production implementation calls a model. Verification must invoke the application with its real model and demonstrate the classification behavior; a fixed or stubbed model response cannot satisfy this verification.

# Request

Use gherkin-craft to write native .feature specifications in output/ for this application. No implementation or tests requested.

# Source material

Constructed software requirement. Given ticket text, classifying a ticket returns billing for an explicit invoice question and access for an explicit password-reset question. A ticket with neither kind is returned as unclassified and requires triage; no routing is performed by this query. Mixed billing/access text has no precedence defined. Examples: T-1 says "Where is my invoice?"; T-2 says "Reset my password"; T-3 says "Office opening hours?". The response identifies the ticket and preserves its original text. The model and a logging library are internal dependencies, not additional exposed operations. The model's exact wording is not contractual.
