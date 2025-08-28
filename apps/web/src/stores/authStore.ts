import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  username?: string;
  createdAt: Date;
  updatedAt: Date;
  walletAddress?: string;
  provider?: 'email' | 'google' | 'facebook' | 'github';
  providerId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  login: (user, token) => set({ user, isAuthenticated: true, token }),
  logout: () => set({ user: null, isAuthenticated: false, token: null }),
}));
