// Scaffolded by yarn run:example. Implement these test adapters during TDD.
export function taskListSteps() {
  return {
    anEmptyTaskList(): void {
      throw new Error('TODO: Given an empty task list')
    },
    theUserAdds(value: string): void {
      void value
      throw new Error('TODO: When the user adds "Buy milk"')
    },
    theTaskListContains(value: string): void {
      void value
      throw new Error('TODO: Then the task list contains "Buy milk"')
    },
    theUserAddsWithPriority(item: string, priority: string): void {
      void item
      void priority
      throw new Error('TODO: When the user adds "<item>" with priority "<priority>"')
    },
    theTaskListContainsWithPriority(item: string, priority: string): void {
      void item
      void priority
      throw new Error('TODO: Then the task list contains "<item>" with priority "<priority>"')
    },
    theUserAdded(value: string): void {
      void value
      throw new Error('TODO: Given the user added "Call Alice"')
    },
    theUserCompletes(value: string): void {
      void value
      throw new Error('TODO: When the user completes "Call Alice"')
    },
    isMarkedAsCompleted(value: string): void {
      void value
      throw new Error('TODO: Then "Call Alice" is marked as completed')
    },
  }
}
