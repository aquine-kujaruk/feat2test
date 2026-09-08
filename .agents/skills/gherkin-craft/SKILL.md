---
name: gherkin-craft
description: "Guide agents in specifying observable system behavior through domain rules and complete use cases. Use to write, review, or reformulate native .feature and Markdown .feature.md Gherkin from requirements, procedures, books, articles, transcripts, instructions, configurations, or schemas. Ordinary summaries, prose editing, and implementation alone do not need this workflow."
---

# Gherkin Craft

This skill supplies modeling guidance. The calling agent interprets context,
identifies relevant domains, proposes decompositions, authors specifications,
and manages user interaction. It applies this sequence:

**Contextual intent → intended system and observable behavior → relevant domain
→ complete use cases → one verification modality per Feature.**

One **Feature represents one use case**, viewed from the Detroit perspective:
prior facts, a whole action or query at the system boundary, and observable
answers or changed or preserved state. The intended system can be planned;
specification does not require its implementation or tests to exist. It can be
software, instructions interpreted by a model or agent, a custom configuration
or schema, or another established system. Those are examples, not a catalog.

## Shared contract

- Reuse the objective already available in conversation or project context.
  Sources supply knowledge for that objective; their chapters, medium, filename,
  or packaging do not select the system to build. If incompatible objectives
  remain, expose that decision for the calling agent to resolve. Do not silently
  select a system or present source-only Features as a complete contract. There
  is no separate skill-owned interview or compulsory input form.
- Build a contextual taxonomy and ubiquitous language from the request and
  relevant available sources. Reuse agreed meanings; infer missing abstractions
  when justified. Inspect concepts, instances, units, independent dimensions,
  states, events, policies, strategies, and relationships between use cases.
- One example can reveal a reusable concept. It does not establish behavior for
  every possible member. Separate source assertions, justified inferences,
  proposed extensions, and unresolved decisions. Preserve explicit boundaries.
- Keep this working model internal unless the user asks to inspect it. Deliver
  the requested specifications or review findings; do not add a glossary,
  architecture document, catalog application, tests, or implementation by
  default.
- Specify domain consequences. Implementation mechanisms belong only when they
  are themselves the subject being specified. Source claims retain their
  assumptions; writing a scenario does not prove them empirically.
- Keep vocabulary and argument roles consistent across Features. A query can
  return an answer without mutation. A recommendation does not establish that
  its recipient acted or acquired a capability.

## Route the work

For authoring, revision, and review, read
[domain discovery](references/domain-discovery.md) and
[format and language](references/gherkin-format.md), then use
[verification modalities](references/verification-modalities.md) to select one
Feature-level modality from required execution evidence.

- **Create or revise:** follow [the creator brief](references/creator.md).
  Read [the authoring guide](references/authoring-guide.md) for worked examples
  when choosing formulations or correcting a decomposition problem.
- **Review only:** follow [the editor brief](references/editor.md). Inspect the
  whole supplied specification; return findings. Do not edit files or create a
  review document unless requested.
- **Maintain or evaluate this skill:** additionally read
  [the evaluation protocol](references/evaluation.md). Evaluation cases and
  expected findings are not normal authoring context.

## Precision that every path preserves

Give meaningful example values explicit named arguments in a `Scenario Outline`,
even with one justified row. Check conditions, action inputs, consequences,
negatives, and diagnostics for hidden values, including units and identities in
words or argument names. Bind every placeholder to concrete `Examples` data.
Keep independently variable roles distinct even when their values coincide.

Keep fixed criteria in their rules. An expected diagnostic can bind that fixed
value without making the criterion configurable. Preserve cohesive records and
collections as data; do not turn whole actions, conditions, or diagnostic
sentences into generic prose-valued arguments. Named domain categories can be
arguments when their meaning is established.

Preserve subjects, units, scope, timing, quantifiers, negation, relative
selectors, and causal meaning. Use explicit absence rather than blank cells or
`null` / `undefined` stand-ins. A literal that is itself the source's subject
remains literal data. Supply source inputs when their derivation is being
examined.

Every scenario stands alone, with simultaneously possible prior facts, one
whole action or query, and a discriminating answer or consequence. Explore
relevant boundaries and missing state/event combinations; retain already
justified coverage during revision. Do not manufacture policy to fill a table.

Write specifications in **English by default**, another language only on explicit
request. Conversation or source language does not select the output language.
Apply the format reference before claiming native or Markdown validity.

## Creator and editor

Every specification receives creation and editorial passes. When delegation is
available, use different agents with a fresh editor context. The caller may act
as creator and delegate the editorial pass. Supply the original request, raw
sources, existing specifications, complete candidate, concise working vocabulary
and evidence distinctions, coverage claims, modality decision, and open
decisions. A summary of the candidate is insufficient.

The editor follows its brief and verifies the claims against the complete text.
The creator resolves supported findings across all affected occurrences; the
editor rechecks the whole result, including unchanged coverage. Allow at most
two correction/recheck cycles. Report remaining findings instead of extending
the loop or claiming readiness.

Delegated roles do not delegate further or restart this workflow. If delegation
is unavailable, perform separate passes and disclose that the review was not
independent. Report only review actions actually performed. Keep working notes
internal unless they are requested deliverables.
