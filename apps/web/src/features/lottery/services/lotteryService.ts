import { apiClient } from '../../../services/apiClient';
import { AnalyticsFilters, AdvancedAnalytics } from '../../../lib/services/lotteryAnalyticsService';

export interface LotteryDraw {
  id: string;
  lotteryName: string;
  drawDate: Date;
  winningNumbers: number[];
  bonusNumber?: number;
  jackpotAmount?: number;
  sourceUrl?: string;
}

export interface NumberFrequency {
  number: number;
  frequency: number;
  percentage: number;
}

export interface LotteryPrediction {
  suggestedNumbers: number[];
  frequencyAnalysis: NumberFrequency[];
  hotNumbers: number[];
  coldNumbers: number[];
  mostRecentDraw: LotteryDraw | null;
  analysisDate: Date;
}

export interface LotteryDrawsResponse {
  success: boolean;
  data: LotteryDraw[];
  count: number;
}

export interface LotteryPredictionsResponse {
  success: boolean;
  data: LotteryPrediction;
}

export interface AdvancedAnalyticsResponse {
  success: boolean;
  data: AdvancedAnalytics;
}

export class LotteryService {
  async getRecentDraws(params?: {
    limit?: number;
    lotteryName?: string;
  }): Promise<LotteryDraw[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.limit) {
      searchParams.set('limit', params.limit.toString());
    }
    
    if (params?.lotteryName) {
      searchParams.set('lotteryName', params.lotteryName);
    }

    const url = `/api/lottery/draws${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const response = await apiClient.get<LotteryDrawsResponse>(url);
    
    if (!response.success) {
      throw new Error('Failed to fetch lottery draws');
    }

    // Convert date strings to Date objects
    return response.data.map(draw => ({
      ...draw,
      drawDate: new Date(draw.drawDate),
    }));
  }

  async getPredictions(lotteryName?: string): Promise<LotteryPrediction> {
    const searchParams = new URLSearchParams();
    
    if (lotteryName) {
      searchParams.set('lotteryName', lotteryName);
    }

    const url = `/api/lottery/predictions${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const response = await apiClient.get<LotteryPredictionsResponse>(url);
    
    if (!response.success) {
      throw new Error('Failed to fetch predictions');
    }

    // Convert date strings to Date objects
    return {
      ...response.data,
      analysisDate: new Date(response.data.analysisDate),
      mostRecentDraw: response.data.mostRecentDraw ? {
        ...response.data.mostRecentDraw,
        drawDate: new Date(response.data.mostRecentDraw.drawDate),
      } : null,
    };
  }

  async getAnalytics(filters: AnalyticsFilters): Promise<AdvancedAnalytics> {
    const searchParams = new URLSearchParams();

    if (filters.lotteryName) {
      searchParams.set('lotteryName', filters.lotteryName);
    }
    if (filters.dateRange) {
      searchParams.set('startDate', filters.dateRange.startDate.toISOString());
      searchParams.set('endDate', filters.dateRange.endDate.toISOString());
    }
    if (filters.analysisType) {
      searchParams.set('analysisType', filters.analysisType);
    }
    if (filters.periodLength) {
      searchParams.set('periodLength', filters.periodLength.toString());
    }

    const url = `/api/lottery/analytics${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const response = await apiClient.get<AdvancedAnalyticsResponse>(url);

    if (!response.success) {
      throw new Error('Failed to fetch advanced analytics');
    }

    return {
      ...response.data,
      analysisDate: new Date(response.data.analysisDate),
      statisticalSummary: {
        ...response.data.statisticalSummary,
        dateRange: {
          startDate: new Date(response.data.statisticalSummary.dateRange.startDate),
          endDate: new Date(response.data.statisticalSummary.dateRange.endDate),
        }
      }
    };
  }
}

export const lotteryService = new LotteryService();
