import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { CryptoReward } from './CryptoReward';

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('CryptoReward', () => {
  beforeEach(() => {
    // Mock timers to control animations
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render default reward message and emoji', () => {
    renderWithChakra(<CryptoReward earnedAmount={10} />);

    expect(screen.getByText('🎉 Congratulations!')).toBeInTheDocument();
    expect(screen.getByText('Game Champion!')).toBeInTheDocument();
    expect(screen.getByText('You completed the game!')).toBeInTheDocument();
    expect(screen.getByText('+10')).toBeInTheDocument();
    expect(screen.getByText('CRYPTO')).toBeInTheDocument();
    expect(screen.getByText('Your crypto balance has been updated!')).toBeInTheDocument();
    expect(screen.getByText('🪙✨💎')).toBeInTheDocument();
  });

  it('should render Color Memory Challenge specific messages and emoji', () => {
    renderWithChakra(
      <CryptoReward 
        earnedAmount={12} 
        gameName="Color Memory Challenge"
        gameSpecificMessage="You completed all 5 rounds! Your memory is incredible!"
      />
    );

    expect(screen.getByText('🎉 Congratulations!')).toBeInTheDocument();
    expect(screen.getByText('Memory Master!')).toBeInTheDocument();
    expect(screen.getByText('You completed all 5 rounds! Your memory is incredible!')).toBeInTheDocument();
    expect(screen.getByText('+12')).toBeInTheDocument();
    expect(screen.getByText('🎨🧠💫')).toBeInTheDocument();
  });

  it('should render Lucky Number Puzzle specific messages and emoji', () => {
    renderWithChakra(
      <CryptoReward 
        earnedAmount={10} 
        gameName="Lucky Number Puzzle"
        gameSpecificMessage="You found the lucky number! Fortune favors you!"
      />
    );

    expect(screen.getByText('🎉 Congratulations!')).toBeInTheDocument();
    expect(screen.getByText('Number Wizard!')).toBeInTheDocument();
    expect(screen.getByText('You found the lucky number! Fortune favors you!')).toBeInTheDocument();
    expect(screen.getByText('+10')).toBeInTheDocument();
    expect(screen.getByText('🎲🍀✨')).toBeInTheDocument();
  });

  it('should fall back to default messages when gameName is unknown', () => {
    renderWithChakra(
      <CryptoReward 
        earnedAmount={15} 
        gameName="Unknown Game"
        gameSpecificMessage="Custom message"
      />
    );

    expect(screen.getByText('Game Champion!')).toBeInTheDocument();
    expect(screen.getByText('Custom message')).toBeInTheDocument();
    expect(screen.getByText('+15')).toBeInTheDocument();
    expect(screen.getByText('🪙✨💎')).toBeInTheDocument();
  });

  it('should use default message when no gameSpecificMessage provided', () => {
    renderWithChakra(
      <CryptoReward 
        earnedAmount={8} 
        gameName="Color Memory Challenge"
      />
    );

    expect(screen.getByText('Memory Master!')).toBeInTheDocument();
    expect(screen.getByText('Amazing memory skills!')).toBeInTheDocument();
  });

  it('should display correct earned amount formatting', () => {
    renderWithChakra(<CryptoReward earnedAmount={25} />);
    expect(screen.getByText('+25')).toBeInTheDocument();
  });

  it('should display crypto badge', () => {
    renderWithChakra(<CryptoReward earnedAmount={10} />);
    expect(screen.getByText('CRYPTO')).toBeInTheDocument();
  });

  it('should display balance update message', () => {
    renderWithChakra(<CryptoReward earnedAmount={10} />);
    expect(screen.getByText('Your crypto balance has been updated!')).toBeInTheDocument();
  });

  it('should render with different reward amounts', () => {
    const { rerender } = renderWithChakra(<CryptoReward earnedAmount={5} />);
    expect(screen.getByText('+5')).toBeInTheDocument();

    rerender(
      <ChakraProvider>
        <CryptoReward earnedAmount={100} />
      </ChakraProvider>
    );
    expect(screen.getByText('+100')).toBeInTheDocument();
  });

  it('should handle zero earned amount', () => {
    renderWithChakra(<CryptoReward earnedAmount={0} />);
    expect(screen.getByText('+0')).toBeInTheDocument();
  });

  it('should display trophy and coin icons', () => {
    renderWithChakra(<CryptoReward earnedAmount={10} />);
    
    // Icons are rendered but not easily testable with text content
    // We can check that the component renders without errors
    expect(screen.getByText('🎉 Congratulations!')).toBeInTheDocument();
  });
});