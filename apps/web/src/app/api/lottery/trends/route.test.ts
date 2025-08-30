import { NextRequest } from 'next/server';
import { GET } from './route';
import { lotteryAnalyticsService } from '../../../../lib/services/lotteryAnalyticsService';

// Mock the analytics service
jest.mock('../../../../lib/services/lotteryAnalyticsService');

const mockLotteryAnalyticsService = lotteryAnalyticsService as jest.Mocked<typeof lotteryAnalyticsService>;

describe('/api/lottery/trends', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock
    mockLotteryAnalyticsService.getAdvancedAnalytics.mockResolvedValue({
      frequencyAnalysis: [],
      hotColdAnalysis: { hotNumbers: [], coldNumbers: [], threshold: { hot: 0, cold: 0 } },
      trendAnalysis: [
        {
          number: 10,
          trends: [
            { period: '2025-01-01', frequency: 5, movingAverage: 4.5 },
            { period: '2025-01-02', frequency: 6, movingAverage: 5.2 },
          ],
          overallTrend: 'increasing',
          trendStrength: 0.8,
        },
        {
          number: 15,
          trends: [
            { period: '2025-01-01', frequency: 3, movingAverage: 3.2 },
            { period: '2025-01-02', frequency: 2, movingAverage: 2.8 },
          ],
          overallTrend: 'decreasing',
          trendStrength: 0.6,
        },
        {
          number: 20,
          trends: [
            { period: '2025-01-01', frequency: 4, movingAverage: 4.0 },
            { period: '2025-01-02', frequency: 4, movingAverage: 4.0 },
          ],
          overallTrend: 'stable',
          trendStrength: 0.1,
        },
      ],
      statisticalSummary: {
        totalDraws: 100,
        dateRange: { startDate: new Date('2024-01-01'), endDate: new Date('2025-01-15') },
        avgNumbersPerDraw: 6,
        uniqueNumbersDrawn: 50,
      },
      analysisDate: new Date('2025-01-15'),
    });
  });

  const createMockRequest = (searchParams: Record<string, string> = {}) => {
    const url = new URL('http://localhost:3000/api/lottery/trends');
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    return new NextRequest(url);
  };

  describe('basic functionality', () => {
    it('should return trend analysis data', async () => {
      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('trends');
      expect(data.data).toHaveProperty('metadata');
      expect(data.data.trends).toHaveLength(3);
      expect(data.data.trends[0]).toHaveProperty('number', 10);
      expect(data.data.trends[0]).toHaveProperty('overallTrend', 'increasing');
    });

    it('should call analytics service with empty filters by default', async () => {
      const request = createMockRequest();
      await GET(request);

      expect(mockLotteryAnalyticsService.getAdvancedAnalytics).toHaveBeenCalledWith({});
    });
  });

  describe('filtering options', () => {
    it('should filter by lottery name', async () => {
      const request = createMockRequest({ lotteryName: 'Powerball' });
      await GET(request);

      expect(mockLotteryAnalyticsService.getAdvancedAnalytics).toHaveBeenCalledWith({
        lotteryName: 'Powerball',
      });
    });

    it('should filter by date range', async () => {
      const request = createMockRequest({
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      });
      await GET(request);

      expect(mockLotteryAnalyticsService.getAdvancedAnalytics).toHaveBeenCalledWith({
        dateRange: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-31'),
        },
      });
    });

    it('should set custom period length', async () => {
      const request = createMockRequest({ periodLength: '14' });
      await GET(request);

      expect(mockLotteryAnalyticsService.getAdvancedAnalytics).toHaveBeenCalledWith({
        periodLength: 14,
      });
    });

    it('should ignore invalid period length', async () => {
      const request = createMockRequest({ periodLength: 'invalid' });
      await GET(request);

      expect(mockLotteryAnalyticsService.getAdvancedAnalytics).toHaveBeenCalledWith({});
    });

    it('should combine all filters', async () => {
      const request = createMockRequest({
        lotteryName: 'Mega Millions',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        periodLength: '7',
      });
      await GET(request);

      expect(mockLotteryAnalyticsService.getAdvancedAnalytics).toHaveBeenCalledWith({
        lotteryName: 'Mega Millions',
        dateRange: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-31'),
        },
        periodLength: 7,
      });
    });
  });

  describe('trend type filtering', () => {
    it('should filter trends by type - increasing', async () => {
      const request = createMockRequest({ trendType: 'increasing' });
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.trends).toHaveLength(1);
      expect(data.data.trends[0].overallTrend).toBe('increasing');
    });

    it('should filter trends by type - decreasing', async () => {
      const request = createMockRequest({ trendType: 'decreasing' });
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.trends).toHaveLength(1);
      expect(data.data.trends[0].overallTrend).toBe('decreasing');
    });

    it('should filter trends by type - stable', async () => {
      const request = createMockRequest({ trendType: 'stable' });
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.trends).toHaveLength(1);
      expect(data.data.trends[0].overallTrend).toBe('stable');
    });

    it('should return all trends when trendType is all', async () => {
      const request = createMockRequest({ trendType: 'all' });
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.trends).toHaveLength(3);
    });

    it('should ignore invalid trend type', async () => {
      const request = createMockRequest({ trendType: 'invalid' });
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.trends).toHaveLength(3); // All trends returned
    });
  });

  describe('limit parameter', () => {
    it('should limit the number of trends returned', async () => {
      const request = createMockRequest({ limit: '2' });
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.trends).toHaveLength(2);
    });

    it('should ignore invalid limit values', async () => {
      const request = createMockRequest({ limit: 'invalid' });
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.trends).toHaveLength(3); // No limit applied
    });

    it('should ignore negative limit values', async () => {
      const request = createMockRequest({ limit: '-5' });
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.trends).toHaveLength(3); // No limit applied
    });
  });

  describe('metadata', () => {
    it('should return correct metadata', async () => {
      const request = createMockRequest({
        lotteryName: 'Powerball',
        periodLength: '14',
      });
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.metadata).toHaveProperty('filters');
      expect(data.data.metadata).toHaveProperty('totalNumbers', 3);
      expect(data.data.metadata).toHaveProperty('periodLength', 14);
      expect(data.data.metadata).toHaveProperty('analysisDate');
      expect(data.data.metadata.filters).toEqual({
        lotteryName: 'Powerball',
        periodLength: 14,
      });
    });

    it('should use default period length in metadata when not specified', async () => {
      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.metadata.periodLength).toBe(30);
    });
  });

  describe('error handling', () => {
    it('should handle analytics service errors', async () => {
      mockLotteryAnalyticsService.getAdvancedAnalytics.mockRejectedValue(
        new Error('Analytics processing failed')
      );

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Analytics processing failed');
    });

    it('should handle unknown errors', async () => {
      mockLotteryAnalyticsService.getAdvancedAnalytics.mockRejectedValue('Unknown error');

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unknown error');
    });
  });

  describe('complex scenarios', () => {
    it('should handle filtering and limiting together', async () => {
      const request = createMockRequest({
        trendType: 'increasing',
        limit: '1',
        lotteryName: 'Powerball',
      });
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.trends).toHaveLength(1);
      expect(data.data.trends[0].overallTrend).toBe('increasing');
      expect(mockLotteryAnalyticsService.getAdvancedAnalytics).toHaveBeenCalledWith({
        lotteryName: 'Powerball',
      });
    });
  });
});