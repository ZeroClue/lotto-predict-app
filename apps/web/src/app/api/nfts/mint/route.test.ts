import { POST } from './route';
import { NFTService } from '../../../../lib/services/nftService';
import { tokenService } from '../../../../lib/services/tokenService';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies
jest.mock('../../../../lib/services/nftService');
jest.mock('../../../../lib/services/tokenService');

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

describe('POST /api/nfts/mint', () => {
  const mockNFTService = NFTService as jest.MockedClass<typeof NFTService>;
  let mockNFTServiceInstance: jest.Mocked<NFTService>;
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();

    mockNFTServiceInstance = {
      mintNFT: jest.fn(),
    } as any;

    mockNFTService.mockImplementation(() => mockNFTServiceInstance);

    mockRequest = {
      headers: new Headers(),
      json: jest.fn(),
    } as any;
  });

  it('should mint NFT successfully', async () => {
    const userId = 'user123';
    const token = 'valid-token';
    const templateId = 'starter-crystal';
    const requestBody = { templateId, reason: 'Test mint' };
    
    const mockMintResult = {
      nft: {
        id: 'nft1',
        ownerId: userId,
        name: 'Starter Crystal',
        imageUrl: '/images/starter.png',
        rarity: 'Common',
        baseValue: 25,
        isFeatured: false,
        mintDate: new Date(),
      },
      awardReason: 'Test mint',
    };

    (tokenService.extractToken as jest.Mock).mockReturnValue(token);
    (tokenService.validateToken as jest.Mock).mockResolvedValue(userId);
    mockRequest.json = jest.fn().mockResolvedValue(requestBody);
    mockNFTServiceInstance.mintNFT.mockResolvedValue(mockMintResult as any);

    const response = await POST(mockRequest);

    expect(tokenService.extractToken).toHaveBeenCalledWith(mockRequest);
    expect(tokenService.validateToken).toHaveBeenCalledWith(token);
    expect(mockRequest.json).toHaveBeenCalled();
    expect(mockNFTServiceInstance.mintNFT).toHaveBeenCalledWith(templateId, userId, 'Test mint');
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        success: true,
        data: mockMintResult,
      },
      { status: 201 }
    );
  });

  it('should return 401 if no token provided', async () => {
    (tokenService.extractToken as jest.Mock).mockReturnValue(null);

    const response = await POST(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        success: false,
        error: 'Authentication required',
      },
      { status: 401 }
    );
  });

  it('should return 400 if templateId is missing', async () => {
    const userId = 'user123';
    const token = 'valid-token';
    const requestBody = {}; // Missing templateId

    (tokenService.extractToken as jest.Mock).mockReturnValue(token);
    (tokenService.validateToken as jest.Mock).mockResolvedValue(userId);
    mockRequest.json = jest.fn().mockResolvedValue(requestBody);

    const response = await POST(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        success: false,
        error: 'Template ID is required',
      },
      { status: 400 }
    );
  });

  it('should use default reason if not provided', async () => {
    const userId = 'user123';
    const token = 'valid-token';
    const templateId = 'starter-crystal';
    const requestBody = { templateId }; // No reason provided

    const mockMintResult = {
      nft: {
        id: 'nft1',
        ownerId: userId,
        name: 'Starter Crystal',
        imageUrl: '/images/starter.png',
        rarity: 'Common',
        baseValue: 25,
        isFeatured: false,
        mintDate: new Date(),
      },
      awardReason: 'Manual mint',
    };

    (tokenService.extractToken as jest.Mock).mockReturnValue(token);
    (tokenService.validateToken as jest.Mock).mockResolvedValue(userId);
    mockRequest.json = jest.fn().mockResolvedValue(requestBody);
    mockNFTServiceInstance.mintNFT.mockResolvedValue(mockMintResult as any);

    const response = await POST(mockRequest);

    expect(mockNFTServiceInstance.mintNFT).toHaveBeenCalledWith(templateId, userId, 'Manual mint');
  });

  it('should handle service errors', async () => {
    const userId = 'user123';
    const token = 'valid-token';
    const templateId = 'starter-crystal';
    const requestBody = { templateId };

    (tokenService.extractToken as jest.Mock).mockReturnValue(token);
    (tokenService.validateToken as jest.Mock).mockResolvedValue(userId);
    mockRequest.json = jest.fn().mockResolvedValue(requestBody);
    mockNFTServiceInstance.mintNFT.mockRejectedValue(new Error('Template not found'));

    const response = await POST(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        success: false,
        error: 'Failed to mint NFT',
        message: 'Template not found',
      },
      { status: 500 }
    );
  });
});