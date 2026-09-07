# Verification targets

Read for authoring and review. Ask what asset a test will exercise to verify the
whole use case. Apply that boundary as Feature metadata; steps describe the
observable domain contract. Target kind does not mean deterministic or stochastic.

| Tag | Asset exercised to verify the contract |
| --- | --- |
| `@code` | Executable software through its use-case interface, including software that calls a model. |
| `@skill` | An agent applying the skill's guidance to perform the use case. |
| `@prompt` | A model executing the prompt with the use case's inputs. |
| `@plugin` | The plugin's exposed behavior exercised through its host integration. |

## Choose the boundary

Infer the intended verification from context. Label every completed Feature,
preserving other applicable metadata. If the target cannot be classified, expose
the pending decision rather than inventing a category or declaring the contract
complete. Use [format and language](gherkin-format.md) for tag placement.

The tag is not an inventory of dependencies. An application's internal model
does not add `@prompt`; a script inside a skill does not add `@code`; packaging a
skill in a plugin does not by itself add `@skill` to a plugin test. Internal
components get separate contracts only for independently requested public uses.

Keep the target's implementation out of acceptance premises. For a planned
prompt, specify the source inputs and required response; do not author a prompt
inside a Given and make its exact wording part of the contract. The same applies
to reproducing a skill's instructions or a software algorithm. Existing code or
prompt text can be legitimate input when the use case actually examines that
text, such as reviewing a supplied change.

## Share a contract when its outcomes are shared

Use multiple tags when the same complete contract is deliberately verified
through multiple asset boundaries. A review tested both by an agent applying a
skill and through the hosting plugin has one Feature with `@skill @plugin`.
Its steps remain applicable to both; do not parameterize the test route in
Examples solely to choose a harness or duplicate scenarios for each runner.

Different public purposes or materially different contracts need separate
Features even if their implementations cooperate. Preparing a negotiation and
evaluating an offer remain different use cases. Multiple strategies for one
asset kind reuse its single tag.

## Keep execution choices separate

Tags can guide scaffolding selection. They do not prescribe Vitest, SkillOps,
a provider, judge, optimizer, repetitions, or scoring method. A skill checked by
exact file comparisons and one checked by semantic criteria both remain `@skill`.
Domain assertions must describe meaningful outcomes under either valid strategy.

When asked to generate tests, check what the available generator and adapters
actually support. This repository's current feat2test CLI selects a renderer
with `--runner`; it does not dispatch by these asset tags. Identify unsupported
target scaffolding explicitly. Tags alone neither generate an adapter nor prove
that tests or the future asset ran. Adapter generation is separate work.
