# Prior context

Earlier context: We are specifying executable simulation software for this abstract music-box mechanism. Tests exercise its public inspection, play and performance operations. No human actor is needed.

# Request

Use gherkin-craft to turn the following source into native .feature specifications in output/. Preserve its stated limits. Deliver specifications and any indispensable unresolved decisions only.

# Source material

Constructed explanatory source: a wind-up music box, presented as an abstract mechanism rather than a software design.

A music box has two independent facts: its spring may be wound or unwound, and a tune cylinder may be present or absent. A wound box can lack a cylinder, and an unwound box can contain a cylinder. Inspecting playability reports which of these requirements is missing and changes neither fact.

A play request with a wound spring and a cylinder produces that cylinder's tune once and leaves the spring unwound. If either requirement is missing, the request produces no tune, identifies the missing requirement, and preserves both facts. A repeated request when the spring is now unwound must be assessed from that current condition. No duration or winding energy calculation is defined.

Only one named performance profile is described: Rain. Rain follows an inspect-then-play strategy: inspect playability, play once if playable, otherwise report the missing requirement or requirements. Rain names the profile; inspect-then-play names the composition policy. There is no profile lifecycle named Rain and no catalog-management operation in the source. Additional performance strategies have no defined behavior.

The source's only concrete cylinder is Lark. This name identifies its tune, rather than denoting all possible cylinders. A sample box M-2 is wound and contains Lark; another sample M-3 is wound and has no cylinder. The model deliberately contains no listener, business organization, application service, or test harness.
