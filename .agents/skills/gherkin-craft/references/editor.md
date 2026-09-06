# Editor brief

You review the whole specification against the original requirements and
[the skill](../SKILL.md). Use the [authoring guide](authoring-guide.md) when a
rewrite needs an example. Do not delegate or restart the creator-editor workflow.

## Inputs and independence

Read the original request, business requirements, source specifications, agreed
vocabulary, complete candidate, and coverage map. Treat the map as a claim to
verify. Do not rely on the creator's assurances, a selected excerpt, or a prior
review score. For the final pass, also inspect findings and their dispositions.
Establish the output language from the user's explicit request, defaulting to
English rather than inferring it from the conversation or source material.

## Review in this order

1. **Scope, business meaning, and coverage.** Match the candidate to the supplied
   application, taxonomy, vocabulary, and use cases. Flag unsupported actors,
   concepts, rules, states, or workflows, including concepts copied from guide
   examples. Distinguish concrete test data and justified consequences from
   added domain policy. If the user delegated domain choice, assess its minimal
   coherent scope rather than rejecting invention itself.
   Check every requirement against concrete examples. Could the rule be ignored
   while every consequence still holds?
   Could a forbidden state change go unnoticed? Require discriminating inputs,
   relevant boundaries and failures, and observable preserved state where needed.
2. **Scenario integrity.** Can all prior facts hold together? Does the use case
   accept these inputs? Is the example assuming the derivation it should exercise,
   or directing an internal algorithm? Check subject identity, a whole business
   action, resulting state or answer, and independence from other scenarios.
3. **Hidden arguments.** Examine every condition, action, consequence, negative,
   and diagnostic. Mark quantities, identities, positions, and expected values
   embedded in wording, including words such as "ten" and "fourth". Keep relative
   positions relative and named concepts intact. Verify
   meaningful argument names, concrete bindings, coherent repeated references,
   and unchanged rule constants.
4. **Decomposition and vocabulary.** Can one property change independently of
   another? Can the same relationship retain its wording when an argument changes?
   Flag compound facts, synonym rotation, vague subjects, and universal phrases
   that hide domain meaning. A whole sentence hidden in `<reason>` is not a
   well-factored argument. Do not split a cohesive concept merely to shorten it.
5. **Consistency across scenarios.** Group equivalent formulations throughout
   the complete candidate, including repeated facts within one scenario. Compare
   their relationships independently of placeholder names and example values,
   retaining subjects, negation, scope, and timing. Check argument meaning,
   order, units, data shape, and table headings. Flag accidental renaming or
   incompatible meanings hidden behind the same wording.
   Distinguish a relationship's fields from local bindings for its instances.
   Different Outline column names alone are not a defect: preserve names needed
   to identify simultaneous values and verify their correspondence to the fields.
   A table with stable headings can make that mapping clear for a cohesive
   collection; it is not mandatory for equivalent scalar facts. Do not merge
   distinct bindings or invent synonyms merely to make formulations look alike
   or different.
6. **Conciseness and precision.** Flag empty framing, nominalized actions,
   repeated rule explanations, and clauses whose subject or cause is unclear.
   Prefer direct grammatical wording. Verify that each suggested shortening
   preserves negation, comparisons, quantities, units, quantifiers, temporal scope,
   and causal links. Under negation, splitting "and" can change the requirement;
   do not trade an accurate sentence for a shorter but stronger assertion.
7. **Gherkin semantics.** Check keyword roles and explicit negation where intended;
   `But` can also contrast a positive fact. Check Outline bindings, independent
   rows, and cohesive DataTables. Check native or
   Markdown structure as appropriate. Ensure the interpreted examples retain all
   intended scenarios and exact data; successful parsing alone is insufficient.
8. **Language.** Check titles, descriptions, sentences, and argument names against
   the selected language. Preserve required literal data and domain meaning
   through translation. For non-English native Gherkin, require the first-line
   `# language: <code>` declaration and matching dialect keywords. Flag an
   unresolved non-English Markdown format constraint or a claim that its dialect
   is configured by this header.

Judge only defects supported by the requirements or this skill. Sentence length
alone is not a defect. Neither fewer sentences nor fewer formulations proves
better domain coverage. Do not invent vocabulary, expected diagnostics, or
additional business behavior to make a proposed rewrite work.

## Output and recheck

Return `ready` or `changes required`, with each finding giving:

- The affected scenario and exact sentence or example values.
- The semantic or authoring defect and the requirement it affects.
- The smallest concrete correction, preserving the intended behavior.

Separate unsupported assumptions or missing business decisions from wording
defects. Report only actionable findings; do not pad a clean review.

After correction, review the complete revised candidate again, not just the
diff. Check that fixes address the findings without losing coverage, altering
constants, weakening a consequence, or changing example data. Return `ready`
only when no supported defect or material unresolved question remains. After
the permitted correction cycles, report remaining findings plainly.
