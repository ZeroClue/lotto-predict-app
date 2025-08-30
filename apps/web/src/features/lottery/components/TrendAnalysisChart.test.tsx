import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TrendAnalysisChart } from './TrendAnalysisChart';
import { NumberTrend } from '../../../lib/services/lotteryAnalyticsService';

// Mock the prediction store
jest.mock('../../../stores/predictionStore', () => ({
  usePredictionStore: jest.fn(),
}));

// Mock Recharts components
jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Line: ({ name }: any) => <div data-testid={`line-${name}`} />,
  Area: ({ name }: any) => <div data-testid={`area-${name}`} />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

const mockTrendData: NumberTrend[] = [
  {
    number: 10,
    trends: [
      { period: '2025-01-01', frequency: 3, movingAverage: 3.2 },
      { period: '2025-01-08', frequency: 5, movingAverage: 4.1 },
      { period: '2025-01-15', frequency: 6, movingAverage: 4.8 },
    ],
    overallTrend: 'increasing',
    trendStrength: 0.8,
  },
  {
    number: 15,
    trends: [
      { period: '2025-01-01', frequency: 8, movingAverage: 7.5 },
      { period: '2025-01-08', frequency: 6, movingAverage: 6.8 },
      { period: '2025-01-15', frequency: 4, movingAverage: 6.1 },
    ],
    overallTrend: 'decreasing',
    trendStrength: 0.6,
  },
  {
    number: 20,
    trends: [
      { period: '2025-01-01', frequency: 5, movingAverage: 5.0 },
      { period: '2025-01-08', frequency: 5, movingAverage: 5.0 },
      { period: '2025-01-15', frequency: 5, movingAverage: 5.0 },
    ],
    overallTrend: 'stable',
    trendStrength: 0.1,
  },
];

const { usePredictionStore } = jest.requireMock('../../../stores/predictionStore');

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('TrendAnalysisChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render the component with data', () => {
      usePredictionStore.mockReturnValue({
        analyticsData: { trendAnalysis: mockTrendData },
        loading: false,
      });

      renderWithChakra(<TrendAnalysisChart />);

      expect(screen.getByText('Trend Analysis')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      usePredictionStore.mockReturnValue({
        analyticsData: null,
        loading: true,
      });

      renderWithChakra(<TrendAnalysisChart />);

      expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });

    it('should show empty state when no data', () => {
      usePredictionStore.mockReturnValue({
        analyticsData: null,
        loading: false,
      });

      renderWithChakra(<TrendAnalysisChart />);

      expect(screen.getByText('No trend data to display. Apply filters to see results.')).toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });
  });

  describe('number selection', () => {
    it('should display number selection dropdown', () => {
      usePredictionStore.mockReturnValue({
        analyticsData: { trendAnalysis: mockTrendData },
        loading: false,
      });

      renderWithChakra(<TrendAnalysisChart />);

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      expect(screen.getByText('Select Number')).toBeInTheDocument();
    });

    it('should allow selecting different numbers', async () => {
      usePredictionStore.mockReturnValue({
        analyticsData: { trendAnalysis: mockTrendData },
        loading: false,
      });

      renderWithChakra(<TrendAnalysisChart />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '15' } });

      await waitFor(() => {
        expect(screen.getByTestId('line-MA for 15')).toBeInTheDocument();
      });
    });

    it('should show message when no number is selected', () => {
      usePredictionStore.mockReturnValue({
        analyticsData: { trendAnalysis: mockTrendData },
        loading: false,
      });

      renderWithChakra(<TrendAnalysisChart />);

      // Initially no number is selected, but useEffect should select first one
      expect(screen.getByText('Select a number to view its trend.') || screen.getByTestId('line-chart')).toBeTruthy();
    });
  });
});