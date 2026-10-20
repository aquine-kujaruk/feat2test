@billing @slow
Feature: Check out a basket

  One customer owns the basket. Prices are in euros and shown with two decimals.

  Background:
    Given the shop sells: <!-- shopSells -->
      | product      | unitPrice |
      | Pencil       | 1.50      |
      | Notebook     | 3.00      |
      | Ink \| black | 0.00      |

  @pricing
  Rule: The total is the sum of each unit price times its quantity

    Scenario Outline: Charge <total> EUR for <quantity> × <product>
      Given the basket holds <quantity> of "<product>" <!-- basketHolds -->
      When the customer checks out <!-- checkOut -->
      Then the receipt reads <total> EUR and the card is charged <total> EUR <!-- totalCharged -->
      And the basket is empty <!-- basketIsEmpty -->

      Examples: Usual basket
        | quantity | product | total |
        | 4        | Pencil  | 6.00  |

      Examples: Boundaries confirmed with the expert
        | quantity | product      | total |
        | 0        | Pencil       | 0.00  |
        | 1        | Ink \| black | 0.00  |

  Rule: Checking out an unavailable product is rejected and keeps the basket

    Scenario Outline: Reject <product> while it is out of stock
      # Same method as above: the name, not the words, is a step's identity.
      Given The basket, holds <quantity> of <product> <!-- basketHolds -->
      But "<product>" is out of stock <!-- productOutOfStock -->
      When the customer checks out <!-- checkOut -->
      Then checkout is rejected with: <!-- checkoutRejected -->
        """
        <product> is out of stock.
        Nothing was charged.
        """
      And the basket still holds <quantity> of "<product>" <!-- basketStillHolds -->

      Examples:
        | quantity | product       |
        | 2        | Notebook      |
        | 1        | O'Brien's Ink |

  Rule: Asking for the total changes nothing

    @smoke
    Scenario: Show the total of 3 pencils before paying
      * the basket holds 3 pencils <!-- basketHoldsThreePencils -->
      When the customer asks for the total <!-- requestTotal -->
      Then the total shown is 4.50 EUR <!-- totalShown -->
      * the basket still holds 3 pencils <!-- basketStillHoldsThreePencils -->

  Rule: The delivery class sets the fee

    Scenario Outline: Pay <fee> EUR for <class> delivery
      Given the customer's café card is <card> <!-- customerCard -->
      And delivery class is <class> <!-- deliveryClass -->
      When the customer checks out <!-- checkOut -->
      Then the delivery fee is <fee> EUR <!-- deliveryFee -->

      Examples:
        | card | class    | fee  |
        | none | standard | 0.00 |
        | gold | express  | 4.90 |

    Scenario Outline: Express delivery costs the same for any basket
      Given the basket holds <quantity> of "<product>" <!-- basketHolds -->
      And delivery class is <class> <!-- deliveryClass -->
      When the customer checks out <!-- checkOut -->
      Then the delivery fee is <fee> EUR <!-- deliveryFee -->

      Examples:
        | quantity | product  | class   | fee  |
        | 1        | Pencil   | express | 4.90 |
        | 5        | Notebook | express | 4.90 |
