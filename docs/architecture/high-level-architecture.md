# High Level Architecture

## Technical Summary

The Lotto-NFT application will be built as a unified full-stack web application using **Next.js (React/Node.js)** within a **monorepo structure**. The architecture will initially be a modular monolith, designed for a future transition to microservices. Frontend and backend will communicate via a **REST API**. Deployment will leverage a major cloud provider (e.g., AWS, GCP, or Azure) to ensure scalability and reliability, with a focus on cost-effectiveness for the MVP. This approach aims to deliver an engaging, performant, and secure platform that transforms the lottery experience.

## Platform and Infrastructure Choice

**Platform:** Vercel + Supabase
**Key Services:** Vercel: Frontend hosting, serverless functions (for Next.js API routes), global CDN, automatic deployments. Supabase: PostgreSQL database, authentication, real-time capabilities, file storage (for NFTs).
**Deployment Host and Regions:** Vercel's global edge network for frontend, Supabase hosted in a region geographically close to the primary user base (e.g., `us-east-1` for North America).

## Repository Structure

**Structure:** Monorepo
**Monorepo Tool:** npm workspaces
**Package Organization:** `apps/web`: The Next.js frontend application, including API routes. `packages/shared`: Contains shared TypeScript types, utility functions, and constants used by both `apps/web` and any future backend services.

## High Level Architecture Diagram

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

## Architectural Patterns

-   **Fullstack Framework (Next.js):** Leveraging Next.js for both frontend rendering and backend API routes - _Rationale:_ Provides a unified development experience, simplifies deployment, enables server-side rendering (SSR) and static site generation (SSG) for performance, and aligns with the PRD's preference for a streamlined full-stack framework.
-   **Component-Based UI (React):** Building the user interface with reusable, encapsulated React components - _Rationale:_ Enhances maintainability, promotes code reuse, and facilitates collaboration among frontend developers. Aligns with the UI/UX spec's emphasis on a component library.
-   **Serverless Functions (Vercel/Next.js API Routes):** Utilizing Vercel's serverless infrastructure for Next.js API routes to handle backend logic - _Rationale:_ Offers automatic scaling, pay-per-use cost model, and reduces operational overhead, aligning with the MVP's cost-effectiveness and scalability goals.
-   **Repository Pattern:** Abstracting data access logic from business logic, providing a clean API for interacting with the database - _Rationale:_ Improves testability, allows for easier swapping of data sources (e.g., different databases or ORMs), and enforces a clear separation of concerns, as requested by NFR7 in the PRD.
-   **API Gateway Pattern (Implicit via Next.js API Routes/Vercel):** Next.js API routes, deployed on Vercel, implicitly act as an API Gateway, providing a single entry point for frontend requests to backend logic - _Rationale:_ Centralizes API access, simplifies client-side code, and allows for future implementation of cross-cutting concerns like authentication, rate limiting, and monitoring.
-   **State Management (React Context API / Zustand/Jotai):** Using React's Context API for global state, potentially supplemented by a lightweight library like Zustand or Jotai for more complex or frequently updated state - _Rationale:_ Provides a scalable and performant way to manage application state, ensuring data consistency across components without prop-drilling. The choice of a lightweight library over Redux for the MVP prioritizes simplicity and developer experience.
