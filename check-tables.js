import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkTables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('Checking database tables...\n');
  
  // Query to list all tables in public schema
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/check_tables`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
  });
  
  // Try a simple query to profiles table
  const profilesResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?select=count&limit=1`, {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
  });
  
  console.log('Profiles table status:', profilesResponse.status);
  if (profilesResponse.ok) {
    const data = await profilesResponse.json();
    console.log('Profiles data:', data);
  } else {
    const error = await profilesResponse.text();
    console.log('Error:', error);
  }
}

checkTables().catch(console.error);
