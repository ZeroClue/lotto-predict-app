import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GameService } from '../../../../lib/services/gameService';

function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

const gameService = new GameService();

export async function GET(request: NextRequest) {
  try {
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

    // Get user's crypto balance
    const balance = await gameService.getUserBalance(user.id);
    
    return NextResponse.json({
      success: true,
      data: balance,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching crypto balance:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch crypto balance',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}