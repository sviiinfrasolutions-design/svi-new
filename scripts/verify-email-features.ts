import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendApiKey = process.env.RESEND_API_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

async function runTests() {
  console.log('--- Starting Email Feature Verification ---');

  // 1. Verify Resend Configuration
  console.log('\n1. Verifying Resend API Key...');
  try {
    const domains = await resend.domains.list();
    console.log(
      'Resend Domains accessible:',
      domains.data?.map((d) => d.name)
    );
  } catch (error: any) {
    console.error('Error accessing Resend:', error.message);
  }

  // 2. Verify Supabase Tables
  console.log('\n2. Verifying Supabase Tables...');
  const tables = [
    'email_inbox',
    'email_attachments',
    'scheduled_emails',
    'email_deletions',
    'email_stars',
  ];
  for (const table of tables) {
    try {
      const { data, error } = await supabaseAdmin.from(table).select('*').limit(1);
      if (error) {
        console.error(`❌ Table ${table} verification failed:`, error.message);
      } else {
        console.log(`✅ Table ${table} is accessible.`);
      }
    } catch (error: any) {
      console.error(`❌ Table ${table} threw exception:`, error.message);
    }
  }

  // 3. Test Scheduling an Email
  console.log('\n3. Testing Scheduled Emails (Insertion)...');
  const dummyEmail = {
    to_emails: ['test@example.com'],
    subject: 'Test Scheduled Email',
    html_body: '<p>This is a test</p>',
    scheduled_at: new Date().toISOString(), // Schedule it now
    status: 'pending',
    metadata: { test: true },
  };

  let insertedId: string | undefined;

  try {
    const { data, error } = await supabaseAdmin
      .from('scheduled_emails')
      .insert(dummyEmail)
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to schedule email:', error.message);
    } else {
      console.log('✅ Successfully inserted scheduled email:', data.id);
      insertedId = data.id;
    }
  } catch (err: any) {
    console.error('❌ Exception scheduling email:', err.message);
  }

  // 4. Test cron logic manually (simulate processing)
  if (insertedId) {
    console.log('\n4. Simulating Cron Job Processing...');
    try {
      const { data: pendingEmails, error: fetchError } = await supabaseAdmin
        .from('scheduled_emails')
        .select('*')
        .lte('scheduled_at', new Date().toISOString())
        .eq('status', 'pending')
        .eq('id', insertedId);

      if (fetchError) {
        console.error('❌ Failed to fetch pending email:', fetchError.message);
      } else if (!pendingEmails || pendingEmails.length === 0) {
        console.log('❌ No pending emails found.');
      } else {
        console.log(`✅ Found ${pendingEmails.length} pending email(s) to process.`);

        for (const email of pendingEmails) {
          console.log(
            `Marking email ${email.id} as failed (we won't actually send a test email to avoid spam)...`
          );

          await supabaseAdmin
            .from('scheduled_emails')
            .update({
              status: 'failed',
              metadata: { ...email.metadata, error: 'Simulated failure for testing' },
            })
            .eq('id', email.id);

          console.log(`✅ Simulated processing for ${email.id}`);
        }
      }

      // Cleanup the test email
      await supabaseAdmin.from('scheduled_emails').delete().eq('id', insertedId);
      console.log('✅ Cleaned up test scheduled email.');
    } catch (err: any) {
      console.error('❌ Exception simulating cron:', err.message);
    }
  }

  // 5. Test syncing inbound emails (fetch from Resend)
  console.log('\n5. Testing Inbound Email Sync logic...');
  try {
    const resendEmails = await resend.emails.receiving.list();
    const emails = (resendEmails.data as any)?.data || resendEmails.data || [];
    console.log(`✅ Fetched ${emails.length} inbound emails from Resend.`);
  } catch (err: any) {
    console.error('❌ Exception fetching inbound emails:', err.message);
  }

  console.log('\n--- Verification Complete ---');
}

runTests().catch(console.error);
