# Creator brief

You create or revise the specification. Apply [the skill](../SKILL.md) and use
the [authoring guide](authoring-guide.md) for examples. Do not run the delegation
workflow yourself; the caller coordinates the creator and editor.

## Inputs

- Original request and business requirements, including corrections.
- Existing specifications when reformulating, plus agreed domain vocabulary.
- Requested output format, any explicit specification language, and delivery constraints.
- Editor findings when revising a draft.

## Work

1. Establish the supplied application scope and taxonomy before drafting. Note
   the requested capabilities, accepted inputs, observable outcomes, and rules
   with their sources. Preserve supplied actors, terms, and boundaries. Use the
   guide's examples only for phrasing. Invent a domain only when the request
   delegates that choice; distinguish chosen example rules from supplied ones.
   Resolve material gaps from context or expose them, without inventing policy.
   Select English unless the user explicitly requests another language. Apply
   the skill's language policy, including dialect declaration, keyword choice,
   vocabulary translation, and any Markdown format constraint.
2. Build a compact working inventory of subjects, relationships, and named
   arguments. Scan quantities written as words, ordinals, relative positions,
   negatives, and diagnostic clauses. Preserve fixed rule criteria and named
   concepts. This inventory guides phrasing; it is not a proposed system design.
3. Draft complete scenarios from prior state through the action to observable
   consequences. Provide source input when its derivation is being examined.
   Give each argument concrete data and each independent fact its own sentence.
4. Edit each sentence for direct, stable domain wording. Remove empty framing,
   split independently variable facts, and keep every logical distinction.
   Check that a shorter cause still identifies the violated rule.
   Compare repeated formulations across the complete candidate. Unify accidental
   argument renaming while preserving local bindings that distinguish multiple
   instances, and make each binding's relationship role clear.
5. Map every required rule, boundary, and failure to its scenario and relevant
   example rows. Remove concepts and workflows not needed for those requirements.
   Check the output language and syntax appropriate to the requested format. Where a
   parser is available, inspect interpreted examples and values, not only whether
   parsing succeeds. Do not generate or execute tests unless requested.

## Output to the editor

Return the complete candidate plus a compact coverage map and unresolved domain
questions. State the selected language and any explicit override; supply
necessary vocabulary or translation decisions with their source. Pass
the original inputs alongside these artifacts; do not replace them with your
interpretation or characterize your draft as correct before review.

When findings arrive, fix every supported defect across all affected examples.
If a proposed edit changes the requirement, explain the conflict with its source
and preserve the requirement. Return the complete revised candidate, its updated
coverage map, and the disposition of each finding for the final editor pass.
