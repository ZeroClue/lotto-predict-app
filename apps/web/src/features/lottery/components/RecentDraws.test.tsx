import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { RecentDraws } from './RecentDraws';
import { LotteryDraw } from '../services/lotteryService';
import { HotColdAnalysis, NumberFrequency } from '../../../lib/services/lotteryAnalyticsService';

describe('RecentDraws', () => {
  const mockDraws: LotteryDraw[] = [
    {
      id: 'Powerball-2025-08-27',
      lotteryName: 'Powerball',
      drawDate: new Date('2025-08-27T20:00:00Z'),
      winningNumbers: [12, 29, 33],
      bonusNumber: 24,
      jackpotAmount: 150000000,
    },
  ];

  const mockFrequencyAnalysis: NumberFrequency[] = [
    { number: 12, frequency: 15, percentage: 7.8 },
    { number: 29, frequency: 5, percentage: 2.6 },
    { number: 33, frequency: 10, percentage: 5.2 },
  ];

  const mockHotColdAnalysis: HotColdAnalysis = {
    hotNumbers: [12],
    coldNumbers: [29],
    threshold: { hot: 10, cold: 5 },
  };

  const renderWithChakra = (component: React.ReactElement) => {
    return render(<ChakraProvider>{component}</ChakraProvider>);
  };

  it('renders without frequency context when not provided', () => {
    renderWithChakra(<RecentDraws draws={mockDraws} />);
    expect(screen.getByText('Recent Draws')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders with frequency context when provided', async () => {
    renderWithChakra(
      <RecentDraws
        draws={mockDraws}
        frequencyAnalysis={mockFrequencyAnalysis}
        hotColdAnalysis={mockHotColdAnalysis}
      />
    );

    const number12 = screen.getByText('12');
    fireEvent.mouseOver(number12);

    await screen.findByText('Frequency: 15 times');
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('hot')).toBeInTheDocument();
  });

  it('shows correct color for hot, cold, and normal numbers', () => {
    renderWithChakra(
      <RecentDraws
        draws={mockDraws}
        frequencyAnalysis={mockFrequencyAnalysis}
        hotColdAnalysis={mockHotColdAnalysis}
      />
    );

    // Hot number
    const hotNumberCircle = screen.getByText('12').parentElement;
    expect(hotNumberCircle).toHaveStyle('background-color: red.500');

    // Cold number
    const coldNumberCircle = screen.getByText('29').parentElement;
    expect(coldNumberCircle).toHaveStyle('background-color: blue.500');
    
    // Normal number
    const normalNumberCircle = screen.getByText('33').parentElement;
    expect(normalNumberCircle).toHaveStyle('background-color: gray.500');
  });
});
