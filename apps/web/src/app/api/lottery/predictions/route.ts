import { NextRequest, NextResponse } from 'next/server';
import { lotteryDataService } from '../../../../lib/services/lotteryDataService';
import { lotteryAnalyticsService, AnalyticsFilters } from '../../../../lib/services/lotteryAnalyticsService';

export interface EnhancedPredictionsResponse {
  predictions: any; // From existing lotteryDataService
  analytics: {
    frequencyAnalysis: any[];
    hotColdAnalysis: any;
    basicTrends?: any[]; // Optional basic trend data
  };
  metadata: {
    filters: AnalyticsFilters;
    generatedAt: Date;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse existing and new parameters
    const lotteryName = searchParams.get('lotteryName') || undefined;
    
    // New filter parameters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeAnalytics = searchParams.get('includeAnalytics') !== 'false'; // Default to true
    const includeTrends = searchParams.get('includeTrends') === 'true'; // Default to false for performance
    const periodLength = searchParams.get('periodLength');

    // Build analytics filters
    const analyticsFilters: AnalyticsFilters = {};
    
    if (lotteryName) {
      analyticsFilters.lotteryName = lotteryName;
    }
    
    if (startDate && endDate) {
      analyticsFilters.dateRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
    }
    
    if (periodLength) {
      const parsed = parseInt(periodLength, 10);
      if (!isNaN(parsed) && parsed > 0) {
        analyticsFilters.periodLength = parsed;
      }
    }

    // Generate basic predictions (existing functionality)
    const predictions = await lotteryDataService.generatePredictions(lotteryName);

    let analyticsData;
    if (includeAnalytics) {
      // Get enhanced analytics data
      const fullAnalytics = await lotteryAnalyticsService.getAdvancedAnalytics(analyticsFilters);
      
      analyticsData = {
        frequencyAnalysis: fullAnalytics.frequencyAnalysis,
        hotColdAnalysis: fullAnalytics.hotColdAnalysis,
        ...(includeTrends && { basicTrends: fullAnalytics.trendAnalysis.slice(0, 20) }), // Limit trends for performance
      };
    }

    // For backward compatibility, return the predictions directly
    // The enhanced response structure is available but the frontend expects the basic structure
    return NextResponse.json({
      success: true,
      data: predictions, // Return predictions directly to match frontend expectations
    });
  } catch (error) {
    console.error('Error generating enhanced lottery predictions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate enhanced predictions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}