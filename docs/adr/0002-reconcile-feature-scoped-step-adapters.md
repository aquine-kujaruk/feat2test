# Reconcile feature-scoped Step Adapters

Each Feature owns one developer-edited Step Adapter whose method bodies survive regeneration. The generator identifies methods by Step Name, uses its own runtime TypeScript dependency to apply position-based AST patches to the supported `createSteps()` return-object shape, adds or marks Pending Steps when contracts change, warns about Obsolete Steps locally, and fails `--check` until they are removed. Methods are ordered by Step Role—Context, Action, Outcome, then Obsolete—while preserving their bodies.
