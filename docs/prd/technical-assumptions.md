# Technical Assumptions

## Repository Structure: Monorepo

We will use a monorepo to house the frontend and backend code. This simplifies dependency management and cross-cutting changes during the initial stages of the project.

## Service Architecture: Monolith (designed for modularity)

For the MVP, we will build the backend as a single, monolithic service. However, it will be designed internally with high modularity and clear separation of concerns (per NFR7) to make a future transition to a microservices architecture (per NFR6) straightforward.

## Testing Requirements: Unit + Integration

The project will require both unit tests for individual components and integration tests for key workflows. All new business logic must be accompanied by unit tests, aiming for a minimum of 80% code coverage.

## Additional Technical Assumptions and Requests

*   **Full-Stack Framework:** To ensure a streamlined development process and reduce friction, it is strongly recommended to use a single, integrated full-stack framework. A solution like **Next.js (using a React/Node.js stack)** is preferred, as it provides a cohesive environment for both frontend and backend development within the monorepo.
*   **Database:** A combination of a relational database (**PostgreSQL**) for transactional data (user accounts, rewards) and a NoSQL database (**MongoDB** or **DynamoDB**) for less structured data (user profiles, game states).
*   **Cloud Provider:** The application will be hosted on a major cloud provider like **AWS, Google Cloud, or Azure**.
*   **Cost-Effective Architecture:** The architecture must prioritize cost-effectiveness for the MVP. The selection of cloud services should favor those with generous free tiers and/or the ability to scale to zero to minimize idle costs. A target monthly infrastructure budget for the MVP should be established and adhered to.
*   **Blockchain/NFTs:** A specific blockchain and NFT minting solution needs to be researched and chosen. The ideal solution should have low transaction costs (gas fees) and high transaction speed. This is a critical open question.
