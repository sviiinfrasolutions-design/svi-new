import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listTables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('Listing all tables in public schema...\n');
  
  // Use Supabase REST API to query information_schema
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/list_tables`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  
  if (!response.ok) {
    console.log('RPC method not available, trying direct query...');
    
    // Alternative: Try to access common tables directly
    const tablesToCheck = ['profiles', 'documents', 'activity_logs'];
    
    for (const table of tablesToCheck) {
      const tableResponse = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=0`, {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
      });
      
      console.log(`${table}: ${tableResponse.status} ${tableResponse.ok ? '✓ EXISTS' : '✗ NOT FOUND'}`);
    }
  } else {
    const data = await response.json();
    console.log('Tables:', data);
  }
}

listTables().catch(console.error);
