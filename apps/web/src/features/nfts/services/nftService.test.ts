import { NFTClientService } from './nftService';
import { tokenService } from '../../../lib/services/tokenService';
import { NFT } from '../../../lib/types';

// Mock tokenService
jest.mock('../../../lib/services/tokenService');

// Mock fetch
global.fetch = jest.fn();

const mockNFTs: NFT[] = [
  {
    id: 'nft1',
    ownerId: 'user1',
    name: 'Starter Crystal',
    description: 'A glowing crystal',
    imageUrl: '/images/nft1.png',
    rarity: 'Common',
    mintDate: new Date('2023-12-01'),
    dynamicProperties: {},
    isFeatured: false,
    baseValue: 25,
  },
  {
    id: 'nft2',
    ownerId: 'user1',
    name: 'Lucky Coin',
    description: 'A shimmering coin',
    imageUrl: '/images/nft2.png',
    rarity: 'Rare',
    mintDate: new Date('2023-12-02'),
    dynamicProperties: {},
    isFeatured: true,
    baseValue: 50,
  },
  {
    id: 'nft3',
    ownerId: 'user1',
    name: 'Golden Trophy',
    description: 'The ultimate prize',
    imageUrl: '/images/nft3.png',
    rarity: 'Legendary',
    mintDate: new Date('2023-12-03'),
    dynamicProperties: {},
    isFeatured: false,
    baseValue: 100,
  },
];

