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
    const hotNumbers = this.getHotNumbers(frequencyAnalysis, 10);
    const coldNumbers = this.getColdNumbers(frequencyAnalysis, 10);
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
    const hotNumbers = this.getHotNumbers(frequencyAnalysis, 15);
    const mediumNumbers = frequencyAnalysis
      .slice(Math.floor(frequencyAnalysis.length * 0.3), Math.floor(frequencyAnalysis.length * 0.7))
      .map(item => item.number);
    
    const suggestions: number[] = [];
    
    // Mix of hot (3), medium (2), and one random from all
    suggestions.push(...this.getRandomFromArray(hotNumbers, 3));
    suggestions.push(...this.getRandomFromArray(mediumNumbers, 2));
    
    // Avoid exact repetition of most recent draw
    const availableNumbers = frequencyAnalysis
      .map(item => item.number)
      .filter(num => !mostRecentDraw.winningNumbers.includes(num) && !suggestions.includes(num));
    
    if (availableNumbers.length > 0 && suggestions.length < 6) {
      suggestions.push(...this.getRandomFromArray(availableNumbers, 6 - suggestions.length));
    }

    // Ensure we have exactly 6 numbers, fill with hot numbers if needed
    while (suggestions.length < 6) {
      const remaining = hotNumbers.filter(num => !suggestions.includes(num));
      if (remaining.length > 0) {
        suggestions.push(remaining[0]);
      } else {
        break;
      }
    }

    return suggestions.slice(0, 6).sort((a, b) => a - b);
  }

  private getRandomFromArray<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }
}

export const lotteryDataService = new LotteryDataService();