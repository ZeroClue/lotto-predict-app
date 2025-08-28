import { db } from '../db';

export interface LotteryDraw {
  id: string;
  lotteryName: string;
  drawDate: Date;
  winningNumbers: number[];
  bonusNumber?: number;
  jackpotAmount?: number;
  sourceUrl?: string;
}

export class LotteryRepository {
  async getRecentDraws(limit: number = 20): Promise<LotteryDraw[]> {
    const { data, error } = await db
      .from('lottery_draws')
      .select('*')
      .order('draw_date', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch lottery draws: ${error.message}`);
    }

    return data.map(this.mapDatabaseRowToLotteryDraw);
  }

  async getDrawsByLottery(lotteryName: string, limit: number = 10): Promise<LotteryDraw[]> {
    const { data, error } = await db
      .from('lottery_draws')
      .select('*')
      .eq('lottery_name', lotteryName)
      .order('draw_date', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch draws for ${lotteryName}: ${error.message}`);
    }

    return data.map(this.mapDatabaseRowToLotteryDraw);
  }

  async getAllDrawsForAnalysis(): Promise<LotteryDraw[]> {
    const { data, error } = await db
      .from('lottery_draws')
      .select('*')
      .order('draw_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch all draws: ${error.message}`);
    }

    return data.map(this.mapDatabaseRowToLotteryDraw);
  }

  private mapDatabaseRowToLotteryDraw(row: any): LotteryDraw {
    return {
      id: row.id,
      lotteryName: row.lottery_name,
      drawDate: new Date(row.draw_date),
      winningNumbers: row.winning_numbers,
      bonusNumber: row.bonus_number,
      jackpotAmount: row.jackpot_amount ? parseFloat(row.jackpot_amount) : undefined,
      sourceUrl: row.source_url,
    };
  }
}

export const lotteryRepository = new LotteryRepository();