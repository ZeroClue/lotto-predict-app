import { lotteryRepository, LotteryDraw } from '../repositories/lotteryRepository';

export interface NumberFrequency {
  number: number;
  frequency: number;
  percentage: number;
}

export interface HotColdAnalysis {
  hotNumbers: number[];
  coldNumbers: number[];
  threshold: {
    hot: number;
    cold: number;
  };
}

export interface TrendPoint {
  period: string;
  frequency: number;
  movingAverage: number;
}

export interface NumberTrend {
  number: number;
  trends: TrendPoint[];
  overallTrend: 'increasing' | 'decreasing' | 'stable';
  trendStrength: number; // 0-1 scale
}

export interface AnalyticsFilters {
  lotteryName?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  analysisType?: 'frequency' | 'trends' | 'hot-cold' | 'all';
  periodLength?: number; // for trend analysis, in days
}

export interface AdvancedAnalytics {
  frequencyAnalysis: NumberFrequency[];
  hotColdAnalysis: HotColdAnalysis;
  trendAnalysis: NumberTrend[];
  statisticalSummary: {
    totalDraws: number;
    dateRange: {
      startDate: Date;
      endDate: Date;
    };
    avgNumbersPerDraw: number;
    uniqueNumbersDrawn: number;
  };
  analysisDate: Date;
}

// Constants for analytics calculations
const ANALYTICS_CONSTANTS = {
  DEFAULT_HOT_COLD_COUNT: 10,
  HOT_NUMBER_PERCENTILE: 0.75, // Top 25% are "hot"
  COLD_NUMBER_PERCENTILE: 0.25, // Bottom 25% are "cold"
  TREND_WINDOW_DAYS: 30, // Default trend analysis window
  MOVING_AVERAGE_WINDOW: 5, // Points for moving average
  TREND_THRESHOLD: 0.1, // Minimum change to be considered trending
} as const;

export class LotteryAnalyticsService {
  async getAdvancedAnalytics(filters: AnalyticsFilters = {}): Promise<AdvancedAnalytics> {
    const draws = await this.getFilteredDraws(filters);
    
    if (draws.length === 0) {
      throw new Error('No historical data available for the specified filters');
    }

    const frequencyAnalysis = this.calculateNumberFrequency(draws);
    const hotColdAnalysis = this.calculateHotColdNumbers(frequencyAnalysis);
    const trendAnalysis = await this.calculateTrendAnalysis(draws, filters);
    const statisticalSummary = this.calculateStatisticalSummary(draws);

    return {
      frequencyAnalysis,
      hotColdAnalysis,
      trendAnalysis,
      statisticalSummary,
      analysisDate: new Date(),
    };
  }

