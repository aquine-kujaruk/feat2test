# Feature: Calculator display

The display follows Spanish number conventions.

## Background:

* Given a calculator with an empty display

## Rule: Expression and result flow

### Scenario: View expression during entry

* When the user enters "12+3" without pressing equals
* Then the display shows "12+3"

### Scenario: View result after evaluation

* When the user enters "12+3" without pressing equals
* And the user presses equals
* Then the display shows "15"

## Rule: Spanish number presentation

### Scenario Outline: Display a grouped decimal value

* When the current value is <value>
* Then the display shows "<formatted>"

#### Examples:

  | value   | formatted |
  | ------- | --------- |
  | 1234.56 | 1.234,56  |
  | 0.5     | 0,5       |

### Scenario: Enter a decimal separator

* When the user presses the comma button while entering "3"
* Then the display shows "3,"

## Rule: Error presentation

### Scenario: Display invalid result

* When the user enters "1/0" without pressing equals
* And the user presses equals
* Then the display shows "Error"
