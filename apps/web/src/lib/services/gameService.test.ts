import { GameService } from './gameService';
import { GameRepository } from '../repositories/gameRepository';
import { CryptoBalanceRepository } from '../repositories/cryptoBalanceRepository';
import { NFTService } from './nftService';

// Mock the repositories and services
jest.mock('../repositories/gameRepository');
jest.mock('../repositories/cryptoBalanceRepository');
jest.mock('./nftService');

const mockGameRepository = GameRepository as jest.MockedClass<typeof GameRepository>;
const mockCryptoBalanceRepository = CryptoBalanceRepository as jest.MockedClass<typeof CryptoBalanceRepository>;
const mockNFTService = NFTService as jest.MockedClass<typeof NFTService>;

describe('GameService', () => {
  let gameService: GameService;
  let mockGameRepoInstance: jest.Mocked<GameRepository>;
  let mockCryptoRepoInstance: jest.Mocked<CryptoBalanceRepository>;
  let mockNFTServiceInstance: jest.Mocked<NFTService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGameRepoInstance = {
      getActiveGames: jest.fn(),
      getGameById: jest.fn(),
    } as any;

    mockCryptoRepoInstance = {
      getUserBalance: jest.fn(),
      addToBalance: jest.fn(),
      getOrCreateUserBalance: jest.fn(),
      initializeUserBalance: jest.fn(),
    } as any;

    mockNFTServiceInstance = {
      checkAndMintNFTs: jest.fn(),
    } as any;

    mockGameRepository.mockImplementation(() => mockGameRepoInstance);
    mockCryptoBalanceRepository.mockImplementation(() => mockCryptoRepoInstance);
    mockNFTService.mockImplementation(() => mockNFTServiceInstance);
    
    gameService = new GameService();
  });

  describe('getActiveGames', () => {
    it('should return active games from repository', async () => {
      const mockGames = [
        {
          id: '1',
          name: 'Lucky Number Puzzle',
          description: 'Test game',
          rewardAmount: 10,
          isActive: true,
        },
      ];

      mockGameRepoInstance.getActiveGames.mockResolvedValue(mockGames as any);

      const result = await gameService.getActiveGames();

      expect(mockGameRepoInstance.getActiveGames).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockGames);
    });
  });

  describe('getGameById', () => {
    it('should return game by ID from repository', async () => {
      const mockGame = {
        id: '1',
        name: 'Lucky Number Puzzle',
        description: 'Test game',
        rewardAmount: 10,
        isActive: true,
      };

      mockGameRepoInstance.getGameById.mockResolvedValue(mockGame as any);

      const result = await gameService.getGameById('1');

      expect(mockGameRepoInstance.getGameById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockGame);
    });
  });

  describe('completeGame', () => {
    it('should complete game and award crypto to user', async () => {
      const mockGame = {
        id: '1',
        name: 'Lucky Number Puzzle',
        description: 'Test game',
        rewardAmount: 10,
        isActive: true,
      };

      const mockBalance = {
        userId: 'user1',
        balance: 20,
        updatedAt: new Date(),
      };

      const mockMintedNFTs = [];

      mockGameRepoInstance.getGameById.mockResolvedValue(mockGame as any);
      mockCryptoRepoInstance.addToBalance.mockResolvedValue(mockBalance as any);
      mockNFTServiceInstance.checkAndMintNFTs.mockResolvedValue(mockMintedNFTs as any);

      const result = await gameService.completeGame('1', 'user1');

      expect(mockGameRepoInstance.getGameById).toHaveBeenCalledWith('1');
      expect(mockCryptoRepoInstance.addToBalance).toHaveBeenCalledWith('user1', 10);
      expect(mockNFTServiceInstance.checkAndMintNFTs).toHaveBeenCalledWith('user1', 2); // 20 balance / 10 reward = 2 completions
      
      expect(result).toEqual({
        game: mockGame,
        earnedAmount: 10,
        newBalance: mockBalance,
        mintedNFTs: undefined, // No NFTs minted
      });
    });

    it('should complete game and mint NFTs when conditions are met', async () => {
      const mockGame = {
        id: '1',
        name: 'Lucky Number Puzzle',
        description: 'Test game',
        rewardAmount: 10,
        isActive: true,
      };

      const mockBalance = {
        userId: 'user1',
        balance: 10, // First completion
        updatedAt: new Date(),
      };

      const mockMintedNFTs = [
        {
          nft: {
            id: 'nft1',
            ownerId: 'user1',
            name: 'Starter Crystal',
            imageUrl: '/images/starter.png',
            rarity: 'Common',
            baseValue: 25,
            isFeatured: false,
            mintDate: new Date(),
          },
          awardReason: 'Congratulations on completing your first game!',
        },
      ];

      mockGameRepoInstance.getGameById.mockResolvedValue(mockGame as any);
      mockCryptoRepoInstance.addToBalance.mockResolvedValue(mockBalance as any);
      mockNFTServiceInstance.checkAndMintNFTs.mockResolvedValue(mockMintedNFTs as any);

      const result = await gameService.completeGame('1', 'user1');

      expect(mockGameRepoInstance.getGameById).toHaveBeenCalledWith('1');
      expect(mockCryptoRepoInstance.addToBalance).toHaveBeenCalledWith('user1', 10);
      expect(mockNFTServiceInstance.checkAndMintNFTs).toHaveBeenCalledWith('user1', 1); // 10 balance / 10 reward = 1 completion
      
      expect(result).toEqual({
        game: mockGame,
        earnedAmount: 10,
        newBalance: mockBalance,
        mintedNFTs: mockMintedNFTs,
      });
    });

    it('should throw error when game not found', async () => {
      mockGameRepoInstance.getGameById.mockResolvedValue(null);

      await expect(gameService.completeGame('nonexistent', 'user1')).rejects.toThrow('Game not found or inactive');
      
      expect(mockCryptoRepoInstance.addToBalance).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      mockGameRepoInstance.getGameById.mockRejectedValue(new Error('Database error'));

      await expect(gameService.completeGame('1', 'user1')).rejects.toThrow('Database error');
    });
  });

  describe('getUserBalance', () => {
    it('should return user balance from repository', async () => {
      const mockBalance = {
        userId: 'user1',
        balance: 15.5,
        updatedAt: new Date(),
      };

      mockCryptoRepoInstance.getOrCreateUserBalance.mockResolvedValue(mockBalance as any);

      const result = await gameService.getUserBalance('user1');

      expect(mockCryptoRepoInstance.getOrCreateUserBalance).toHaveBeenCalledWith('user1');
      expect(result).toEqual(mockBalance);
    });
  });

  describe('initializeUserBalance', () => {
    it('should initialize balance for new user', async () => {
      const mockBalance = {
        userId: 'user1',
        balance: 0,
        updatedAt: new Date(),
      };

      mockCryptoRepoInstance.initializeUserBalance.mockResolvedValue(mockBalance as any);

      const result = await gameService.initializeUserBalance('user1');

      expect(mockCryptoRepoInstance.initializeUserBalance).toHaveBeenCalledWith('user1');
      expect(result).toEqual(mockBalance);
    });
  });
});