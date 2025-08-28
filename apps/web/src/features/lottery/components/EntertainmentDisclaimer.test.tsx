import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { EntertainmentDisclaimer } from './EntertainmentDisclaimer';

describe('EntertainmentDisclaimer', () => {
  const renderWithChakra = (component: React.ReactElement) => {
    return render(<ChakraProvider>{component}</ChakraProvider>);
  };

  it('renders entertainment disclaimer message', () => {
    renderWithChakra(<EntertainmentDisclaimer />);

    expect(screen.getByText('For Entertainment Only')).toBeInTheDocument();
    expect(screen.getByText(/These predictions are generated for entertainment purposes only/)).toBeInTheDocument();
    expect(screen.getByText(/Lottery games are games of chance/)).toBeInTheDocument();
    expect(screen.getByText(/Please play responsibly/)).toBeInTheDocument();
  });

  it('displays warning alert status', () => {
    renderWithChakra(<EntertainmentDisclaimer />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('data-status', 'warning');
  });
});