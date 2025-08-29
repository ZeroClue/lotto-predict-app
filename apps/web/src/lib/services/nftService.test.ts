import { NFTService } from './nftService';
import { NFTRepository } from '../repositories/nftRepository';
import { CryptoBalanceRepository } from '../repositories/cryptoBalanceRepository';

// Mock the repositories
jest.mock('../repositories/nftRepository');
jest.mock('../repositories/cryptoBalanceRepository');

const mockNFTRepository = NFTRepository as jest.MockedClass<typeof NFTRepository>;
const mockCryptoBalanceRepository = CryptoBalanceRepository as jest.MockedClass<typeof CryptoBalanceRepository>;

describe('NFTService', () => {
  let nftService: NFTService;
  let mockNFTRepoInstance: jest.Mocked<NFTRepository>;
  let mockCryptoRepoInstance: jest.Mocked<CryptoBalanceRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockNFTRepoInstance = {
      getUserNFTs: jest.fn(),
      getNFTById: jest.fn(),
      mintNFT: jest.fn(),
      setFeatured: jest.fn(),
      updateDynamicProperties: jest.fn(),
      getNFTTemplate: jest.fn(),
      getNFTTemplates: jest.fn(),
    } as any;

    mockCryptoRepoInstance = {
      getOrCreateUserBalance: jest.fn(),
    } as any;

    mockNFTRepository.mockImplementation(() => mockNFTRepoInstance);
    mockCryptoBalanceRepository.mockImplementation(() => mockCryptoRepoInstance);
    
    nftService = new NFTService();
  });

  describe('getUserNFTs', () => {
    it('should return user NFTs from repository', async () => {
      const mockNFTs = [
        {
          id: 'nft1',
          ownerId: 'user1',
          name: 'Starter Crystal',
          imageUrl: '/images/starter.png',
          rarity: 'Common',
          baseValue: 25,
          isFeatured: false,
          mintDate: new Date(),
        },
      ];

      mockNFTRepoInstance.getUserNFTs.mockResolvedValue(mockNFTs as any);

      const result = await nftService.getUserNFTs('user1');

      expect(mockNFTRepoInstance.getUserNFTs).toHaveBeenCalledWith('user1');
      expect(result).toEqual(mockNFTs);
    });
  });

  describe('getNFTById', () => {
    it('should return specific NFT by ID', async () => {
      const mockNFT = {
        id: 'nft1',
        ownerId: 'user1',
        name: 'Starter Crystal',
        imageUrl: '/images/starter.png',
        rarity: 'Common',
        baseValue: 25,
        isFeatured: false,
        mintDate: new Date(),
      };

      mockNFTRepoInstance.getNFTById.mockResolvedValue(mockNFT as any);

      const result = await nftService.getNFTById('nft1', 'user1');

      expect(mockNFTRepoInstance.getNFTById).toHaveBeenCalledWith('nft1', 'user1');
      expect(result).toEqual(mockNFT);
    });
  });

  describe('setNFTFeatured', () => {
    it('should update NFT featured status', async () => {
      const mockNFT = {
        id: 'nft1',
        ownerId: 'user1',
        name: 'Starter Crystal',
        imageUrl: '/images/starter.png',
        rarity: 'Common',
        baseValue: 25,
        isFeatured: true,
        mintDate: new Date(),
      };

      mockNFTRepoInstance.setFeatured.mockResolvedValue(mockNFT as any);

      const result = await nftService.setNFTFeatured('nft1', 'user1', true);

      expect(mockNFTRepoInstance.setFeatured).toHaveBeenCalledWith('nft1', 'user1', true);
      expect(result).toEqual(mockNFT);
    });
  });

  describe('checkAndMintNFTs', () => {
    it('should mint NFT for first game completion', async () => {
      const mockTemplates = [
        {
          id: 'starter-crystal',
          name: 'Starter Crystal',
          imageUrl: '/images/starter.png',
          rarity: 'Common',
          baseValue: 25,
          mintConditions: { first_game_completion: true },
        },
      ];

      const mockBalance = {
        userId: 'user1',
        balance: 10,
        updatedAt: new Date(),
      };

      const mockMintedNFT = {
        id: 'nft1',
        ownerId: 'user1',
        name: 'Starter Crystal',
        imageUrl: '/images/starter.png',
        rarity: 'Common',
        baseValue: 25,
        isFeatured: false,
        mintDate: new Date(),
      };

      mockNFTRepoInstance.getNFTTemplates.mockResolvedValue(mockTemplates as any);
      mockCryptoRepoInstance.getOrCreateUserBalance.mockResolvedValue(mockBalance as any);
      mockNFTRepoInstance.getUserNFTs.mockResolvedValue([]);
      mockNFTRepoInstance.mintNFT.mockResolvedValue(mockMintedNFT as any);

      const result = await nftService.checkAndMintNFTs('user1', 1);

      expect(result).toHaveLength(1);
      expect(result[0].nft).toEqual(mockMintedNFT);
      expect(result[0].awardReason).toContain('first game');
    });

    it('should mint NFT for crypto threshold reached', async () => {
      const mockTemplates = [
        {
          id: 'lucky-coin',
          name: 'Lucky Coin',
          imageUrl: '/images/coin.png',
          rarity: 'Rare',
          baseValue: 50,
          mintConditions: { crypto_threshold: 100 },
        },
      ];

      const mockBalance = {
        userId: 'user1',
        balance: 150,
        updatedAt: new Date(),
      };

      const mockMintedNFT = {
        id: 'nft2',
        ownerId: 'user1',
        name: 'Lucky Coin',
        imageUrl: '/images/coin.png',
        rarity: 'Rare',
        baseValue: 50,
        isFeatured: false,
        mintDate: new Date(),
      };

      mockNFTRepoInstance.getNFTTemplates.mockResolvedValue(mockTemplates as any);
      mockCryptoRepoInstance.getOrCreateUserBalance.mockResolvedValue(mockBalance as any);
      mockNFTRepoInstance.getUserNFTs.mockResolvedValue([]);
      mockNFTRepoInstance.mintNFT.mockResolvedValue(mockMintedNFT as any);

      const result = await nftService.checkAndMintNFTs('user1', 0);

      expect(result).toHaveLength(1);
      expect(result[0].nft).toEqual(mockMintedNFT);
      expect(result[0].awardReason).toContain('100 crypto');
    });

    it('should not mint duplicate NFTs', async () => {
      const mockTemplates = [
        {
          id: 'starter-crystal',
          name: 'Starter Crystal',
          imageUrl: '/images/starter.png',
          rarity: 'Common',
          baseValue: 25,
          mintConditions: { first_game_completion: true },
        },
      ];

      const mockBalance = {
        userId: 'user1',
        balance: 10,
        updatedAt: new Date(),
      };

      const existingNFT = {
        id: 'existing-nft',
        ownerId: 'user1',
        name: 'Starter Crystal', // Same name as template
        imageUrl: '/images/starter.png',
        rarity: 'Common',
        baseValue: 25,
        isFeatured: false,
        mintDate: new Date(),
      };

      mockNFTRepoInstance.getNFTTemplates.mockResolvedValue(mockTemplates as any);
      mockCryptoRepoInstance.getOrCreateUserBalance.mockResolvedValue(mockBalance as any);
      mockNFTRepoInstance.getUserNFTs.mockResolvedValue([existingNFT] as any);

      const result = await nftService.checkAndMintNFTs('user1', 1);

      expect(result).toHaveLength(0);
      expect(mockNFTRepoInstance.mintNFT).not.toHaveBeenCalled();
    });
  });

  describe('mintNFT', () => {
    it('should mint specific NFT with reason', async () => {
      const mockMintedNFT = {
        id: 'nft1',
        ownerId: 'user1',
        name: 'Starter Crystal',
        imageUrl: '/images/starter.png',
        rarity: 'Common',
        baseValue: 25,
        isFeatured: false,
        mintDate: new Date(),
      };

      mockNFTRepoInstance.mintNFT.mockResolvedValue(mockMintedNFT as any);

      const result = await nftService.mintNFT('starter-crystal', 'user1', 'Test mint');

      expect(mockNFTRepoInstance.mintNFT).toHaveBeenCalledWith(
        expect.stringMatching(/starter-crystal-/),
        'user1',
        'starter-crystal'
      );
      expect(result.nft).toEqual(mockMintedNFT);
      expect(result.awardReason).toBe('Test mint');
    });
  });

  describe('updateNFTDynamicProperties', () => {
    it('should update NFT dynamic properties', async () => {
      const mockNFT = {
        id: 'nft1',
        ownerId: 'user1',
        name: 'Starter Crystal',
        imageUrl: '/images/starter.png',
        rarity: 'Common',
        baseValue: 25,
        isFeatured: false,
        mintDate: new Date(),
        dynamicProperties: { power: 150 },
      };

      mockNFTRepoInstance.updateDynamicProperties.mockResolvedValue(mockNFT as any);

      const result = await nftService.updateNFTDynamicProperties(
        'nft1',
        'user1',
        { power: 150 }
      );

      expect(mockNFTRepoInstance.updateDynamicProperties).toHaveBeenCalledWith(
        'nft1',
        'user1',
        { power: 150 }
      );
      expect(result).toEqual(mockNFT);
    });
  });

  describe('getNFTTemplates', () => {
    it('should return all NFT templates', async () => {
      const mockTemplates = [
        {
          id: 'starter-crystal',
          name: 'Starter Crystal',
          imageUrl: '/images/starter.png',
          rarity: 'Common',
          baseValue: 25,
          mintConditions: { first_game_completion: true },
        },
      ];

      mockNFTRepoInstance.getNFTTemplates.mockResolvedValue(mockTemplates as any);

      const result = await nftService.getNFTTemplates();

      expect(mockNFTRepoInstance.getNFTTemplates).toHaveBeenCalled();
      expect(result).toEqual(mockTemplates);
    });
  });
});