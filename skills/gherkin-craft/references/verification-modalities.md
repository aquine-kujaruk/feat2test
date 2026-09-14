# Verification modalities

Read for authoring and review. Select the modality from the execution that must
supply evidence for the **whole use case**, not from the kind or packaging of the
system. Apply it as Feature metadata; Rules and scenarios describe the observable
domain contract and inherit the Feature's modality.

| Tag | Required verification evidence |
| --- | --- |
| `@code` | Exercise programmed rules through the use-case interface and observe their results. |
| `@ai` | Exercise a model or agent interpreting instructions and context, and observe the behavior required by the contract, including when invoked through a software interface. |

## Select exactly one modality

Every completed Feature has exactly one of `@code` or `@ai`. The tags are
mutually exclusive. A Rule or scenario cannot add or replace the Feature's
selection. Retain unrelated metadata when applicable.

First identify the behavior whose execution answers the acceptance claim:

- Use `@code` when verification exercises programmed rules. A configuration
  loader that resolves schema references, a host-exposed record lookup, or an
  application handling a supplied model response are programmed behaviors.
- Use `@ai` when verification must exercise a model or agent interpreting
  instructions and context. An agent applying guidance, a model executing a
  prompt, or an agent following a custom configuration or project policy are
  AI behavior even when a software interface or host invokes them.
- A software interface does not decide the tag. A real model classifying ticket
  text through an application is `@ai`; a fixed model response supplied to
  test the application's parsing and triage is `@code`.
- A skill, prompt, plugin, configuration, schema, policy file, or unfamiliar
  instruction format does not decide the tag. These names and packages explain
  context; required execution evidence selects the modality.

When context presents programmed and AI routes but selects neither, preserve the
supported domain contract and identify the specific pending modality decision.
Do not attach both tags, invent a third tag, duplicate the Feature, or add an
Examples column to choose a route. A later selected route replaces the Feature
tag while retaining still-applicable domain behavior.

A distinct public purpose or materially different contract needs its own Feature
and its own selected modality. Several executions within one selected modality,
such as direct guidance and the same guidance through a plugin host, remain one
Feature labeled only `@ai`.

## Keep packaging, dependencies, and checking separate

The modality is not an inventory of dependencies. Internal code, a script, a
model, a plugin host, or a bundled instruction component does not create another
modality. Give a component its own Feature only if an independently requested
whole use case needs specification.

The checker does not select the tag. An agent producing workflow files remains
`@ai` when filenames or contents are checked exactly. A programmed report
generator remains `@code` when an AI judge assesses its report. Exact versus
semantic checks, repetition, deterministic versus stochastic behavior, and
authorship of the implementation are separate concerns.

The selected tag is input to later test-generation work. It does not prescribe a
test language, framework, runner, provider, judge, optimizer, repetition count,
or number, names, and organization of generated support files. Keep acceptance
criteria meaningful independently of those choices. When tests are requested,
identify the necessary execution evidence and inspect available generator or
adapter support. This repository's CLI selects a renderer with `--runner`; it
does not dispatch by modality. Report unsupported scaffolding honestly rather
than claiming it was generated or executed.

## Apply the tag in Gherkin

Use [format and language](gherkin-format.md) for native and Markdown placement.
A parser can retain tags and inherited metadata but cannot establish that the
selection is semantically correct. Review combined tags or a Rule/scenario
override as classification defects even if parser syntax accepts them.
