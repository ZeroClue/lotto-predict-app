import { act, renderHook } from '@testing-library/react';
import { useNFTStore } from './nftStore';
import { NFT } from '../lib/types';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

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
];

describe('useNFTStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
    
    // Reset store state
    const { result } = renderHook(() => useNFTStore());
    act(() => {
      result.current.clearNFTs();
    });
  });

  describe('Initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useNFTStore());
      
      expect(result.current.nfts).toEqual([]);
      expect(result.current.isLoadingNFTs).toBe(false);
      expect(result.current.nftsError).toBe(null);
      expect(result.current.selectedNFT).toBe(null);
    });
  });

  describe('State mutations', () => {
    it('should set NFTs', () => {
      const { result } = renderHook(() => useNFTStore());
      
      act(() => {
        result.current.setNFTs(mockNFTs);
      });

      expect(result.current.nfts).toEqual(mockNFTs);
    });

    it('should add NFT', () => {
      const { result } = renderHook(() => useNFTStore());
      
      act(() => {
        result.current.setNFTs([mockNFTs[0]]);
        result.current.addNFT(mockNFTs[1]);
      });

      expect(result.current.nfts).toHaveLength(2);
      expect(result.current.nfts).toContain(mockNFTs[1]);
    });

    it('should update NFT', () => {
      const { result } = renderHook(() => useNFTStore());
      
      act(() => {
        result.current.setNFTs(mockNFTs);
        result.current.updateNFT({
          ...mockNFTs[0],
          isFeatured: true,
        });
      });

      const updatedNFT = result.current.nfts.find(nft => nft.id === 'nft1');
      expect(updatedNFT?.isFeatured).toBe(true);
    });

    it('should set loading state', () => {
      const { result } = renderHook(() => useNFTStore());
      
      act(() => {
        result.current.setLoadingNFTs(true);
      });

      expect(result.current.isLoadingNFTs).toBe(true);
    });

    it('should set error', () => {
      const { result } = renderHook(() => useNFTStore());
      
      act(() => {
        result.current.setNFTsError('Test error');
      });

      expect(result.current.nftsError).toBe('Test error');
    });

    it('should set selected NFT', () => {
      const { result } = renderHook(() => useNFTStore());
      
      act(() => {
        result.current.setSelectedNFT(mockNFTs[0]);
      });

      expect(result.current.selectedNFT).toEqual(mockNFTs[0]);
    });

    it('should clear NFTs', () => {
      const { result } = renderHook(() => useNFTStore());
      
      act(() => {
        result.current.setNFTs(mockNFTs);
        result.current.setSelectedNFT(mockNFTs[0]);
        result.current.setNFTsError('Test error');
        result.current.clearNFTs();
      });

      expect(result.current.nfts).toEqual([]);
      expect(result.current.selectedNFT).toBe(null);
      expect(result.current.nftsError).toBe(null);
    });
  });

  describe('Selectors', () => {
    it('should get featured NFTs', () => {
      const { result } = renderHook(() => useNFTStore());
      
      act(() => {
        result.current.setNFTs(mockNFTs);
      });

      const featuredNFTs = result.current.getFeaturedNFTs();
      expect(featuredNFTs).toHaveLength(1);
      expect(featuredNFTs[0].name).toBe('Lucky Coin');
    });

    it('should get NFTs by rarity', () => {
      const { result } = renderHook(() => useNFTStore());
      
      act(() => {
        result.current.setNFTs(mockNFTs);
      });

      const commonNFTs = result.current.getNFTsByRarity('Common');
      expect(commonNFTs).toHaveLength(1);
      expect(commonNFTs[0].name).toBe('Starter Crystal');

      const rareNFTs = result.current.getNFTsByRarity('rare'); // Test case insensitive
      expect(rareNFTs).toHaveLength(1);
      expect(rareNFTs[0].name).toBe('Lucky Coin');
    });

    it('should get NFT count', () => {
      const { result } = renderHook(() => useNFTStore());
      
      act(() => {
        result.current.setNFTs(mockNFTs);
      });

      expect(result.current.getNFTCount()).toBe(2);
    });
  });

  describe('Async actions', () => {
    it('should fetch NFTs successfully', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        json: async () => ({
          success: true,
          data: mockNFTs,
        }),
      });

      const { result } = renderHook(() => useNFTStore());

      await act(async () => {
        await result.current.fetchNFTs();
      });

      expect(result.current.nfts).toEqual(mockNFTs);
      expect(result.current.isLoadingNFTs).toBe(false);
      expect(result.current.nftsError).toBe(null);
      expect(fetch).toHaveBeenCalledWith('/api/nfts', {
        headers: {
          'Authorization': 'Bearer mock-token',
        },
      });
    });

    it('should handle fetch NFTs error', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        json: async () => ({
          success: false,
          error: 'Failed to fetch NFTs',
        }),
      });

      const { result } = renderHook(() => useNFTStore());

      await act(async () => {
        await expect(result.current.fetchNFTs()).rejects.toThrow('Failed to fetch NFTs');
      });

      expect(result.current.isLoadingNFTs).toBe(false);
      expect(result.current.nftsError).toBe('Failed to fetch NFTs');
    });

    it('should handle missing auth token', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useNFTStore());

      await act(async () => {
        await expect(result.current.fetchNFTs()).rejects.toThrow('No authentication token found');
      });

      expect(result.current.nftsError).toBe('No authentication token found');
    });

    it('should set NFT featured successfully', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        json: async () => ({
          success: true,
          data: { ...mockNFTs[0], isFeatured: true },
        }),
      });

      const { result } = renderHook(() => useNFTStore());
      
      act(() => {
        result.current.setNFTs(mockNFTs);
      });

      await act(async () => {
        await result.current.setNFTFeatured('nft1', true);
      });

      const updatedNFT = result.current.nfts.find(nft => nft.id === 'nft1');
      expect(updatedNFT?.isFeatured).toBe(true);
      expect(fetch).toHaveBeenCalledWith('/api/nfts/nft1/feature', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: JSON.stringify({ isFeatured: true }),
      });
    });

    it('should handle set NFT featured error', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        json: async () => ({
          success: false,
          error: 'Failed to update NFT',
        }),
      });

      const { result } = renderHook(() => useNFTStore());

      await act(async () => {
        await expect(result.current.setNFTFeatured('nft1', true)).rejects.toThrow('Failed to update NFT');
      });

      expect(result.current.nftsError).toBe('Failed to update NFT');
    });

    it('should refresh NFTs', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        json: async () => ({
          success: true,
          data: mockNFTs,
        }),
      });

      const { result } = renderHook(() => useNFTStore());

      await act(async () => {
        await result.current.refreshNFTs();
      });

      expect(result.current.nfts).toEqual(mockNFTs);
      expect(fetch).toHaveBeenCalled();
    });
  });
});