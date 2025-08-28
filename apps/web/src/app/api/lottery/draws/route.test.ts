import { GET } from './route';
import { NextRequest } from 'next/server';
import { lotteryDataService } from '../../../../lib/services/lotteryDataService';

jest.mock('../../../../lib/services/lotteryDataService');

const mockLotteryDataService = lotteryDataService as jest.Mocked<typeof lotteryDataService>;

describe('/api/lottery/draws', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('should return recent draws with default limit', async () => {
    mockLotteryDataService.getRecentDraws.mockResolvedValue(mockDraws);

    const request = new NextRequest('http://localhost:3000/api/lottery/draws');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockDraws);
    expect(data.count).toBe(1);
    expect(mockLotteryDataService.getRecentDraws).toHaveBeenCalledWith(20);
  });

  it('should return draws with custom limit', async () => {
    mockLotteryDataService.getRecentDraws.mockResolvedValue(mockDraws);

    const request = new NextRequest('http://localhost:3000/api/lottery/draws?limit=5');
    const response = await GET(request);

    expect(mockLotteryDataService.getRecentDraws).toHaveBeenCalledWith(5);
  });

  it('should return draws for specific lottery', async () => {
    mockLotteryDataService.getDrawsByLottery.mockResolvedValue(mockDraws);

    const request = new NextRequest('http://localhost:3000/api/lottery/draws?lotteryName=Powerball&limit=10');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockLotteryDataService.getDrawsByLottery).toHaveBeenCalledWith('Powerball', 10);
  });

  it('should handle service errors', async () => {
    mockLotteryDataService.getRecentDraws.mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost:3000/api/lottery/draws');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to fetch lottery draws');
    expect(data.message).toBe('Database connection failed');
  });

  it('should handle unknown errors', async () => {
    mockLotteryDataService.getRecentDraws.mockRejectedValue('Unknown error');

    const request = new NextRequest('http://localhost:3000/api/lottery/draws');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Unknown error');
  });
});