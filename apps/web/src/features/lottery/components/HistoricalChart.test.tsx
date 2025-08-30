import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { HistoricalChart } from './HistoricalChart';
import { LotteryPrediction } from '../services/lotteryService';

// Mock Recharts components to avoid rendering issues in JSDOM
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div className="recharts-responsive-container">{children}</div>
    ),
    BarChart: ({ children }: { children: React.ReactNode }) => <div className="recharts-bar-chart">{children}</div>,
    Bar: () => <div className="recharts-bar" />,
    XAxis: () => <div className="recharts-x-axis" />,
    YAxis: () => <div className="recharts-y-axis" />,
    CartesianGrid: () => <div className="recharts-cartesian-grid" />,
    Tooltip: () => <div className="recharts-tooltip" />,
    Legend: () => <div className="recharts-legend" />,
    Cell: () => <div className="recharts-cell" />,
  };
});

describe('HistoricalChart', () => {
  const mockPredictions: LotteryPrediction = {
    suggestedNumbers: [1, 15, 23, 37, 42, 55],
    frequencyAnalysis: [
      { number: 7, frequency: 15, percentage: 7.8 },
      { number: 23, frequency: 12, percentage: 6.3 },
      { number: 1, frequency: 10, percentage: 5.2 },
    ],
    hotNumbers: [7, 23],
    coldNumbers: [1],
    analysisDate: new Date('2025-08-28T10:00:00Z'),
  };

  const renderWithChakra = (component: React.ReactElement) => {
    return render(<ChakraProvider>{component}</ChakraProvider>);
  };

  it('renders loading state when predictions is null', () => {
    renderWithChakra(<HistoricalChart predictions={null} />);
    expect(screen.getByText('Loading frequency analysis...')).toBeInTheDocument();
  });

  it('renders the chart when predictions are provided', () => {
    renderWithChakra(<HistoricalChart predictions={mockPredictions} />);
    expect(screen.getByText('Enhanced Frequency Analysis')).toBeInTheDocument();
    expect(document.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    expect(document.querySelector('.recharts-bar-chart')).toBeInTheDocument();
  });

  it('renders the legend with hot, cold, and normal classifications', () => {
    renderWithChakra(<HistoricalChart predictions={mockPredictions} />);
    expect(screen.getByText('Hot Numbers')).toBeInTheDocument();
    expect(screen.getByText('Cold Numbers')).toBeInTheDocument();
    expect(screen.getByText('Normal Numbers')).toBeInTheDocument();
  });

  it('shows trend indicators in the legend when showTrendIndicators is true', () => {
    renderWithChakra(<HistoricalChart predictions={mockPredictions} showTrendIndicators={true} />);
    expect(screen.getByText('Trending Up')).toBeInTheDocument();
    expect(screen.getByText('Trending Down')).toBeInTheDocument();
  });

  it('hides trend indicators in the legend when showTrendIndicators is false', () => {
    renderWithChakra(<HistoricalChart predictions={mockPredictions} showTrendIndicators={false} />);
    expect(screen.queryByText('Trending Up')).not.toBeInTheDocument();
    expect(screen.queryByText('Trending Down')).not.toBeInTheDocument();
  });
});
