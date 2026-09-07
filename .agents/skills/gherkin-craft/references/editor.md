# Editor brief

Review the **complete specification** against the original request, relevant raw
sources, existing specifications, and [the skill](../SKILL.md). Read
[domain discovery](domain-discovery.md), [verification targets](verification-targets.md),
and [format and language](gherkin-format.md).
Use [the authoring guide](authoring-guide.md) when a formulation needs an example.
Do not delegate or restart the caller's creator/editor workflow.

## Evidence and independence

Receive the complete candidate, working vocabulary and evidence distinctions,
coverage map, and open decisions. These are claims to verify, not an answer key.
Inspect every scenario, sentence, and example row; selected excerpts or the
creator's assurance cannot replace the full text. On recheck, also inspect each
finding and its disposition. Determine output language from explicit user choice,
defaulting to English rather than copying conversation or source language.

## Review priorities

First recover the intended executable asset and purpose from the whole context.
Do the Features specify that asset's relevant capabilities, or merely rewrite
source sections? Check that clear prior intent was reused. A genuinely missing
objective remains a decision for the calling agent, not an invented system or a
skill-owned interview. Do not call a target contract complete while that choice
is unresolved.

1. **Domain meaning and evidence.** Compare claims and conditions with the source.
   Check both missing abstractions and unsupported policy. Does a named example
   obscure its concept? Do independent dimensions disappear into a generic state?
   Are a unit and a magnitude, a profile and a strategy, or two temporal roles
   conflated? Inference itself is allowed; unsupported behavior is not. Respect
   explicit category restrictions. Flag concepts imported from teaching examples.
   Preserve assumptions and attribution in explanatory texts.
2. **Use-case boundaries and relationships.** Verify one Feature per whole
   public purpose from the Detroit perspective. Distinct purposes under one topic must be separated; acceptance and
   rejection of one action belong together. Do not split internal steps into
   use cases. Check containing context, shared vocabulary, prerequisites and
   supported composition across the complete set without execution dependencies.
   Distinguish domain policies, application workflow, and external mechanisms
   without demanding architectural directories or contracts for every dependency.
3. **Coverage and scenario integrity.** Compare every claimed rule and class with
   the actual examples. Can a factor be ignored and the assertions still hold?
   Would an unintended state change be visible? Inspect relevant state/event
   gaps, mixed independent states, repeat requests, missing information and
   boundaries. Recognize already-covered classes. All prior facts must coexist;
   each scenario supplies its own context, accepted inputs, one whole action or
   query, and supported consequences. No invented mutation, calculation premise,
   implementation call sequence, or assertion that advice causes execution.
4. **Arguments and meaning.** Inspect conditions, inputs, consequences, negatives,
   and diagnostics for quantities, identities, categories, units, expected values,
   and positions hidden in words or names. Preserve relative selectors and fixed
   rule criteria. Verify concrete Outline bindings, causal diagnoses, meaningful
   argument roles and source inputs for derivations. Do not accept whole condition
   or diagnostic sentences hidden in generic arguments.
5. **Shared language and data shape.** Compare equivalent relationships across all
   Features, preserving subject, negation, scope and timing. Separate independent
   facts; keep cohesive records, collections, and named concepts intact. Different
   local bindings can represent simultaneous instances of the same relationship.
   Stable field headings can show that correspondence. Do not merge those values
   just to make argument names identical, or use identical names for different
   semantic roles merely because values currently match.
6. **Precision and representation.** Prefer direct grammatical sentences without
   deleting quantifiers, units, comparisons, causes, or necessary qualifiers.
   In particular, “not both” must not become “neither.” Length alone is not a
   defect. Verify keyword roles, explicit negation, independent rows, native or
   Markdown structure, selected language and actual table interpretation. Check
   the native language declaration; flag unresolved Markdown dialect assumptions.
   Parsing does not establish semantic correctness.
   Check every completed Feature's target tags against the requested tested
   boundary. Reject dependency inventories, deterministic/stochastic inferences,
   duplicate contracts or Examples solely for test routes, and newly authored
   target implementations embedded as acceptance premises. Multiple tags must
   describe the same complete contract; multiple checkers do not change asset
   kind. Inspect each Markdown tag's separate code span.
7. **Deliverable scope.** Keep review-only requests read-only, including no
   unsolicited report files. A working taxonomy is not an extra deliverable by
   default. Distinguish actual editorial actions from unverified independence
   claims. Missing policy remains visible; unrelated supported behavior can still
   be complete once their objective is established. Labeling does not establish
   test generation or execution; unsupported scaffolding must be reported.

## Findings and recheck

Return `ready` or `changes required`. For each supported finding identify:

- The affected Feature/scenario and exact sentence or example values.
- The source/rule affected and whether this is a defect or unresolved decision.
- The smallest correction that preserves meaning and existing coverage.

Judge evidence, not preferred wording, a larger taxonomy, or counts of Features
and arguments. Do not invent rules or diagnostics to make a correction work.
Do not pad a clean review. A missing decision can be adequately disclosed while
supported portions are ready; state that limited scope explicitly and do not
claim the unresolved behavior is fully specified.

After correction, recheck the entire revised candidate, including unchanged
rules, shared relationships, boundaries and example meanings. Return `ready`
only when the stated scope has no supported defect or hidden material decision.
Respect the caller's two-cycle limit; report any remaining findings plainly.
