# External APIs

## Lottery Results API

-   **Purpose:** To fetch historical and current lottery draw results to power the prediction engine and potentially trigger dynamic NFT property updates.
-   **Documentation:** (To be determined - placeholder for now)
-   **Base URL(s):** (To be determined - placeholder for now)
-   **Authentication:** (To be determined - likely API Key or no auth for public data)
-   **Rate Limits:** (To be determined - will need to check API provider's terms)

**Key Endpoints Used:**
-   `GET /draws` - Get a list of recent lottery draws.
-   `GET /draws/{id}` - Get details for a specific lottery draw.

**Integration Notes:** We will need to research and select a reliable third-party lottery results API. Data fetching will likely be scheduled (e.g., daily) to update our internal `LotteryDraw` database. Error handling for API failures and data inconsistencies will be critical.
