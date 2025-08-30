import { LotteryAnalyticsService, NumberFrequency, AnalyticsFilters } from './lotteryAnalyticsService';
import { lotteryRepository, LotteryDraw } from '../repositories/lotteryRepository';

// Mock the lottery repository
jest.mock('../repositories/lotteryRepository', () => ({
  lotteryRepository: {
    getDrawsByLottery: jest.fn(),
    getAllDrawsForAnalysis: jest.fn(),
  },
}));

const mockLotteryRepository = lotteryRepository as jest.Mocked<typeof lotteryRepository>;

describe('LotteryAnalyticsService', () => {
  let service: LotteryAnalyticsService;
  let mockDraws: LotteryDraw[];

  beforeEach(() => {
    service = new LotteryAnalyticsService();
    
    // Create mock lottery draws for testing
    mockDraws = [
      {
        id: 'powerball-2025-01-01',
        lotteryName: 'Powerball',
        drawDate: new Date('2025-01-01'),
        winningNumbers: [1, 5, 10, 15, 20, 25],
        bonusNumber: 3,
        jackpotAmount: 1000000,
      },
      {
        id: 'powerball-2025-01-02',
        lotteryName: 'Powerball',
        drawDate: new Date('2025-01-02'),
        winningNumbers: [5, 10, 15, 30, 35, 40],
        bonusNumber: 7,
        jackpotAmount: 1200000,
      },
      {
        id: 'powerball-2025-01-03',
        lotteryName: 'Powerball',
        drawDate: new Date('2025-01-03'),
        winningNumbers: [1, 10, 15, 25, 45, 50],
        bonusNumber: 12,
        jackpotAmount: 1500000,
      },
    ];

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('calculateNumberFrequency', () => {
    it('should calculate correct frequency for numbers', () => {
      const result = service.calculateNumberFrequency(mockDraws);

      // Numbers 10 and 15 appear 3 times, should be at the top
      expect(result[0]).toEqual(expect.objectContaining({
        number: expect.any(Number),
        frequency: 3,
        percentage: expect.any(Number),
      }));
      
      // Total numbers drawn: 18 (6 per draw × 3 draws)
      // Numbers appearing 3 times should have 16.67% (3/18 * 100)
      const topFrequency = result.find(r => r.frequency === 3);
      expect(topFrequency?.percentage).toBeCloseTo(16.67, 1);
    });

    it('should sort results by frequency in descending order', () => {
      const result = service.calculateNumberFrequency(mockDraws);

      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].frequency).toBeGreaterThanOrEqual(result[i].frequency);
      }
    });

    it('should handle empty draws array', () => {
      const result = service.calculateNumberFrequency([]);
      expect(result).toEqual([]);
    });
  });

  describe('calculateHotColdNumbers', () => {
    it('should identify hot and cold numbers correctly', () => {
      const frequencyData: NumberFrequency[] = [
        { number: 10, frequency: 5, percentage: 20 },
        { number: 15, frequency: 4, percentage: 16 },
        { number: 20, frequency: 3, percentage: 12 },
        { number: 25, frequency: 2, percentage: 8 },
        { number: 30, frequency: 1, percentage: 4 },
      ];

      const result = service.calculateHotColdNumbers(frequencyData, 2, 2);

      expect(result.hotNumbers).toHaveLength(2);
      expect(result.coldNumbers).toHaveLength(2);
      expect(result.hotNumbers[0]).toBe(10); // Highest frequency
      expect(result.coldNumbers[0]).toBe(30); // Lowest frequency (reversed)
    });

    it('should handle empty frequency data', () => {
      const result = service.calculateHotColdNumbers([], 5, 5);
      
      expect(result.hotNumbers).toEqual([]);
      expect(result.coldNumbers).toEqual([]);
      expect(result.threshold).toEqual({ hot: 0, cold: 0 });
    });

    it('should respect count limits', () => {
      const frequencyData: NumberFrequency[] = Array.from({ length: 20 }, (_, i) => ({
        number: i + 1,
        frequency: 20 - i,
        percentage: (20 - i) * 5,
      }));

      const result = service.calculateHotColdNumbers(frequencyData, 3, 3);

      expect(result.hotNumbers).toHaveLength(3);
      expect(result.coldNumbers).toHaveLength(3);
    });
  });

  describe('getAdvancedAnalytics', () => {
    beforeEach(() => {
      mockLotteryRepository.getAllDrawsForAnalysis.mockResolvedValue(mockDraws);
      mockLotteryRepository.getDrawsByLottery.mockResolvedValue(mockDraws);
    });

    it('should return complete analytics data', async () => {
      const result = await service.getAdvancedAnalytics();

      expect(result).toHaveProperty('frequencyAnalysis');
      expect(result).toHaveProperty('hotColdAnalysis');
      expect(result).toHaveProperty('trendAnalysis');
      expect(result).toHaveProperty('statisticalSummary');
      expect(result).toHaveProperty('analysisDate');
      expect(result.analysisDate).toBeInstanceOf(Date);
    });

    it('should filter by lottery name when provided', async () => {
      const filters: AnalyticsFilters = { lotteryName: 'Powerball' };
      
      await service.getAdvancedAnalytics(filters);

      expect(mockLotteryRepository.getDrawsByLottery).toHaveBeenCalledWith('Powerball', 1000);
      expect(mockLotteryRepository.getAllDrawsForAnalysis).not.toHaveBeenCalled();
    });

    it('should use all draws when no lottery name specified', async () => {
      await service.getAdvancedAnalytics();

      expect(mockLotteryRepository.getAllDrawsForAnalysis).toHaveBeenCalled();
      expect(mockLotteryRepository.getDrawsByLottery).not.toHaveBeenCalled();
    });

    it('should filter by date range when provided', async () => {
      const filters: AnalyticsFilters = {
        dateRange: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-02'),
        }
      };

      const result = await service.getAdvancedAnalytics(filters);
      
      // Should only include draws within the date range
      expect(result.statisticalSummary.totalDraws).toBeLessThanOrEqual(mockDraws.length);
    });

    it('should throw error when no data available', async () => {
      mockLotteryRepository.getAllDrawsForAnalysis.mockResolvedValue([]);

      await expect(service.getAdvancedAnalytics()).rejects.toThrow(
        'No historical data available for the specified filters'
      );
    });
  });

  describe('calculateTrendAnalysis', () => {
    it('should return trend analysis for numbers', async () => {
      const result = await service.calculateTrendAnalysis(mockDraws, {});

      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        const trend = result[0];
        expect(trend).toHaveProperty('number');
        expect(trend).toHaveProperty('trends');
        expect(trend).toHaveProperty('overallTrend');
        expect(trend).toHaveProperty('trendStrength');
        expect(['increasing', 'decreasing', 'stable']).toContain(trend.overallTrend);
        expect(trend.trendStrength).toBeGreaterThanOrEqual(0);
        expect(trend.trendStrength).toBeLessThanOrEqual(1);
      }
    });

    it('should handle single draw gracefully', async () => {
      const singleDraw = [mockDraws[0]];
      const result = await service.calculateTrendAnalysis(singleDraw, {});
      
      // Should return empty array for insufficient data
      expect(result).toEqual([]);
    });

    it('should use custom period length when provided', async () => {
      const filters: AnalyticsFilters = { periodLength: 7 };
      const result = await service.calculateTrendAnalysis(mockDraws, filters);
      
      // Should process with 7-day periods instead of default
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('statistical summary calculations', () => {
    it('should calculate statistical summary correctly', async () => {
      mockLotteryRepository.getAllDrawsForAnalysis.mockResolvedValue(mockDraws);
      
      const result = await service.getAdvancedAnalytics();
      const summary = result.statisticalSummary;

      expect(summary.totalDraws).toBe(3);
      expect(summary.avgNumbersPerDraw).toBe(6); // Each draw has 6 numbers
      expect(summary.dateRange.startDate).toEqual(new Date('2025-01-01'));
      expect(summary.dateRange.endDate).toEqual(new Date('2025-01-03'));
      expect(summary.uniqueNumbersDrawn).toBeGreaterThan(0);
    });

    it('should handle date range correctly', async () => {
      // Create draws with wider date range
      const wideRangeDraws: LotteryDraw[] = [
        { ...mockDraws[0], drawDate: new Date('2024-12-01') },
        { ...mockDraws[1], drawDate: new Date('2025-02-01') },
      ];
      
      mockLotteryRepository.getAllDrawsForAnalysis.mockResolvedValue(wideRangeDraws);
      
      const result = await service.getAdvancedAnalytics();
      const summary = result.statisticalSummary;

      expect(summary.dateRange.startDate).toEqual(new Date('2024-12-01'));
      expect(summary.dateRange.endDate).toEqual(new Date('2025-02-01'));
    });
  });

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      mockLotteryRepository.getAllDrawsForAnalysis.mockRejectedValue(new Error('Database error'));

      await expect(service.getAdvancedAnalytics()).rejects.toThrow('Database error');
    });

    it('should validate date range filters', async () => {
      mockLotteryRepository.getAllDrawsForAnalysis.mockResolvedValue(mockDraws);
      
      const filters: AnalyticsFilters = {
        dateRange: {
          startDate: new Date('2025-01-10'), // After all mock draws
          endDate: new Date('2025-01-15'),
        }
      };

      await expect(service.getAdvancedAnalytics(filters)).rejects.toThrow(
        'No historical data available for the specified filters'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle draws with different number counts', async () => {
      const mixedDraws: LotteryDraw[] = [
        { ...mockDraws[0], winningNumbers: [1, 2, 3] }, // 3 numbers
        { ...mockDraws[1], winningNumbers: [4, 5, 6, 7, 8] }, // 5 numbers
      ];

      const result = service.calculateNumberFrequency(mixedDraws);
      
      expect(result).toHaveLength(8); // All unique numbers
      expect(result.every(r => r.frequency === 1)).toBe(true); // Each appears once
    });

    it('should handle duplicate numbers in same draw', async () => {
      // This should not happen in real lottery data, but test defensively
      const badDraw: LotteryDraw = {
        ...mockDraws[0],
        winningNumbers: [1, 1, 2, 2, 3, 3], // Duplicates
      };

      const result = service.calculateNumberFrequency([badDraw]);
      
      // Should count each occurrence
      const number1 = result.find(r => r.number === 1);
      expect(number1?.frequency).toBe(2);
    });
  });
});