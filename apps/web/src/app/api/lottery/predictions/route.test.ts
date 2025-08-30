import { GET } from './route';
import { NextRequest } from 'next/server';
import { lotteryDataService } from '../../../../lib/services/lotteryDataService';
import { lotteryAnalyticsService } from '../../../../lib/services/lotteryAnalyticsService';

jest.mock('../../../../lib/services/lotteryDataService');
jest.mock('../../../../lib/services/lotteryAnalyticsService');

const mockLotteryDataService = lotteryDataService as jest.Mocked<typeof lotteryDataService>;
const mockLotteryAnalyticsService = lotteryAnalyticsService as jest.Mocked<typeof lotteryAnalyticsService>;

describe('/api/lottery/predictions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup analytics service mock
    mockLotteryAnalyticsService.getAdvancedAnalytics.mockResolvedValue({
      frequencyAnalysis: [
        { number: 10, frequency: 15, percentage: 10 },
        { number: 20, frequency: 12, percentage: 8 },
      ],
      hotColdAnalysis: {
        hotNumbers: [10, 20, 30],
        coldNumbers: [1, 2, 3],
        threshold: { hot: 10, cold: 3 },
      },
      trendAnalysis: [
        {
          number: 10,
          trends: [
            { period: '2025-01-01', frequency: 5, movingAverage: 4.5 },
          ],
          overallTrend: 'increasing',
          trendStrength: 0.7,
        },
      ],
      statisticalSummary: {
        totalDraws: 100,
        dateRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-01-15'),
        },
        avgNumbersPerDraw: 6,
        uniqueNumbersDrawn: 50,
      },
      analysisDate: new Date('2025-01-15'),
    });
  });

  const mockPredictions = {
    suggestedNumbers: [12, 24, 33, 41, 52, 67],
    frequencyAnalysis: [
      { number: 12, frequency: 5, percentage: 8.33 },
      { number: 24, frequency: 4, percentage: 6.67 },
    ],
    hotNumbers: [12, 24, 33, 41, 52],
    coldNumbers: [1, 2, 3, 4, 5],
    mostRecentDraw: {
      id: 'Powerball-2025-08-27',
      lotteryName: 'Powerball',
      drawDate: new Date('2025-08-27T20:00:00Z'),
      winningNumbers: [12, 29, 33, 41, 52],
      bonusNumber: 24,
      jackpotAmount: 150000000,
      sourceUrl: 'https://www.powerball.com',
    },
    analysisDate: new Date(),
  };

  it('should return enhanced predictions with analytics for all lotteries', async () => {
    mockLotteryDataService.generatePredictions.mockResolvedValue(mockPredictions);

    const request = new NextRequest('http://localhost:3000/api/lottery/predictions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('predictions', mockPredictions);
    expect(data.data).toHaveProperty('analytics');
    expect(data.data).toHaveProperty('metadata');
    expect(data.data.analytics).toHaveProperty('frequencyAnalysis');
    expect(data.data.analytics).toHaveProperty('hotColdAnalysis');
    expect(mockLotteryDataService.generatePredictions).toHaveBeenCalledWith(undefined);
    expect(mockLotteryAnalyticsService.getAdvancedAnalytics).toHaveBeenCalledWith({});
  });

  it('should return predictions for specific lottery with analytics', async () => {
    mockLotteryDataService.generatePredictions.mockResolvedValue(mockPredictions);

    const request = new NextRequest('http://localhost:3000/api/lottery/predictions?lotteryName=Powerball');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('predictions', mockPredictions);
    expect(mockLotteryDataService.generatePredictions).toHaveBeenCalledWith('Powerball');
    expect(mockLotteryAnalyticsService.getAdvancedAnalytics).toHaveBeenCalledWith({
      lotteryName: 'Powerball',
    });
  });

  it('should handle date range filters', async () => {
    mockLotteryDataService.generatePredictions.mockResolvedValue(mockPredictions);

    const request = new NextRequest('http://localhost:3000/api/lottery/predictions?startDate=2025-01-01&endDate=2025-01-31');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockLotteryAnalyticsService.getAdvancedAnalytics).toHaveBeenCalledWith({
      dateRange: {
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
      },
    });
  });

  it('should exclude analytics when includeAnalytics=false', async () => {
    mockLotteryDataService.generatePredictions.mockResolvedValue(mockPredictions);

    const request = new NextRequest('http://localhost:3000/api/lottery/predictions?includeAnalytics=false');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.analytics.frequencyAnalysis).toEqual([]);
    expect(mockLotteryAnalyticsService.getAdvancedAnalytics).not.toHaveBeenCalled();
  });

  it('should include trends when includeTrends=true', async () => {
    mockLotteryDataService.generatePredictions.mockResolvedValue(mockPredictions);

    const request = new NextRequest('http://localhost:3000/api/lottery/predictions?includeTrends=true');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.analytics).toHaveProperty('basicTrends');
    expect(data.data.analytics.basicTrends).toHaveLength(1);
  });

  it('should handle service errors', async () => {
    mockLotteryDataService.generatePredictions.mockRejectedValue(
      new Error('No historical data available for predictions')
    );

    const request = new NextRequest('http://localhost:3000/api/lottery/predictions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to generate enhanced predictions');
    expect(data.message).toBe('No historical data available for predictions');
  });

  it('should handle analytics service errors', async () => {
    mockLotteryDataService.generatePredictions.mockResolvedValue(mockPredictions);
    mockLotteryAnalyticsService.getAdvancedAnalytics.mockRejectedValue(
      new Error('Analytics processing failed')
    );

    const request = new NextRequest('http://localhost:3000/api/lottery/predictions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Analytics processing failed');
  });

  it('should handle unknown errors', async () => {
    mockLotteryDataService.generatePredictions.mockRejectedValue('Unknown error');

    const request = new NextRequest('http://localhost:3000/api/lottery/predictions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Unknown error');
  });
});