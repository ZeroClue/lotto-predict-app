import { LotteryDataService } from './lotteryDataService';
import { lotteryRepository, LotteryDraw } from '../repositories/lotteryRepository';

jest.mock('../repositories/lotteryRepository');

const mockLotteryRepository = lotteryRepository as jest.Mocked<typeof lotteryRepository>;

describe('LotteryDataService', () => {
  let service: LotteryDataService;

  beforeEach(() => {
    service = new LotteryDataService();
    jest.clearAllMocks();
  });

  const mockDraws: LotteryDraw[] = [
    {
      id: 'Powerball-2025-08-27',
      lotteryName: 'Powerball',
      drawDate: new Date('2025-08-27T20:00:00Z'),
      winningNumbers: [12, 29, 33, 41, 52],
      bonusNumber: 24,
      jackpotAmount: 150000000,
      sourceUrl: 'https://www.powerball.com',
    },
    {
      id: 'Powerball-2025-08-24',
      lotteryName: 'Powerball',
      drawDate: new Date('2025-08-24T20:00:00Z'),
      winningNumbers: [8, 19, 34, 46, 58],
      bonusNumber: 3,
      jackpotAmount: 120000000,
      sourceUrl: 'https://www.powerball.com',
    },
    {
      id: 'Powerball-2025-08-21',
      lotteryName: 'Powerball',
      drawDate: new Date('2025-08-21T20:00:00Z'),
      winningNumbers: [12, 27, 35, 48, 67],
      bonusNumber: 18,
      jackpotAmount: 100000000,
      sourceUrl: 'https://www.powerball.com',
    },
  ];

  describe('getRecentDraws', () => {
    it('should return recent draws from repository', async () => {
      mockLotteryRepository.getRecentDraws.mockResolvedValue(mockDraws);

      const result = await service.getRecentDraws(3);

      expect(mockLotteryRepository.getRecentDraws).toHaveBeenCalledWith(3);
      expect(result).toEqual(mockDraws);
    });
  });

  describe('getDrawsByLottery', () => {
    it('should return draws by lottery from repository', async () => {
      mockLotteryRepository.getDrawsByLottery.mockResolvedValue(mockDraws);

      const result = await service.getDrawsByLottery('Powerball', 10);

      expect(mockLotteryRepository.getDrawsByLottery).toHaveBeenCalledWith('Powerball', 10);
      expect(result).toEqual(mockDraws);
    });
  });

  describe('generatePredictions', () => {
    it('should generate predictions with frequency analysis', async () => {
      mockLotteryRepository.getAllDrawsForAnalysis.mockResolvedValue(mockDraws);

      const result = await service.generatePredictions();

      expect(result).toHaveProperty('suggestedNumbers');
      expect(result).toHaveProperty('frequencyAnalysis');
      expect(result).toHaveProperty('hotNumbers');
      expect(result).toHaveProperty('coldNumbers');
      expect(result).toHaveProperty('mostRecentDraw');
      expect(result).toHaveProperty('analysisDate');

      expect(result.suggestedNumbers).toHaveLength(6);
      expect(result.frequencyAnalysis.length).toBeGreaterThan(0);
      expect(result.hotNumbers.length).toBeGreaterThan(0);
      expect(result.coldNumbers.length).toBeGreaterThan(0);
      expect(result.mostRecentDraw).toEqual(mockDraws[0]);
    });

    it('should generate predictions for specific lottery', async () => {
      mockLotteryRepository.getDrawsByLottery.mockResolvedValue(mockDraws);

      const result = await service.generatePredictions('Powerball');

      expect(mockLotteryRepository.getDrawsByLottery).toHaveBeenCalledWith('Powerball', 50);
      expect(result.suggestedNumbers).toHaveLength(6);
    });

    it('should throw error when no historical data available', async () => {
      mockLotteryRepository.getAllDrawsForAnalysis.mockResolvedValue([]);

      await expect(service.generatePredictions()).rejects.toThrow(
        'No historical data available for predictions'
      );
    });

    it('should analyze number frequency correctly', async () => {
      mockLotteryRepository.getAllDrawsForAnalysis.mockResolvedValue(mockDraws);

      const result = await service.generatePredictions();

      // Number 12 appears twice in mock data
      const number12Analysis = result.frequencyAnalysis.find(item => item.number === 12);
      expect(number12Analysis).toBeDefined();
      expect(number12Analysis!.frequency).toBe(2);

      // Check that percentages are calculated
      result.frequencyAnalysis.forEach(item => {
        expect(item.percentage).toBeGreaterThan(0);
      });
    });

    it('should suggest numbers different from most recent draw', async () => {
      mockLotteryRepository.getAllDrawsForAnalysis.mockResolvedValue(mockDraws);

      const result = await service.generatePredictions();
      const mostRecentNumbers = mockDraws[0].winningNumbers;

      // At least some suggested numbers should be different from most recent
      const hasNewNumbers = result.suggestedNumbers.some(num => !mostRecentNumbers.includes(num));
      expect(hasNewNumbers).toBe(true);
    });
  });
});