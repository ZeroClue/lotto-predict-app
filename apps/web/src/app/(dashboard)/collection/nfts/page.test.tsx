import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import NFTGalleryPage from './page';
import { NFT } from '../../../../lib/types';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock fetch
global.fetch = jest.fn();

const mockNFTs: NFT[] = [
  {
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
  },
  {
    id: 'nft2',
    ownerId: 'user1',
    name: 'Lucky Coin',
    description: 'A shimmering coin that brings fortune to its holder',
    imageUrl: '/images/nfts/lucky-coin.png',
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

describe('NFTGalleryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
  });

  it('should render loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves to simulate loading
    );

    renderWithChakra(<NFTGalleryPage />);

    expect(screen.getByText('Loading your NFT collection...')).toBeInTheDocument();
  });

  it('should render NFT gallery with NFTs', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        success: true,
        data: mockNFTs,
      }),
    });

    renderWithChakra(<NFTGalleryPage />);

    await waitFor(() => {
      expect(screen.getByText('💎 NFT Gallery')).toBeInTheDocument();
      expect(screen.getByText('Starter Crystal')).toBeInTheDocument();
      expect(screen.getByText('Lucky Coin')).toBeInTheDocument();
    });

    // Check rarity badges
    expect(screen.getByText('Common')).toBeInTheDocument();
    expect(screen.getByText('Rare')).toBeInTheDocument();

    // Check values
    expect(screen.getByText('Value: 25 crypto')).toBeInTheDocument();
    expect(screen.getByText('Value: 50 crypto')).toBeInTheDocument();
  });

  it('should render empty state when no NFTs', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    renderWithChakra(<NFTGalleryPage />);

    await waitFor(() => {
      expect(screen.getByText('No NFTs Yet')).toBeInTheDocument();
      expect(screen.getByText('Start playing games to earn your first NFTs!')).toBeInTheDocument();
      expect(screen.getByText('Play Games')).toBeInTheDocument();
    });
  });

  it('should render error state when fetch fails', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        success: false,
        error: 'Failed to fetch NFTs',
      }),
    });

    renderWithChakra(<NFTGalleryPage />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch NFTs')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('should handle authentication error', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    renderWithChakra(<NFTGalleryPage />);

    await waitFor(() => {
      expect(screen.getByText(/No authentication token found/)).toBeInTheDocument();
    });
  });

  it('should filter NFTs by rarity', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        success: true,
        data: mockNFTs,
      }),
    });

    renderWithChakra(<NFTGalleryPage />);

    await waitFor(() => {
      expect(screen.getByText('Starter Crystal')).toBeInTheDocument();
      expect(screen.getByText('Lucky Coin')).toBeInTheDocument();
    });

    // Select rare filter
    const filterSelect = screen.getByDisplayValue('All (2)');
    fireEvent.change(filterSelect, { target: { value: 'Rare' } });

    // Only rare NFT should be visible
    expect(screen.queryByText('Starter Crystal')).not.toBeInTheDocument();
    expect(screen.getByText('Lucky Coin')).toBeInTheDocument();
  });

  it('should filter featured NFTs', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        success: true,
        data: mockNFTs,
      }),
    });

    renderWithChakra(<NFTGalleryPage />);

    await waitFor(() => {
      expect(screen.getByText('Starter Crystal')).toBeInTheDocument();
      expect(screen.getByText('Lucky Coin')).toBeInTheDocument();
    });

    // Select featured filter
    const filterSelect = screen.getByDisplayValue('All (2)');
    fireEvent.change(filterSelect, { target: { value: 'featured' } });

    // Only featured NFT should be visible
    expect(screen.queryByText('Starter Crystal')).not.toBeInTheDocument();
    expect(screen.getByText('Lucky Coin')).toBeInTheDocument();
  });

  it('should sort NFTs by name', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        success: true,
        data: mockNFTs,
      }),
    });

    renderWithChakra(<NFTGalleryPage />);

    await waitFor(() => {
      expect(screen.getByText('Starter Crystal')).toBeInTheDocument();
      expect(screen.getByText('Lucky Coin')).toBeInTheDocument();
    });

    // Change sort to name
    const sortSelect = screen.getByDisplayValue('Date Added');
    fireEvent.change(sortSelect, { target: { value: 'name' } });

    // NFTs should still be visible (just reordered)
    expect(screen.getByText('Starter Crystal')).toBeInTheDocument();
    expect(screen.getByText('Lucky Coin')).toBeInTheDocument();
  });

  it('should toggle featured status', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: mockNFTs,
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: {
            ...mockNFTs[0],
            isFeatured: true,
          },
        }),
      });

    renderWithChakra(<NFTGalleryPage />);

    await waitFor(() => {
      expect(screen.getByText('Starter Crystal')).toBeInTheDocument();
    });

    // Click feature button for Starter Crystal (not currently featured)
    const featureButtons = screen.getAllByText('Set as Featured');
    fireEvent.click(featureButtons[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/nfts/nft1/feature', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: JSON.stringify({ isFeatured: true }),
      });
    });
  });
});