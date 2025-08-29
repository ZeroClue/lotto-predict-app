import { NextRequest, NextResponse } from 'next/server';
import { NFTService } from '../../../../../lib/services/nftService';
import { tokenService } from '../../../../../lib/services/tokenService';

const nftService = new NFTService();

interface FeatureNFTRequest {
  isFeatured: boolean;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { nftId: string } }
) {
  try {
    // Verify authentication and get user ID
    const token = tokenService.extractToken(request);
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const userId = await tokenService.validateToken(token);
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired token',
      }, { status: 401 });
    }

    // Parse request body
    const body: FeatureNFTRequest = await request.json();
    
    if (typeof body.isFeatured !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: 'isFeatured must be a boolean value',
      }, { status: 400 });
    }

    // Update NFT featured status
    const nft = await nftService.setNFTFeatured(params.nftId, userId, body.isFeatured);
    
    return NextResponse.json({
      success: true,
      data: nft,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating NFT featured status:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update NFT featured status',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}