import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createJiti } from 'jiti'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { compileExample } from '../scripts/compile-example.js'

describe('compileExample', () => {
  let root = ''

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'gherkin-vitest-example-'))
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  test('scaffolds deterministic no-world tests from one Markdown specification', async () => {
    await put(
      'task-list.feature.md',
      `# Feature: Task list

## Background:

* Given an empty task list

## Rule: Adding tasks

### Scenario Outline: Add a prioritized task

* When the user adds "<item>" with priority "<priority>"
* Then the task list contains "<item>" with priority "<priority>"

#### Examples:

  | item      | priority |
  | --------- | -------- |
  | Buy milk  | high     |
  | Read book | low      |
`,
    )

    const compilation = await compileExample(root)

    expect(compilation.report).toMatchObject({ featureCount: 1, scenarioCount: 2, stepCount: 6 })
    expect(compilation.artifactPaths.map((value) => path.relative(root, value))).toEqual([
      'gherkin-vitest.config.ts',
      'test/steps/task-list.steps.ts',
      'test/generated/task-list.generated.test.ts',
    ])

    const config = await read('gherkin-vitest.config.ts')
    expect(config).toContain("factory: 'taskListSteps'")
    expect(config).toContain('^the user adds "([^"]*)" with priority "([^"]*)"$')
    expect(config).not.toContain('world')

    const steps = await read('test/steps/task-list.steps.ts')
    expect(steps).toContain('export function taskListSteps()')
    expect(steps).toContain('theUserAddsWithPriority(item: string, priority: string)')
    expect(steps).toContain('TODO: When the user adds')
    expect(steps).not.toContain('world')

    const generated = await read('test/generated/task-list.generated.test.ts')
    expect(generated).toContain("import { describe, test } from 'vitest'")
    expect(generated).toContain('const taskList = taskListSteps()')
    expect(generated).toContain('await taskList.theUserAddsWithPriority("Buy milk", "high")')
    expect(generated).toContain(
      'await taskList.theTaskListContainsWithPriority("Read book", "low")',
    )
    expect(generated).not.toContain('world')
    await expect(stat(path.join(root, 'src'))).rejects.toThrow()
    await expect(stat(path.join(root, 'test/support'))).rejects.toThrow()

    const stepModule = (await createJiti(import.meta.url).import(
      path.join(root, 'test/steps/task-list.steps.ts'),
    )) as { taskListSteps(): { anEmptyTaskList(): void } }
    expect(() => stepModule.taskListSteps().anEmptyTaskList()).toThrow(
      'TODO: Given an empty task list',
    )
  })

  test('scaffolds another example with several concrete steps and escaped patterns', async () => {
    await put(
      'door-lock.feature',
      `Feature: Door lock
  Scenario: Grant access
    Given a lock at "front/door"
    When code "12.34" is entered
    Then access is "granted"
`,
    )

    const compilation = await compileExample('door-lock.feature', root)
    const generated = await read('test/generated/door-lock.generated.test.ts')

    expect(compilation.report).toMatchObject({ scenarioCount: 1, stepCount: 3 })
    expect(generated).toContain('await doorLock.aLockAt("front/door")')
    expect(generated).toContain('await doorLock.codeIsEntered("12.34")')
    expect(generated).toContain('await doorLock.accessIs("granted")')
  })

  test('rejects an unconfigured example containing multiple specifications', async () => {
    await put('first.feature.md', simpleFeature('First'))
    await put('nested/second.feature.md', simpleFeature('Second'))

    await expect(compileExample(root)).rejects.toThrow('Expected one feature')
  })

  async function put(relativePath: string, contents: string): Promise<void> {
    const absolutePath = path.join(root, relativePath)
    await mkdir(path.dirname(absolutePath), { recursive: true })
    await writeFile(absolutePath, contents, 'utf8')
  }

  async function read(relativePath: string): Promise<string> {
    return readFile(path.join(root, relativePath), 'utf8')
  }
})

function simpleFeature(name: string): string {
  return `# Feature: ${name}
### Scenario: Example
* Given a step
`
}
