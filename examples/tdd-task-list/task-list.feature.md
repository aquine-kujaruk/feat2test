# Feature: Task list

The example starts from this executable specification. No application source exists yet.

## Background:

* Given an empty task list

## Rule: Adding tasks

### Scenario: Add one task

* When the user adds "Buy milk"
* Then the task list contains "Buy milk"

### Scenario Outline: Add tasks with a priority

* When the user adds "<item>" with priority "<priority>"
* Then the task list contains "<item>" with priority "<priority>"

#### Examples:

  | item       | priority |
  | ---------- | -------- |
  | Read a book | low      |
  | Pay rent    | high     |

## Rule: Completing tasks

### Scenario: Complete a task

* Given the user added "Call Alice"
* When the user completes "Call Alice"
* Then "Call Alice" is marked as completed
