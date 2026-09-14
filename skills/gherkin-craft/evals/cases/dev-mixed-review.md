# Prior context

Earlier context: We will verify one shared code-review contract twice: with an agent applying a review skill directly, and with the hosting plugin’s review operation. Both must report the same supported findings and preserve files. The plugin bundles the same skill.

# Request

Use gherkin-craft to write the requested .feature.md specifications in output/ from the book notes below.

# Source material

Constructed book notes: Reviewing a change.

Chapter 1, Review evidence. A review finding identifies an observable defect, cites the changed file and the relevant public rule, and explains an input that reveals the defect. When no defect is supported, report no supported finding; do not invent a finding to fill a quota. Review does not edit project files.

Chapter 2, Compatibility. For the supplied parcel-fee project, parcels at or below 2 kg cost 4 EUR; parcels above 2 kg cost 7 EUR. A proposed change uses mass < 2 for the lower band. Its file is fees.ts. The existing and proposed behavior agree for 1 kg and 3 kg, but differ at 2 kg. The review is about the supplied policy, not whether the prices are economically justified. Different units or nonpositive masses have no defined behavior here.

Chapter 3, A possible workflow. The reviewer can read the diff, consult a local calculator script, and look at a rules document exposed by an external service. These are implementation suggestions, not prescribed public steps. Reordering them does not change review acceptance.

Chapter 4, Facilitating meetings. A facilitator invites a chair and records attendance. This is a different application of the book and has no rule linking it to code review.
