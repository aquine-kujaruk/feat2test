> **Retrospective terminology migration — 2026-09-09.** This archived
> design is restated using the later `@code`/`@ai` modality contract from
> `classify-verification-modalities`. It preserves the historical plan's
> scope; it is not evidence of an execution or evaluation performed in 2026.

## Context

The archived skill separated entrypoint, domain discovery, authoring, editing,
formatting, and evaluation guidance. Those routes need a consistent definition
of the intended system, observable behavior, and required verification
evidence. The CLI selects a renderer through `--runner`; this plan never added
modality-based dispatch.

## Goals / Non-Goals

**Goals:** Keep the instruction flow small; give each rule one authoritative
home; preserve discovery and Gherkin guidance; compare changed agent behavior
with a baseline.

**Non-Goals:** Introduce an authoring API, compulsory interview, test execution
platform, modality aliases, generator selection, or directory conventions for
the systems being specified.

## Decisions

### 1. Organize the guide around an intended system

Use one sequence throughout the instructions:

```text
Contextual intent → intended system and observable behavior
                  → relevant domain → complete use cases
                  → one verification modality per Feature
```

The agent applies that sequence. The skill supplies criteria and examples, not
an independent decision maker. Intent can already exist in earlier conversation,
a proposal, or an existing specification. A material gap remains a decision for
the calling agent; it does not trigger a prescribed interview or an invented
purpose.

### 2. Keep guidance responsibilities separate

| Resource | Responsibility |
| --- | --- |
| `SKILL.md` and `agents/openai.yaml` | Purpose, activation, agent/guide distinction, short workflow, resource routing |
| `references/domain-discovery.md` | Relevant domains, contextual language, responsibility boundaries, use-case decomposition |
| `references/verification-modalities.md` | Modality definitions, selection evidence, pending route, and generation limits |
| creator/editor briefs | Apply or review the sequence and complete use cases |
| authoring/formatting references | Worked examples and native/Markdown representation |
| evaluation protocol and corpus | Evidence that agents apply the revised guidance |

### 3. Select execution evidence, not packaging

Every completed Feature receives exactly one tag. `@code` exercises
programmed rules; `@ai` exercises a model or agent interpreting instructions
and context. Rules and scenarios inherit the Feature choice. A real model
behind a software interface can require `@ai`; a fixed model response used to
test programmed handling requires `@code`. Direct agent guidance and the same
guidance through a host remain one `@ai` contract. An unresolved route remains
a named decision, not a combined tag.

A checker cannot select the modality: exact checks of agent-created files remain
`@ai`, and an AI judge of programmed output remains `@code`. Language,
framework, runner, repetition, and file layout remain later decisions.

### 4. Evaluate observed behavior

Freeze the corpus and the complete prior skill before editing. Run preserved and
candidate versions under comparable isolated conditions, inspect parser output
separately from semantics, use independent editorial review, and retain fresh
transfer cases. Record source identity, settings, resource reads, outputs,
limitations, and any unexecuted checks. Do not claim that a future system or its
tests ran because an agent authored a specification.

## Risks / Trade-offs

- Packaging can look like a classification rule: select from execution evidence.
- Mixed implementations can suggest two tags: keep one selected modality and
  name unresolved routes.
- Modality can be mistaken for test technology: preserve later generation
  choices as separate decisions.
- A small corpus can hide regressions: retain semantic cases, independent
  review, and transfer evidence.
- Archive wording can falsify history: retain this note and keep raw historical
  evidence unchanged.

## Migration Plan

1. Preserve the complete prior skill and evaluation evidence.
2. Update guidance, examples, metadata, and evaluation resources together.
3. Check syntax, behavior, activation, and editorial review separately.
4. Accept only with required new evidence and no material semantic regression.
5. Keep generator support as a separate change.
