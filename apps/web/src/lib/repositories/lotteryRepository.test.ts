import { LotteryRepository } from './lotteryRepository';
import { db } from '../db';

jest.mock('../db');

const mockDb = db as jest.Mocked<typeof db>;

describe('LotteryRepository', () => {
  let repository: LotteryRepository;

  beforeEach(() => {
    repository = new LotteryRepository();
    jest.clearAllMocks();
  });

  describe('getRecentDraws', () => {
    it('should return recent lottery draws', async () => {
      const mockData = [
        {
          id: 'Powerball-2025-08-27',
          lottery_name: 'Powerball',
          draw_date: '2025-08-27T20:00:00Z',
          winning_numbers: [12, 29, 33, 41, 52],
          bonus_number: 24,
          jackpot_amount: '150000000',
          source_url: 'https://www.powerball.com',
        },
      ];

      mockDb.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: mockData,
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await repository.getRecentDraws(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'Powerball-2025-08-27',
        lotteryName: 'Powerball',
        drawDate: new Date('2025-08-27T20:00:00Z'),
        winningNumbers: [12, 29, 33, 41, 52],
        bonusNumber: 24,
        jackpotAmount: 150000000,
        sourceUrl: 'https://www.powerball.com',
      });
    });

    it('should throw error when database query fails', async () => {
      mockDb.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection failed' },
            }),
          }),
        }),
      } as any);

      await expect(repository.getRecentDraws()).rejects.toThrow(
        'Failed to fetch lottery draws: Database connection failed'
      );
    });
  });

  describe('getDrawsByLottery', () => {
    it('should return draws for specific lottery', async () => {
      const mockData = [
        {
          id: 'Powerball-2025-08-27',
          lottery_name: 'Powerball',
          draw_date: '2025-08-27T20:00:00Z',
          winning_numbers: [12, 29, 33, 41, 52],
          bonus_number: 24,
          jackpot_amount: '150000000',
          source_url: 'https://www.powerball.com',
        },
      ];

      mockDb.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: mockData,
                error: null,
              }),
            }),
          }),
        }),
      } as any);

      const result = await repository.getDrawsByLottery('Powerball', 1);

      expect(result).toHaveLength(1);
      expect(result[0].lotteryName).toBe('Powerball');
    });
  });

  describe('getAllDrawsForAnalysis', () => {
    it('should return all draws for analysis', async () => {
      const mockData = [
        {
          id: 'Powerball-2025-08-27',
          lottery_name: 'Powerball',
          draw_date: '2025-08-27T20:00:00Z',
          winning_numbers: [12, 29, 33, 41, 52],
          bonus_number: 24,
          jackpot_amount: '150000000',
          source_url: 'https://www.powerball.com',
        },
      ];

      mockDb.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      } as any);

      const result = await repository.getAllDrawsForAnalysis();

      expect(result).toHaveLength(1);
      expect(result[0].lotteryName).toBe('Powerball');
    });
  });
});