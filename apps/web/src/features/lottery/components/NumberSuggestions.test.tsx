import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { NumberSuggestions } from './NumberSuggestions';
import { LotteryPrediction } from '../services/lotteryService';

describe('NumberSuggestions', () => {
  const mockPredictions: LotteryPrediction = {
    suggestedNumbers: [1, 15, 23, 37, 42, 55],
    frequencyAnalysis: [
      { number: 1, frequency: 10, percentage: 5.2 },
      { number: 15, frequency: 8, percentage: 4.1 },
      { number: 23, frequency: 7, percentage: 3.6 },
    ],
    hotNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    coldNumbers: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69],
    mostRecentDraw: null,
    analysisDate: new Date('2025-08-28T10:00:00Z'),
  };

  const renderWithChakra = (component: React.ReactElement) => {
    return render(<ChakraProvider>{component}</ChakraProvider>);
  };

  it('renders loading state when predictions is null', () => {
    renderWithChakra(<NumberSuggestions predictions={null} />);

    expect(screen.getByText('Number Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Loading suggestions...')).toBeInTheDocument();
  });

  it('renders suggested numbers when predictions are provided', () => {
    renderWithChakra(<NumberSuggestions predictions={mockPredictions} />);

    expect(screen.getByText('Number Suggestions')).toBeInTheDocument();
    expect(screen.getByText('AI Powered')).toBeInTheDocument();
    
    // Check all suggested numbers are displayed
    mockPredictions.suggestedNumbers.forEach(number => {
      expect(screen.getByText(number.toString())).toBeInTheDocument();
    });
  });

  it('renders hot numbers section', () => {
    renderWithChakra(<NumberSuggestions predictions={mockPredictions} />);

    expect(screen.getByText('Hot Numbers (Most Frequent)')).toBeInTheDocument();
    
    // Check first 10 hot numbers are displayed
    mockPredictions.hotNumbers.slice(0, 10).forEach(number => {
      expect(screen.getByText(number.toString())).toBeInTheDocument();
    });
  });

  it('renders cold numbers section', () => {
    renderWithChakra(<NumberSuggestions predictions={mockPredictions} />);

    expect(screen.getByText('Cold Numbers (Least Frequent)')).toBeInTheDocument();
    
    // Check first 10 cold numbers are displayed
    mockPredictions.coldNumbers.slice(0, 10).forEach(number => {
      expect(screen.getByText(number.toString())).toBeInTheDocument();
    });
  });

  it('displays analysis information', () => {
    renderWithChakra(<NumberSuggestions predictions={mockPredictions} />);

    expect(screen.getByText(/Analysis based on 3 unique numbers/)).toBeInTheDocument();
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it('formats analysis date correctly', () => {
    renderWithChakra(<NumberSuggestions predictions={mockPredictions} />);

    const formattedDate = new Date('2025-08-28T10:00:00Z').toLocaleString();
    expect(screen.getByText(new RegExp(formattedDate))).toBeInTheDocument();
  });
});