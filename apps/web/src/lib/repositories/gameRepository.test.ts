import { GameRepository } from './gameRepository';
import { Game } from '../types';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(),
};

const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockSingle = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

describe('GameRepository', () => {
  let gameRepository: GameRepository;

  beforeEach(() => {
    gameRepository = new GameRepository();
    jest.clearAllMocks();
    
    // Reset the mock chain
    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      order: mockOrder,
      single: mockSingle,
    });
    mockOrder.mockReturnValue({
      single: mockSingle,
    });
  });

  describe('getActiveGames', () => {
    it('should fetch and return active games', async () => {
      const mockGames = [
        {
          id: '1',
          name: 'Lucky Number Puzzle',
          description: 'Test description',
          reward_amount: '10.0',
          nft_award_threshold: 5,
          is_active: true,
          image_url: null,
        },
      ];

      mockOrder.mockReturnValue({
        then: jest.fn().mockResolvedValue({
          data: mockGames,
          error: null,
        }),
      });

      const result = await gameRepository.getActiveGames();

      expect(mockSupabase.from).toHaveBeenCalledWith('games');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('is_active', true);
      expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true });
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '1',
        name: 'Lucky Number Puzzle',
        description: 'Test description',
        rewardAmount: 10.0,
        nftAwardThreshold: 5,
        isActive: true,
        imageUrl: null,
      });
    });

    it('should throw error when database query fails', async () => {
      mockOrder.mockReturnValue({
        then: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      });

      await expect(gameRepository.getActiveGames()).rejects.toThrow('Failed to fetch active games: Database error');
    });

    it('should return empty array when no games found', async () => {
      mockOrder.mockReturnValue({
        then: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      const result = await gameRepository.getActiveGames();
      expect(result).toEqual([]);
    });
  });

  describe('getGameById', () => {
    it('should fetch and return game by ID', async () => {
      const mockGame = {
        id: '1',
        name: 'Lucky Number Puzzle',
        description: 'Test description',
        reward_amount: '10.0',
        nft_award_threshold: 5,
        is_active: true,
        image_url: null,
      };

      mockSingle.mockResolvedValue({
        data: mockGame,
        error: null,
      });

      const result = await gameRepository.getGameById('1');

      expect(mockSupabase.from).toHaveBeenCalledWith('games');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(mockEq).toHaveBeenCalledWith('is_active', true);
      
      expect(result).toEqual({
        id: '1',
        name: 'Lucky Number Puzzle',
        description: 'Test description',
        rewardAmount: 10.0,
        nftAwardThreshold: 5,
        isActive: true,
        imageUrl: null,
      });
    });

    it('should return null when game not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await gameRepository.getGameById('nonexistent');
      expect(result).toBeNull();
    });

    it('should throw error when database query fails', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'OTHER' },
      });

      await expect(gameRepository.getGameById('1')).rejects.toThrow('Failed to fetch game by ID: Database error');
    });
  });
});