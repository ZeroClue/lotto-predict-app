import { create } from 'zustand';
import { lotteryService, LotteryPrediction, LotteryDraw } from '../features/lottery/services/lotteryService';
import { AnalyticsFilters, AdvancedAnalytics } from '../../../lib/services/lotteryAnalyticsService';

interface PredictionState {
  predictions: LotteryPrediction | null;
  recentDraws: LotteryDraw[];
  analyticsData: AdvancedAnalytics | null;
  loading: boolean;
  error: string | null;
}

interface PredictionActions {
  fetchPredictions: (lotteryName?: string) => Promise<void>;
  fetchRecentDraws: (lotteryName?: string, limit?: number) => Promise<void>;
  fetchAnalytics: (filters: AnalyticsFilters) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

type PredictionStore = PredictionState & PredictionActions;

const initialState: PredictionState = {
  predictions: null,
  recentDraws: [],
  analyticsData: null,
  loading: false,
  error: null,
};

export const usePredictionStore = create<PredictionStore>((set, get) => ({
  ...initialState,

  fetchPredictions: async (lotteryName?: string) => {
    set({ loading: true, error: null });
    try {
      const predictions = await lotteryService.getPredictions(lotteryName);
      set({ predictions, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch predictions';
      set({ error: errorMessage, loading: false, predictions: null });
    }
  },

  fetchRecentDraws: async (lotteryName?: string, limit = 20) => {
    set({ loading: true, error: null });
    try {
      const recentDraws = await lotteryService.getRecentDraws({ lotteryName, limit });
      set({ recentDraws, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch recent draws';
      set({ error: errorMessage, loading: false, recentDraws: [] });
    }
  },

  fetchAnalytics: async (filters: AnalyticsFilters) => {
    set({ loading: true, error: null });
    try {
      const analyticsData = await lotteryService.getAnalytics(filters);
      set({ analyticsData, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch advanced analytics';
      set({ error: errorMessage, loading: false, analyticsData: null });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set(initialState);
  },
}));
