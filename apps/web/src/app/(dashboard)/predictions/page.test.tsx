import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import PredictionsPage from './page';
import { usePredictionStore } from '../../../stores/predictionStore';

// Mock the prediction store
jest.mock('../../../stores/predictionStore');

// Mock the components
jest.mock('../../../features/lottery/components/HistoricalChart', () => ({
  HistoricalChart: ({ predictions }: any) => (
    <div data-testid="historical-chart">
      Historical Chart - {predictions ? 'with data' : 'no data'}
    </div>
  ),
}));

jest.mock('../../../features/lottery/components/NumberSuggestions', () => ({
  NumberSuggestions: ({ predictions }: any) => (
    <div data-testid="number-suggestions">
      Number Suggestions - {predictions ? 'with data' : 'no data'}
    </div>
  ),
}));

jest.mock('../../../features/lottery/components/RecentDraws', () => ({
  RecentDraws: ({ draws }: any) => (
    <div data-testid="recent-draws">
      Recent Draws - {draws ? draws.length + ' draws' : 'no draws'}
    </div>
  ),
}));

jest.mock('../../../features/lottery/components/EntertainmentDisclaimer', () => ({
  EntertainmentDisclaimer: () => (
    <div data-testid="entertainment-disclaimer">
      Entertainment Disclaimer
    </div>
  ),
}));

const mockPredictionStore = usePredictionStore as jest.MockedFunction<typeof usePredictionStore>;

describe('PredictionsPage', () => {
  const mockFetchPredictions = jest.fn();
  const mockFetchRecentDraws = jest.fn();

  const defaultMockState = {
    predictions: {
      suggestedNumbers: [1, 2, 3, 4, 5, 6],
      frequencyAnalysis: [
        { number: 1, frequency: 5, percentage: 10 },
        { number: 2, frequency: 4, percentage: 8 },
      ],
      hotNumbers: [1, 2, 3],
      coldNumbers: [60, 61, 62],
      mostRecentDraw: null,
      analysisDate: new Date('2025-08-28'),
    },
    recentDraws: [
      {
        id: 'test-1',
        lotteryName: 'Powerball',
        drawDate: new Date('2025-08-27'),
        winningNumbers: [1, 2, 3, 4, 5],
        bonusNumber: 6,
        jackpotAmount: 1000000,
      },
    ],
    loading: false,
    error: null,
    fetchPredictions: mockFetchPredictions,
    fetchRecentDraws: mockFetchRecentDraws,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPredictionStore.mockReturnValue(defaultMockState);
  });

  const renderWithChakra = (component: React.ReactElement) => {
    return render(<ChakraProvider>{component}</ChakraProvider>);
  };

  it('renders predictions page with all components', () => {
    renderWithChakra(<PredictionsPage />);

    expect(screen.getByText('Lottery Predictions')).toBeInTheDocument();
    expect(screen.getByText('AI-powered number analysis and suggestions')).toBeInTheDocument();
    expect(screen.getByTestId('entertainment-disclaimer')).toBeInTheDocument();
    expect(screen.getByTestId('number-suggestions')).toBeInTheDocument();
    expect(screen.getByTestId('recent-draws')).toBeInTheDocument();
    expect(screen.getByTestId('historical-chart')).toBeInTheDocument();
  });

  it('fetches data on component mount', () => {
    renderWithChakra(<PredictionsPage />);

    expect(mockFetchPredictions).toHaveBeenCalledTimes(1);
    expect(mockFetchRecentDraws).toHaveBeenCalledTimes(1);
  });

  it('displays loading state', () => {
    mockPredictionStore.mockReturnValue({
      ...defaultMockState,
      loading: true,
    });

    renderWithChakra(<PredictionsPage />);

    expect(screen.getByText('Loading predictions...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    mockPredictionStore.mockReturnValue({
      ...defaultMockState,
      error: 'Failed to load data',
    });

    renderWithChakra(<PredictionsPage />);

    expect(screen.getByText('Error loading data!')).toBeInTheDocument();
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('handles lottery selection change', async () => {
    renderWithChakra(<PredictionsPage />);

    const select = screen.getByDisplayValue('All Lotteries');
    fireEvent.change(select, { target: { value: 'Powerball' } });

    await waitFor(() => {
      expect(mockFetchPredictions).toHaveBeenCalledWith('Powerball');
      expect(mockFetchRecentDraws).toHaveBeenCalledWith('Powerball');
    });
  });

  it('handles refresh button click', () => {
    renderWithChakra(<PredictionsPage />);

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(mockFetchPredictions).toHaveBeenCalledWith(undefined);
    expect(mockFetchRecentDraws).toHaveBeenCalledWith(undefined);
  });

  it('displays quick stats when predictions are available', () => {
    renderWithChakra(<PredictionsPage />);

    expect(screen.getByText('Quick Stats')).toBeInTheDocument();
    expect(screen.getByText('Analysis Date:')).toBeInTheDocument();
    expect(screen.getByText('Numbers Analyzed:')).toBeInTheDocument();
    expect(screen.getByText('Hot Numbers:')).toBeInTheDocument();
    expect(screen.getByText('Cold Numbers:')).toBeInTheDocument();
  });

  it('does not display quick stats when predictions are null', () => {
    mockPredictionStore.mockReturnValue({
      ...defaultMockState,
      predictions: null,
    });

    renderWithChakra(<PredictionsPage />);

    expect(screen.queryByText('Quick Stats')).not.toBeInTheDocument();
  });
});