import { createClient } from '@supabase/supabase-js';
import { CryptoBalance } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export class CryptoBalanceRepository {
  /**
   * Get crypto balance for a user
   */
  async getUserBalance(userId: string): Promise<CryptoBalance | null> {
    const { data, error } = await supabase
      .from('crypto_balances')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No balance found
      }
      throw new Error(`Failed to fetch crypto balance: ${error.message}`);
    }

    return data ? this.mapDatabaseToCryptoBalance(data) : null;
  }

  /**
   * Initialize crypto balance for a new user
   */
  async initializeUserBalance(userId: string): Promise<CryptoBalance> {
    const { data, error } = await supabase
      .from('crypto_balances')
      .insert({
        user_id: userId,
        balance: 0.0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to initialize crypto balance: ${error.message}`);
    }

    return this.mapDatabaseToCryptoBalance(data);
  }

  /**
   * Add crypto to user's balance
   */
  async addToBalance(userId: string, amount: number): Promise<CryptoBalance> {
    // First, ensure the user has a balance record
    let balance = await this.getUserBalance(userId);
    
    if (!balance) {
      balance = await this.initializeUserBalance(userId);
    }

    const newBalance = balance.balance + amount;

    const { data, error } = await supabase
      .from('crypto_balances')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update crypto balance: ${error.message}`);
    }

    return this.mapDatabaseToCryptoBalance(data);
  }

  /**
   * Get or create crypto balance for user (ensures balance exists)
   */
  async getOrCreateUserBalance(userId: string): Promise<CryptoBalance> {
    let balance = await this.getUserBalance(userId);
    
    if (!balance) {
      balance = await this.initializeUserBalance(userId);
    }

    return balance;
  }

  /**
   * Map database row to CryptoBalance interface
   */
  private mapDatabaseToCryptoBalance(row: any): CryptoBalance {
    return {
      userId: row.user_id,
      balance: parseFloat(row.balance),
      updatedAt: new Date(row.updated_at),
    };
  }
}