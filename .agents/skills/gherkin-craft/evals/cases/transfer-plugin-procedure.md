# Request

Use gherkin-craft to turn this material into Markdown `.feature.md` acceptance specifications under `output/`. Deliver those files and indispensable unresolved decisions only. Put unresolved decisions in comments in the relevant file.

# Project context

We are preparing the first installable ParcelNook plugin for a neighborhood parcel room. Clerks will use its `/parcel-place` and `/parcel-cancel` commands. The release includes a command router, a locker-picker skill, and the LockerStore code library. Acceptance examples are for what clerks get from the installed plugin through the two commands. We are using the attached operating procedure as the agreed behavior for this release; implementation work has not started.

# Source material

Constructed operating procedure, adapted from fictional parcel-room training notes. It is not a published article.

## The locker ledger

Every locker has its own ID, an integer usable capacity in litres, a service condition (usable or blocked), and an allocation fact (unassigned or assigned). Service condition and allocation are separate: a blocked locker may still hold an assignment, and a usable locker may already be assigned. Changing a locker to blocked does not cancel its assignment.

An active assignment records its assignment ID, placement request ID, parcel ID, locker ID, and whether that parcel has been deposited. Deposit status belongs to that assignment. A newly created assignment has not been deposited. A clerk's placement request includes a request ID, a parcel ID, and the parcel's required capacity in litres.

## Fit scan

The locker-picker routine considers lockers that are usable, unassigned, and have at least the parcel's required capacity. It chooses the eligible locker with the smallest capacity. An exact capacity match is sufficient. The choice routine is used inside placement; clerks have no separate fit-scan command. We have not decided which locker to choose when several eligible lockers share the smallest capacity.

## Placing a parcel

On `/parcel-place`, a new placement request creates one active assignment for the chosen locker, changes that locker to assigned, and returns the assignment ID and locker ID to the clerk. It does not change the locker capacity or service condition, and it leaves other lockers and their assignments alone. If no locker qualifies, the reply says that no suitable locker is available, creates no assignment, and changes nothing in the ledger.

When the same placement request ID is sent again while its assignment is still active, the plugin returns that original assignment ID and locker ID. It creates no second assignment and does not allocate a different locker. This remains true if the assigned locker has become blocked since the first request. A retry refers to the original request; changing the parcel ID or required capacity under that same request ID has no agreed policy yet.

A training ledger contains these lockers. An unrelated assignment A-10 is already active for parcel Q-10 in B-24, with that parcel deposited. Assignment A-11 is active for Q-11 in B-25, with that parcel not yet deposited.

| locker ID | capacity in litres | service condition | allocation |
| --- | --- | --- | --- |
| B-12 | 12 | usable | unassigned |
| B-24 | 24 | usable | assigned to A-10 |
| B-22 | 22 | blocked | unassigned |
| B-25 | 25 | blocked | assigned to A-11 |
| B-30 | 30 | usable | unassigned |

For new request R-41, parcel Q-41 requires 22 litres. Placement chooses B-30. B-22 is an exact size match but blocked; B-25 is both blocked and assigned. For a separate starting ledger consisting of usable, unassigned B-22 at 22 litres and B-30 at 30 litres, the same 22-litre requirement chooses B-22. For a separate ledger with only usable, unassigned B-12 at 12 litres, a 22-litre request fails for lack of a suitable locker.

## Canceling a placement

On `/parcel-cancel`, a clerk supplies an assignment ID. If the assignment is active and its parcel has not been deposited, cancellation marks the assignment canceled, makes its locker unassigned, and confirms cancellation with the assignment ID. The locker retains its service condition and capacity. Other assignments and lockers are unchanged. A-11 from the training ledger can therefore be canceled even though B-25 is blocked; afterward B-25 is still blocked and is unassigned.

If the parcel has been deposited, cancellation is refused with the reason that the parcel has been deposited; the assignment and ledger are unchanged. Canceling A-10 in the training ledger has this result. Repeating cancellation for an already canceled assignment confirms that it is already canceled and changes nothing. We have not agreed on the reply for an assignment ID that never existed, or whether a canceled placement request ID can later be reused.

## Release scope

This procedure covers allocation and cancellation for ordinary ambient parcels. It does not cover chilled or hazardous parcels, physical deposit or collection, parcel ownership checks, or changing a locker's service condition. Those operations have other procedures. The plugin's internal routine and library may perform several checks, but clerks complete their work through the commands described above.
