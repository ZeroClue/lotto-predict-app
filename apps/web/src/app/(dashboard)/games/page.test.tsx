import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import GamesPage from './page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const mockPush = jest.fn();
const mockRouter = useRouter as jest.MockedFunction<typeof useRouter>;

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('GamesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any);
  });

  it('should render loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithChakra(<GamesPage />);

    expect(screen.getByText('🎮 Games Hub')).toBeInTheDocument();
    expect(screen.getByText('Loading games...')).toBeInTheDocument();
  });

  it('should render games when fetch is successful', async () => {
    const mockGames = [
      {
        id: '1',
        name: 'Lucky Number Puzzle',
        description: 'Guess the lucky number between 1 and 10',
        rewardAmount: 10,
        isActive: true,
        nftAwardThreshold: 5,
      },
      {
        id: '2',
        name: 'Color Memory Challenge',
        description: 'Remember and repeat the color sequence to earn crypto rewards! Progressive difficulty increases with each round.',
        rewardAmount: 12,
        isActive: true,
        nftAwardThreshold: 4,
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: mockGames,
      }),
    });

    renderWithChakra(<GamesPage />);

    await waitFor(() => {
      expect(screen.getByText('Lucky Number Puzzle')).toBeInTheDocument();
      expect(screen.getByText('Color Memory Challenge')).toBeInTheDocument();
    });

    expect(screen.getByText('Guess the lucky number between 1 and 10')).toBeInTheDocument();
    expect(screen.getByText('Remember and repeat the color sequence to earn crypto rewards! Progressive difficulty increases with each round.')).toBeInTheDocument();
    expect(screen.getByText('10 crypto')).toBeInTheDocument();
    expect(screen.getByText('12 crypto')).toBeInTheDocument();
    expect(screen.getByText('NFT @ 5 wins')).toBeInTheDocument();
    expect(screen.getByText('NFT @ 4 wins')).toBeInTheDocument();
  });

  it('should render error state when fetch fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: false,
        error: 'Server error',
      }),
    });

    renderWithChakra(<GamesPage />);

    await waitFor(() => {
      expect(screen.getByText('Error: Server error')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('should navigate to game when Play Game is clicked', async () => {
    const mockGames = [
      {
        id: 'game-1',
        name: 'Lucky Number Puzzle',
        description: 'Test game',
        rewardAmount: 10,
        isActive: true,
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: mockGames,
      }),
    });

    renderWithChakra(<GamesPage />);

    await waitFor(() => {
      expect(screen.getByText('Lucky Number Puzzle')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Play Game'));

    expect(mockPush).toHaveBeenCalledWith('/games/game-1');
  });

  it('should retry fetch when Retry button is clicked', async () => {
    // First call fails
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: false,
        error: 'Server error',
      }),
    });

    // Second call succeeds
    const mockGames = [
      {
        id: '1',
        name: 'Test Game',
        description: 'Test description',
        rewardAmount: 5,
        isActive: true,
      },
    ];

    renderWithChakra(<GamesPage />);

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    // Mock successful retry
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: mockGames,
      }),
    });

    fireEvent.click(screen.getByText('Retry'));

    await waitFor(() => {
      expect(screen.getByText('Test Game')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should show empty state when no games available', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    renderWithChakra(<GamesPage />);

    await waitFor(() => {
      expect(screen.getByText('No games available at the moment.')).toBeInTheDocument();
    });
  });

  it('should display page description correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    renderWithChakra(<GamesPage />);

    await waitFor(() => {
      expect(screen.getByText('Play games and earn crypto rewards! Each game completion earns you cryptocurrency.')).toBeInTheDocument();
    });
  });
});