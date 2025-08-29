import { Game, CryptoBalance } from '../../../lib/types';
import { tokenService } from '../../../lib/services/tokenService';

export interface GameCompletionResponse {
  game: Game;
  earnedAmount: number;
  newBalance: number;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class GameServiceClient {
  private baseUrl = '/api';

  private async getAuthHeaders(): Promise<Record<string, string>> {
    // Use centralized token service for secure token management
    return tokenService.getAuthHeaders();
  }

  /**
   * Fetch all active games
   */
  async getGames(): Promise<Game[]> {
    const response = await fetch(`${this.baseUrl}/games`);
    const result: ApiResponse<Game[]> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch games');
    }

    return result.data;
  }

  /**
   * Fetch game by ID
   */
  async getGameById(gameId: string): Promise<Game> {
    const response = await fetch(`${this.baseUrl}/games/${gameId}`);
    const result: ApiResponse<Game> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch game');
    }

    return result.data;
  }

  /**
   * Complete a game and earn crypto
   */
  async completeGame(gameId: string): Promise<GameCompletionResponse> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/games/${gameId}/complete`, {
      method: 'POST',
      headers,
    });

    const result: ApiResponse<GameCompletionResponse> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to complete game');
    }

    return result.data;
  }

  /**
   * Get user's crypto balance
   */
  async getCryptoBalance(): Promise<CryptoBalance> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/crypto/balance`, {
      headers,
    });

    const result: ApiResponse<CryptoBalance> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch crypto balance');
    }

    return result.data;
  }
}

// Export singleton instance
export const gameService = new GameServiceClient();