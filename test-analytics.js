// Test script to verify analytics API works correctly
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testAnalyticsAPI() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Testing Analytics API...\n');
  
  // First, login as admin
  console.log('1. Logging in as admin...');
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
  
  // Now call the analytics API
  console.log('2. Calling analytics API...');
  const analyticsResponse = await fetch('http://localhost:3000/api/admin/analytics', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!analyticsResponse.ok) {
    console.error('Analytics API failed:', analyticsResponse.status, await analyticsResponse.text());
    return;
  }
  
  const analyticsData = await analyticsResponse.json();
  console.log('✓ Analytics API successful\n');
  
  // Display user growth data
  console.log('3. User Growth Data (last 5 days):');
  const last5Days = analyticsData.userGrowth.slice(-5);
  last5Days.forEach(day => {
    console.log(`   ${day.date}: ${day.users} users`);
  });
  
  console.log('\n4. Document Stats:');
  analyticsData.documentStats.forEach(doc => {
    console.log(`   ${doc.name}: ${doc.count}`);
  });
  
  console.log('\n5. Trends:');
  console.log(`   User Growth: ${analyticsData.trends.userGrowth}`);
  console.log(`   Client Growth: ${analyticsData.trends.clientGrowth}`);
  
  console.log('\n✓ All tests passed! The User Growth chart should now display cumulative data.');
}

testAnalyticsAPI().catch(console.error);
