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

export interface HistoricalDataFilters {
  lotteryName?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
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

  async getHistoricalDrawsFiltered(filters: HistoricalDataFilters): Promise<LotteryDraw[]> {
    let query = db.from('lottery_draws').select('*');

    // Apply lottery name filter
    if (filters.lotteryName) {
      query = query.eq('lottery_name', filters.lotteryName);
    }

    // Apply date range filters
    if (filters.startDate) {
      query = query.gte('draw_date', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      query = query.lte('draw_date', filters.endDate.toISOString());
    }

    // Apply ordering and limit
    query = query.order('draw_date', { ascending: false });
    if (filters.limit && filters.limit > 0) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch filtered historical draws: ${error.message}`);
    }

    return data.map(this.mapDatabaseRowToLotteryDraw);
  }

  async getDrawsForFrequencyAnalysis(filters: HistoricalDataFilters): Promise<LotteryDraw[]> {
    // Optimized query for frequency analysis - may fetch more data but uses index efficiently
    const optimizedFilters = {
      ...filters,
      // Remove limit for frequency analysis to get complete dataset
      limit: undefined,
    };

    return this.getHistoricalDrawsFiltered(optimizedFilters);
  }

  async getDrawCountByLottery(lotteryName?: string): Promise<number> {
    let query = db.from('lottery_draws').select('id', { count: 'exact' });

    if (lotteryName) {
      query = query.eq('lottery_name', lotteryName);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to get draw count: ${error.message}`);
    }

    return count || 0;
  }

  async getDateRangeForLottery(lotteryName?: string): Promise<{ earliestDate: Date | null; latestDate: Date | null }> {
    let query = db.from('lottery_draws').select('draw_date');

    if (lotteryName) {
      query = query.eq('lottery_name', lotteryName);
    }

    const { data, error } = await query.order('draw_date', { ascending: true }).limit(1);
    const earliest = data?.[0]?.draw_date ? new Date(data[0].draw_date) : null;

    if (error) {
      throw new Error(`Failed to get earliest date: ${error.message}`);
    }

    const { data: latestData, error: latestError } = await query.order('draw_date', { ascending: false }).limit(1);
    const latest = latestData?.[0]?.draw_date ? new Date(latestData[0].draw_date) : null;

    if (latestError) {
      throw new Error(`Failed to get latest date: ${latestError.message}`);
    }

    return {
      earliestDate: earliest,
      latestDate: latest,
    };
  }

  async getUniqueNumbers(lotteryName?: string): Promise<number[]> {
    let query = db.from('lottery_draws').select('winning_numbers');

    if (lotteryName) {
      query = query.eq('lottery_name', lotteryName);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch unique numbers: ${error.message}`);
    }

    const uniqueNumbers = new Set<number>();
    data.forEach(row => {
      if (row.winning_numbers && Array.isArray(row.winning_numbers)) {
        row.winning_numbers.forEach((num: number) => uniqueNumbers.add(num));
      }
    });

    return Array.from(uniqueNumbers).sort((a, b) => a - b);
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