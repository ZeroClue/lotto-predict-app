import { NextRequest, NextResponse } from 'next/server';
import { GameService } from '../../../lib/services/gameService';

const gameService = new GameService();

export async function GET(request: NextRequest) {
  try {
    const games = await gameService.getActiveGames();
    
    return NextResponse.json({
      success: true,
      data: games,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching games:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch games',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}