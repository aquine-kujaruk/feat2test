`@orders` `@regression`
# Feature: Confirm an order

Each order holds lines of a product, a unit price and a quantity. Money shows
two decimals; a zero price is a free sample; a repeated product adds up.

## Background:

* Given these orders exist:
  | order | product  | unitPrice | quantity |
  | ----- | :------- | --------: | :------: |
  | 1     | Pencil   | 1.50      | 4        |
  | 1     | Notebook | 3.00      | 2        |
  | 2     | Pencil   | 0.10      | 3        |
  | 2     | Notebook | 0.00      | 1        |
  | 3     | Pencil   | 1.50      | 4        |
  | 3     | Pencil   | 1.50      | 4        |
  | 4     | Pencil   | 1.50      | 1        |
  | 4     | Eraser   | 0.50      | 1        |

## Rule: An order is confirmed when every requested product is available

### Scenario Outline: Confirm order <order> worth <total>

* Given every requested product is available
* When the customer confirms order `<order>`
* Then the order is confirmed
* And the order total is `<total>`

#### Examples: Usual order

  | order | total |
  | ----- | ----- |
  | 1     | 12.00 |

#### Examples: Boundaries confirmed with the expert

  | order | total |
  | 2     | 0.30  |
  | 3     | 12.00 |

## Rule: An unavailable product prevents confirmation and keeps the order

### Scenario Outline: Reject order <order> because <product> is unavailable

* Given product `<product>` is unavailable
* When the customer confirms order `<order>`
* Then confirmation of order `<order>` is rejected
* And the rejection names the unavailable products:
  | product   |
  | <product> |
* But order `<order>` still holds `<lines>` lines

#### Examples:

  | order | product | lines |
  | 4     | Eraser  | 2     |
