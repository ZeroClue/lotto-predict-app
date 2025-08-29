import { NextRequest, NextResponse } from 'next/server';
import { NFTService } from '../../../../lib/services/nftService';
import { tokenService } from '../../../../lib/services/tokenService';

const nftService = new NFTService();

interface MintNFTRequest {
  templateId: string;
  reason?: string;
}

export async function POST(request: NextRequest) {
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
    const body: MintNFTRequest = await request.json();
    
    if (!body.templateId) {
      return NextResponse.json({
        success: false,
        error: 'Template ID is required',
      }, { status: 400 });
    }

    // Mint NFT
    const result = await nftService.mintNFT(
      body.templateId,
      userId,
      body.reason || 'Manual mint'
    );
    
    return NextResponse.json({
      success: true,
      data: result,
    }, { status: 201 });
  } catch (error) {
    console.error('Error minting NFT:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to mint NFT',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}