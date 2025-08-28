# Epic 2: Gamification & Core Feature Maturation

## Story 2.1: Enhanced Prediction Engine Features

As a logged-in user,
I want to access more detailed lottery prediction data and analysis tools,
so that I can make more informed decisions or simply enjoy deeper insights.

### Acceptance Criteria

1.  Prediction engine displays additional historical data (e.g., frequency of numbers, hot/cold numbers).
2.  Prediction engine offers advanced analysis tools (e.g., customizable filters, trend graphs).
3.  Data visualizations are clear, interactive, and maintain the transparency disclaimer.

## Story 2.2: Additional In-App Game

As a logged-in user,
I want to play a second, different in-app game,
so that I have more variety in earning cryptocurrency.

### Acceptance Criteria

1.  User can access and play a new, distinct in-app game.
2.  Upon completing the game, user is awarded a fixed amount of placeholder cryptocurrency.
3.  The new game provides immediate, clear, and visually engaging confirmation of crypto earning.

## Story 2.3: Real Crypto Integration - Earning

As a logged-in user,
I want to earn real cryptocurrency instead of placeholder currency,
so that my in-app earnings have tangible value.

### Acceptance Criteria

1.  System integrates with a chosen blockchain to mint and transfer real cryptocurrency to user wallets upon game completion.
2.  User's in-app wallet displays real cryptocurrency balance.
3.  All previous placeholder crypto is converted to real crypto (if applicable, or a clear migration strategy is defined).
4.  Transaction details (e.g., transaction ID, timestamp) are accessible to the user.
5.  All crypto earning events are logged internally with sufficient detail for auditing and debugging (e.g., user ID, amount, source, timestamp, blockchain transaction ID).

## Story 2.4: Real Crypto Integration - Basic Spending (e.g., Game Entry)

As a logged-in user,
I want to use my earned real cryptocurrency to access certain in-app features (e.g., enter a premium game),
so that I can experience the utility of my earnings.

### Acceptance Criteria

1.  User can spend real cryptocurrency for defined in-app actions.
2.  User's real crypto balance is debited upon spending.
3.  User receives immediate confirmation of successful spending.
4.  System provides clear, actionable, and user-friendly error messages for failed transactions (e.g., "Insufficient balance," "Transaction failed: network error").
5.  User is guided on how to resolve common transaction failures (e.g., "Please top up your balance," "Try again later").
6.  All crypto spending events are logged internally with sufficient detail for auditing and debugging (e.g., user ID, amount, destination, timestamp, blockchain transaction ID).
