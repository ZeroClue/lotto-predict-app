import { getSupabaseClient } from '../db';
import { createClient } from '@supabase/supabase-js';
import { CryptoBalance } from '../types';

export class CryptoBalanceRepository {
  /**
   * Get Supabase service role client (bypasses RLS)
   */
  private getServiceRoleClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(supabaseUrl, supabaseServiceKey);
  }

  /**
   * Get crypto balance for a user
   */
  async getUserBalance(userId: string): Promise<CryptoBalance | null> {
    const supabase = getSupabaseClient();
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
    const supabase = this.getServiceRoleClient();
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
    let balance = await this.getOrCreateUserBalance(userId);

    const newBalance = balance.balance + amount;

    const supabase = getSupabaseClient();
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
      try {
        balance = await this.initializeUserBalance(userId);
      } catch (error) {
        // If initialization fails, return a default balance instead of throwing
        console.warn(`Failed to initialize crypto balance for user ${userId}:`, error);
        return {
          userId,
          balance: 0.0,
          updatedAt: new Date(),
        };
      }
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