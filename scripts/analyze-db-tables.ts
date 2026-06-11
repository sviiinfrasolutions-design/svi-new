import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const tablesToCheck = [
  'profiles',
  'email_campaigns',
  'portal_settings',
  'properties',
  'faqs',
  'activity_logs',
  'teams',
  'team_members',
  'attendance_records',
  'lotteries',
  'scheduled_draws',
  'lottery_participants',
  'project_images',
  'notifications',
  'chat_leads',
  'chat_logs',
  'email_inbox',
  'email_deletions',
  'email_stars',
  'scheduled_emails',
  'documents',
];

async function checkTables() {
  console.log('Analyzing Database Tables...');
  const results = [];

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);

      if (error) {
        results.push({ table, status: 'ERROR', message: error.message, code: error.code });
      } else {
        results.push({ table, status: 'OK', count: data ? data.length : 0 });
      }
    } catch (e: any) {
      results.push({ table, status: 'EXCEPTION', message: e.message });
    }
  }

  console.table(results);

  const errors = results.filter((r) => r.status !== 'OK');
  if (errors.length > 0) {
    console.log('\nFound issues with the following tables:');
    errors.forEach((e) => console.log(`- ${e.table}: ${e.message}`));
  } else {
    console.log('\nAll expected tables exist and are accessible!');
  }
}

checkTables();
