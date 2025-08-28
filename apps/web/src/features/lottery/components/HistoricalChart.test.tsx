import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { HistoricalChart } from './HistoricalChart';
import { LotteryPrediction } from '../services/lotteryService';

describe('HistoricalChart', () => {
  const mockPredictions: LotteryPrediction = {
    suggestedNumbers: [1, 15, 23, 37, 42, 55],
    frequencyAnalysis: [
      { number: 7, frequency: 15, percentage: 7.8 },
      { number: 23, frequency: 12, percentage: 6.3 },
      { number: 1, frequency: 10, percentage: 5.2 },
      { number: 45, frequency: 8, percentage: 4.2 },
      { number: 67, frequency: 3, percentage: 1.6 },
    ],
    hotNumbers: [7, 23, 1, 45, 12],
    coldNumbers: [67, 68, 69, 60, 61],
    mostRecentDraw: null,
    analysisDate: new Date('2025-08-28T10:00:00Z'),
  };

  const renderWithChakra = (component: React.ReactElement) => {
    return render(<ChakraProvider>{component}</ChakraProvider>);
  };

  it('renders loading state when predictions is null', () => {
    renderWithChakra(<HistoricalChart predictions={null} />);

    expect(screen.getByText('Number Frequency Analysis')).toBeInTheDocument();
    expect(screen.getByText('Loading frequency analysis...')).toBeInTheDocument();
  });

  it('renders frequency analysis when predictions are provided', () => {
    renderWithChakra(<HistoricalChart predictions={mockPredictions} />);

    expect(screen.getByText('Number Frequency Analysis')).toBeInTheDocument();
    expect(screen.getByText('Top 20')).toBeInTheDocument();
    expect(screen.getByText('Most frequently drawn numbers in historical data')).toBeInTheDocument();
  });

  it('displays frequency data for numbers', () => {
    renderWithChakra(<HistoricalChart predictions={mockPredictions} />);

    // Check highest frequency number
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('15 times')).toBeInTheDocument();
    expect(screen.getByText('7.8%')).toBeInTheDocument();

    // Check other numbers
    expect(screen.getByText('23')).toBeInTheDocument();
    expect(screen.getByText('12 times')).toBeInTheDocument();
    expect(screen.getByText('6.3%')).toBeInTheDocument();
  });

  it('displays most and least frequent numbers summary', () => {
    renderWithChakra(<HistoricalChart predictions={mockPredictions} />);

    expect(screen.getByText('Most Frequent')).toBeInTheDocument();
    expect(screen.getByText('Least Frequent')).toBeInTheDocument();

    // Check hot numbers (first 3)
    mockPredictions.hotNumbers.slice(0, 3).forEach(number => {
      expect(screen.getByText(number.toString())).toBeInTheDocument();
    });

    // Check cold numbers (first 3)  
    mockPredictions.coldNumbers.slice(0, 3).forEach(number => {
      expect(screen.getByText(number.toString())).toBeInTheDocument();
    });
  });

  it('displays analysis summary', () => {
    renderWithChakra(<HistoricalChart predictions={mockPredictions} />);

    expect(screen.getByText(/Analysis includes 5 unique numbers from historical draws/)).toBeInTheDocument();
  });

  it('sorts frequency analysis by frequency descending', () => {
    renderWithChakra(<HistoricalChart predictions={mockPredictions} />);

    // The numbers should appear in order of frequency (15, 12, 10, 8, 3)
    const frequencyTexts = screen.getAllByText(/\d+ times/);
    expect(frequencyTexts[0]).toHaveTextContent('15 times');
    expect(frequencyTexts[1]).toHaveTextContent('12 times');
    expect(frequencyTexts[2]).toHaveTextContent('10 times');
    expect(frequencyTexts[3]).toHaveTextContent('8 times');
    expect(frequencyTexts[4]).toHaveTextContent('3 times');
  });

  it('limits display to top 20 numbers', () => {
    const manyNumbers = Array.from({ length: 30 }, (_, index) => ({
      number: index + 1,
      frequency: 30 - index,
      percentage: ((30 - index) / 600) * 100,
    }));

    const predictionsWith30Numbers: LotteryPrediction = {
      ...mockPredictions,
      frequencyAnalysis: manyNumbers,
    };

    renderWithChakra(<HistoricalChart predictions={predictionsWith30Numbers} />);

    // Should only display top 20
    const frequencyTexts = screen.getAllByText(/\d+ times/);
    expect(frequencyTexts).toHaveLength(20);
  });

  it('handles empty frequency analysis', () => {
    const predictionsWithEmptyAnalysis: LotteryPrediction = {
      ...mockPredictions,
      frequencyAnalysis: [],
    };

    renderWithChakra(<HistoricalChart predictions={predictionsWithEmptyAnalysis} />);

    expect(screen.getByText('Number Frequency Analysis')).toBeInTheDocument();
    expect(screen.getByText(/Analysis includes 0 unique numbers/)).toBeInTheDocument();
  });
});