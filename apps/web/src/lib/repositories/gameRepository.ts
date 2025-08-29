import { createClient } from '@supabase/supabase-js';
import { Game } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export class GameRepository {
  /**
   * Get all active games
   */
  async getActiveGames(): Promise<Game[]> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch active games: ${error.message}`);
    }

    return data?.map(this.mapDatabaseToGame) || [];
  }

  /**
   * Get game by ID
   */
  async getGameById(id: string): Promise<Game | null> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch game by ID: ${error.message}`);
    }

    return data ? this.mapDatabaseToGame(data) : null;
  }

  /**
   * Map database row to Game interface
   */
  private mapDatabaseToGame(row: any): Game {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      rewardAmount: parseFloat(row.reward_amount),
      nftAwardThreshold: row.nft_award_threshold,
      isActive: row.is_active,
      imageUrl: row.image_url,
    };
  }
}