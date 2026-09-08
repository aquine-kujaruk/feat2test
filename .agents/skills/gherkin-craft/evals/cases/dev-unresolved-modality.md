# Prior context

Earlier context: The product team has established a code-review behavior and
its acceptance rules. They have not selected whether verification will exercise
programmed review rules or an agent interpreting review guidance. The filename,
packaging, test language, framework, runner, and generated file layout are also
undecided.

# Request

Use gherkin-craft to write native .feature specifications in output/ for the
established review behavior. State any indispensable pending decision. Do not
implement the reviewer or tests.

# Source material

Constructed review requirements. A review finding identifies a changed file, a
violated public rule, and an input that exposes the defect. If no defect is
supported, the review reports no supported finding. Reviewing changes no project
files. The supplied change removes a required export named formatEntry from
public.ts; importing formatEntry exposes the defect. Unrelated meeting notes are
out of scope.
