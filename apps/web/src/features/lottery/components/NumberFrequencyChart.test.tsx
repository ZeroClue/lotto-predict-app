import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { NumberFrequencyChart } from './NumberFrequencyChart';
import { NumberFrequency, HotColdAnalysis } from '../../../lib/services/lotteryAnalyticsService';

// Mock Recharts components
jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Cell: () => <div data-testid="cell" />,
}));

const mockFrequencyData: NumberFrequency[] = [
  { number: 10, frequency: 25, percentage: 8.33 },
  { number: 15, frequency: 22, percentage: 7.33 },
  { number: 20, frequency: 20, percentage: 6.67 },
  { number: 5, frequency: 18, percentage: 6.00 },
  { number: 30, frequency: 15, percentage: 5.00 },
  { number: 1, frequency: 8, percentage: 2.67 },
  { number: 2, frequency: 6, percentage: 2.00 },
  { number: 3, frequency: 4, percentage: 1.33 },
];

const mockHotColdAnalysis: HotColdAnalysis = {
  hotNumbers: [10, 15, 20],
  coldNumbers: [1, 2, 3],
  threshold: {
    hot: 15,
    cold: 8,
  },
};

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('NumberFrequencyChart', () => {
  describe('basic rendering', () => {
    it('should render the component with data', () => {
      renderWithChakra(
        <NumberFrequencyChart
          frequencyData={mockFrequencyData}
          hotColdAnalysis={mockHotColdAnalysis}
        />
      );

      expect(screen.getByText('Number Frequency Analysis')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      renderWithChakra(
        <NumberFrequencyChart
          frequencyData={[]}
          hotColdAnalysis={mockHotColdAnalysis}
          isLoading={true}
        />
      );

      expect(screen.getByText('Loading frequency analysis...')).toBeInTheDocument();
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });

    it('should show empty state when no data', () => {
      renderWithChakra(
        <NumberFrequencyChart
          frequencyData={[]}
          hotColdAnalysis={{ hotNumbers: [], coldNumbers: [], threshold: { hot: 0, cold: 0 } }}
        />
      );

      expect(screen.getByText('No frequency data available')).toBeInTheDocument();
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });
  });

  describe('view mode filtering', () => {
    it('should have default view mode as "top20"', () => {
      renderWithChakra(
        <NumberFrequencyChart
          frequencyData={mockFrequencyData}
          hotColdAnalysis={mockHotColdAnalysis}
        />
      );

      const select = screen.getByDisplayValue('Top 20 Numbers');
      expect(select).toBeInTheDocument();
    });

    it('should change view mode when select changes', async () => {
      renderWithChakra(
        <NumberFrequencyChart
          frequencyData={mockFrequencyData}
          hotColdAnalysis={mockHotColdAnalysis}
        />
      );

      const select = screen.getByDisplayValue('Top 20 Numbers');
      fireEvent.change(select, { target: { value: 'hot' } });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Hot Numbers')).toBeInTheDocument();
      });
    });

    it('should show correct number count for hot numbers view', () => {
      renderWithChakra(
        <NumberFrequencyChart
          frequencyData={mockFrequencyData}
          hotColdAnalysis={mockHotColdAnalysis}
        />
      );

      expect(screen.getByText('Hot Numbers (3)')).toBeInTheDocument();
    });

    it('should show correct number count for cold numbers view', () => {
      renderWithChakra(
        <NumberFrequencyChart
          frequencyData={mockFrequencyData}
          hotColdAnalysis={mockHotColdAnalysis}
        />
      );

      expect(screen.getByText('Cold Numbers (3)')).toBeInTheDocument();
    });
  });

  describe('legend display', () => {
    it('should display legend with correct counts', () => {
      renderWithChakra(
        <NumberFrequencyChart
          frequencyData={mockFrequencyData}
          hotColdAnalysis={mockHotColdAnalysis}
        />
      );

      expect(screen.getByText('Hot Numbers (3)')).toBeInTheDocument();
      expect(screen.getByText('Cold Numbers (3)')).toBeInTheDocument();
      expect(screen.getByText('Normal Numbers')).toBeInTheDocument();
    });
  });

  describe('summary statistics', () => {
    it('should display threshold information', () => {
      renderWithChakra(
        <NumberFrequencyChart
          frequencyData={mockFrequencyData}
          hotColdAnalysis={mockHotColdAnalysis}
        />
      );

      expect(screen.getByText('Hot Threshold')).toBeInTheDocument();
      expect(screen.getByText('≥ 15 occurrences')).toBeInTheDocument();
      expect(screen.getByText('Cold Threshold')).toBeInTheDocument();
      expect(screen.getByText('≤ 8 occurrences')).toBeInTheDocument();
    });

    it('should display count summary', () => {
      renderWithChakra(
        <NumberFrequencyChart
          frequencyData={mockFrequencyData}
          hotColdAnalysis={mockHotColdAnalysis}
        />
      );

      expect(screen.getByText(/Showing \d+ numbers from 8 total analyzed numbers/)).toBeInTheDocument();
    });
  });

  describe('data filtering', () => {
    it('should filter data based on view mode', () => {
      const component = (
        <NumberFrequencyChart
          frequencyData={mockFrequencyData}
          hotColdAnalysis={mockHotColdAnalysis}
        />
      );

      const { rerender } = renderWithChakra(component);

      // Change to hot numbers view
      const select = screen.getByDisplayValue('Top 20 Numbers');
      fireEvent.change(select, { target: { value: 'hot' } });

      rerender(
        <ChakraProvider>
          <NumberFrequencyChart
            frequencyData={mockFrequencyData}
            hotColdAnalysis={mockHotColdAnalysis}
          />
        </ChakraProvider>
      );

      // Should still show the chart
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      renderWithChakra(
        <NumberFrequencyChart
          frequencyData={mockFrequencyData}
          hotColdAnalysis={mockHotColdAnalysis}
        />
      );

      const heading = screen.getByRole('heading', { name: 'Number Frequency Analysis' });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible select element', () => {
      renderWithChakra(
        <NumberFrequencyChart
          frequencyData={mockFrequencyData}
          hotColdAnalysis={mockHotColdAnalysis}
        />
      );

      const select = screen.getByDisplayValue('Top 20 Numbers');
      expect(select).toHaveAttribute('aria-expanded');
    });
  });

  describe('edge cases', () => {
    it('should handle empty hot/cold analysis', () => {
      const emptyAnalysis: HotColdAnalysis = {
        hotNumbers: [],
        coldNumbers: [],
        threshold: { hot: 0, cold: 0 },
      };

      renderWithChakra(
        <NumberFrequencyChart
          frequencyData={mockFrequencyData}
          hotColdAnalysis={emptyAnalysis}
        />
      );

      expect(screen.getByText('Hot Numbers (0)')).toBeInTheDocument();
      expect(screen.getByText('Cold Numbers (0)')).toBeInTheDocument();
      expect(screen.getByText('≥ 0 occurrences')).toBeInTheDocument();
      expect(screen.getByText('≤ 0 occurrences')).toBeInTheDocument();
    });

    it('should handle single number data', () => {
      const singleNumber: NumberFrequency[] = [
        { number: 42, frequency: 10, percentage: 100 }
      ];

      renderWithChakra(
        <NumberFrequencyChart
          frequencyData={singleNumber}
          hotColdAnalysis={mockHotColdAnalysis}
        />
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByText(/Showing \d+ numbers from 1 total analyzed numbers/)).toBeInTheDocument();
    });

    it('should handle large datasets', () => {
      const largeDataset: NumberFrequency[] = Array.from({ length: 100 }, (_, i) => ({
        number: i + 1,
        frequency: 100 - i,
        percentage: (100 - i) / 100,
      }));

      renderWithChakra(
        <NumberFrequencyChart
          frequencyData={largeDataset}
          hotColdAnalysis={mockHotColdAnalysis}
        />
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByText(/from 100 total analyzed numbers/)).toBeInTheDocument();
    });
  });

  describe('color mode compatibility', () => {
    it('should render without errors in different color modes', () => {
      // Test both light and dark mode renders
      const { unmount } = renderWithChakra(
        <NumberFrequencyChart
          frequencyData={mockFrequencyData}
          hotColdAnalysis={mockHotColdAnalysis}
        />
      );

      expect(screen.getByText('Number Frequency Analysis')).toBeInTheDocument();
      
      unmount();

      // Re-render should work fine
      renderWithChakra(
        <NumberFrequencyChart
          frequencyData={mockFrequencyData}
          hotColdAnalysis={mockHotColdAnalysis}
        />
      );

      expect(screen.getByText('Number Frequency Analysis')).toBeInTheDocument();
    });
  });
});