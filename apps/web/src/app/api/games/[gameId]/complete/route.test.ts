import { NextRequest } from 'next/server';
import { POST } from './route';
import { createClient } from '@supabase/supabase-js';
import { GameService } from '../../../../../lib/services/gameService';

// Mock dependencies
jest.mock('@supabase/supabase-js');
jest.mock('../../../../../lib/services/gameService');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const MockGameService = GameService as jest.MockedClass<typeof GameService>;

describe('POST /api/games/[gameId]/complete', () => {
  let mockSupabase: any;
  let mockGameService: jest.Mocked<GameService>;

  beforeEach(() => {
    // Reset environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

    // Mock Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
    };
    mockCreateClient.mockReturnValue(mockSupabase);

    // Mock GameService
    mockGameService = new MockGameService() as jest.Mocked<GameService>;
    MockGameService.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 400 when gameId is missing', async () => {
      const request = new NextRequest('http://test.com/api/games//complete', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      const response = await POST(request, { params: { gameId: '' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Game ID is required');
    });

    it('should return 401 when authorization header is missing', async () => {
      const request = new NextRequest('http://test.com/api/games/game-123/complete', {
        method: 'POST',
      });

      const response = await POST(request, { params: { gameId: 'game-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 401 when authorization header is invalid format', async () => {
      const request = new NextRequest('http://test.com/api/games/game-123/complete', {
        method: 'POST',
        headers: {
          'authorization': 'InvalidFormat token',
        },
      });

      const response = await POST(request, { params: { gameId: 'game-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 401 when Supabase auth fails', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Invalid token'),
      });

      const request = new NextRequest('http://test.com/api/games/game-123/complete', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer invalid-token',
        },
      });

      const response = await POST(request, { params: { gameId: 'game-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid authentication token');
    });
  });

  describe('Game Completion', () => {
    beforeEach(() => {
      // Mock successful authentication
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'user-123',
            email: 'test@example.com'
          }
        },
        error: null,
      });
    });

    it('should successfully complete game and return crypto reward', async () => {
      const mockGameResult = {
        game: {
          id: 'game-123',
          name: 'Color Memory Challenge',
          rewardAmount: 12,
        },
        earnedAmount: 12,
        newBalance: { balance: 25 },
        mintedNFTs: [],
      };

      mockGameService.completeGame.mockResolvedValue(mockGameResult);

      const request = new NextRequest('http://test.com/api/games/game-123/complete', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      const response = await POST(request, { params: { gameId: 'game-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.game).toEqual(mockGameResult.game);
      expect(data.data.earnedAmount).toBe(12);
      expect(data.data.newBalance).toBe(25);
      expect(data.data.message).toBe('Congratulations! You earned 12 crypto!');

      expect(mockGameService.completeGame).toHaveBeenCalledWith('game-123', 'user-123');
    });

    it('should include NFT message when NFTs are minted', async () => {
      const mockGameResult = {
        game: {
          id: 'game-123',
          name: 'Color Memory Challenge',
          rewardAmount: 12,
        },
        earnedAmount: 12,
        newBalance: { balance: 25 },
        mintedNFTs: [
          { id: 'nft-1', name: 'Memory Master Badge' },
          { id: 'nft-2', name: 'Color Champion Trophy' },
        ],
      };

      mockGameService.completeGame.mockResolvedValue(mockGameResult);

      const request = new NextRequest('http://test.com/api/games/game-123/complete', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      const response = await POST(request, { params: { gameId: 'game-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.mintedNFTs).toHaveLength(2);
      expect(data.data.message).toBe('Congratulations! You earned 12 crypto! Plus, you earned 2 new NFTs!');
    });

    it('should handle single NFT correctly', async () => {
      const mockGameResult = {
        game: {
          id: 'game-123',
          name: 'Color Memory Challenge',
          rewardAmount: 12,
        },
        earnedAmount: 12,
        newBalance: { balance: 25 },
        mintedNFTs: [
          { id: 'nft-1', name: 'Memory Master Badge' },
        ],
      };

      mockGameService.completeGame.mockResolvedValue(mockGameResult);

      const request = new NextRequest('http://test.com/api/games/game-123/complete', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      const response = await POST(request, { params: { gameId: 'game-123' } });
      const data = await response.json();

      expect(data.data.message).toBe('Congratulations! You earned 12 crypto! Plus, you earned 1 new NFT!');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      // Mock successful authentication
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'user-123',
            email: 'test@example.com'
          }
        },
        error: null,
      });
    });

    it('should handle GameService errors gracefully', async () => {
      const gameServiceError = new Error('Game not found');
      mockGameService.completeGame.mockRejectedValue(gameServiceError);

      const request = new NextRequest('http://test.com/api/games/invalid-game/complete', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      const response = await POST(request, { params: { gameId: 'invalid-game' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to complete game');
      expect(data.message).toBe('Game not found');
    });

    it('should handle unknown errors', async () => {
      mockGameService.completeGame.mockRejectedValue('Unknown error string');

      const request = new NextRequest('http://test.com/api/games/game-123/complete', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      const response = await POST(request, { params: { gameId: 'game-123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to complete game');
      expect(data.message).toBe('Unknown error');
    });
  });

  describe('Color Memory Challenge Specific', () => {
    beforeEach(() => {
      // Mock successful authentication
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'user-123',
            email: 'test@example.com'
          }
        },
        error: null,
      });
    });

    it('should handle Color Memory Challenge completion correctly', async () => {
      const mockGameResult = {
        game: {
          id: 'color-memory-challenge',
          name: 'Color Memory Challenge',
          rewardAmount: 12,
          description: 'Remember and repeat the color sequence to earn crypto rewards!',
        },
        earnedAmount: 12,
        newBalance: { balance: 25 },
        mintedNFTs: [],
      };

      mockGameService.completeGame.mockResolvedValue(mockGameResult);

      const request = new NextRequest('http://test.com/api/games/color-memory-challenge/complete', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      const response = await POST(request, { params: { gameId: 'color-memory-challenge' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.game.name).toBe('Color Memory Challenge');
      expect(data.data.earnedAmount).toBe(12);
      expect(mockGameService.completeGame).toHaveBeenCalledWith('color-memory-challenge', 'user-123');
    });
  });
});