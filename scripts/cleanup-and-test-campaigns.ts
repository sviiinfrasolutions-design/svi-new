import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from .env.local in the workspace root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function run() {
  const { supabaseAdmin } = await import('../src/lib/supabase/admin.js');

  console.log(
    '1. Cleaning up existing campaigns, scheduled draws, lottery participants, and lotteries...'
  );

  // Clean email campaigns
  const { error: errCamp } = await supabaseAdmin
    .from('email_campaigns')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (errCamp) console.error('Error deleting campaigns:', errCamp.message);
  else console.log('✅ Cleaned email_campaigns.');

  // Clean scheduled draws
  const { error: errDraws } = await supabaseAdmin
    .from('scheduled_draws')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (errDraws) console.error('Error deleting scheduled draws:', errDraws.message);
  else console.log('✅ Cleaned scheduled_draws.');

  // Clean lottery participants
  const { error: errPart } = await supabaseAdmin
    .from('lottery_participants')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (errPart) console.error('Error deleting lottery participants:', errPart.message);
  else console.log('✅ Cleaned lottery_participants.');

  // Clean lotteries
  const { error: errLotter } = await supabaseAdmin
    .from('lotteries')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (errLotter) console.error('Error deleting lotteries:', errLotter.message);
  else console.log('✅ Cleaned lotteries.');

  console.log('\n2. Creating a test Lottery...');
  const { data: lottery, error: errCreateLottery } = await supabaseAdmin
    .from('lotteries')
    .insert({
      title: 'Mega Summer Lucky Draw 2026',
      description: 'Exclusive lucky draw for premium plot bookings in Shyam Aangan Phase 1.',
      status: 'active',
    })
    .select()
    .single();

  if (errCreateLottery || !lottery) {
    console.error('❌ Failed to create test lottery:', errCreateLottery?.message);
    return;
  }
  console.log('✅ Created test lottery:', lottery.title, `(ID: ${lottery.id})`);

  console.log('\n3. Creating a test Lottery Participant...');
  const { data: participant, error: errCreatePart } = await supabaseAdmin
    .from('lottery_participants')
    .insert({
      lottery_id: lottery.id,
      name: 'Test Winner',
      phone: '+91 9999999999',
      email: 'hr.sviinfrasolutions@gmail.com',
      ticket_number: 'SVI-2026-999',
      is_winner: false,
    })
    .select()
    .single();

  if (errCreatePart || !participant) {
    console.error('❌ Failed to create test participant:', errCreatePart?.message);
    return;
  }
  console.log(
    '✅ Created test participant:',
    participant.name,
    `(Ticket: ${participant.ticket_number})`
  );

  console.log('\n4. Creating a test Scheduled Draw...');
  const { data: scheduledDraw, error: errCreateDraw } = await supabaseAdmin
    .from('scheduled_draws')
    .insert({
      lottery_id: lottery.id,
      scheduled_at: new Date(Date.now() + 2 * 3600000).toISOString(), // 2 hours from now
      pre_notify_minutes: 60,
      show_countdown: true,
      include_countdown_in_email: true,
      status: 'pending',
    })
    .select()
    .single();

  if (errCreateDraw || !scheduledDraw) {
    console.error('❌ Failed to create scheduled draw:', errCreateDraw?.message);
    return;
  }
  console.log('✅ Created scheduled draw:', scheduledDraw.scheduled_at);

  console.log('\n5. Creating a test Email Campaign...');
  const { data: campaign, error: errCreateCamp } = await supabaseAdmin
    .from('email_campaigns')
    .insert({
      title: 'Summer Draw Announcement',
      subject: 'You are invited to the Mega Summer Lucky Draw!',
      body_html: `<h1>Exciting News!</h1><p>Dear Valued Client,</p><p>We are thrilled to invite you to the SVI Mega Summer Lucky Draw. Your ticket is registered!</p><p>Best regards,<br>SVI Infra Team</p>`,
      recipient_group: 'custom',
      custom_emails: ['hr.sviinfrasolutions@gmail.com'],
      status: 'draft',
    })
    .select()
    .single();

  if (errCreateCamp || !campaign) {
    console.error('❌ Failed to create email campaign:', errCreateCamp?.message);
    return;
  }
  console.log('✅ Created test campaign:', campaign.title, `(ID: ${campaign.id})`);

  console.log('\n======================================');
  console.log('CLEANUP & SEED SUCCESSFUL! ALL SYSTEMS OPERATIONAL.');
  console.log('======================================');
}

run();
