import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { LuckyNumberPuzzle } from './LuckyNumberPuzzle';

// Mock Math.random to make tests predictable
const mockMath = Object.create(global.Math);
mockMath.random = jest.fn();
global.Math = mockMath;

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('LuckyNumberPuzzle', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up Math.random to return 0.5 (which gives us target number 6)
    (Math.random as jest.Mock).mockReturnValue(0.5);
  });

  it('should render game interface correctly', () => {
    renderWithChakra(<LuckyNumberPuzzle onComplete={mockOnComplete} />);

    expect(screen.getByText('Lucky Number Puzzle')).toBeInTheDocument();
    expect(screen.getByText('Guess the lucky number between 1 and 10!')).toBeInTheDocument();
    expect(screen.getByText('You have 5 attempts to win.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter 1-10')).toBeInTheDocument();
    expect(screen.getByText('Guess')).toBeInTheDocument();
    expect(screen.getByText('Attempts: 0/5')).toBeInTheDocument();
  });

  it('should handle correct guess and show success', async () => {
    renderWithChakra(<LuckyNumberPuzzle onComplete={mockOnComplete} />);

    const input = screen.getByPlaceholderText('Enter 1-10');
    const guessButton = screen.getByText('Guess');

    // Make the correct guess (6 based on our mocked Math.random)
    fireEvent.change(input, { target: { value: '6' } });
    fireEvent.click(guessButton);

    await waitFor(() => {
      expect(screen.getByText(/🎉 Congratulations! You guessed it in 1 attempt/)).toBeInTheDocument();
      expect(screen.getByText('Claim Reward')).toBeInTheDocument();
    });

    // Click claim reward
    fireEvent.click(screen.getByText('Claim Reward'));
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('should handle incorrect guess and show feedback', async () => {
    renderWithChakra(<LuckyNumberPuzzle onComplete={mockOnComplete} />);

    const input = screen.getByPlaceholderText('Enter 1-10');
    const guessButton = screen.getByText('Guess');

    // Make an incorrect guess
    fireEvent.change(input, { target: { value: '3' } });
    fireEvent.click(guessButton);

    await waitFor(() => {
      expect(screen.getByText(/Your guess is too low. 4 attempts left./)).toBeInTheDocument();
      expect(screen.getByText('Attempts: 1/5')).toBeInTheDocument();
    });

    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('should handle game over after max attempts', async () => {
    renderWithChakra(<LuckyNumberPuzzle onComplete={mockOnComplete} />);

    const input = screen.getByPlaceholderText('Enter 1-10');
    const guessButton = screen.getByText('Guess');

    // Make 5 incorrect guesses
    for (let i = 1; i <= 5; i++) {
      fireEvent.change(input, { target: { value: '1' } }); // Always guess wrong
      fireEvent.click(guessButton);
      
      if (i < 5) {
        await waitFor(() => {
          expect(screen.getByText(`Attempts: ${i}/5`)).toBeInTheDocument();
        });
      }
    }

    await waitFor(() => {
      expect(screen.getByText(/😞 Game over! The lucky number was 6. Try again!/)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('should reset game when Try Again is clicked', async () => {
    renderWithChakra(<LuckyNumberPuzzle onComplete={mockOnComplete} />);

    const input = screen.getByPlaceholderText('Enter 1-10');
    const guessButton = screen.getByText('Guess');

    // Lose the game
    for (let i = 1; i <= 5; i++) {
      fireEvent.change(input, { target: { value: '1' } });
      fireEvent.click(guessButton);
    }

    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    // Click Try Again
    fireEvent.click(screen.getByText('Try Again'));

    await waitFor(() => {
      expect(screen.getByText('Attempts: 0/5')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter 1-10')).toHaveValue('');
    });
  });

  it('should validate input range', async () => {
    renderWithChakra(<LuckyNumberPuzzle onComplete={mockOnComplete} />);

    const input = screen.getByPlaceholderText('Enter 1-10');
    const guessButton = screen.getByText('Guess');

    // Test invalid input (out of range)
    fireEvent.change(input, { target: { value: '11' } });
    fireEvent.click(guessButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a number between 1 and 10')).toBeInTheDocument();
    });

    // Test non-numeric input
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.click(guessButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a number between 1 and 10')).toBeInTheDocument();
    });

    expect(screen.getByText('Attempts: 0/5')).toBeInTheDocument(); // No attempts should be counted
  });

  it('should handle Enter key press', async () => {
    renderWithChakra(<LuckyNumberPuzzle onComplete={mockOnComplete} />);

    const input = screen.getByPlaceholderText('Enter 1-10');

    // Enter correct guess and press Enter
    fireEvent.change(input, { target: { value: '6' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(screen.getByText(/🎉 Congratulations! You guessed it in 1 attempt/)).toBeInTheDocument();
    });
  });

  it('should show loading state when completing', () => {
    renderWithChakra(<LuckyNumberPuzzle onComplete={mockOnComplete} isCompleting={true} />);

    const input = screen.getByPlaceholderText('Enter 1-10');
    const guessButton = screen.getByText('Guess');

    // Make correct guess first
    fireEvent.change(input, { target: { value: '6' } });
    fireEvent.click(guessButton);

    // Should show loading state on claim button
    waitFor(() => {
      expect(screen.getByText('Awarding crypto...')).toBeInTheDocument();
    });
  });
});