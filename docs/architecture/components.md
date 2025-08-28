# Components

## Frontend Application (Web)

**Responsibility:** Provides the user interface, handles user interactions, manages client-side state, and communicates with backend services via API calls.

**Key Interfaces:**
- Exposes the web application via a URL (e.g., `lotto-nft.com`).
- Consumes REST API endpoints from the backend.

**Dependencies:** Authentication Service, User Service, Game Service, NFT Service, Lottery Data Service (via API).

**Technology Stack:** Next.js (React, TypeScript), Chakra UI, Zustand, Tailwind CSS.

## Authentication Service

**Responsibility:** Manages user registration, login, session management, and social logins. Provides secure user identity.

**Key Interfaces:**
- `POST /auth/register`
- `POST /auth/login`
- Handles social login redirects (e.g., `/auth/google`).

**Dependencies:** Supabase Auth, Supabase PostgreSQL (for user data).

**Technology Stack:** Next.js API Routes (for integration with Supabase Auth).

## User Service

**Responsibility:** Manages user profiles, retrieves user-specific data (excluding sensitive auth details), and handles user settings.

**Key Interfaces:**
- `GET /user/me` (get current user profile)
- `PUT /user/{id}` (update user profile)

**Dependencies:** Supabase PostgreSQL.

**Technology Stack:** Next.js API Routes, Supabase PostgreSQL.

## Game Service

**Responsibility:** Manages game definitions, tracks user game activity, and awards cryptocurrency for game completion.

**Key Interfaces:**
- `GET /games` (list all active games)
- `GET /games/{id}` (get game details)
- `POST /games/{id}/complete` (record game completion and award crypto)

**Dependencies:** Supabase PostgreSQL (for game data and user game activity), CryptoBalance management.

**Technology Stack:** Next.js API Routes, Supabase PostgreSQL.

## NFT Service

**Responsibility:** Manages NFT definitions, mints NFTs, assigns them to users, and handles dynamic property updates.

**Key Interfaces:**
- `GET /nfts` (list user's NFTs)
- `GET /nfts/{id}` (get NFT details)
- `POST /nfts/mint` (internal: mint a new NFT)
- `PUT /nfts/{id}/feature` (set an NFT as featured)
- `POST /nfts/{id}/update-dynamic-properties` (internal: update dynamic properties based on lottery results)

**Dependencies:** Supabase PostgreSQL (for NFT data), Supabase Storage (for NFT images), External Lottery Results API (for dynamic updates).

**Technology Stack:** Next.js API Routes, Supabase PostgreSQL, Supabase Storage.

## Lottery Data Service

**Responsibility:** Fetches and stores historical lottery draw results from external APIs, and provides this data to the prediction engine.

**Key Interfaces:**
- `GET /lottery/draws` (list recent draws)
- `GET /lottery/draws/{id}` (get specific draw details)
- `GET /lottery/predictions` (provide number suggestions based on historical data)

**Dependencies:** External Lottery Results API, Supabase PostgreSQL (for storing historical data).

**Technology Stack:** Next.js API Routes, Supabase PostgreSQL.

## Component Diagrams

```mermaid
C4Container
    title Lotto-NFT System Components

    Container(web_app, "Web Application", "Next.js (React, TypeScript)", "Provides the user interface and client-side logic.")
    Container(api_gateway, "API Gateway / Backend Services", "Next.js API Routes (TypeScript, Node.js) on Vercel", "Handles all API requests, orchestrates business logic, and integrates with external services.")
    Container(supabase_auth, "Supabase Auth", "Managed Service", "Handles user authentication (email/password, social logins) and user management.")
    Container(supabase_db, "Supabase PostgreSQL Database", "Managed Service", "Stores all application data (users, NFTs, games, lottery draws, crypto balances).")
    Container(supabase_storage, "Supabase Storage", "Managed Service", "Stores NFT image assets and other user-generated files.")
    Container(lottery_api, "External Lottery Results API", "Third-Party API", "Provides historical and current lottery draw results.")

    Rel(web_app, api_gateway, "Makes API Calls", "HTTPS/REST")
    Rel(api_gateway, supabase_auth, "Authenticates Users", "HTTPS")
    Rel(api_gateway, supabase_db, "Reads/Writes Data", "PostgreSQL")
    Rel(api_gateway, supabase_storage, "Manages NFT Assets", "HTTPS")
    Rel(api_gateway, lottery_api, "Fetches Lottery Data", "HTTPS")

    Boundary(user_boundary, "User")
    Person(user, "Lotto-NFT User", "Plays games, collects NFTs, views predictions.")
    Rel(user, web_app, "Uses", "Web Browser")
```
