# Prior context

Earlier context: We are specifying an archive plugin. Tests exercise its two exposed decisions through the host. Its implementation may bundle a skill and helper scripts; those are not separately requested test entry points.

# Request

Use gherkin-craft to write Markdown Gherkin .feature.md specifications in output/ from these archive notes. Limit the result to the two decisions described for the current annual reading event; do not add registration, acquisition, publication, or scheduling-management workflows. Deliver the specifications and indispensable unresolved decisions only.

# Source material

Constructed archive notes for an annual reading event.

In the publication catalog, “edition” means a publication version. A publication edition has its own catalog identifier and publication year. In the event archive, “edition” means the occurrence of the annual reading event, identified by its event year. A book can have a publication edition from 2018 and be read at the event edition in 2027. These years describe different things.

The first decision is whether an event's ordered reading list is complete. Each reading-list entry has a position, a publication-edition identifier, and an assigned reading date. The list is complete only if every entry has all three facts. Missing date and unknown publication-edition identifier are separate defects. A missing date in the last entry is reported as the last entry, independent of list length. Checking completeness changes neither the list nor the event's year.

The current example is the 2027 event with ordered entries: first, publication edition B-12 (publication year 2018), assigned 2027-04-05; second, publication edition B-19 (publication year 2021), assigned 2027-04-12; last, publication edition B-31 (publication year 2026), with its reading date explicitly absent. The catalog recognizes B-12, B-19, and B-31. What to do with an entirely empty reading list has not been decided.

The second decision is whether a dated entry falls inside a supplied review window. The window includes its start and end dates. This decision uses the assigned reading date, not the publication year or event year. For a supplied window from 2027-04-05 through 2027-04-12, both example dated entries are inside. A review window is an input; no rule automatically computes it from either edition year. Undated entries have no defined inside/outside classification. The decision does not assign missing dates or move a reading date.
