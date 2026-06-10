import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('--- Checking Resend Receiving ---');
  try {
    const resendEmails = await resend.emails.receiving.list();
    console.log('Resend Response Keys:', Object.keys(resendEmails));
    console.log('Resend data:', JSON.stringify(resendEmails.data, null, 2));
  } catch (err) {
    console.error('Error fetching from Resend:', err);
  }

  console.log('\n--- Checking Supabase Inbox ---');
  try {
    const { data: dbEmails, error } = await supabase
      .from('email_inbox')
      .select('id, email_id, subject, from_email, received_at')
      .order('received_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
    } else {
      console.log(`Supabase count: ${dbEmails?.length}`);
      console.log('Supabase emails:', JSON.stringify(dbEmails, null, 2));
    }
  } catch (err) {
    console.error('Error fetching from Supabase:', err);
  }
}

main();
