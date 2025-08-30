import { NextRequest, NextResponse } from 'next/server';
import { lotteryAnalyticsService, AnalyticsFilters } from '../../../../lib/services/lotteryAnalyticsService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters from query parameters
    const filters: AnalyticsFilters = {};
    
    // Lottery name filter
    const lotteryName = searchParams.get('lotteryName');
    if (lotteryName) {
      filters.lotteryName = lotteryName;
    }
    
    // Date range filter
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate && endDate) {
      filters.dateRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
    }
    
    // Analysis type filter
    const analysisType = searchParams.get('analysisType');
    if (analysisType && ['frequency', 'trends', 'hot-cold', 'all'].includes(analysisType)) {
      filters.analysisType = analysisType as AnalyticsFilters['analysisType'];
    }
    
    // Period length for trend analysis
    const periodLength = searchParams.get('periodLength');
    if (periodLength) {
      const parsed = parseInt(periodLength, 10);
      if (!isNaN(parsed) && parsed > 0) {
        filters.periodLength = parsed;
      }
    }

    // Get analytics data
    const analytics = await lotteryAnalyticsService.getAdvancedAnalytics(filters);

    return NextResponse.json({
      success: true,
      data: analytics,
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}