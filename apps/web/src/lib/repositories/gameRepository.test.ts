import { GameRepository } from './gameRepository';
import { Game } from '../types';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('GameRepository', () => {
  let gameRepository: GameRepository;
  let mockSupabase: any;
  let mockSelect: jest.Mock;
  let mockEq: jest.Mock;
  let mockOrder: jest.Mock;
  let mockSingle: jest.Mock;

  beforeAll(() => {
    const { createClient } = require('@supabase/supabase-js');
    
    mockSelect = jest.fn();
    mockEq = jest.fn();
    mockOrder = jest.fn();
    mockSingle = jest.fn();
    
    mockSupabase = {
      from: jest.fn(() => ({
        select: mockSelect,
      })),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  beforeEach(() => {
    gameRepository = new GameRepository();
    jest.clearAllMocks();
    
    // Reset the mock chain
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      order: mockOrder,
      single: mockSingle,
    });
    mockOrder.mockReturnValue({
      // This is for getActiveGames chaining
    });
  });

  describe('getActiveGames', () => {
    it('should fetch and return active games including Color Memory Challenge', async () => {
      const mockGames = [
        {
          id: '1',
          name: 'Lucky Number Puzzle',
          description: 'Guess the lucky number between 1 and 10 to earn crypto rewards!',
          reward_amount: '10.0',
          nft_award_threshold: 5,
          is_active: true,
          image_url: null,
        },
        {
          id: '2',
          name: 'Color Memory Challenge',
          description: 'Remember and repeat the color sequence to earn crypto rewards! Progressive difficulty increases with each round.',
          reward_amount: '12.0',
          nft_award_threshold: 4,
          is_active: true,
          image_url: null,
        },
      ];

      mockOrder.mockResolvedValue({
        data: mockGames,
        error: null,
      });

      const result = await gameRepository.getActiveGames();

      expect(mockSupabase.from).toHaveBeenCalledWith('games');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('is_active', true);
      expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true });
      
      expect(result).toHaveLength(2);
      
      // Verify Lucky Number Puzzle
      expect(result[0]).toEqual({
        id: '1',
        name: 'Lucky Number Puzzle',
        description: 'Guess the lucky number between 1 and 10 to earn crypto rewards!',
        rewardAmount: 10.0,
        nftAwardThreshold: 5,
        isActive: true,
        imageUrl: null,
      });

      // Verify Color Memory Challenge
      expect(result[1]).toEqual({
        id: '2',
        name: 'Color Memory Challenge',
        description: 'Remember and repeat the color sequence to earn crypto rewards! Progressive difficulty increases with each round.',
        rewardAmount: 12.0,
        nftAwardThreshold: 4,
        isActive: true,
        imageUrl: null,
      });
    });

    it('should throw error when database query fails', async () => {
      mockOrder.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(gameRepository.getActiveGames()).rejects.toThrow('Failed to fetch active games: Database error');
    });

    it('should return empty array when no games found', async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await gameRepository.getActiveGames();
      expect(result).toEqual([]);
    });
  });

  describe('getGameById', () => {
    it('should fetch and return Color Memory Challenge game by ID', async () => {
      const mockGame = {
        id: '2',
        name: 'Color Memory Challenge',
        description: 'Remember and repeat the color sequence to earn crypto rewards! Progressive difficulty increases with each round.',
        reward_amount: '12.0',
        nft_award_threshold: 4,
        is_active: true,
        image_url: null,
      };

      mockSingle.mockResolvedValue({
        data: mockGame,
        error: null,
      });

      const result = await gameRepository.getGameById('2');

      expect(mockSupabase.from).toHaveBeenCalledWith('games');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', '2');
      expect(mockEq).toHaveBeenCalledWith('is_active', true);
      
      expect(result).toEqual({
        id: '2',
        name: 'Color Memory Challenge',
        description: 'Remember and repeat the color sequence to earn crypto rewards! Progressive difficulty increases with each round.',
        rewardAmount: 12.0,
        nftAwardThreshold: 4,
        isActive: true,
        imageUrl: null,
      });
    });

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