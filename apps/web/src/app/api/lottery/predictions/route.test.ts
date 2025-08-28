import { GET } from './route';
import { NextRequest } from 'next/server';
import { lotteryDataService } from '../../../../lib/services/lotteryDataService';

jest.mock('../../../../lib/services/lotteryDataService');

const mockLotteryDataService = lotteryDataService as jest.Mocked<typeof lotteryDataService>;

describe('/api/lottery/predictions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('should return predictions for all lotteries', async () => {
    mockLotteryDataService.generatePredictions.mockResolvedValue(mockPredictions);

    const request = new NextRequest('http://localhost:3000/api/lottery/predictions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockPredictions);
    expect(mockLotteryDataService.generatePredictions).toHaveBeenCalledWith(undefined);
  });

  it('should return predictions for specific lottery', async () => {
    mockLotteryDataService.generatePredictions.mockResolvedValue(mockPredictions);

    const request = new NextRequest('http://localhost:3000/api/lottery/predictions?lotteryName=Powerball');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockPredictions);
    expect(mockLotteryDataService.generatePredictions).toHaveBeenCalledWith('Powerball');
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
    expect(data.error).toBe('Failed to generate predictions');
    expect(data.message).toBe('No historical data available for predictions');
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