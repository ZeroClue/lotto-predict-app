import { create } from 'zustand';
import { Game, NFT } from '../lib/types';
import { tokenService } from '../lib/services/tokenService';

interface NFTMintResult {
  nft: NFT;
  awardReason: string;
}

interface GameCompletionResult {
  game: Game;
  earnedAmount: number;
  newBalance: number;
  message: string;
  mintedNFTs?: NFTMintResult[];
}

interface GameStore {
  // State
  games: Game[];
  currentGame: Game | null;
  isLoadingGames: boolean;
  isCompletingGame: boolean;
  gamesError: string | null;
  completionError: string | null;
  lastCompletion: GameCompletionResult | null;

  // Actions
  setGames: (games: Game[]) => void;
  setCurrentGame: (game: Game | null) => void;
  setLoadingGames: (loading: boolean) => void;
  setCompletingGame: (completing: boolean) => void;
  setGamesError: (error: string | null) => void;
  setCompletionError: (error: string | null) => void;
  setLastCompletion: (completion: GameCompletionResult | null) => void;

  // Async actions
  fetchGames: () => Promise<void>;
  fetchGameById: (gameId: string) => Promise<void>;
  completeGame: (gameId: string) => Promise<GameCompletionResult>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  games: [],
  currentGame: null,
  isLoadingGames: false,
  isCompletingGame: false,
  gamesError: null,
  completionError: null,
  lastCompletion: null,

  // Setters
  setGames: (games) => set({ games }),
  setCurrentGame: (currentGame) => set({ currentGame }),
  setLoadingGames: (isLoadingGames) => set({ isLoadingGames }),
  setCompletingGame: (isCompletingGame) => set({ isCompletingGame }),
  setGamesError: (gamesError) => set({ gamesError }),
  setCompletionError: (completionError) => set({ completionError }),
  setLastCompletion: (lastCompletion) => set({ lastCompletion }),

  // Async actions
  fetchGames: async () => {
    try {
      set({ isLoadingGames: true, gamesError: null });
      
      const response = await fetch('/api/games');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch games');
      }

      set({ games: result.data, isLoadingGames: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch games';
      set({ gamesError: errorMessage, isLoadingGames: false });
      throw error;
    }
  },

  fetchGameById: async (gameId: string) => {
    try {
      set({ isLoadingGames: true, gamesError: null });
      
      const response = await fetch(`/api/games/${gameId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch game');
      }

      set({ currentGame: result.data, isLoadingGames: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch game';
      set({ gamesError: errorMessage, isLoadingGames: false, currentGame: null });
      throw error;
    }
  },

  completeGame: async (gameId: string) => {
    try {
      set({ isCompletingGame: true, completionError: null });

      // Get auth headers from centralized token service
      const headers = tokenService.getAuthHeaders();
      
      const response = await fetch(`/api/games/${gameId}/complete`, {
        method: 'POST',
        headers,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to complete game');
      }

      const completionResult: GameCompletionResult = result.data;
      set({ 
        lastCompletion: completionResult, 
        isCompletingGame: false 
      });

      return completionResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete game';
      set({ completionError: errorMessage, isCompletingGame: false });
      throw error;
    }
  },
}));