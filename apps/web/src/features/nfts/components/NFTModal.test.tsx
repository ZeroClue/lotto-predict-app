import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import NFTModal from './NFTModal';
import { NFT } from '../../../lib/types';

const mockNFT: NFT = {
  id: 'nft1',
  ownerId: 'user1',
  name: 'Starter Crystal',
  description: 'A glowing crystal awarded for completing your first game',
  imageUrl: '/images/nfts/starter-crystal.png',
  rarity: 'Common',
  mintDate: new Date('2023-12-01'),
  dynamicProperties: { power: 150, element: 'earth' },
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

describe('NFTModal', () => {
  const mockOnClose = jest.fn();
  const mockOnFeatureToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when NFT is null', () => {
    renderWithChakra(
      <NFTModal
        isOpen={true}
        onClose={mockOnClose}
        nft={null}
      />
    );

    expect(screen.queryByText('Starter Crystal')).not.toBeInTheDocument();
  });

  it('should render NFT details correctly', () => {
    renderWithChakra(
      <NFTModal
        isOpen={true}
        onClose={mockOnClose}
        nft={mockNFT}
      />
    );

    expect(screen.getByText('Starter Crystal')).toBeInTheDocument();
    expect(screen.getByText('Common')).toBeInTheDocument();
    expect(screen.getByText('A glowing crystal awarded for completing your first game')).toBeInTheDocument();
    expect(screen.getByText('25 crypto')).toBeInTheDocument();
    expect(screen.getByText('December 1, 2023')).toBeInTheDocument();
  });

  it('should show dynamic properties', () => {
    renderWithChakra(
      <NFTModal
        isOpen={true}
        onClose={mockOnClose}
        nft={mockNFT}
      />
    );

    expect(screen.getByText('Dynamic Properties')).toBeInTheDocument();
    expect(screen.getByText('Power:')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('Element:')).toBeInTheDocument();
    expect(screen.getByText('earth')).toBeInTheDocument();
  });

  it('should handle feature toggle', () => {
    renderWithChakra(
      <NFTModal
        isOpen={true}
        onClose={mockOnClose}
        nft={mockNFT}
        onFeatureToggle={mockOnFeatureToggle}
      />
    );

    const featureButton = screen.getByText('Set as Featured');
    fireEvent.click(featureButton);

    expect(mockOnFeatureToggle).toHaveBeenCalledWith(true);
  });

  it('should show featured badge for featured NFT', () => {
    const featuredNFT = { ...mockNFT, isFeatured: true };
    
    renderWithChakra(
      <NFTModal
        isOpen={true}
        onClose={mockOnClose}
        nft={featuredNFT}
      />
    );

    expect(screen.getByText('Featured NFT')).toBeInTheDocument();
    expect(screen.getByText('Remove from Featured')).toBeInTheDocument();
  });

  it('should handle close button', () => {
    renderWithChakra(
      <NFTModal
        isOpen={true}
        onClose={mockOnClose}
        nft={mockNFT}
      />
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not show feature button when disabled', () => {
    renderWithChakra(
      <NFTModal
        isOpen={true}
        onClose={mockOnClose}
        nft={mockNFT}
        showFeatureButton={false}
      />
    );

    expect(screen.queryByText('Set as Featured')).not.toBeInTheDocument();
  });

  it('should display NFT ID and Owner ID', () => {
    renderWithChakra(
      <NFTModal
        isOpen={true}
        onClose={mockOnClose}
        nft={mockNFT}
      />
    );

    expect(screen.getByText('NFT ID')).toBeInTheDocument();
    expect(screen.getByText('nft1')).toBeInTheDocument();
    expect(screen.getByText('Owner ID')).toBeInTheDocument();
    expect(screen.getByText('user1')).toBeInTheDocument();
  });

  it('should not show dynamic properties section when empty', () => {
    const nftWithoutDynamicProps = { ...mockNFT, dynamicProperties: {} };
    
    renderWithChakra(
      <NFTModal
        isOpen={true}
        onClose={mockOnClose}
        nft={nftWithoutDynamicProps}
      />
    );

    expect(screen.queryByText('Dynamic Properties')).not.toBeInTheDocument();
  });
});