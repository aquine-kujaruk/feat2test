// Generated from task-list.feature.md by gherkin-vitest-codegen.
// Do not edit by hand.
import { describe, test } from 'vitest'
import { taskListSteps } from "../steps/task-list.steps"

describe("Feature: Task list", () => {
  describe("Rule: Adding tasks", () => {
    // task-list.feature.md:11
    test("Add one task", async () => {
      const taskList = taskListSteps()

      // Given an empty task list
      await taskList.anEmptyTaskList()
      // When the user adds "Buy milk"
      await taskList.theUserAdds("Buy milk")
      // Then the task list contains "Buy milk"
      await taskList.theTaskListContains("Buy milk")
    })

    // task-list.feature.md:25
    test("Add tasks with a priority (item=Read a book, priority=low)", async () => {
      const taskList = taskListSteps()

      // Given an empty task list
      await taskList.anEmptyTaskList()
      // When the user adds "Read a book" with priority "low"
      await taskList.theUserAddsWithPriority("Read a book", "low")
      // Then the task list contains "Read a book" with priority "low"
      await taskList.theTaskListContainsWithPriority("Read a book", "low")
    })

    // task-list.feature.md:26
    test("Add tasks with a priority (item=Pay rent, priority=high)", async () => {
      const taskList = taskListSteps()

      // Given an empty task list
      await taskList.anEmptyTaskList()
      // When the user adds "Pay rent" with priority "high"
      await taskList.theUserAddsWithPriority("Pay rent", "high")
      // Then the task list contains "Pay rent" with priority "high"
      await taskList.theTaskListContainsWithPriority("Pay rent", "high")
    })
  })

  describe("Rule: Completing tasks", () => {
    // task-list.feature.md:30
    test("Complete a task", async () => {
      const taskList = taskListSteps()

      // Given an empty task list
      await taskList.anEmptyTaskList()
      // Given the user added "Call Alice"
      await taskList.theUserAdded("Call Alice")
      // When the user completes "Call Alice"
      await taskList.theUserCompletes("Call Alice")
      // Then "Call Alice" is marked as completed
      await taskList.isMarkedAsCompleted("Call Alice")
    })
  })
})
