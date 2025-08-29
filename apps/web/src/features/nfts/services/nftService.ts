import { NFT } from '../../../lib/types';
import { tokenService } from '../../../lib/services/tokenService';

export interface NFTMintResult {
  nft: NFT;
  awardReason: string;
}

/**
 * Frontend NFT service for API interactions
 * Handles all NFT-related API calls from the client side
 */
export class NFTClientService {
  
  /**
   * Fetch all NFTs for the current user
   */
  async fetchUserNFTs(): Promise<NFT[]> {
    const headers = tokenService.getAuthHeaders();
    
    const response = await fetch('/api/nfts', {
      headers,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch NFTs');
    }

    return result.data;
  }

  /**
   * Fetch specific NFT by ID
   */
  async fetchNFTById(nftId: string): Promise<NFT> {
    const headers = tokenService.getAuthHeaders();
    
    const response = await fetch(`/api/nfts/${nftId}`, {
      headers,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch NFT');
    }

    return result.data;
  }

  /**
   * Set NFT featured status
   */
  async setNFTFeatured(nftId: string, isFeatured: boolean): Promise<NFT> {
    const headers = tokenService.getAuthHeaders();
    headers['Content-Type'] = 'application/json';
    
    const response = await fetch(`/api/nfts/${nftId}/feature`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ isFeatured }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to update NFT');
    }

    return result.data;
  }

  /**
   * Mint NFT (for testing/admin purposes)
   */
  async mintNFT(templateId: string, reason?: string): Promise<NFTMintResult> {
    const headers = tokenService.getAuthHeaders();
    headers['Content-Type'] = 'application/json';
    
    const response = await fetch('/api/nfts/mint', {
      method: 'POST',
      headers,
      body: JSON.stringify({ templateId, reason }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to mint NFT');
    }

    return result.data;
  }

  /**
   * Utility method to filter NFTs by rarity
   */
  filterNFTsByRarity(nfts: NFT[], rarity: string): NFT[] {
    return nfts.filter(nft => nft.rarity.toLowerCase() === rarity.toLowerCase());
  }

  /**
   * Utility method to get featured NFTs
   */
  getFeaturedNFTs(nfts: NFT[]): NFT[] {
    return nfts.filter(nft => nft.isFeatured);
  }

  /**
   * Utility method to sort NFTs by various criteria
   */
  sortNFTs(nfts: NFT[], sortBy: 'name' | 'rarity' | 'mintDate' | 'baseValue'): NFT[] {
    return [...nfts].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity':
          const rarityOrder = { 'legendary': 3, 'rare': 2, 'common': 1 };
          return (rarityOrder[b.rarity.toLowerCase() as keyof typeof rarityOrder] || 0) - 
                 (rarityOrder[a.rarity.toLowerCase() as keyof typeof rarityOrder] || 0);
        case 'baseValue':
          return b.baseValue - a.baseValue;
        case 'mintDate':
        default:
          return new Date(b.mintDate).getTime() - new Date(a.mintDate).getTime();
      }
    });
  }

  /**
   * Utility method to get rarity statistics
   */
  getNFTRarityStats(nfts: NFT[]): Record<string, number> {
    return nfts.reduce((stats, nft) => {
      const rarity = nft.rarity.toLowerCase();
      stats[rarity] = (stats[rarity] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);
  }

  /**
   * Utility method to calculate total collection value
   */
  calculateCollectionValue(nfts: NFT[]): number {
    return nfts.reduce((total, nft) => total + nft.baseValue, 0);
  }
}

// Export singleton instance
export const nftClientService = new NFTClientService();