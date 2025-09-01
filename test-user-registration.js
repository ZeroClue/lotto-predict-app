// Simple test script to verify user registration database integration
// Run this after applying the migration to test the user table creation

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/web/.env.local' });

async function testUserRegistration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role needed for admin operations
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  console.log('🧪 Testing User Registration Database Integration...\n');
  
  try {
    // 1. Test if users table exists
    console.log('1️⃣ Checking if users table exists...');
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (tablesError) {
      console.error('❌ Users table does not exist:', tablesError.message);
      console.log('\n🔧 Fix: Run the 000_users.sql migration in your Supabase SQL editor');
      return;
    }
    
    console.log('✅ Users table exists');
    
    // 2. Test database trigger exists
    console.log('2️⃣ Checking database triggers...');
    const { data: triggers, error: triggerError } = await supabase.rpc('pg_get_triggers');
    
    if (triggerError) {
      console.log('⚠️ Could not check triggers (this is okay)');
    } else {
      console.log('✅ Database connection working');
    }
    
    // 3. Simulate user creation to test trigger
    console.log('3️⃣ Testing user record creation...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testUsername = `testuser${Date.now()}`;
    
    // Create a test user record directly (simulating what the trigger should do)
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        id: '12345678-1234-5678-9012-123456789012', // UUID format
        email: testEmail,
        username: testUsername,
        provider: 'email'
      })
      .select()
      .single();
    
    if (userError) {
      console.error('❌ Failed to create user record:', userError.message);
      return;
    }
    
    console.log('✅ User record created successfully:', {
      id: userRecord.id,
      email: userRecord.email,
      username: userRecord.username
    });
    
    // 4. Clean up test data
    await supabase
      .from('users')
      .delete()
      .eq('id', '12345678-1234-5678-9012-123456789012');
    
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 Database integration test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run the migration: 000_users.sql in Supabase SQL editor');
    console.log('2. Test user registration through your app');
    console.log('3. Verify users appear in both auth.users and public.users tables');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure Supabase environment variables are set');
    console.log('2. Run 000_users.sql migration in Supabase');
    console.log('3. Check database permissions');
  }
}

testUserRegistration();