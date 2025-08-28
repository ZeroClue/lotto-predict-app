import { lotteryRepository, LotteryDraw } from '../repositories/lotteryRepository';

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

// Constants for prediction algorithm
const PREDICTION_CONSTANTS = {
  HOT_NUMBERS_FOR_SUGGESTIONS: 15,
  HOT_NUMBERS_IN_SUGGESTION: 3,
  MEDIUM_NUMBERS_IN_SUGGESTION: 2,
  TOTAL_SUGGESTED_NUMBERS: 6,
  DEFAULT_HOT_COLD_COUNT: 10,
  MEDIUM_RANGE_START: 0.3,
  MEDIUM_RANGE_END: 0.7,
} as const;

export class LotteryDataService {
  async getRecentDraws(limit: number = 20): Promise<LotteryDraw[]> {
    return await lotteryRepository.getRecentDraws(limit);
  }

  async getDrawsByLottery(lotteryName: string, limit: number = 10): Promise<LotteryDraw[]> {
    return await lotteryRepository.getDrawsByLottery(lotteryName, limit);
  }

  async generatePredictions(lotteryName?: string): Promise<LotteryPrediction> {
    let draws: LotteryDraw[];
    
    if (lotteryName) {
      draws = await lotteryRepository.getDrawsByLottery(lotteryName, 50);
    } else {
      draws = await lotteryRepository.getAllDrawsForAnalysis();
    }

    if (draws.length === 0) {
      throw new Error('No historical data available for predictions');
    }

    const frequencyAnalysis = this.analyzeNumberFrequency(draws);
    const hotNumbers = this.getHotNumbers(frequencyAnalysis, PREDICTION_CONSTANTS.DEFAULT_HOT_COLD_COUNT);
    const coldNumbers = this.getColdNumbers(frequencyAnalysis, PREDICTION_CONSTANTS.DEFAULT_HOT_COLD_COUNT);
    const suggestedNumbers = this.generateSuggestedNumbers(frequencyAnalysis, draws[0]);

    return {
      suggestedNumbers,
      frequencyAnalysis,
      hotNumbers,
      coldNumbers,
      mostRecentDraw: draws[0] || null,
      analysisDate: new Date(),
    };
  }

  private analyzeNumberFrequency(draws: LotteryDraw[]): NumberFrequency[] {
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

  private getHotNumbers(frequencyAnalysis: NumberFrequency[], count: number): number[] {
    return frequencyAnalysis
      .slice(0, count)
      .map(item => item.number);
  }

  private getColdNumbers(frequencyAnalysis: NumberFrequency[], count: number): number[] {
    return frequencyAnalysis
      .slice(-count)
      .map(item => item.number)
      .reverse();
  }

  private generateSuggestedNumbers(frequencyAnalysis: NumberFrequency[], mostRecentDraw: LotteryDraw): number[] {
    const hotNumbers = this.getHotNumbers(frequencyAnalysis, PREDICTION_CONSTANTS.HOT_NUMBERS_FOR_SUGGESTIONS);
    const mediumNumbers = frequencyAnalysis
      .slice(
        Math.floor(frequencyAnalysis.length * PREDICTION_CONSTANTS.MEDIUM_RANGE_START), 
        Math.floor(frequencyAnalysis.length * PREDICTION_CONSTANTS.MEDIUM_RANGE_END)
      )
      .map(item => item.number);
    
    const suggestions: number[] = [];
    
    // Mix of hot (3), medium (2), and one random from all
    suggestions.push(...this.getRandomFromArray(hotNumbers, PREDICTION_CONSTANTS.HOT_NUMBERS_IN_SUGGESTION));
    suggestions.push(...this.getRandomFromArray(mediumNumbers, PREDICTION_CONSTANTS.MEDIUM_NUMBERS_IN_SUGGESTION));
    
    // Avoid exact repetition of most recent draw
    const availableNumbers = frequencyAnalysis
      .map(item => item.number)
      .filter(num => !mostRecentDraw.winningNumbers.includes(num) && !suggestions.includes(num));
    
    if (availableNumbers.length > 0 && suggestions.length < PREDICTION_CONSTANTS.TOTAL_SUGGESTED_NUMBERS) {
      suggestions.push(...this.getRandomFromArray(availableNumbers, PREDICTION_CONSTANTS.TOTAL_SUGGESTED_NUMBERS - suggestions.length));
    }

    // Ensure we have exactly 6 numbers, fill with hot numbers if needed
    while (suggestions.length < PREDICTION_CONSTANTS.TOTAL_SUGGESTED_NUMBERS) {
      const remaining = hotNumbers.filter(num => !suggestions.includes(num));
      if (remaining.length > 0) {
        suggestions.push(remaining[0]);
      } else {
        break;
      }
    }

    return suggestions.slice(0, PREDICTION_CONSTANTS.TOTAL_SUGGESTED_NUMBERS).sort((a, b) => a - b);
  }

  private getRandomFromArray<T>(array: T[], count: number): T[] {
    // Fisher-Yates shuffle for proper randomization
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, Math.min(count, array.length));
  }
}

export const lotteryDataService = new LotteryDataService();