import { NextRequest, NextResponse } from 'next/server';
import { lotteryDataService } from '../../../../lib/services/lotteryDataService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lotteryName = searchParams.get('lotteryName') || undefined;

    const predictions = await lotteryDataService.generatePredictions(lotteryName);

    return NextResponse.json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    console.error('Error generating lottery predictions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate predictions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}