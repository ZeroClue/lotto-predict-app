import { GameRepository } from '../repositories/gameRepository';
import { CryptoBalanceRepository } from '../repositories/cryptoBalanceRepository';
import { NFTService, NFTMintResult } from './nftService';
import { Game, CryptoBalance } from '../types';

export class GameService {
  private gameRepository: GameRepository;
  private cryptoBalanceRepository: CryptoBalanceRepository;
  private nftService: NFTService;

  constructor() {
    this.gameRepository = new GameRepository();
    this.cryptoBalanceRepository = new CryptoBalanceRepository();
    this.nftService = new NFTService();
  }

  /**
   * Get all active games
   */
  async getActiveGames(): Promise<Game[]> {
    return this.gameRepository.getActiveGames();
  }

  /**
   * Get game by ID
   */
  async getGameById(id: string): Promise<Game | null> {
    return this.gameRepository.getGameById(id);
  }

  /**
   * Complete a game and award crypto to user
   */
  async completeGame(gameId: string, userId: string): Promise<{
    game: Game;
    earnedAmount: number;
    newBalance: CryptoBalance;
    mintedNFTs?: NFTMintResult[];
  }> {
    // Verify game exists and is active
    const game = await this.gameRepository.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found or inactive');
    }

    // Award crypto to user
    const newBalance = await this.cryptoBalanceRepository.addToBalance(
      userId,
      game.rewardAmount
    );

    // Get user's total game completion count (approximated by balance / average reward)
    // This is a simple approximation - in a real system you'd track completions in a separate table
    const userCompletions = Math.floor(newBalance.balance / game.rewardAmount);

    // Check and mint NFTs based on current state
    const mintedNFTs = await this.nftService.checkAndMintNFTs(userId, userCompletions);

    return {
      game,
      earnedAmount: game.rewardAmount,
      newBalance,
      mintedNFTs: mintedNFTs.length > 0 ? mintedNFTs : undefined,
    };
  }

  /**
   * Get user's crypto balance
   */
  async getUserBalance(userId: string): Promise<CryptoBalance> {
    return this.cryptoBalanceRepository.getOrCreateUserBalance(userId);
  }

  /**
   * Initialize crypto balance for new user (called during registration)
   */
  async initializeUserBalance(userId: string): Promise<CryptoBalance> {
    return this.cryptoBalanceRepository.initializeUserBalance(userId);
  }
}