describe('NFTClientService', () => {
  let service: NFTClientService;
  const mockTokenService = tokenService as jest.Mocked<typeof tokenService>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NFTClientService();
    mockTokenService.getAuthHeaders.mockReturnValue({
      'Authorization': 'Bearer mock-token',
    });
  });

  describe('fetchUserNFTs', () => {
    it('should fetch user NFTs successfully', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        json: async () => ({
          success: true,
          data: mockNFTs,
        }),
      });

      const result = await service.fetchUserNFTs();

      expect(result).toEqual(mockNFTs);
      expect(fetch).toHaveBeenCalledWith('/api/nfts', {
        headers: { 'Authorization': 'Bearer mock-token' },
      });
    });

    it('should handle fetch error', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        json: async () => ({
          success: false,
          error: 'Failed to fetch NFTs',
        }),
      });

      await expect(service.fetchUserNFTs()).rejects.toThrow('Failed to fetch NFTs');
    });
  });

  describe('fetchNFTById', () => {
    it('should fetch NFT by ID successfully', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        json: async () => ({
          success: true,
          data: mockNFTs[0],
        }),
      });

      const result = await service.fetchNFTById('nft1');

      expect(result).toEqual(mockNFTs[0]);
      expect(fetch).toHaveBeenCalledWith('/api/nfts/nft1', {
        headers: { 'Authorization': 'Bearer mock-token' },
      });
    });

    it('should handle fetch NFT by ID error', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        json: async () => ({
          success: false,
          error: 'NFT not found',
        }),
      });

      await expect(service.fetchNFTById('nonexistent')).rejects.toThrow('NFT not found');
    });
  });

  describe('setNFTFeatured', () => {
    it('should set NFT featured successfully', async () => {
      const updatedNFT = { ...mockNFTs[0], isFeatured: true };
      
      (fetch as jest.Mock).mockResolvedValue({
        json: async () => ({
          success: true,
          data: updatedNFT,
        }),
      });

      const result = await service.setNFTFeatured('nft1', true);

      expect(result).toEqual(updatedNFT);
      expect(fetch).toHaveBeenCalledWith('/api/nfts/nft1/feature', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFeatured: true }),
      });
    });

    it('should handle set featured error', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        json: async () => ({
          success: false,
          error: 'Failed to update NFT',
        }),
      });

      await expect(service.setNFTFeatured('nft1', true)).rejects.toThrow('Failed to update NFT');
    });
  });

  describe('mintNFT', () => {
    it('should mint NFT successfully', async () => {
      const mintResult = {
        nft: mockNFTs[0],
        awardReason: 'Test mint',
      };

      (fetch as jest.Mock).mockResolvedValue({
        json: async () => ({
          success: true,
          data: mintResult,
        }),
      });

      const result = await service.mintNFT('starter-crystal', 'Test mint');

      expect(result).toEqual(mintResult);
      expect(fetch).toHaveBeenCalledWith('/api/nfts/mint', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId: 'starter-crystal', reason: 'Test mint' }),
      });
    });

    it('should mint NFT without reason', async () => {
      const mintResult = {
        nft: mockNFTs[0],
        awardReason: 'Manual mint',
      };

      (fetch as jest.Mock).mockResolvedValue({
        json: async () => ({
          success: true,
          data: mintResult,
        }),
      });

      const result = await service.mintNFT('starter-crystal');

      expect(result).toEqual(mintResult);
      expect(fetch).toHaveBeenCalledWith('/api/nfts/mint', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId: 'starter-crystal', reason: undefined }),
      });
    });

    it('should handle mint error', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        json: async () => ({
          success: false,
          error: 'Template not found',
        }),
      });

      await expect(service.mintNFT('invalid-template')).rejects.toThrow('Template not found');
    });
  });

  describe('Utility methods', () => {
    it('should filter NFTs by rarity', () => {
      const commonNFTs = service.filterNFTsByRarity(mockNFTs, 'Common');
      expect(commonNFTs).toHaveLength(1);
      expect(commonNFTs[0].name).toBe('Starter Crystal');

      const rareNFTs = service.filterNFTsByRarity(mockNFTs, 'rare'); // Case insensitive
      expect(rareNFTs).toHaveLength(1);
      expect(rareNFTs[0].name).toBe('Lucky Coin');
    });

    it('should get featured NFTs', () => {
      const featuredNFTs = service.getFeaturedNFTs(mockNFTs);
      expect(featuredNFTs).toHaveLength(1);
      expect(featuredNFTs[0].name).toBe('Lucky Coin');
    });

    it('should sort NFTs by name', () => {
      const sorted = service.sortNFTs(mockNFTs, 'name');
      expect(sorted[0].name).toBe('Golden Trophy');
      expect(sorted[1].name).toBe('Lucky Coin');
      expect(sorted[2].name).toBe('Starter Crystal');
    });

    it('should sort NFTs by rarity', () => {
      const sorted = service.sortNFTs(mockNFTs, 'rarity');
      expect(sorted[0].rarity).toBe('Legendary');
      expect(sorted[1].rarity).toBe('Rare');
      expect(sorted[2].rarity).toBe('Common');
    });

    it('should sort NFTs by base value', () => {
      const sorted = service.sortNFTs(mockNFTs, 'baseValue');
      expect(sorted[0].baseValue).toBe(100);
      expect(sorted[1].baseValue).toBe(50);
      expect(sorted[2].baseValue).toBe(25);
    });

    it('should sort NFTs by mint date (default)', () => {
      const sorted = service.sortNFTs(mockNFTs, 'mintDate');
      expect(sorted[0].id).toBe('nft3'); // Most recent
      expect(sorted[1].id).toBe('nft2');
      expect(sorted[2].id).toBe('nft1'); // Oldest
    });

    it('should get NFT rarity statistics', () => {
      const stats = service.getNFTRarityStats(mockNFTs);
      expect(stats).toEqual({
        common: 1,
        rare: 1,
        legendary: 1,
      });
    });

    it('should calculate collection value', () => {
      const totalValue = service.calculateCollectionValue(mockNFTs);
      expect(totalValue).toBe(175); // 25 + 50 + 100
    });

    it('should handle empty collection in utilities', () => {
      const emptyNFTs: NFT[] = [];
      
      expect(service.filterNFTsByRarity(emptyNFTs, 'Common')).toEqual([]);
      expect(service.getFeaturedNFTs(emptyNFTs)).toEqual([]);
      expect(service.sortNFTs(emptyNFTs, 'name')).toEqual([]);
      expect(service.getNFTRarityStats(emptyNFTs)).toEqual({});
      expect(service.calculateCollectionValue(emptyNFTs)).toBe(0);
    });
  });
});