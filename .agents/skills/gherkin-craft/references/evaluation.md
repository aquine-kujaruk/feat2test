# Evaluate a revision of Gherkin Craft

Read only when maintaining or evaluating the skill. Ordinary specification work
does not load the corpus or require an implementation, runner, model provider,
viewer, or evaluation report. Assess produced specifications against their source
and intended system; parsing them does not execute or empirically validate the
system. The agent applies the guide; seeing desired words in its instructions is
not evidence of that behavior.

## Separate inputs from evaluator knowledge

Use [the manifest](../evals/manifest.json) for cases and provenance,
[the semantic rubric](../evals/rubric.json) for assessment, and
[activation cases](../evals/activation.json) for selection checks. Case-specific
criteria belong to evaluator-only resources, never authoring inputs. Freeze raw
requests, sources, output constraints, and applicable criteria before comparing.

The corpus covers software requirements, a real-world procedure, explanatory
prose, transcripts, custom configurations, and unfamiliar instruction formats.
It includes programmed behavior, model or agent interpretation, an unresolved
modality, combined or conflicting tags to reject, and a completed modality with
language, framework, runner, and file layout deferred. It also contrasts a real
model behind an application with programmed handling of a supplied response,
exact checking of agent behavior with an AI judge of programmed behavior, and
the same AI behavior exposed through different hosts. These are constructed
fixtures, not published sources or product implementations.

An independent evaluator retains fresh transfer inputs and case-specific criteria
while instructions are authored. The author receives only broad coverage
categories until the candidate is frozen. A case stops being reserved when its
results influence an edit: promote it to development and replace it before
another transfer claim. Previously published transfer cases are regression
material; do not call them unseen.

## Preserve and select exact versions

Use Red–Green–Refactor: freeze cases and record the prior guide's behavior;
revise against supported failures; then consolidate instructions and recheck the
changed version. A syntactically valid chapter-based output that misses the
requested system fails purpose and decomposition, irrespective of formatting.

1. Before rewriting, snapshot the entire old skill, including metadata and all
   references. Record file hashes and verify the copy. Keep snapshots, outputs,
   raw logs, and reports in an ignored evaluation workspace outside normal skill
   discovery.
2. Run the preserved version on frozen development and regression inputs in a
   fresh context per case. Supply only the selected skill version and raw case,
   with explicit output constraints. Do not supply the revision's diagnoses,
   rubric, expected answers, earlier output, or another version.
3. Record request/source identity, skill hashes, host/model version, reasoning
   and generation settings, tools, effective instruction sources, selected skill
   path, artifacts, and available time/token/cost data. Inspect actual resource
   reads; a clean folder alone does not prove context isolation.
4. Run the candidate under equivalent conditions. Keep prompts, tools, model,
   and settings equal; record unavoidable differences. Do not silently
   substitute a different baseline or select only favorable runs.

A fresh project root and exact-version resources can reduce contamination.
Global instructions or skill catalogs may still be visible in a host. Record
those limitations; do not claim a fully controlled causal comparison when
effective instructions cannot be isolated. An unavailable independent editorial
tool is not a successful editor pass; distinguish actual delegation from a
separate local pass and from the external evaluator's independent assessment.

## Assess actual behavior

Have an evaluator independent of the instruction author inspect each complete
output against raw source and predeclared criteria. For each applicable criterion
record `pass`, `fail`, or `unverified`, with supporting source/output
locations and uncertainty. Use `not applicable` only with a reason.

Assess fidelity and evidence, useful abstraction, consistent terminology, whole
use-case boundaries and composition, relevant state/event and boundary coverage,
meaningful arguments, implementation independence, language/format, and
deliverable scope. Assess purpose fit, context reuse, proposed domain
decomposition, and Detroit boundaries independently of modality correctness.

For modality, identify the execution that must supply evidence for each complete
Feature. Require exactly one Feature-level `@code` or `@ai`; Rules and
scenarios inherit it. Reject combined tags, a child override, duplicate Features,
or Examples parameters used only to choose a route. Packaging, dependencies,
names, public software interfaces, exact or semantic checkers, an AI judge,
determinism, language, framework, runner, and file layout do not decide the
modality. A real model or agent interpreting instructions is `@ai`; programmed
handling of a supplied response and programmed output assessed by an AI judge
are `@code`. A genuinely unselected route remains a pending decision with
supported domain behavior, not an incomplete objective or an invented tag.

Where a parser applies, inspect interpreted examples and values: bindings, rows,
relative positions, units, DataTables, counts, dialect, Feature tags, and
inheritance. In Markdown, each tag occupies its own code span; an unrelated tag
may coexist with the one modality tag. Parsing cannot validate the selection.
Review-only cases must leave files untouched and identify supplied
specification defects without discarding valid coverage.

Resolve supported development findings and rerun affected cases. Recheck shared
instructions and compatibility after material changes. Retain disagreements and
prior results. Start with one run per case; repeat only when material variability
or a disagreement requires it, reporting uncertainty rather than cherry-picking.

## Freeze and check transfer

After development corrections and checks, freeze candidate instructions and
metadata hashes. Only then compare prior and candidate guides on fresh reserved
inputs under equivalent conditions. Assess the unfamiliar source's own
relationships and constraints, not similarity to teaching examples. If results
require an instruction edit, promote the input to development and reserve another
before making a new transfer claim. Retain source identities, outputs, and
findings for reproduction.

## Observe activation separately

Run positive requests and nearby negative requests in the actual target host
with normal skill discovery. Include explicit invocation, requests seeking domain
rules without saying Gherkin when intended system behavior appears in earlier
context, ordinary summaries, and ordinary code tasks. Record whether the skill
was actually loaded and its selected path. A statement that it would select the
skill is not evidence. A selection test must not pre-load the skill or tell the
model the expected selection.

Report false positives, missed relevant requests, and explicit-invocation
behavior separately from output quality. CLI observations can supplement a
desktop test but do not prove desktop activation. If target observation is
unavailable, mark it **unexecuted** with the reason; do not simulate a pass or
silently change the host under evaluation.

## Report and acceptance

Distinguish three observations: an agent actually ran using the guide; a parser
retained generated metadata and examples; the intended system's tests executed.
The first two do not establish the third. No existing implementation or test
scaffolding is needed to assess the first two.

Produce a concise comparison report with version/source identities, coverage,
conditions and confounds, criterion-level source/output evidence, independent
review findings and dispositions, available costs, and every unexecuted or
unverified check. Link raw artifacts without placing run outputs among ordinary
instructions. Corpus and protocol stay with the skill.

Acceptance requires predeclared mandatory checks on selected cases, an evidenced
purpose, decomposition, or boundary correction beyond labels, no material
regression in retained guarantees, and complete migration of authored
terminology. State the corpus limits. Unexecuted required comparisons prevent
claiming behavior validated; syntax checks or document review do not substitute
for observed agent runs. Report activation separately.
