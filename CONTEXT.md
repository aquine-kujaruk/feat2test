# Gherkin Vitest Code Generation

This context turns Gherkin specifications into deterministic tests that can drive development.

## Language

**Feature Test**:
An executable test derived from the examples of a Gherkin Feature and used to drive behavior development.
_Avoid_: Acceptance test, end-to-end test

**Valid Gherkin**:
Source content that yields a named Feature, executable scenarios, and valid Pickles, independently of its filename or presentation format.
_Avoid_: Valid extension

**Step Name**:
The stable identity derived from a step's normalized literal words, excluding dynamic input values. Input parameters may change without changing this identity.
_Avoid_: Step Signature, method signature

**Step Role**:
The semantic position of a step in a scenario: Context, Action, or Outcome. `And` and `But` inherit the preceding role.
_Avoid_: Expect step

**Step Adapter**:
The developer-owned implementation of the Step Names required by one Feature, with fresh state for each scenario.
_Avoid_: Shared step registry

**Obsolete Step**:
A step implementation whose Step Name is no longer required by its Gherkin specification.
_Avoid_: Unused step

**Pending Step**:
A new or structurally changed step implementation that deliberately remains RED until a developer adapts it to the current Feature.
_Avoid_: Stub

**Anonymous Step Input**:
A dynamic literal whose Gherkin scenario provides no semantic placeholder name. It remains valid but receives a generic name and an educational warning.
_Avoid_: Invalid input

**Orphaned Feature Output**:
A generated Feature Test and Step Adapter pair whose recorded Gherkin source no longer exists.
_Avoid_: Stale test