  calculateNumberFrequency(draws: LotteryDraw[]): NumberFrequency[] {
    const frequencyMap: { [key: number]: number } = {};
    let totalNumbers = 0;

    draws.forEach(draw => {
      draw.winningNumbers.forEach(number => {
        frequencyMap[number] = (frequencyMap[number] || 0) + 1;
        totalNumbers++;
      });
    });

    return Object.entries(frequencyMap)
      .map(([number, frequency]) => ({
        number: parseInt(number),
        frequency,
        percentage: (frequency / totalNumbers) * 100,
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  calculateHotColdNumbers(
    frequencyAnalysis: NumberFrequency[], 
    hotCount: number = ANALYTICS_CONSTANTS.DEFAULT_HOT_COLD_COUNT,
    coldCount: number = ANALYTICS_CONSTANTS.DEFAULT_HOT_COLD_COUNT
  ): HotColdAnalysis {
    if (frequencyAnalysis.length === 0) {
      return {
        hotNumbers: [],
        coldNumbers: [],
        threshold: { hot: 0, cold: 0 }
      };
    }

    // Calculate percentile-based thresholds
    const sortedFrequencies = frequencyAnalysis.map(f => f.frequency).sort((a, b) => b - a);
    const hotThresholdIndex = Math.floor(sortedFrequencies.length * (1 - ANALYTICS_CONSTANTS.HOT_NUMBER_PERCENTILE));
    const coldThresholdIndex = Math.floor(sortedFrequencies.length * ANALYTICS_CONSTANTS.COLD_NUMBER_PERCENTILE);
    
    const hotThreshold = sortedFrequencies[hotThresholdIndex] || 0;
    const coldThreshold = sortedFrequencies[coldThresholdIndex] || 0;

    // Get hot numbers (most frequent)
    const hotNumbers = frequencyAnalysis
      .filter(item => item.frequency >= hotThreshold)
      .slice(0, hotCount)
      .map(item => item.number);

    // Get cold numbers (least frequent)
    const coldNumbers = frequencyAnalysis
      .filter(item => item.frequency <= coldThreshold)
      .slice(-coldCount)
      .map(item => item.number)
      .reverse();

    return {
      hotNumbers,
      coldNumbers,
      threshold: {
        hot: hotThreshold,
        cold: coldThreshold,
      },
    };
  }

  async calculateTrendAnalysis(draws: LotteryDraw[], filters: AnalyticsFilters): Promise<NumberTrend[]> {
    const periodLength = filters.periodLength || ANALYTICS_CONSTANTS.TREND_WINDOW_DAYS;
    const sortedDraws = [...draws].sort((a, b) => a.drawDate.getTime() - b.drawDate.getTime());
    
    if (sortedDraws.length < 2) {
      return [];
    }

    // Group draws by time periods
    const periods = this.groupDrawsByPeriods(sortedDraws, periodLength);
    const allNumbers = this.getAllUniqueNumbers(draws);
    
    const trends: NumberTrend[] = [];

    for (const number of allNumbers) {
      const trendPoints: TrendPoint[] = [];
      
      for (const period of periods) {
        const frequency = period.draws.reduce((count, draw) => 
          count + (draw.winningNumbers.includes(number) ? 1 : 0), 0
        );
        
        trendPoints.push({
          period: period.label,
          frequency,
          movingAverage: 0, // Will calculate after all points are created
        });
      }

      // Calculate moving averages
      this.calculateMovingAverages(trendPoints);

      // Determine overall trend
      const trendAnalysis = this.analyzeTrend(trendPoints);

      trends.push({
        number,
        trends: trendPoints,
        overallTrend: trendAnalysis.trend,
        trendStrength: trendAnalysis.strength,
      });
    }

    return trends.sort((a, b) => b.trendStrength - a.trendStrength);
  }

  private async getFilteredDraws(filters: AnalyticsFilters): Promise<LotteryDraw[]> {
    let draws: LotteryDraw[];

    if (filters.lotteryName) {
      draws = await lotteryRepository.getDrawsByLottery(filters.lotteryName, 1000);
    } else {
      draws = await lotteryRepository.getAllDrawsForAnalysis();
    }

    // Apply date range filter if specified
    if (filters.dateRange) {
      draws = draws.filter(draw => {
        const drawDate = new Date(draw.drawDate);
        return drawDate >= filters.dateRange!.startDate && 
               drawDate <= filters.dateRange!.endDate;
      });
    }

    return draws.sort((a, b) => b.drawDate.getTime() - a.drawDate.getTime());
  }

  private groupDrawsByPeriods(draws: LotteryDraw[], periodLengthDays: number): Array<{label: string, draws: LotteryDraw[]}> {
    if (draws.length === 0) return [];

    const periods: Array<{label: string, draws: LotteryDraw[]}> = [];
    const startDate = new Date(draws[0].drawDate);
    const endDate = new Date(draws[draws.length - 1].drawDate);
    const periodMs = periodLengthDays * 24 * 60 * 60 * 1000;

    let currentPeriodStart = new Date(startDate);
    
    while (currentPeriodStart < endDate) {
      const currentPeriodEnd = new Date(currentPeriodStart.getTime() + periodMs);
      const perioDraws = draws.filter(draw => {
        const drawDate = new Date(draw.drawDate);
        return drawDate >= currentPeriodStart && drawDate < currentPeriodEnd;
      });

      if (perioDraws.length > 0) {
        periods.push({
          label: currentPeriodStart.toISOString().split('T')[0],
          draws: perioDraws,
        });
      }

      currentPeriodStart = currentPeriodEnd;
    }

    return periods;
  }

  private getAllUniqueNumbers(draws: LotteryDraw[]): number[] {
    const numberSet = new Set<number>();
    draws.forEach(draw => {
      draw.winningNumbers.forEach(number => numberSet.add(number));
    });
    return Array.from(numberSet).sort((a, b) => a - b);
  }

  private calculateMovingAverages(trendPoints: TrendPoint[]): void {
    const window = ANALYTICS_CONSTANTS.MOVING_AVERAGE_WINDOW;
    
    for (let i = 0; i < trendPoints.length; i++) {
      const start = Math.max(0, i - Math.floor(window / 2));
      const end = Math.min(trendPoints.length, start + window);
      
      const sum = trendPoints.slice(start, end).reduce((acc, point) => acc + point.frequency, 0);
      trendPoints[i].movingAverage = sum / (end - start);
    }
  }

  private analyzeTrend(trendPoints: TrendPoint[]): { trend: 'increasing' | 'decreasing' | 'stable', strength: number } {
    if (trendPoints.length < 2) {
      return { trend: 'stable', strength: 0 };
    }

    // Calculate linear regression slope for moving averages
    const n = trendPoints.length;
    const sumX = trendPoints.reduce((sum, _, index) => sum + index, 0);
    const sumY = trendPoints.reduce((sum, point) => sum + point.movingAverage, 0);
    const sumXY = trendPoints.reduce((sum, point, index) => sum + (index * point.movingAverage), 0);
    const sumXX = trendPoints.reduce((sum, _, index) => sum + (index * index), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const strength = Math.abs(slope) / Math.max(...trendPoints.map(p => p.movingAverage));

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(slope) < ANALYTICS_CONSTANTS.TREND_THRESHOLD) {
      trend = 'stable';
    } else if (slope > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    return { trend, strength: Math.min(1, strength) };
  }

  private calculateStatisticalSummary(draws: LotteryDraw[]): AdvancedAnalytics['statisticalSummary'] {
    if (draws.length === 0) {
      throw new Error('Cannot calculate statistics for empty dataset');
    }

    const sortedDraws = [...draws].sort((a, b) => a.drawDate.getTime() - b.drawDate.getTime());
    const uniqueNumbers = this.getAllUniqueNumbers(draws);
    const totalNumbers = draws.reduce((sum, draw) => sum + draw.winningNumbers.length, 0);

    return {
      totalDraws: draws.length,
      dateRange: {
        startDate: new Date(sortedDraws[0].drawDate),
        endDate: new Date(sortedDraws[sortedDraws.length - 1].drawDate),
      },
      avgNumbersPerDraw: totalNumbers / draws.length,
      uniqueNumbersDrawn: uniqueNumbers.length,
    };
  }
}

export const lotteryAnalyticsService = new LotteryAnalyticsService();