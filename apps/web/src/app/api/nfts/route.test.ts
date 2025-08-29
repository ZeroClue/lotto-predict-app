import { GET } from './route';
import { NFTService } from '../../../lib/services/nftService';
import { tokenService } from '../../../lib/services/tokenService';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies
jest.mock('../../../lib/services/nftService');
jest.mock('../../../lib/services/tokenService');

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
    })),
  },
}));

describe('GET /api/nfts', () => {
  const mockNFTService = NFTService as jest.MockedClass<typeof NFTService>;
  let mockNFTServiceInstance: jest.Mocked<NFTService>;
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();

    mockNFTServiceInstance = {
      getUserNFTs: jest.fn(),
    } as any;

    mockNFTService.mockImplementation(() => mockNFTServiceInstance);

    mockRequest = {
      headers: new Headers(),
    } as any;
  });

  it('should return user NFTs successfully', async () => {
    const userId = 'user123';
    const token = 'valid-token';
    const mockNFTs = [
      {
        id: 'nft1',
        ownerId: userId,
        name: 'Starter Crystal',
        imageUrl: '/images/starter.png',
        rarity: 'Common',
        baseValue: 25,
        isFeatured: false,
        mintDate: new Date(),
      },
    ];

    (tokenService.extractToken as jest.Mock).mockReturnValue(token);
    (tokenService.validateToken as jest.Mock).mockResolvedValue(userId);
    mockNFTServiceInstance.getUserNFTs.mockResolvedValue(mockNFTs as any);

    const response = await GET(mockRequest);

    expect(tokenService.extractToken).toHaveBeenCalledWith(mockRequest);
    expect(tokenService.validateToken).toHaveBeenCalledWith(token);
    expect(mockNFTServiceInstance.getUserNFTs).toHaveBeenCalledWith(userId);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        success: true,
        data: mockNFTs,
      },
      { status: 200 }
    );
  });

  it('should return 401 if no token provided', async () => {
    (tokenService.extractToken as jest.Mock).mockReturnValue(null);

    const response = await GET(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        success: false,
        error: 'Authentication required',
      },
      { status: 401 }
    );
  });

  it('should return 401 if token is invalid', async () => {
    const token = 'invalid-token';

    (tokenService.extractToken as jest.Mock).mockReturnValue(token);
    (tokenService.validateToken as jest.Mock).mockResolvedValue(null);

    const response = await GET(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        success: false,
        error: 'Invalid or expired token',
      },
      { status: 401 }
    );
  });

  it('should handle service errors', async () => {
    const userId = 'user123';
    const token = 'valid-token';

    (tokenService.extractToken as jest.Mock).mockReturnValue(token);
    (tokenService.validateToken as jest.Mock).mockResolvedValue(userId);
    mockNFTServiceInstance.getUserNFTs.mockRejectedValue(new Error('Database error'));

    const response = await GET(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        success: false,
        error: 'Failed to fetch NFTs',
        message: 'Database error',
      },
      { status: 500 }
    );
  });
});