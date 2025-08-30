import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GameService } from '../../../../../lib/services/gameService';

function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

const gameService = new GameService();

export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = params;
    
    if (!gameId) {
      return NextResponse.json({
        success: false,
        error: 'Game ID is required',
      }, { status: 400 });
    }

    // Get user from session
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const supabase = getSupabaseServiceClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid authentication token',
      }, { status: 401 });
    }

    // Complete the game and award crypto
    const result = await gameService.completeGame(gameId, user.id);
    
    // Create response message
    let message = `Congratulations! You earned ${result.earnedAmount} crypto!`;
    if (result.mintedNFTs && result.mintedNFTs.length > 0) {
      message += ` Plus, you earned ${result.mintedNFTs.length} new NFT${result.mintedNFTs.length > 1 ? 's' : ''}!`;
    }
    
    return NextResponse.json({
      success: true,
      data: {
        game: result.game,
        earnedAmount: result.earnedAmount,
        newBalance: result.newBalance.balance,
        mintedNFTs: result.mintedNFTs,
        message,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error completing game:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to complete game',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}