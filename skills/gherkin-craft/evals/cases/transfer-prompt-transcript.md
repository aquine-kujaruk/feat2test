# Request

Use gherkin-craft to write the acceptance specifications for this work as native `.feature` files under `output/`. Deliver those files and indispensable unresolved decisions only. Put unresolved decisions in comments in the relevant file.

# Project context

I maintain Arbor Ledger, a plugin used by a municipal inventory team. We have already agreed that this ticket ships a revision of the reusable `inventory-handoff.prompt.md` template. Arbor Ledger will invoke that template with a prepared survey packet. Its CensusExtract skill assembles the packet beforehand; the prompt receives the packet as text. The acceptance work here concerns the prompt's response to that input. The plugin packaging and data collection already have their own tickets.

The inventory team needs a handoff they can send to the next documentation shift. The handoff identifies which street-tree records can be described from the supplied evidence and which need another field visit. It does not assess tree health, authorize tree work, or maintain the inventory. The domain terms and operating decisions from yesterday's meeting follow.

# Source material

Constructed meeting transcript; all people, identifiers, and observations are fictional.

**Nadia, inventory lead:** A survey packet has a selected street block, records, and the notes recorded in the survey. Each record has a stable tree ID and a block ID. The prompt should prepare the handoff for the selected block using only those records. Other blocks can be present because an export covers a whole route.

**Eli, field surveyor:** Two things decide whether a record has enough documentation: its locator has been confirmed, and its crown photograph is usable. These are separate facts. I can confirm the locator without getting a usable photograph. I can also bring back a usable photograph while the locator still needs checking.

**Nadia:** When both are satisfied, put the record in the documentation-ready group, with its tree ID and the note supplied in the packet. The note is evidence, not an invitation to improve the description with facts we did not record. When either is missing, put the record in the revisit group, with its tree ID and all the missing documentation requirements. If the locator is unconfirmed, say that; if the photograph is unusable, say that. An unusable photograph does not tell us whether the locator is confirmed.

**Tom, prompt maintainer:** The draft has a three-stage scratch outline: pick records for the block, check documentation, then arrange the handoff. It is just how I organize the template. The next shift receives one handoff. They do not request those stages separately.

**Eli:** Here is the small packet from block Elm-4. These are the values in the export, not categories of trees.

| tree ID | block ID | locator confirmed | crown photograph usable | recorded note |
| --- | --- | --- | --- | --- |
| T-81 | Elm-4 | yes | yes | Two white ties on the identification stake. |
| T-82 | Elm-4 | yes | no | The tree ID is readable on the stake. |
| T-83 | Elm-4 | no | yes | A circular planting bed is visible. |
| T-84 | Elm-4 | no | no | The field notebook lists this tree ID. |
| T-90 | Pine-2 | yes | yes | A square planting bed is visible. |

**Nadia:** Elm-4 is selected for that handoff. For T-81, the supplied note belongs with the ready record. T-82 needs another photograph, T-83 needs its locator confirmed, and T-84 needs both. T-90 belongs to a different block's handoff; neither group for Elm-4 should contain it. We should also cope with selecting a block that has no records in the packet: say there are no records for that block, with empty ready and revisit groups. That is different from records existing but all needing a visit.

**Tom:** Are exact sentences important?

**Nadia:** No. The tree identities, source-backed note, grouping, and missing requirements are. The prompt produces the handoff text; it does not update a locator or repair a photograph. Sending the same packet through again cannot turn an unconfirmed locator into a confirmed one. CensusExtract may read inventory exports before the prompt runs, but the handoff must be based on the packet we actually supplied, not an imagined fresh lookup.

**Eli:** Sometimes two records with the same tree ID disagree because two surveyors uploaded different observations. We have not agreed whether one replaces the other or whether the prompt should ask for reconciliation. There is no approved conflict rule yet.

**Nadia:** Keep that decision visible for us. This release is for street-tree documentation only. Park surveys and health assessments have different procedures and are outside this ticket.
