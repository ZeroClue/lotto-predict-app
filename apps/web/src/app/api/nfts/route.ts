import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NFTService } from '../../../lib/services/nftService';

function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

const nftService = new NFTService();

export async function GET(request: NextRequest) {
  try {
    // Try both authentication methods - Bearer token and cookies
    let user = null;
    let authError = null;

    // First try Bearer token authentication
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const supabaseService = getSupabaseServiceClient();
      const { data: { user: tokenUser }, error: tokenError } = await supabaseService.auth.getUser(token);
      if (!tokenError && tokenUser) {
        user = tokenUser;
      } else {
        authError = tokenError;
      }
    }

    // If Bearer token failed, try cookie-based authentication
    if (!user) {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser();
      if (!cookieError && cookieUser) {
        user = cookieUser;
      } else {
        authError = cookieError;
      }
    }
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid authentication token',
        debug: authError?.message,
      }, { status: 401 });
    }

    // Get user's NFTs
    const nfts = await nftService.getUserNFTs(user.id);
    
    return NextResponse.json({
      success: true,
      data: nfts,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user NFTs:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch NFTs',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}