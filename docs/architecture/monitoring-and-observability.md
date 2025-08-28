# Monitoring and Observability

## Monitoring Stack

-   **Frontend Monitoring:** Vercel Analytics: Provides out-of-the-box performance metrics for Next.js applications deployed on Vercel (e.g., Core Web Vitals). Sentry: For real-time error tracking and performance monitoring of client-side JavaScript errors.
-   **Backend Monitoring:** Vercel Logs: Centralized logging for Next.js API Routes, providing insights into function execution and errors. Supabase Analytics: Provides database performance metrics, query insights, and real-time activity. Sentry: For real-time error tracking and performance monitoring of server-side (API Route) errors.
-   **Error Tracking:** Sentry (unified for both frontend and backend).
-   **Performance Monitoring:** Vercel Analytics (frontend), Supabase Analytics (database), Sentry (frontend/backend transaction tracing).

## Key Metrics

**Frontend Metrics:**
- Core Web Vitals: (Largest Contentful Paint, Cumulative Layout Shift, First Input Delay) - Crucial for user experience and SEO.
- JavaScript errors: Number and rate of client-side errors.
- API response times: Latency of API calls from the frontend perspective.
- User interactions: Key user actions (e.g., game plays, NFT views) and their success/failure rates.
- Page load times: Overall time taken for pages to become interactive.

**Backend Metrics:**
- Request rate: Number of API requests per second/minute.
- Error rate: Percentage of API requests resulting in errors (e.g., 5xx status codes).
- Response time: Latency of API responses from the backend perspective.
- Database query performance: Slowest queries, query counts, and overall database load.
- Serverless function invocations/duration: Metrics for Next.js API route execution.
