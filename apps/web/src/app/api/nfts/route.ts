import { NextRequest, NextResponse } from 'next/server';
import { NFTService } from '../../../lib/services/nftService';
import { tokenService } from '../../../lib/services/tokenService';

const nftService = new NFTService();

export async function GET(request: NextRequest) {
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

    // Get user's NFTs
    const nfts = await nftService.getUserNFTs(userId);
    
    return NextResponse.json({
      success: true,
      data: nfts,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user NFTs:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch NFTs',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}