# Prior context

Earlier context: We are specifying a manuscript-submission application. Tests will exercise its public operations. The software is planned, not implemented.

# Request

Use gherkin-craft to write native .feature specifications from the requirements below. Deliver only the specifications and any indispensable unresolved decisions. Do not implement the software. You may create the requested .feature files in output/.

# Source material

Constructed requirements fixture: manuscript submission desk.

The desk handles public manuscripts. A packet has an identity, a set of required attachment identifiers, the attachment identifiers actually supplied, a reviewer-approval fact, and a submission status (unsubmitted or submitted). Attachment completeness and reviewer approval can vary independently. No relationship makes one imply the other.

Inspecting readiness reports which required attachments are missing and whether reviewer approval is missing. This inspection changes neither the packet nor its submission status.

Submitting a packet accepts its packet identity and a dispatch code. A dispatch code must contain exactly four decimal digits. A valid code does not vary this fixed rule. Submission requires all required attachments AND reviewer approval. If either requirement is missing, submission is rejected with the missing requirement identified; nothing is submitted. Invalid dispatch codes are rejected with the violated code requirement identified. A ready, unsubmitted packet with a valid code becomes submitted. Repeating submission of an already submitted packet reports already submitted and does not create another submission. The relative priority of multiple simultaneous failures is not specified.

A named desk profile, Cedar, is currently the only configured profile. Cedar uses a guarded-submission strategy: inspect readiness, then submit a ready packet using the supplied dispatch code; for an unready packet, return the readiness findings without attempting submission. Profile identity identifies the configured choice; guarded submission names how it combines the available operations. Only Cedar's behavior is defined here. Profile administration is outside this request.

Example packet P-8 requires [cover, consent], supplies [cover, consent], has reviewer approval, is unsubmitted, and is submitted with code 0421. Packet P-9 has the same supplied attachments but lacks reviewer approval. Packet P-10 has reviewer approval but supplies only [cover].
