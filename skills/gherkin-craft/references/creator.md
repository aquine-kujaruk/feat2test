# Creator brief

Apply [the skill](../SKILL.md), [domain discovery](domain-discovery.md),
[verification modalities](verification-modalities.md), and
[format and language](gherkin-format.md). The caller coordinates review;
delegated creators do not delegate or restart that workflow.

## Inputs

Use the original request and corrections, relevant raw sources, existing
specifications for revisions, agreed vocabulary, output constraints, and any
editor findings. Establish the requested deliverables and explicit language;
English remains the default regardless of the source language.

## Work

1. Recover the intended system, its purpose, and its observable behavior from
   the request and prior context. Its packaging does not need to fit a known
   category. Select relevant source knowledge; expose a genuinely missing
   objective for the calling agent rather than inventing one. Build the internal
   contextual model and distinguish evidence status. Infer concepts from
   examples, containing contexts, independent dimensions, and relationships
   using the discovery reference. Preserve actual restrictions; expose missing
   policy without suppressing useful abstraction.
2. Propose whole use cases through the system's public access patterns. Assign
   one Feature to each purpose, grouping its rules and outcome variants.
   Preserve composition and shared meanings across Features. Use the Detroit
   boundary: acceptance concerns the complete result, not internal
   orchestration. Do not turn each procedural step into a Feature.
3. For each completed Feature, identify the execution evidence needed to verify
   its whole contract. Select exactly one Feature-level modality: `@code` for
   programmed behavior or `@ai` for model/agent interpretation. Rules and
   scenarios inherit it. Do not derive it from a skill, prompt, plugin,
   configuration, schema, policy-file name, dependency, public interface, or
   checker. If context has not selected the route, preserve the domain contract
   and state the pending decision without either tag.
4. Inventory meaningful arguments in prior facts, action inputs, consequences,
   negatives, and diagnostics. Separate independently variable roles,
   quantities, units, identities, and positions. Keep rule constants, cohesive
   collections, and named concepts intact. Give simultaneous instances distinct
   bindings.
5. Draft independent examples with possible prior facts, one whole action or
   query, and observable consequences. Supply raw input when its derivation is
   at issue. Explore relevant state/event pairs and discriminating factors,
   boundaries, and failures. Keep supported behavior separate from open
   decisions.
6. Edit for direct, stable domain language. Check subjects, causal
   relationships, negation, quantifiers, units, scope, and timing before
   shortening. Apply [the authoring guide](authoring-guide.md) when examples
   help resolve a formulation. No generic action or prose-valued diagnostic
   should hide the domain relation.
7. Map rules, supported relationships, boundaries, and failures to actual
   scenarios and rows. Check the complete candidate for consistent vocabulary,
   arguments, coverage, and one modality per completed Feature. Apply the
   selected Feature tag in the requested format; when a parser is available,
   inspect tags, inherited scenario metadata, rows, and values as well as
   syntax. This does not require generating tests or executing the system.

## Revisions and reformulation

Recover each existing scenario's domain intent and justified coverage. Replace
implementation steps with observable domain behavior; preserve a technical
concept when that concept is itself the subject. Where the mechanism was the
only content, determine its intended observable result from context, or report
the gap. Do not silently remove an equivalence class, boundary, failure,
preserved-state assertion, or contractual literal.

Regroup topic Features into use cases when revising under this convention.
Retain the relationships between resulting Features. A change from programmed
to AI execution replaces the modality tag and preserves applicable domain
behavior; it does not create a hybrid tag or duplicate Feature. Leave language,
framework, runner, checker, and generated file-layout choices open unless the
request establishes them.

## Handoff and corrections

Pass the original inputs, **complete candidate**, concise working vocabulary and
evidence distinctions, coverage map, selected or pending modality, and
unresolved decisions to the editor. Include language/format choices and the
source of any required translation. These are working review inputs, not extra
user-facing files by default.

Fix supported findings across every affected occurrence. If a suggested edit
changes the source's meaning, record that conflict instead of inventing policy.
Return the complete revised candidate, updated coverage, and finding dispositions
for the full recheck, within the skill's two-cycle limit.
