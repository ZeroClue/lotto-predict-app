# API Specification

## REST API Specification

```yaml
openapi: 3.0.0
info:
  title: Lotto-NFT API
  version: 1.0.0
  description: API for Lotto-NFT application, managing users, games, NFTs, and lottery data.
servers:
  - url: /api
    description: Primary API server (handled by Next.js API Routes on Vercel)
paths:
  /auth/register:
    post:
      summary: Register a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
                username:
                  type: string
              required:
                - email
                - password
      responses:
        '201':
          description: User successfully registered
        '400':
          description: Invalid input
  /auth/login:
    post:
      summary: Log in an existing user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
              required:
                - email
                - password
      responses:
        '200':
          description: User successfully logged in
        '401':
          description: Invalid credentials
  /user/me:
    get:
      summary: Get current user's profile
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Current user profile
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '401':
          description: Unauthorized
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
          format: email
        username:
          type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        walletAddress:
          type: string
        provider:
          type: string
          enum: ['email', 'google', 'facebook', 'github']
        providerId:
          type: string
      required:
        - id
        - email
        - createdAt
        - updatedAt
```
