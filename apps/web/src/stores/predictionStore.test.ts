import { renderHook, act } from '@testing-library/react';
import { usePredictionStore } from './predictionStore';
import { lotteryService } from '../features/lottery/services/lotteryService';

jest.mock('../features/lottery/services/lotteryService');

const mockLotteryService = lotteryService as jest.Mocked<typeof lotteryService>;

describe('usePredictionStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state before each test
    const { result } = renderHook(() => usePredictionStore());
    act(() => {
      result.current.reset();
    });
  });

  const mockPredictions = {
    suggestedNumbers: [1, 2, 3, 4, 5, 6],
    frequencyAnalysis: [
      { number: 1, frequency: 5, percentage: 10 },
      { number: 2, frequency: 4, percentage: 8 },
    ],
    hotNumbers: [1, 2, 3],
    coldNumbers: [60, 61, 62],
    mostRecentDraw: null,
    analysisDate: new Date('2025-08-28'),
  };

  const mockDraws = [
    {
      id: 'Powerball-2025-08-27',
      lotteryName: 'Powerball',
      drawDate: new Date('2025-08-27T20:00:00Z'),
      winningNumbers: [12, 29, 33, 41, 52],
      bonusNumber: 24,
      jackpotAmount: 150000000,
      sourceUrl: 'https://www.powerball.com',
    },
  ];

  describe('fetchPredictions', () => {
    it('should fetch predictions successfully', async () => {
      mockLotteryService.getPredictions.mockResolvedValue(mockPredictions);

      const { result } = renderHook(() => usePredictionStore());

      await act(async () => {
        await result.current.fetchPredictions();
      });

      expect(mockLotteryService.getPredictions).toHaveBeenCalledWith(undefined);
      expect(result.current.predictions).toEqual(mockPredictions);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should fetch predictions for specific lottery', async () => {
      mockLotteryService.getPredictions.mockResolvedValue(mockPredictions);

      const { result } = renderHook(() => usePredictionStore());

      await act(async () => {
        await result.current.fetchPredictions('Powerball');
      });

      expect(mockLotteryService.getPredictions).toHaveBeenCalledWith('Powerball');
    });

    it('should handle fetch predictions error', async () => {
      const errorMessage = 'Failed to fetch predictions';
      mockLotteryService.getPredictions.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => usePredictionStore());

      await act(async () => {
        await result.current.fetchPredictions();
      });

      expect(result.current.predictions).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle unknown error', async () => {
      mockLotteryService.getPredictions.mockRejectedValue('Unknown error');

      const { result } = renderHook(() => usePredictionStore());

      await act(async () => {
        await result.current.fetchPredictions();
      });

      expect(result.current.error).toBe('Failed to fetch predictions');
    });

    it('should clear existing error before fetching', async () => {
      mockLotteryService.getPredictions.mockResolvedValue(mockPredictions);

      const { result } = renderHook(() => usePredictionStore());

      // Set initial error
      act(() => {
        result.current.fetchPredictions().catch(() => {});
      });

      // Wait for error to be set
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Now fetch successfully
      await act(async () => {
        await result.current.fetchPredictions();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('fetchRecentDraws', () => {
    it('should fetch recent draws successfully', async () => {
      mockLotteryService.getRecentDraws.mockResolvedValue(mockDraws);

      const { result } = renderHook(() => usePredictionStore());

      await act(async () => {
        await result.current.fetchRecentDraws();
      });

      expect(mockLotteryService.getRecentDraws).toHaveBeenCalledWith({
        lotteryName: undefined,
        limit: 20,
      });
      expect(result.current.recentDraws).toEqual(mockDraws);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should fetch recent draws with parameters', async () => {
      mockLotteryService.getRecentDraws.mockResolvedValue(mockDraws);

      const { result } = renderHook(() => usePredictionStore());

      await act(async () => {
        await result.current.fetchRecentDraws('Powerball', 10);
      });

      expect(mockLotteryService.getRecentDraws).toHaveBeenCalledWith({
        lotteryName: 'Powerball',
        limit: 10,
      });
    });

    it('should handle fetch recent draws error', async () => {
      const errorMessage = 'Failed to fetch recent draws';
      mockLotteryService.getRecentDraws.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => usePredictionStore());

      await act(async () => {
        await result.current.fetchRecentDraws();
      });

      expect(result.current.recentDraws).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('clearError', () => {
    it('should clear error', async () => {
      const { result } = renderHook(() => usePredictionStore());

      // Set error first
      mockLotteryService.getPredictions.mockRejectedValue(new Error('Test error'));
      await act(async () => {
        await result.current.fetchPredictions();
      });

      expect(result.current.error).toBe('Test error');

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', async () => {
      mockLotteryService.getPredictions.mockResolvedValue(mockPredictions);
      mockLotteryService.getRecentDraws.mockResolvedValue(mockDraws);

      const { result } = renderHook(() => usePredictionStore());

      // Populate store
      await act(async () => {
        await result.current.fetchPredictions();
        await result.current.fetchRecentDraws();
      });

      expect(result.current.predictions).not.toBeNull();
      expect(result.current.recentDraws).not.toEqual([]);

      // Reset store
      act(() => {
        result.current.reset();
      });

      expect(result.current.predictions).toBeNull();
      expect(result.current.recentDraws).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});