import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase login error:', error);
      return NextResponse.json({ message: error.message || 'Invalid credentials' }, { status: 401 });
    }

    if (!data.user || !data.session) {
      return NextResponse.json({ message: 'Login failed: No user or session data' }, { status: 401 });
    }

    // Return user and session token
    return NextResponse.json({
      message: 'User logged in successfully',
      user: { id: data.user.id, email: data.user.email }, // Only return necessary user info
      token: data.session.access_token,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
