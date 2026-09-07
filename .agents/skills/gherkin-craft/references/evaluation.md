# Evaluate a revision of Gherkin Craft

Read only when maintaining or evaluating the skill. Ordinary specification work
does not load the corpus or require an implementation, runner, model provider,
viewer, or evaluation report. Assess the produced specifications against their
source and intended executable objective; parsing them does not execute or
empirically validate their domain. The agent applies the guide; seeing desired
words in its instructions is not evidence of that agent behavior.

## Separate inputs from evaluator knowledge

Use [the manifest](../evals/manifest.json) for cases and provenance,
[the semantic rubric](../evals/rubric.json) for assessment, and
[activation cases](../evals/activation.json) for selection checks. Case-specific
criteria belong to evaluator-only resources, never authoring inputs. Freeze raw
requests, sources, output constraints, and applicable criteria before comparing.

The corpus covers software requirements, a real-world procedure, explanatory
prose, and a transcript. They are constructed fixtures, not excerpts from
published works or real recordings. Sources are paired with contextual executable
objectives or a deliberately unresolved objective. Preserve explicit scope, review-only
constraints, native/Markdown formats, language choices, ambiguity and missing
policy alongside the abstraction and composition cases. Do not replace this
coverage with repetitions of the motivating example. Include all four
[verification targets](verification-targets.md), a deliberately shared contract
with multiple targets, and dependencies that must not add target tags. Contrast
the same source used for different objectives and clear intent carried from an
earlier exchange with genuinely missing intent.

An independent evaluator chooses and retains reserved sources and case-specific
criteria while instructions are being authored. The author receives only broad
coverage categories until the candidate is frozen. A case stops being reserved
when its results influence an edit: promote it to development and replace it
with a newly retained case before another transfer claim. For later maintenance,
previously published reserved cases are regression cases; select new unseen
ones rather than claiming the author has not seen them.

## Preserve and select exact versions

Use Red–Green–Refactor: freeze cases and record the old guide's behavior; revise
against supported failures; then consolidate instructions and recheck the changed
version. A syntactically valid chapter-based output that misses the requested
asset fails purpose and decomposition, irrespective of its formatting quality.

1. Before rewriting, snapshot the entire old skill, including metadata and all
   references. Record file hashes and verify the copy. Keep snapshots, outputs,
   raw logs and reports in an ignored evaluation workspace outside normal skill
   discovery, for example `.artifacts/gherkin-craft-eval/<revision>/`.
2. Run the preserved version on development inputs before modifying instructions.
   Use a fresh context per case. Supply only the selected skill version and the
   raw case, with its explicit output constraints. Do not supply this change's
   diagnoses, rubric, expected answers, earlier run output, or the other version.
3. Record the exact request/source identity, skill hashes, host/model version,
   reasoning and generation settings, tools, effective instruction sources,
   selected skill path, artifacts and available time/token/cost data. Inspect
   actual resource reads; a clean folder alone does not prove context isolation.
4. Run the candidate under equivalent conditions. Keep prompts, tools, model and
   settings equal; record unavoidable differences. Do not silently substitute a
   different baseline or select only favorable runs.

A fresh project root and exact-version resources can reduce contamination.
Global instructions or skill catalogs may still be visible in a host. Record
those limitations; do not claim a fully controlled causal comparison when
effective instructions cannot be isolated. An unavailable independent editorial
tool is not a successful editor pass; distinguish actual delegation from a
separate local pass and from the external evaluator's independent assessment.

## Assess actual behavior

Have an evaluator independent of the instruction author inspect each complete
output against the raw source and predeclared criteria. For each applicable
criterion record `pass`, `fail`, or `unverified`, the supporting source/output
locations, and any uncertainty. Use `not applicable` only with a reason.

Assess fidelity and evidence, useful abstraction, consistent terminology,
one-use-case boundaries and composition, relevant state/event and boundary
coverage, meaningful arguments, implementation independence, language/format,
and requested deliverable scope. Unknown policy, explicit restrictions,
quantifiers, diagnostics, relative selectors and independent dimensions matter.
Imported domain concepts or unsupported consequences are failures; larger
taxonomies, more Features, more parameters and preferred wording are not quality
metrics. Assess purpose fit, context reuse, proposed domain decomposition, and
Detroit boundaries independently of tag correctness. An unknown objective
reported honestly is a handled gap, not a completed target specification. A
source-only contract offered as complete while deferring its objective fails.
Check that target tags identify exercised boundaries rather than dependencies,
and that different test routes do not duplicate the domain contract. A material
semantic failure cannot be averaged away by other scores.

Where a parser applies, inspect interpreted examples and values: bindings,
rows, relative positions, units, data tables, counts, dialect, Feature tags and
their inheritance. In Markdown, multiple tags require separate code spans. Check semantic
claims independently. Review-only cases must leave files untouched and identify
the supplied specification's supported defects without discarding valid coverage.

Resolve supported development findings and rerun affected cases. Recheck shared
instructions and compatibility when they change. Retain disagreements and prior
results. Start with one run per case; repeat when material variability or a
disagreement needs resolution, reporting uncertainty instead of cherry-picking.

## Freeze and check transfer

After development corrections and checks, freeze the candidate's instruction
and metadata hashes. Only then compare both versions on the reserved cases under
the same conditions. Check the unfamiliar source's own relationships and
constraints; do not grade similarity to teaching examples. Follow the reservation
rule above if the result requires instruction changes. Retain source identities,
outputs and findings for later reproduction.

## Observe activation separately

Run positive requests and near-miss negatives in the actual target host with
normal skill discovery. Include explicit invocation, requests that seek domain
rules without saying Gherkin with executable intent supplied in prior context,
ordinary summaries and ordinary code tasks. Record
whether the skill was actually loaded and its selected path. A model saying it
would select the skill is not evidence. A selection test must not pre-load the
skill or tell the model the expected selection.

Report false positives, missed relevant requests, and explicit-invocation
behavior separately from output quality. CLI observations can supplement a
desktop test but do not prove desktop activation. If the target observation is
unavailable, mark it **unexecuted** with the reason; do not simulate a pass or
silently change the host under evaluation.

## Report and acceptance

Distinguish three observations: an agent actually ran using the guide; a parser
retained the generated metadata and examples; the specified future asset's tests
executed. The first two do not establish the third. No existing implementation
or test scaffolding is needed to assess the first two.

Produce a concise comparison report with version/source identities, coverage,
conditions and confounds, criterion-level source/output evidence, independent
review findings and their dispositions, available costs, and every unexecuted
or unverified check. Link raw artifacts without placing run outputs among
ordinary instructions. Corpus and protocol stay with the skill.

Acceptance requires the predeclared mandatory checks on selected cases, at least
one evidenced purpose, decomposition, or boundary correction relative to the
preserved version beyond adding labels, and no material regression in retained
guarantees. State the limits of
the small corpus. Unexecuted required comparisons prevent claiming the behavior
validated; syntax checks or document review do not substitute for those runs.
Report activation's status separately, including any unexecuted observation.

## Construction guidance consulted

- [OpenAI: Build skills](https://learn.chatgpt.com/docs/build-skills)
- [Agent Skills specification](https://agentskills.io/specification)
- [Anthropic: Skill authoring practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Evaluating skills](https://agentskills.io/skill-creation/evaluating-skills)
- [Optimizing descriptions](https://agentskills.io/skill-creation/optimizing-descriptions)
- [Pickled State](https://blog.cleancoder.com/uncle-bob/2018/06/06/PickledState.html)

These sources inform skill construction and coverage exploration. They do not
supply policies for the domains later specified or establish that an older
skill creator is obsolete.
