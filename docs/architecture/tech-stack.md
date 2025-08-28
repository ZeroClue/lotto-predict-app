# Tech Stack

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| Frontend Language | TypeScript | Latest Stable | Type safety, improved developer experience | Standard for modern web development, aligns with Next.js |
| Frontend Framework | Next.js | Latest Stable | Full-stack React framework for web application | Chosen for unified development, SSR/SSG, and API routes |
| UI Component Library | Chakra UI | Latest Stable | Pre-built, accessible UI components | Accelerates UI development, highly customizable, good for MVP |
| State Management | Zustand | Latest Stable | Lightweight, performant state management | Simple, unopinionated, and effective for React applications |
| Backend Language | TypeScript | Latest Stable | Type safety, Node.js runtime for API routes | Consistency with frontend, strong ecosystem |
| Backend Framework | Next.js API Routes | Latest Stable | Serverless functions for backend logic | Integrated with Next.js, simplifies deployment on Vercel |
| API Style | REST | N/A | Standard for client-server communication | Widely understood, flexible, and well-supported |
| Database | PostgreSQL (Supabase) | Latest Stable | Primary relational data store | Robust, scalable, integrated with Supabase Auth and Realtime |
| Cache | Redis | Latest Stable | In-memory data store for caching | Improves performance by reducing database load for frequently accessed data |
| File Storage | Supabase Storage | N/A | Object storage for user-generated content (e.g., NFTs) | Integrated with Supabase, simplifies asset management |
| Authentication | Supabase Auth | N/A | User authentication and authorization | Integrated with Supabase PostgreSQL, handles user management |
| Frontend Testing | Jest, React Testing Library | Latest Stable | Unit and integration testing for React components | Industry standard for React testing, focuses on user behavior |
| Backend Testing | Jest, Supertest | Latest Stable | Unit and integration testing for API routes | Consistency with frontend testing, Supertest for API endpoint testing |
| E2E Testing | Playwright | Latest Stable | End-to-end testing for full user journeys | Cross-browser support, reliable, and fast E2E tests |
| Build Tool | Next.js Build | N/A | Compiles and optimizes Next.js application for production | Integrated with Next.js, handles bundling and optimizations |
| Bundler | Webpack | N/A | Bundles JavaScript modules for the browser | Integrated with Next.js, no manual configuration needed |
| IaC Tool | Terraform | Latest Stable | Infrastructure as Code for cloud resources | Manages Supabase and other cloud infrastructure declaratively |
| CI/CD | Vercel, GitHub Actions | N/A | Automated build, test, and deployment pipelines | Vercel for Next.js deployments, GitHub Actions for other automation (e.g., database migrations) |
| Monitoring | Vercel Analytics, Supabase Analytics, Sentry | N/A | Application performance and error tracking | Comprehensive monitoring for frontend, backend, and errors |
| Logging | Pino, Vercel Logs | N/A | Structured logging for backend services | Efficient and customizable logger for Node.js, integrated with Vercel logs |
| CSS Framework | Tailwind CSS | Latest Stable | Utility-first CSS framework | Rapid styling, highly customizable, good for consistent design |
