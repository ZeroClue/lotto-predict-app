import { create } from 'zustand';
import { NFT } from '../lib/types';
import { tokenService } from '../lib/services/tokenService';

interface NFTStore {
  // State
  nfts: NFT[];
  isLoadingNFTs: boolean;
  nftsError: string | null;
  selectedNFT: NFT | null;
  
  // Actions
  setNFTs: (nfts: NFT[]) => void;
  addNFT: (nft: NFT) => void;
  updateNFT: (nft: NFT) => void;
  setLoadingNFTs: (loading: boolean) => void;
  setNFTsError: (error: string | null) => void;
  setSelectedNFT: (nft: NFT | null) => void;
  clearNFTs: () => void;

  // Async actions
  fetchNFTs: () => Promise<void>;
  setNFTFeatured: (nftId: string, isFeatured: boolean) => Promise<void>;
  refreshNFTs: () => Promise<void>;

  // Selectors
  getFeaturedNFTs: () => NFT[];
  getNFTsByRarity: (rarity: string) => NFT[];
  getNFTCount: () => number;
}

export const useNFTStore = create<NFTStore>((set, get) => ({
  // Initial state
  nfts: [],
  isLoadingNFTs: false,
  nftsError: null,
  selectedNFT: null,

  // Setters
  setNFTs: (nfts) => set({ nfts }),
  addNFT: (nft) => set((state) => ({ 
    nfts: [...state.nfts, nft] 
  })),
  updateNFT: (updatedNFT) => set((state) => ({
    nfts: state.nfts.map(nft => 
      nft.id === updatedNFT.id ? updatedNFT : nft
    )
  })),
  setLoadingNFTs: (isLoadingNFTs) => set({ isLoadingNFTs }),
  setNFTsError: (nftsError) => set({ nftsError }),
  setSelectedNFT: (selectedNFT) => set({ selectedNFT }),
  clearNFTs: () => set({ nfts: [], selectedNFT: null, nftsError: null }),

  // Async actions
  fetchNFTs: async () => {
    try {
      set({ isLoadingNFTs: true, nftsError: null });
      
      // Get auth headers from centralized token service
      const headers = tokenService.getAuthHeaders(true);

      const response = await fetch('/api/nfts', {
        headers,
      });
      
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch NFTs');
      }

      set({ 
        nfts: result.data, 
        isLoadingNFTs: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch NFTs';
      set({ 
        nftsError: errorMessage, 
        isLoadingNFTs: false 
      });
      throw error;
    }
  },

  setNFTFeatured: async (nftId: string, isFeatured: boolean) => {
    try {
      // Get auth headers from centralized token service
      const headers = tokenService.getAuthHeaders(true);

      const response = await fetch(`/api/nfts/${nftId}/feature`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ isFeatured }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update NFT');
      }

      // Update local state
      const updatedNFT = result.data;
      get().updateNFT(updatedNFT);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update NFT';
      set({ nftsError: errorMessage });
      throw error;
    }
  },

  refreshNFTs: async () => {
    // Force refresh by clearing cache and refetching
    await get().fetchNFTs();
  },

  // Selectors
  getFeaturedNFTs: () => {
    const { nfts } = get();
    return nfts.filter(nft => nft.isFeatured);
  },

  getNFTsByRarity: (rarity: string) => {
    const { nfts } = get();
    return nfts.filter(nft => nft.rarity.toLowerCase() === rarity.toLowerCase());
  },

  getNFTCount: () => {
    const { nfts } = get();
    return nfts.length;
  },
}));