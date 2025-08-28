import { create } from 'zustand';
import { lotteryService, LotteryPrediction, LotteryDraw } from '../features/lottery/services/lotteryService';

interface PredictionState {
  predictions: LotteryPrediction | null;
  recentDraws: LotteryDraw[];
  loading: boolean;
  error: string | null;
}

interface PredictionActions {
  fetchPredictions: (lotteryName?: string) => Promise<void>;
  fetchRecentDraws: (lotteryName?: string, limit?: number) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

type PredictionStore = PredictionState & PredictionActions;

const initialState: PredictionState = {
  predictions: null,
  recentDraws: [],
  loading: false,
  error: null,
};

export const usePredictionStore = create<PredictionStore>((set, get) => ({
  ...initialState,

  fetchPredictions: async (lotteryName?: string) => {
    const { error } = get();
    
    // Clear error if it exists
    if (error) {
      set({ error: null });
    }
    
    set({ loading: true });
    
    try {
      const predictions = await lotteryService.getPredictions(lotteryName);
      set({ predictions, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch predictions';
      set({ 
        error: errorMessage, 
        loading: false,
        predictions: null 
      });
    }
  },

  fetchRecentDraws: async (lotteryName?: string, limit = 20) => {
    const { error } = get();
    
    // Clear error if it exists
    if (error) {
      set({ error: null });
    }
    
    set({ loading: true });
    
    try {
      const recentDraws = await lotteryService.getRecentDraws({
        lotteryName,
        limit,
      });
      set({ recentDraws, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch recent draws';
      set({ 
        error: errorMessage, 
        loading: false,
        recentDraws: [] 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set(initialState);
  },
}));