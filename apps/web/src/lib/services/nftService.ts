import { NFTRepository, NFTTemplate } from '../repositories/nftRepository';
import { CryptoBalanceRepository } from '../repositories/cryptoBalanceRepository';
import { NFT } from '../types';

export interface NFTMintResult {
  nft: NFT;
  awardReason: string;
}

export class NFTService {
  private nftRepository: NFTRepository;
  private cryptoBalanceRepository: CryptoBalanceRepository;

  constructor() {
    this.nftRepository = new NFTRepository();
    this.cryptoBalanceRepository = new CryptoBalanceRepository();
  }

  /**
   * Get all NFTs for a user
   */
  async getUserNFTs(userId: string): Promise<NFT[]> {
    return this.nftRepository.getUserNFTs(userId);
  }

  /**
   * Get specific NFT by ID for a user
   */
  async getNFTById(nftId: string, userId: string): Promise<NFT | null> {
    return this.nftRepository.getNFTById(nftId, userId);
  }

  /**
   * Set NFT as featured/unfeatured
   */
  async setNFTFeatured(nftId: string, userId: string, isFeatured: boolean): Promise<NFT> {
    return this.nftRepository.setFeatured(nftId, userId, isFeatured);
  }

  /**
   * Check and mint NFTs based on user's current state
   */
  async checkAndMintNFTs(userId: string, gameCompletions: number): Promise<NFTMintResult[]> {
    const results: NFTMintResult[] = [];
    const templates = await this.nftRepository.getNFTTemplates();
    const userBalance = await this.cryptoBalanceRepository.getOrCreateUserBalance(userId);
    const existingNFTs = await this.nftRepository.getUserNFTs(userId);

    for (const template of templates) {
      const shouldMint = await this.shouldMintNFT(template, userBalance.balance, gameCompletions, existingNFTs);
      
      if (shouldMint.shouldMint) {
        const nftId = this.generateNFTId(template.id, userId);
        
        // Check if user already has this NFT type (to avoid duplicates)
        const hasThisType = existingNFTs.some(nft => nft.name === template.name);
        if (hasThisType) {
          continue;
        }

        const nft = await this.nftRepository.mintNFT(nftId, userId, template.id);
        results.push({
          nft,
          awardReason: shouldMint.reason,
        });
      }
    }

    return results;
  }

  /**
   * Internal method to mint a specific NFT (for API endpoint)
   */
  async mintNFT(templateId: string, userId: string, reason: string): Promise<NFTMintResult> {
    const nftId = this.generateNFTId(templateId, userId);
    const nft = await this.nftRepository.mintNFT(nftId, userId, templateId);
    
    return {
      nft,
      awardReason: reason,
    };
  }

  /**
   * Update NFT dynamic properties (for future lottery integration)
   */
  async updateNFTDynamicProperties(
    nftId: string,
    userId: string,
    properties: Record<string, any>
  ): Promise<NFT> {
    return this.nftRepository.updateDynamicProperties(nftId, userId, properties);
  }

  /**
   * Check if an NFT should be minted based on conditions
   */
  private async shouldMintNFT(
    template: NFTTemplate,
    cryptoBalance: number,
    gameCompletions: number,
    existingNFTs: NFT[]
  ): Promise<{ shouldMint: boolean; reason: string }> {
    const conditions = template.mintConditions;

    // Check first game completion condition
    if (conditions.first_game_completion && gameCompletions >= 1) {
      return {
        shouldMint: true,
        reason: "Congratulations on completing your first game!",
      };
    }

    // Check crypto threshold condition
    if (conditions.crypto_threshold && cryptoBalance >= conditions.crypto_threshold) {
      return {
        shouldMint: true,
        reason: `Amazing! You've earned ${conditions.crypto_threshold} crypto!`,
      };
    }

    return {
      shouldMint: false,
      reason: "",
    };
  }

  /**
   * Generate unique NFT ID
   */
  private generateNFTId(templateId: string, userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${templateId}-${userId.substring(0, 8)}-${timestamp}-${random}`;
  }

  /**
   * Get NFT templates (for admin/internal use)
   */
  async getNFTTemplates(): Promise<NFTTemplate[]> {
    return this.nftRepository.getNFTTemplates();
  }
}