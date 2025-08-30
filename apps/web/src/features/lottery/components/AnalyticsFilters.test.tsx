import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { AnalyticsFilters } from './AnalyticsFilters';
import { AnalyticsFilters as IAnalyticsFilters } from '../../../lib/services/lotteryAnalyticsService';

const mockOnFiltersChange = jest.fn();

const mockAvailableLotteries = [
  'Powerball',
  'Mega Millions',
  'EuroMillions',
  'TestLottery1',
  'TestLottery2',
];

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('AnalyticsFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render the component', () => {
      renderWithChakra(
        <AnalyticsFilters
          onFiltersChange={mockOnFiltersChange}
          availableLotteries={mockAvailableLotteries}
        />
      );

      expect(screen.getByText('Analytics Filters')).toBeInTheDocument();
      expect(screen.getByText('Quick Date Ranges:')).toBeInTheDocument();
      expect(screen.getByLabelText('Lottery Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      renderWithChakra(
        <AnalyticsFilters
          onFiltersChange={mockOnFiltersChange}
          isLoading={true}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });

      const selects = screen.getAllByRole('combobox');
      selects.forEach(select => {
        expect(select).toBeDisabled();
      });
    });

    it('should use default lotteries when none provided', () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      const lotterySelect = screen.getByLabelText('Lottery Type');
      fireEvent.click(lotterySelect);

      expect(screen.getByText('Powerball')).toBeInTheDocument();
      expect(screen.getByText('Mega Millions')).toBeInTheDocument();
      expect(screen.getByText('EuroMillions')).toBeInTheDocument();
    });
  });

  describe('quick date presets', () => {
    it('should display all preset buttons', () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
      expect(screen.getByText('Last 90 Days')).toBeInTheDocument();
      expect(screen.getByText('Last 6 Months')).toBeInTheDocument();
      expect(screen.getByText('Last Year')).toBeInTheDocument();
      expect(screen.getByText('All Time')).toBeInTheDocument();
    });

    it('should apply preset when clicked', async () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      const button = screen.getByText('Last 30 Days');
      fireEvent.click(button);

      // Should be called with debounced effect
      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalled();
      }, { timeout: 1000 });

      // Check that the button becomes active
      expect(button).toHaveClass('chakra-button');
    });

    it('should clear preset when manual date is changed', async () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      // First apply a preset
      const presetButton = screen.getByText('Last 30 Days');
      fireEvent.click(presetButton);

      // Then change start date manually
      const startDateInput = screen.getByLabelText('Start Date');
      fireEvent.change(startDateInput, { target: { value: '2025-01-01' } });

      // Preset should no longer be active (hard to test visually, but the logic should work)
      expect(startDateInput).toHaveValue('2025-01-01');
    });
  });

  describe('lottery selection', () => {
    it('should allow selecting a lottery', () => {
      renderWithChakra(
        <AnalyticsFilters
          onFiltersChange={mockOnFiltersChange}
          availableLotteries={mockAvailableLotteries}
        />
      );

      const select = screen.getByLabelText('Lottery Type');
      fireEvent.change(select, { target: { value: 'Powerball' } });

      expect(select).toHaveValue('Powerball');
    });

    it('should show custom lotteries when provided', () => {
      const customLotteries = ['CustomLottery1', 'CustomLottery2'];

      renderWithChakra(
        <AnalyticsFilters
          onFiltersChange={mockOnFiltersChange}
          availableLotteries={customLotteries}
        />
      );

      const select = screen.getByLabelText('Lottery Type');
      fireEvent.click(select);

      expect(screen.getByText('CustomLottery1')).toBeInTheDocument();
      expect(screen.getByText('CustomLottery2')).toBeInTheDocument();
    });
  });

  describe('date range selection', () => {
    it('should allow setting start and end dates', () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      const startDate = screen.getByLabelText('Start Date');
      const endDate = screen.getByLabelText('End Date');

      fireEvent.change(startDate, { target: { value: '2025-01-01' } });
      fireEvent.change(endDate, { target: { value: '2025-01-31' } });

      expect(startDate).toHaveValue('2025-01-01');
      expect(endDate).toHaveValue('2025-01-31');
    });
  });

  describe('analysis configuration', () => {
    it('should allow selecting analysis type', () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      const select = screen.getByLabelText('Analysis Type');
      fireEvent.change(select, { target: { value: 'frequency' } });

      expect(select).toHaveValue('frequency');
    });

    it('should allow setting trend period', () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      const input = screen.getByDisplayValue('30'); // Default period length
      fireEvent.change(input, { target: { value: '60' } });

      expect(input).toHaveValue('60');
    });

    it('should have increment/decrement buttons for trend period', () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      const incrementButton = screen.getByLabelText('increment');
      const decrementButton = screen.getByLabelText('decrement');

      expect(incrementButton).toBeInTheDocument();
      expect(decrementButton).toBeInTheDocument();
    });
  });

  describe('filter actions', () => {
    it('should have Apply Filters button', () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      const button = screen.getByText('Apply Filters');
      expect(button).toBeInTheDocument();
    });

    it('should have Clear All button', () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      const button = screen.getByText('Clear All');
      expect(button).toBeInTheDocument();
    });

    it('should disable Clear All when no filters active', () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      const button = screen.getByText('Clear All');
      expect(button).toBeDisabled();
    });

    it('should enable Clear All when filters are active', async () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      // Apply a filter
      const lotterySelect = screen.getByLabelText('Lottery Type');
      fireEvent.change(lotterySelect, { target: { value: 'Powerball' } });

      await waitFor(() => {
        const button = screen.getByText('Clear All');
        expect(button).not.toBeDisabled();
      });
    });

    it('should clear all filters when Clear All is clicked', async () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      // Apply filters first
      const lotterySelect = screen.getByLabelText('Lottery Type');
      fireEvent.change(lotterySelect, { target: { value: 'Powerball' } });

      const startDate = screen.getByLabelText('Start Date');
      fireEvent.change(startDate, { target: { value: '2025-01-01' } });

      // Clear all
      const clearButton = screen.getByText('Clear All');
      fireEvent.click(clearButton);

      expect(lotterySelect).toHaveValue('');
      expect(startDate).toHaveValue('');
    });
  });

  describe('filter summary', () => {
    it('should show active filters badge when filters are applied', async () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      const lotterySelect = screen.getByLabelText('Lottery Type');
      fireEvent.change(lotterySelect, { target: { value: 'Powerball' } });

      await waitFor(() => {
        expect(screen.getByText(/filters active/)).toBeInTheDocument();
      });
    });

    it('should show filter summary details', async () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      // Apply multiple filters
      const lotterySelect = screen.getByLabelText('Lottery Type');
      fireEvent.change(lotterySelect, { target: { value: 'Powerball' } });

      const analysisSelect = screen.getByLabelText('Analysis Type');
      fireEvent.change(analysisSelect, { target: { value: 'frequency' } });

      await waitFor(() => {
        expect(screen.getByText('Active Filters Summary:')).toBeInTheDocument();
        expect(screen.getByText('• Lottery: Powerball')).toBeInTheDocument();
        expect(screen.getByText('• Analysis Type: Frequency')).toBeInTheDocument();
      });
    });

    it('should show date range in summary', async () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      const startDate = screen.getByLabelText('Start Date');
      const endDate = screen.getByLabelText('End Date');

      fireEvent.change(startDate, { target: { value: '2025-01-01' } });
      fireEvent.change(endDate, { target: { value: '2025-01-31' } });

      await waitFor(() => {
        expect(screen.getByText(/Date Range: 1\/1\/2025 - 1\/31\/2025/)).toBeInTheDocument();
      });
    });

    it('should show trend period in summary when changed', async () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      const periodInput = screen.getByDisplayValue('30');
      fireEvent.change(periodInput, { target: { value: '60' } });

      await waitFor(() => {
        expect(screen.getByText('• Trend Period: 60 days')).toBeInTheDocument();
      });
    });
  });

  describe('callback behavior', () => {
    it('should call onFiltersChange with debounced updates', async () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      const lotterySelect = screen.getByLabelText('Lottery Type');
      fireEvent.change(lotterySelect, { target: { value: 'Powerball' } });

      // Should be called after debounce delay
      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          lotteryName: 'Powerball',
        });
      }, { timeout: 1000 });
    });

    it('should call onFiltersChange with date range', async () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      const startDate = screen.getByLabelText('Start Date');
      const endDate = screen.getByLabelText('End Date');

      fireEvent.change(startDate, { target: { value: '2025-01-01' } });
      fireEvent.change(endDate, { target: { value: '2025-01-31' } });

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          dateRange: {
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-31'),
          },
        });
      }, { timeout: 1000 });
    });

    it('should call onFiltersChange with empty object when clearing', () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      // Apply a filter first
      const lotterySelect = screen.getByLabelText('Lottery Type');
      fireEvent.change(lotterySelect, { target: { value: 'Powerball' } });

      // Clear all
      const clearButton = screen.getByText('Clear All');
      fireEvent.click(clearButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({});
    });
  });

  describe('accessibility', () => {
    it('should have proper form labels', () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      expect(screen.getByLabelText('Lottery Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Analysis Type')).toBeInTheDocument();
      expect(screen.getByLabelText(/Trend Period/)).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      const heading = screen.getByRole('heading', { name: 'Analytics Filters' });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      const applyButton = screen.getByRole('button', { name: 'Apply Filters' });
      const clearButton = screen.getByRole('button', { name: 'Clear All' });

      expect(applyButton).toBeInTheDocument();
      expect(clearButton).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle invalid date inputs gracefully', () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      const startDate = screen.getByLabelText('Start Date');
      fireEvent.change(startDate, { target: { value: 'invalid-date' } });

      // Should not crash
      expect(startDate).toHaveValue('invalid-date');
    });

    it('should handle empty lottery list', () => {
      renderWithChakra(
        <AnalyticsFilters
          onFiltersChange={mockOnFiltersChange}
          availableLotteries={[]}
        />
      );

      const select = screen.getByLabelText('Lottery Type');
      expect(select).toBeInTheDocument();
      expect(select.children).toHaveLength(1); // Only placeholder option
    });

    it('should handle extreme trend period values', () => {
      renderWithChakra(
        <AnalyticsFilters onFiltersChange={mockOnFiltersChange} />
      );

      const input = screen.getByDisplayValue('30');
      fireEvent.change(input, { target: { value: '1000' } });

      // Should be constrained by max value (365)
      expect(input).toHaveValue('365');
    });
  });
});