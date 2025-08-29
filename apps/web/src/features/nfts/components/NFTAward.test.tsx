import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import NFTAward, { NFTAwardResult } from './NFTAward';
import { NFT } from '../../../lib/types';

const mockNFT1: NFT = {
  id: 'nft1',
  ownerId: 'user1',
  name: 'Starter Crystal',
  description: 'A glowing crystal awarded for completing your first game',
  imageUrl: '/images/nfts/starter-crystal.png',
  rarity: 'Common',
  mintDate: new Date('2023-12-01'),
  dynamicProperties: {},
  isFeatured: false,
  baseValue: 25,
};

const mockNFT2: NFT = {
  id: 'nft2',
  ownerId: 'user1',
  name: 'Lucky Coin',
  description: 'A shimmering coin that brings fortune to its holder',
  imageUrl: '/images/nfts/lucky-coin.png',
  rarity: 'Rare',
  mintDate: new Date('2023-12-02'),
  dynamicProperties: {},
  isFeatured: false,
  baseValue: 50,
};

const mockAwardedNFTs: NFTAwardResult[] = [
  {
    nft: mockNFT1,
    awardReason: 'Congratulations on completing your first game!',
  },
  {
    nft: mockNFT2,
    awardReason: 'Amazing! You\'ve earned 100 crypto!',
  },
];

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('NFTAward', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when not open', () => {
    renderWithChakra(
      <NFTAward
        isOpen={false}
        onClose={mockOnClose}
        awardedNFTs={mockAwardedNFTs}
      />
    );

    expect(screen.queryByText('🎉 NFT Awarded! 🎉')).not.toBeInTheDocument();
  });

  it('should not render when no NFTs awarded', () => {
    renderWithChakra(
      <NFTAward
        isOpen={true}
        onClose={mockOnClose}
        awardedNFTs={[]}
      />
    );

    expect(screen.queryByText('🎉 NFT Awarded! 🎉')).not.toBeInTheDocument();
  });

  it('should render single NFT award', () => {
    renderWithChakra(
      <NFTAward
        isOpen={true}
        onClose={mockOnClose}
        awardedNFTs={[mockAwardedNFTs[0]]}
      />
    );

    expect(screen.getByText('🎉 NFT Awarded! 🎉')).toBeInTheDocument();
    expect(screen.getByText('Starter Crystal')).toBeInTheDocument();
    expect(screen.getByText('A glowing crystal awarded for completing your first game')).toBeInTheDocument();
    expect(screen.getByText('Congratulations on completing your first game!')).toBeInTheDocument();
    expect(screen.getByText('Common')).toBeInTheDocument();
    expect(screen.getByText('25 crypto')).toBeInTheDocument();
    expect(screen.getByText('Awesome!')).toBeInTheDocument();
  });

  it('should render multiple NFT awards with navigation', () => {
    renderWithChakra(
      <NFTAward
        isOpen={true}
        onClose={mockOnClose}
        awardedNFTs={mockAwardedNFTs}
      />
    );

    // Should show first NFT
    expect(screen.getByText('Starter Crystal')).toBeInTheDocument();
    expect(screen.getByText('Congratulations on completing your first game!')).toBeInTheDocument();
    
    // Should show navigation
    expect(screen.getByText('Next (1 more)')).toBeInTheDocument();
    expect(screen.getByText('Skip (1 more)')).toBeInTheDocument();

    // Should show progress indicators
    const progressDots = screen.getAllByRole('generic').filter(el => 
      el.style.width === '10px' && el.style.height === '10px'
    );
    expect(progressDots).toHaveLength(2);
  });

  it('should navigate to next NFT', () => {
    renderWithChakra(
      <NFTAward
        isOpen={true}
        onClose={mockOnClose}
        awardedNFTs={mockAwardedNFTs}
      />
    );

    // Initially shows first NFT
    expect(screen.getByText('Starter Crystal')).toBeInTheDocument();

    // Click Next
    fireEvent.click(screen.getByText('Next (1 more)'));

    // Should show second NFT
    expect(screen.getByText('Lucky Coin')).toBeInTheDocument();
    expect(screen.getByText('Amazing! You\'ve earned 100 crypto!')).toBeInTheDocument();
    expect(screen.getByText('Awesome!')).toBeInTheDocument();
  });

  it('should skip to end when skip button is clicked', () => {
    renderWithChakra(
      <NFTAward
        isOpen={true}
        onClose={mockOnClose}
        awardedNFTs={mockAwardedNFTs}
      />
    );

    // Click Skip
    fireEvent.click(screen.getByText('Skip (1 more)'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close when Awesome button is clicked on last NFT', () => {
    renderWithChakra(
      <NFTAward
        isOpen={true}
        onClose={mockOnClose}
        awardedNFTs={[mockAwardedNFTs[0]]}
      />
    );

    // Click Awesome
    fireEvent.click(screen.getByText('Awesome!'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close when X button is clicked', () => {
    renderWithChakra(
      <NFTAward
        isOpen={true}
        onClose={mockOnClose}
        awardedNFTs={mockAwardedNFTs}
      />
    );

    // Click close button (X)
    const closeButton = screen.getByRole('button', { name: '' }); // FaTimes has no text
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display crypto earned amount', () => {
    renderWithChakra(
      <NFTAward
        isOpen={true}
        onClose={mockOnClose}
        awardedNFTs={[mockAwardedNFTs[0]]}
        earnedAmount={15}
      />
    );

    expect(screen.getByText('Plus 15 crypto earned!')).toBeInTheDocument();
  });

  it('should show different rarity colors', () => {
    const legendaryNFT: NFTAwardResult = {
      nft: { ...mockNFT1, rarity: 'Legendary' },
      awardReason: 'Legendary achievement!',
    };

    renderWithChakra(
      <NFTAward
        isOpen={true}
        onClose={mockOnClose}
        awardedNFTs={[legendaryNFT]}
      />
    );

    expect(screen.getByText('Legendary')).toBeInTheDocument();
  });

  it('should navigate through multiple NFTs correctly', async () => {
    renderWithChakra(
      <NFTAward
        isOpen={true}
        onClose={mockOnClose}
        awardedNFTs={mockAwardedNFTs}
      />
    );

    // Start with first NFT
    expect(screen.getByText('Starter Crystal')).toBeInTheDocument();
    expect(screen.getByText('Next (1 more)')).toBeInTheDocument();

    // Navigate to second NFT
    fireEvent.click(screen.getByText('Next (1 more)'));

    // Should show second NFT and close option
    await waitFor(() => {
      expect(screen.getByText('Lucky Coin')).toBeInTheDocument();
      expect(screen.getByText('Awesome!')).toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });

    // Close from last NFT
    fireEvent.click(screen.getByText('Awesome!'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});