import { LotteryService } from './lotteryService';
import { apiClient } from '../../../services/apiClient';

jest.mock('../../../services/apiClient');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('LotteryService', () => {
  let service: LotteryService;

  beforeEach(() => {
    service = new LotteryService();
    jest.clearAllMocks();
  });

  describe('getRecentDraws', () => {
    const mockDrawsResponse = {
      success: true,
      data: [
        {
          id: 'Powerball-2025-08-27',
          lotteryName: 'Powerball',
          drawDate: '2025-08-27T20:00:00Z',
          winningNumbers: [12, 29, 33, 41, 52],
          bonusNumber: 24,
          jackpotAmount: 150000000,
          sourceUrl: 'https://www.powerball.com',
        },
      ],
      count: 1,
    };

    it('should fetch recent draws without parameters', async () => {
      mockApiClient.get.mockResolvedValue(mockDrawsResponse);

      const result = await service.getRecentDraws();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/lottery/draws');
      expect(result).toHaveLength(1);
      expect(result[0].drawDate).toBeInstanceOf(Date);
    });

    it('should fetch recent draws with limit parameter', async () => {
      mockApiClient.get.mockResolvedValue(mockDrawsResponse);

      await service.getRecentDraws({ limit: 10 });

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/lottery/draws?limit=10');
    });

    it('should fetch recent draws with lottery name parameter', async () => {
      mockApiClient.get.mockResolvedValue(mockDrawsResponse);

      await service.getRecentDraws({ lotteryName: 'Powerball' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/lottery/draws?lotteryName=Powerball');
    });

    it('should fetch recent draws with both parameters', async () => {
      mockApiClient.get.mockResolvedValue(mockDrawsResponse);

      await service.getRecentDraws({ limit: 5, lotteryName: 'Powerball' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/lottery/draws?limit=5&lotteryName=Powerball');
    });

    it('should throw error when API returns unsuccessful response', async () => {
      mockApiClient.get.mockResolvedValue({
        success: false,
        error: 'Database error',
        data: [],
        count: 0,
      });

      await expect(service.getRecentDraws()).rejects.toThrow('Database error');
    });

    it('should throw generic error when API returns unsuccessful response without error message', async () => {
      mockApiClient.get.mockResolvedValue({
        success: false,
        data: [],
        count: 0,
      });

      await expect(service.getRecentDraws()).rejects.toThrow('Failed to fetch lottery draws');
    });
  });

  describe('getPredictions', () => {
    const mockPredictionsResponse = {
      success: true,
      data: {
        suggestedNumbers: [1, 2, 3, 4, 5, 6],
        frequencyAnalysis: [
          { number: 1, frequency: 5, percentage: 10 },
          { number: 2, frequency: 4, percentage: 8 },
        ],
        hotNumbers: [1, 2, 3],
        coldNumbers: [60, 61, 62],
        mostRecentDraw: {
          id: 'Powerball-2025-08-27',
          lotteryName: 'Powerball',
          drawDate: '2025-08-27T20:00:00Z',
          winningNumbers: [12, 29, 33, 41, 52],
          bonusNumber: 24,
          jackpotAmount: 150000000,
          sourceUrl: 'https://www.powerball.com',
        },
        analysisDate: '2025-08-28T10:00:00Z',
      },
    };

    it('should fetch predictions without lottery name', async () => {
      mockApiClient.get.mockResolvedValue(mockPredictionsResponse);

      const result = await service.getPredictions();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/lottery/predictions');
      expect(result.suggestedNumbers).toHaveLength(6);
      expect(result.analysisDate).toBeInstanceOf(Date);
      expect(result.mostRecentDraw?.drawDate).toBeInstanceOf(Date);
    });

    it('should fetch predictions with lottery name', async () => {
      mockApiClient.get.mockResolvedValue(mockPredictionsResponse);

      await service.getPredictions('Powerball');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/lottery/predictions?lotteryName=Powerball');
    });

    it('should handle null mostRecentDraw', async () => {
      const responseWithNullDraw = {
        ...mockPredictionsResponse,
        data: {
          ...mockPredictionsResponse.data,
          mostRecentDraw: null,
        },
      };
      mockApiClient.get.mockResolvedValue(responseWithNullDraw);

      const result = await service.getPredictions();

      expect(result.mostRecentDraw).toBeNull();
    });

    it('should throw error when API returns unsuccessful response', async () => {
      mockApiClient.get.mockResolvedValue({
        success: false,
        error: 'No data available',
        data: {},
      });

      await expect(service.getPredictions()).rejects.toThrow('No data available');
    });

    it('should throw generic error when API returns unsuccessful response without error message', async () => {
      mockApiClient.get.mockResolvedValue({
        success: false,
        data: {},
      });

      await expect(service.getPredictions()).rejects.toThrow('Failed to fetch predictions');
    });
  });
});