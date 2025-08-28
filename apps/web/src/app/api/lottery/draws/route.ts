import { NextRequest, NextResponse } from 'next/server';
import { lotteryDataService } from '../../../../lib/services/lotteryDataService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const lotteryName = searchParams.get('lotteryName') || undefined;

    let draws;
    if (lotteryName) {
      draws = await lotteryDataService.getDrawsByLottery(lotteryName, limit);
    } else {
      draws = await lotteryDataService.getRecentDraws(limit);
    }

    return NextResponse.json({
      success: true,
      data: draws,
      count: draws.length,
    });
  } catch (error) {
    console.error('Error fetching lottery draws:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch lottery draws',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}