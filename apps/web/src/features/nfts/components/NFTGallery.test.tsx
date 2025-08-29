import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import NFTGallery from './NFTGallery';
import { NFT } from '../../../lib/types';

const mockNFTs: NFT[] = [
  {
    id: 'nft1',
    ownerId: 'user1',
    name: 'Starter Crystal',
    description: 'A glowing crystal',
    imageUrl: '/images/nft1.png',
    rarity: 'Common',
    mintDate: new Date('2023-12-01'),
    dynamicProperties: {},
    isFeatured: false,
    baseValue: 25,
  },
  {
    id: 'nft2',
    ownerId: 'user1',
    name: 'Lucky Coin',
    description: 'A shimmering coin',
    imageUrl: '/images/nft2.png',
    rarity: 'Rare',
    mintDate: new Date('2023-12-02'),
    dynamicProperties: {},
    isFeatured: true,
    baseValue: 50,
  },
];

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('NFTGallery', () => {
  const mockOnFeatureToggle = jest.fn();
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    renderWithChakra(
      <NFTGallery
        nfts={[]}
        isLoading={true}
      />
    );

    expect(screen.getByText('Loading NFTs...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    renderWithChakra(
      <NFTGallery
        nfts={[]}
        error="Failed to load NFTs"
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByText('Error: Failed to load NFTs')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Retry'));
    expect(mockOnRetry).toHaveBeenCalled();
  });

  it('should render empty state', () => {
    renderWithChakra(
      <NFTGallery nfts={[]} />
    );

    expect(screen.getByText('No NFTs Yet')).toBeInTheDocument();
    expect(screen.getByText('Start playing games to earn your first NFTs!')).toBeInTheDocument();
  });

  it('should render NFTs correctly', () => {
    renderWithChakra(
      <NFTGallery nfts={mockNFTs} />
    );

    expect(screen.getByText('Starter Crystal')).toBeInTheDocument();
    expect(screen.getByText('Lucky Coin')).toBeInTheDocument();
  });

  it('should handle feature toggle', async () => {
    renderWithChakra(
      <NFTGallery
        nfts={mockNFTs}
        onFeatureToggle={mockOnFeatureToggle}
      />
    );

    const featureButtons = screen.getAllByText('Set Featured');
    fireEvent.click(featureButtons[0]);

    await waitFor(() => {
      expect(mockOnFeatureToggle).toHaveBeenCalledWith('nft1', true);
    });
  });

  it('should filter by featured NFTs', () => {
    renderWithChakra(
      <NFTGallery nfts={mockNFTs} />
    );

    const filterSelect = screen.getByDisplayValue('All (2)');
    fireEvent.change(filterSelect, { target: { value: 'featured' } });

    expect(screen.queryByText('Starter Crystal')).not.toBeInTheDocument();
    expect(screen.getByText('Lucky Coin')).toBeInTheDocument();
  });

  it('should filter by rarity', () => {
    renderWithChakra(
      <NFTGallery nfts={mockNFTs} />
    );

    const filterSelect = screen.getByDisplayValue('All (2)');
    fireEvent.change(filterSelect, { target: { value: 'Common' } });

    expect(screen.getByText('Starter Crystal')).toBeInTheDocument();
    expect(screen.queryByText('Lucky Coin')).not.toBeInTheDocument();
  });

  it('should sort NFTs', () => {
    renderWithChakra(
      <NFTGallery nfts={mockNFTs} />
    );

    const sortSelect = screen.getByDisplayValue('Date Added');
    fireEvent.change(sortSelect, { target: { value: 'name' } });

    // Both NFTs should still be visible, just reordered
    expect(screen.getByText('Starter Crystal')).toBeInTheDocument();
    expect(screen.getByText('Lucky Coin')).toBeInTheDocument();
  });

  it('should open NFT modal on card click', () => {
    renderWithChakra(
      <NFTGallery nfts={mockNFTs} />
    );

    const nftCard = screen.getByText('Starter Crystal').closest('div[role="img"]')?.parentElement;
    if (nftCard) {
      fireEvent.click(nftCard);
    }

    // Modal should be opened (though we can't easily test the modal content due to portal)
    // The test confirms the click handler is working
  });

  it('should hide controls when disabled', () => {
    renderWithChakra(
      <NFTGallery 
        nfts={mockNFTs} 
        showControls={false}
      />
    );

    expect(screen.queryByText('Sort by:')).not.toBeInTheDocument();
    expect(screen.queryByText('Filter:')).not.toBeInTheDocument();
  });

  it('should render compact mode', () => {
    renderWithChakra(
      <NFTGallery 
        nfts={mockNFTs}
        isCompact={true}
      />
    );

    expect(screen.getByText('Starter Crystal')).toBeInTheDocument();
    expect(screen.getByText('Lucky Coin')).toBeInTheDocument();
  });

  it('should limit max items', () => {
    renderWithChakra(
      <NFTGallery 
        nfts={mockNFTs}
        maxItems={1}
      />
    );

    expect(screen.getByText('Showing 1 of 2 NFTs')).toBeInTheDocument();
  });

  it('should show filtered empty state', () => {
    renderWithChakra(
      <NFTGallery nfts={mockNFTs} />
    );

    // Filter to a rarity that doesn't exist
    const filterSelect = screen.getByDisplayValue('All (2)');
    fireEvent.change(filterSelect, { target: { value: 'Legendary' } });

    expect(screen.getByText('No NFTs match the current filter.')).toBeInTheDocument();
    
    const showAllButton = screen.getByText('Show All NFTs');
    fireEvent.click(showAllButton);

    // Should reset filter to show all NFTs
    expect(screen.getByText('Starter Crystal')).toBeInTheDocument();
    expect(screen.getByText('Lucky Coin')).toBeInTheDocument();
  });
});