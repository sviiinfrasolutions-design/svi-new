import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testAdminProfile() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Testing admin profile...\n');
  
  // Login as admin
  console.log('1. Logging in...');
  const loginResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@sviinfra.com',
      password: 'AdminPass123!',
    }),
  });
  
  if (!loginResponse.ok) {
    console.error('Login failed:', await loginResponse.text());
    return;
  }
  
  const loginData = await loginResponse.json();
  const token = loginData.access_token;
  console.log('✓ Login successful\n');
  
  // Check the user's profile
  console.log('2. Checking user profile...');
  const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*&id=eq.${loginData.user.id}`, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!profileResponse.ok) {
    console.error('Profile query failed:', profileResponse.status, await profileResponse.text());
    return;
  }
  
  const profileData = await profileResponse.json();
  console.log('Profile data:', JSON.stringify(profileData, null, 2));
  
  if (profileData && profileData.length > 0) {
    console.log('\n✓ Profile found');
    console.log('Role:', profileData[0].role);
    console.log('Email:', profileData[0].email);
    console.log('Full Name:', profileData[0].full_name);
  } else {
    console.log('\n✗ No profile found for this user!');
  }
}

testAdminProfile().catch(console.error);
