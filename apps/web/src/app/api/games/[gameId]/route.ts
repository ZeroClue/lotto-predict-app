import { NextRequest, NextResponse } from 'next/server';
import { GameService } from '../../../../lib/services/gameService';

const gameService = new GameService();

export async function GET(
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

    const game = await gameService.getGameById(gameId);
    
    if (!game) {
      return NextResponse.json({
        success: false,
        error: 'Game not found',
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: game,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching game:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch game',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}