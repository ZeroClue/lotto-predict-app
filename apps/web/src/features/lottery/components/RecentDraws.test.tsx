import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { RecentDraws } from './RecentDraws';
import { LotteryDraw } from '../services/lotteryService';

describe('RecentDraws', () => {
  const mockDraws: LotteryDraw[] = [
    {
      id: 'Powerball-2025-08-27',
      lotteryName: 'Powerball',
      drawDate: new Date('2025-08-27T20:00:00Z'),
      winningNumbers: [12, 29, 33, 41, 52],
      bonusNumber: 24,
      jackpotAmount: 150000000,
      sourceUrl: 'https://www.powerball.com',
    },
    {
      id: 'Mega-Millions-2025-08-26',
      lotteryName: 'Mega Millions',
      drawDate: new Date('2025-08-26T20:00:00Z'),
      winningNumbers: [7, 18, 25, 39, 47],
      bonusNumber: 12,
      jackpotAmount: 200000000,
      sourceUrl: 'https://www.megamillions.com',
    },
  ];

  const renderWithChakra = (component: React.ReactElement) => {
    return render(<ChakraProvider>{component}</ChakraProvider>);
  };

  it('renders empty state when no draws provided', () => {
    renderWithChakra(<RecentDraws draws={[]} />);

    expect(screen.getByText('Recent Draws')).toBeInTheDocument();
    expect(screen.getByText('No recent draws available...')).toBeInTheDocument();
  });

  it('renders recent draws when data is provided', () => {
    renderWithChakra(<RecentDraws draws={mockDraws} />);

    expect(screen.getByText('Recent Draws')).toBeInTheDocument();
    expect(screen.getByText('2 draws')).toBeInTheDocument();
  });

  it('displays lottery names and dates', () => {
    renderWithChakra(<RecentDraws draws={mockDraws} />);

    expect(screen.getByText('Powerball')).toBeInTheDocument();
    expect(screen.getByText('Mega Millions')).toBeInTheDocument();
    
    // Check formatted dates
    expect(screen.getByText('8/27/2025')).toBeInTheDocument();
    expect(screen.getByText('8/26/2025')).toBeInTheDocument();
  });

  it('displays winning numbers', () => {
    renderWithChakra(<RecentDraws draws={mockDraws} />);

    // Check first draw numbers
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('29')).toBeInTheDocument();
    expect(screen.getByText('33')).toBeInTheDocument();
    expect(screen.getByText('41')).toBeInTheDocument();
    expect(screen.getByText('52')).toBeInTheDocument();

    // Check second draw numbers
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('39')).toBeInTheDocument();
    expect(screen.getByText('47')).toBeInTheDocument();
  });

  it('displays bonus numbers', () => {
    renderWithChakra(<RecentDraws draws={mockDraws} />);

    expect(screen.getByText('Bonus: 24')).toBeInTheDocument();
    expect(screen.getByText('Bonus: 12')).toBeInTheDocument();
  });

  it('displays jackpot amounts', () => {
    renderWithChakra(<RecentDraws draws={mockDraws} />);

    expect(screen.getByText('$150,000,000')).toBeInTheDocument();
    expect(screen.getByText('$200,000,000')).toBeInTheDocument();
  });

  it('handles draws without bonus numbers', () => {
    const drawsWithoutBonus: LotteryDraw[] = [
      {
        id: 'Test-2025-08-27',
        lotteryName: 'Test Lottery',
        drawDate: new Date('2025-08-27T20:00:00Z'),
        winningNumbers: [1, 2, 3, 4, 5],
        sourceUrl: 'https://test.com',
      },
    ];

    renderWithChakra(<RecentDraws draws={drawsWithoutBonus} />);

    expect(screen.getByText('Test Lottery')).toBeInTheDocument();
    expect(screen.queryByText('Bonus:')).not.toBeInTheDocument();
  });

  it('handles draws without jackpot amounts', () => {
    const drawsWithoutJackpot: LotteryDraw[] = [
      {
        id: 'Test-2025-08-27',
        lotteryName: 'Test Lottery',
        drawDate: new Date('2025-08-27T20:00:00Z'),
        winningNumbers: [1, 2, 3, 4, 5],
        sourceUrl: 'https://test.com',
      },
    ];

    renderWithChakra(<RecentDraws draws={drawsWithoutJackpot} />);

    expect(screen.getByText('Test Lottery')).toBeInTheDocument();
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
  });

  it('limits display to 10 draws and shows count', () => {
    const manyDraws: LotteryDraw[] = Array.from({ length: 15 }, (_, index) => ({
      id: `Draw-${index}`,
      lotteryName: 'Test Lottery',
      drawDate: new Date(`2025-08-${27 - index}T20:00:00Z`),
      winningNumbers: [1, 2, 3, 4, 5],
      sourceUrl: 'https://test.com',
    }));

    renderWithChakra(<RecentDraws draws={manyDraws} />);

    expect(screen.getByText('15 draws')).toBeInTheDocument();
    expect(screen.getByText('Showing 10 of 15 recent draws')).toBeInTheDocument();
  });
});