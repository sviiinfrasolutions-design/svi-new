import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

async function testLogin() {
  console.log('--- Auth Test ---');
  console.log('Supabase URL loaded:', process.env.NEXT_PUBLIC_SUPABASE_URL);

  // Dynamically import client.ts AFTER dotenv has loaded the env variables
  const { supabase } = await import('./client.js');

  // 1. Test with a non-existent random user
  console.log('\nTesting non-existent user login...');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'nonexistent-user-12345@sviinfra.com',
      password: 'SomePassword123!',
    });
    if (error) {
      console.log('Non-existent user error response:', error.message, 'Status:', error.status);
    } else {
      console.log('Non-existent user logged in? Success:', !!data.session);
    }
  } catch (err) {
    console.error('Non-existent login threw error:', err);
  }

  // 2. Test with the seeded admin user
  console.log('\nTesting seeded admin user login...');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@sviinfra.com',
      password: 'AdminPass123!',
    });
    if (error) {
      console.log('Admin user error response:', error.message, 'Status:', error.status);
    } else {
      console.log('Admin user logged in? Success:', !!data.session);
    }
  } catch (err) {
    console.error('Admin login threw error:', err);
  }
}

testLogin();
