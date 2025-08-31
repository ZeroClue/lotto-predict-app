import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { userRepository } from '@/lib/repositories/userRepository';

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json();
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Basic validation
    if (!email || !password || !username) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }, // Store username in user_metadata
      },
    });

    if (error) {
      console.error('Supabase registration error:', error);
      return NextResponse.json({ message: error.message || 'Registration failed' }, { status: 400 });
    }

    if (!data.user || !data.session) {
      return NextResponse.json({ message: 'Registration failed: No user or session data' }, { status: 400 });
    }

    // Verify that user record was created in our users table (by the database trigger)
    // If not, create it manually as a fallback
    try {
      let userRecord = await userRepository.findByEmail(email);
      
      if (!userRecord) {
        console.log('Database trigger failed, creating user record manually');
        userRecord = await userRepository.create({
          id: data.user.id,
          email: data.user.email,
          username: username,
          provider: 'email'
        });
      }

      // Return user and session token
      return NextResponse.json({
        message: 'User registered successfully',
        user: { 
          id: userRecord.id, 
          email: userRecord.email, 
          username: userRecord.username 
        },
        token: data.session.access_token,
      }, { status: 201 });
    } catch (dbError: any) {
      console.error('Failed to create/verify user record:', dbError);
      // Still return success since auth user was created successfully
      return NextResponse.json({
        message: 'User registered successfully',
        user: { id: data.user.id, email: data.user.email, username: data.user.user_metadata.username },
        token: data.session.access_token,
      }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
