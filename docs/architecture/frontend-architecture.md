# Frontend Architecture

## Component Architecture

### Component Organization

```text
apps/web/
├── src/
│   ├── app/                  # Next.js App Router (pages, layouts, loading, error)
│   ├── components/
│   │   ├── ui/               # Generic, unopinionated UI components (e.g., Button, Input)
│   │   └── domain/           # Application-specific components (e.g., PredictionChart, GameBoard)
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── services/
│   │   ├── games/
│   │   ├── nfts/
│   │   └── lottery/
│   ├── hooks/                # Custom React hooks (e.g., useAuth, useGame)
│   ├── services/             # API client services (e.g., authService, gameService)
│   ├── stores/               # Zustand stores for global state
│   ├── styles/               # Global styles, Tailwind config, theme overrides
│   ├── utils/                # Frontend utilities
│   └── lib/                  # Third-party library configurations/wrappers
```

### Component Template

```typescript
// components/ui/Button.tsx
import React from 'react';
import { Button as ChakraButton, ButtonProps } from '@chakra-ui/react';

interface CustomButtonProps extends ButtonProps {
  // Add any custom props here
  variant?: 'primary' | 'secondary' | 'ghost';
}

const Button: React.FC<CustomButtonProps> = ({ variant = 'primary', children, ...props }) => {
  // Custom logic based on variant or other props
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { bg: 'blue.500', color: 'white', _hover: { bg: 'blue.600' } };
      case 'secondary':
        return { bg: 'gray.200', color: 'gray.800', _hover: { bg: 'gray.300' } };
      case 'ghost':
        return { variant: 'ghost' };
      default:
        return {};
    }
  };

  return (
    <ChakraButton {...getVariantStyles()} {...props}>
      {children}
    </ChakraButton>
  );
};

export default Button;
```

## State Management Architecture

### State Structure

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { User } from '@/packages/shared/types'; // Assuming shared types

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  // ... other auth-related state and actions
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  login: (user, token) => set({ user, isAuthenticated: true, token }),
  logout: () => set({ user: null, isAuthenticated: false, token: null }),
}));

// stores/gameStore.ts
import { create } from 'zustand';
import { Game } from '@/packages/shared/types';

interface GameState {
  activeGame: Game | null;
  userGameProgress: Record<string, number>; // gameId: completionCount
  // ... other game-related state and actions
}

export const useGameStore = create<GameState>((set) => ({
  activeGame: null,
  userGameProgress: {},
  // ...
}));
```

### State Management Patterns

-   **Atomic State:** Zustand promotes an atomic approach where each store manages a specific, independent piece of state.
-   **Selectors:** Components will use Zustand's selector pattern to subscribe only to the specific parts of the state they need, minimizing re-renders.
-   **Actions for State Updates:** All state modifications will occur through defined actions within the stores, ensuring predictable state changes.
-   **Asynchronous Operations within Actions:** API calls and other asynchronous logic will be handled within Zustand actions, keeping components clean and focused on rendering.

## Routing Architecture

### Route Organization

```text
apps/web/
├── src/
│   ├── app/
│   │   ├── (auth)/             # Route group for authentication pages (e.g., /login, /register)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/        # Route group for authenticated user pages
│   │   │   ├── layout.tsx      # Layout for all dashboard routes
│   │   │   ├── page.tsx        # Dashboard homepage
│   │   │   ├── games/
│   │   │   │   ├── page.tsx    # Games hub
│   │   │   │   └── [gameId]/   # Dynamic route for individual games
│   │   │   │       └── page.tsx
│   │   │   ├── collection/
│   │   │   │   ├── layout.tsx  # Layout for collection (e.g., tabs for NFTs/Wallet)
│   │   │   │   ├── nfts/
│   │   │   │   │   ├── page.tsx # NFT Gallery
│   │   │   │   │   └── [nftId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── wallet/
│   │   │   │       └── page.tsx # Crypto Wallet
│   │   │   └── profile/
│   │   │       └── page.tsx
│   │   ├── layout.tsx          # Root layout (e.g., for public pages, global providers)
│   │   └── page.tsx            # Public homepage
│   ├── middleware.ts           # Next.js Middleware for authentication checks
```

### Protected Route Pattern

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'; // For Supabase integration

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { 
    data: { session }, 
  } = await supabase.auth.getSession();

  const protectedPaths = ['/dashboard', '/games', '/collection', '/profile']; // Paths requiring authentication

  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));

  if (isProtectedPath && !session) {
    // If protected path and no session, redirect to login
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If not protected or user is authenticated, continue
  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|register).*)?'], // Apply middleware to all paths except public ones
};
```

## Frontend Services Layer

### API Client Setup

```typescript
// services/apiClient.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore'; // Assuming auth store for token

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api', // Default to /api for Next.js API Routes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authorization token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token; // Get token from Zustand store
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling (e.g., refresh token, logout on 401)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Example: Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Potentially try to refresh token here, or logout user
      useAuthStore.getState().logout();
      // Redirect to login page
      window.location.href = '/login';
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Service Example

```typescript
// features/auth/services/authService.ts
import apiClient from '@/services/apiClient';
import { User } from '@/packages/shared/types'; // Assuming shared types

interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },

  async register(email: string, password: string, username?: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/register', { email, password, username });
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/user/me');
    return response.data;
  },

  // Example for social login (Supabase Auth handles much of the redirect flow)
  async signInWithGoogle(): Promise<void> {
    // Supabase client-side method to initiate Google OAuth flow
    // This typically redirects the user to Google, then back to our app
    // The auth-helpers-nextjs library handles the session creation on redirect
    // For Next.js App Router, this might involve a client-side redirect or a server action
    // Example: await supabase.auth.signInWithOAuth({ provider: 'google' });
    console.log('Initiating Google Sign-In...');
    // Placeholder for actual Supabase client call
  }
};
```
