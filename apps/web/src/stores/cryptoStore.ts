import { create } from 'zustand';
import { CryptoBalance } from '../lib/types';
import { tokenService } from '../lib/services/tokenService';

interface CryptoStore {
  // State
  balance: CryptoBalance | null;
  isLoadingBalance: boolean;
  balanceError: string | null;

  // Actions
  setBalance: (balance: CryptoBalance | null) => void;
  setLoadingBalance: (loading: boolean) => void;
  setBalanceError: (error: string | null) => void;
  updateBalance: (newBalanceAmount: number) => void;

  // Async actions
  fetchBalance: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

export const useCryptoStore = create<CryptoStore>((set, get) => ({
  // Initial state
  balance: null,
  isLoadingBalance: false,
  balanceError: null,

  // Setters
  setBalance: (balance) => set({ balance }),
  setLoadingBalance: (isLoadingBalance) => set({ isLoadingBalance }),
  setBalanceError: (balanceError) => set({ balanceError }),
  
  updateBalance: (newBalanceAmount) => {
    const currentBalance = get().balance;
    if (currentBalance) {
      set({
        balance: {
          ...currentBalance,
          balance: newBalanceAmount,
          updatedAt: new Date(),
        }
      });
    }
  },

  // Async actions
  fetchBalance: async () => {
    try {
      set({ isLoadingBalance: true, balanceError: null });

      // Get auth headers from centralized token service
      const headers = tokenService.getAuthHeaders(true);
      
      const response = await fetch('/api/crypto/balance', {
        headers,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch balance');
      }

      set({ balance: result.data, isLoadingBalance: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch balance';
      set({ balanceError: errorMessage, isLoadingBalance: false });
      throw error;
    }
  },

  refreshBalance: async () => {
    // Same as fetchBalance but doesn't show loading state
    try {
      set({ balanceError: null });

      // Get auth headers from centralized token service
      const headers = tokenService.getAuthHeaders(true);
      
      const response = await fetch('/api/crypto/balance', {
        headers,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to refresh balance');
      }

      set({ balance: result.data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh balance';
      set({ balanceError: errorMessage });
      console.error('Error refreshing balance:', error);
    }
  },
}));