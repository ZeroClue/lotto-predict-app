import { NextRequest, NextResponse } from 'next/server';
import { NFTService } from '../../../../lib/services/nftService';
import { tokenService } from '../../../../lib/services/tokenService';

const nftService = new NFTService();

export async function GET(
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

    // Get specific NFT
    const nft = await nftService.getNFTById(params.nftId, userId);
    
    if (!nft) {
      return NextResponse.json({
        success: false,
        error: 'NFT not found',
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: nft,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching NFT details:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch NFT details',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}