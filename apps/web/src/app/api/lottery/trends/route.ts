import { NextRequest, NextResponse } from 'next/server';
import { lotteryAnalyticsService, AnalyticsFilters, NumberTrend } from '../../../../lib/services/lotteryAnalyticsService';

export interface TrendAnalysisResponse {
  trends: NumberTrend[];
  metadata: {
    filters: AnalyticsFilters;
    totalNumbers: number;
    analysisDate: Date;
    periodLength: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filter parameters
    const lotteryName = searchParams.get('lotteryName') || undefined;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const periodLength = searchParams.get('periodLength');
    const limit = searchParams.get('limit');
    const trendType = searchParams.get('trendType'); // 'increasing', 'decreasing', 'stable', or 'all'

    // Build analytics filters
    const filters: AnalyticsFilters = {};
    
    if (lotteryName) {
      filters.lotteryName = lotteryName;
    }
    
    if (startDate && endDate) {
      filters.dateRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
    }
    
    if (periodLength) {
      const parsed = parseInt(periodLength, 10);
      if (!isNaN(parsed) && parsed > 0) {
        filters.periodLength = parsed;
      }
    }

    // Get full analytics (we need this to get trend data)
    const analytics = await lotteryAnalyticsService.getAdvancedAnalytics(filters);
    
    let trends = analytics.trendAnalysis;

    // Filter by trend type if specified
    if (trendType && trendType !== 'all') {
      trends = trends.filter(trend => trend.overallTrend === trendType);
    }

    // Apply limit if specified
    if (limit) {
      const parsed = parseInt(limit, 10);
      if (!isNaN(parsed) && parsed > 0) {
        trends = trends.slice(0, parsed);
      }
    }

    const response: TrendAnalysisResponse = {
      trends,
      metadata: {
        filters,
        totalNumbers: analytics.trendAnalysis.length,
        analysisDate: new Date(),
        periodLength: filters.periodLength || 30, // Default from service
      },
    };

    return NextResponse.json({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error('Trend analysis API error:', error);
    
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