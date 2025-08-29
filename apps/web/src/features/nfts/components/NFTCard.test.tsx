import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import NFTCard from './NFTCard';
import { NFT } from '../../../lib/types';

const mockNFT: NFT = {
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

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('NFTCard', () => {
  const mockOnFeatureToggle = jest.fn();
  const mockOnDetailsClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render NFT information correctly', () => {
    renderWithChakra(
      <NFTCard nft={mockNFT} />
    );

    expect(screen.getByText('Starter Crystal')).toBeInTheDocument();
    expect(screen.getByText('A glowing crystal awarded for completing your first game')).toBeInTheDocument();
    expect(screen.getByText('Common')).toBeInTheDocument();
    expect(screen.getByText('Value: 25 crypto')).toBeInTheDocument();
    expect(screen.getByText('12/1/2023')).toBeInTheDocument();
  });

  it('should render compact mode correctly', () => {
    renderWithChakra(
      <NFTCard nft={mockNFT} isCompact={true} />
    );

    expect(screen.getByText('Starter Crystal')).toBeInTheDocument();
    expect(screen.getByText('Common')).toBeInTheDocument();
    expect(screen.getByText('Value: 25 crypto')).toBeInTheDocument();
    // Description and date should not be shown in compact mode
    expect(screen.queryByText('A glowing crystal awarded for completing your first game')).not.toBeInTheDocument();
    expect(screen.queryByText('12/1/2023')).not.toBeInTheDocument();
  });

  it('should show featured badge when NFT is featured', () => {
    const featuredNFT = { ...mockNFT, isFeatured: true };
    
    renderWithChakra(
      <NFTCard nft={featuredNFT} />
    );

    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('should handle feature toggle', () => {
    renderWithChakra(
      <NFTCard 
        nft={mockNFT} 
        onFeatureToggle={mockOnFeatureToggle}
      />
    );

    const featureButton = screen.getByText('Set Featured');
    fireEvent.click(featureButton);

    expect(mockOnFeatureToggle).toHaveBeenCalledWith(true);
  });

  it('should handle details click', () => {
    renderWithChakra(
      <NFTCard 
        nft={mockNFT} 
        onDetailsClick={mockOnDetailsClick}
      />
    );

    const card = screen.getByRole('img').closest('[role="img"]')?.parentElement?.parentElement?.parentElement;
    if (card) {
      fireEvent.click(card);
    }

    expect(mockOnDetailsClick).toHaveBeenCalled();
  });

  it('should not show feature button when disabled', () => {
    renderWithChakra(
      <NFTCard 
        nft={mockNFT} 
        showFeatureButton={false}
      />
    );

    expect(screen.queryByText('Set Featured')).not.toBeInTheDocument();
  });

  it('should prevent event propagation on feature button click', () => {
    renderWithChakra(
      <NFTCard 
        nft={mockNFT} 
        onFeatureToggle={mockOnFeatureToggle}
        onDetailsClick={mockOnDetailsClick}
      />
    );

    const featureButton = screen.getByText('Set Featured');
    fireEvent.click(featureButton);

    expect(mockOnFeatureToggle).toHaveBeenCalled();
    expect(mockOnDetailsClick).not.toHaveBeenCalled();
  });

  it('should render different rarity colors', () => {
    const { rerender } = renderWithChakra(
      <NFTCard nft={{ ...mockNFT, rarity: 'Rare' }} />
    );

    expect(screen.getByText('Rare')).toBeInTheDocument();

    rerender(
      <ChakraProvider>
        <NFTCard nft={{ ...mockNFT, rarity: 'Legendary' }} />
      </ChakraProvider>
    );

    expect(screen.getByText('Legendary')).toBeInTheDocument();
  });

  it('should handle image fallback', () => {
    renderWithChakra(
      <NFTCard nft={{ ...mockNFT, imageUrl: '' }} />
    );

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
  });

  it('should show correct button text for featured NFT', () => {
    const featuredNFT = { ...mockNFT, isFeatured: true };
    
    renderWithChakra(
      <NFTCard 
        nft={featuredNFT} 
        onFeatureToggle={mockOnFeatureToggle}
      />
    );

    const featureButton = screen.getByText('Featured');
    fireEvent.click(featureButton);

    expect(mockOnFeatureToggle).toHaveBeenCalledWith(false);
  });
});