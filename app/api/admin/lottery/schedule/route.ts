import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';

/**
 * GET /api/admin/lottery/schedule?lotteryId=...
 * Returns the current scheduled draw for a lottery
 */
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const lotteryId = url.searchParams.get('lotteryId');
  if (!lotteryId) return NextResponse.json({ error: 'lotteryId is required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('scheduled_draws')
    .select('*')
    .eq('lottery_id', lotteryId)
    .in('status', ['pending', 'reminder_sent'])
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ schedule: data });
}

/**
 * POST /api/admin/lottery/schedule
 * Creates or replaces the scheduled draw for an active lottery
 * Body: { lotteryId, scheduled_at (ISO), pre_notify_minutes, show_countdown, include_countdown_in_email }
 */
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    lotteryId,
    scheduled_at,
    pre_notify_minutes = 60,
    show_countdown = true,
    include_countdown_in_email = true,
  } = body;

  if (!lotteryId || !scheduled_at) {
    return NextResponse.json({ error: 'lotteryId and scheduled_at are required' }, { status: 400 });
  }

  // Validate the scheduled time is in the future
  const scheduledDate = new Date(scheduled_at);
  if (scheduledDate <= new Date()) {
    return NextResponse.json({ error: 'Scheduled time must be in the future' }, { status: 400 });
  }

  // Verify the lottery is active
  const { data: lottery, error: lError } = await supabaseAdmin
    .from('lotteries')
    .select('id, title, status')
    .eq('id', lotteryId)
    .single();

  if (lError || !lottery) return NextResponse.json({ error: 'Lottery not found' }, { status: 404 });
  if (lottery.status !== 'active')
    return NextResponse.json({ error: 'Lottery is not active' }, { status: 400 });

  // Cancel any existing pending schedule for this lottery first
  await supabaseAdmin
    .from('scheduled_draws')
    .update({ status: 'cancelled' })
    .eq('lottery_id', lotteryId)
    .in('status', ['pending', 'reminder_sent']);

  // Insert new schedule
  const { data: newSchedule, error: insertError } = await supabaseAdmin
    .from('scheduled_draws')
    .insert({
      lottery_id: lotteryId,
      scheduled_at,
      pre_notify_minutes,
      show_countdown,
      include_countdown_in_email,
      status: 'pending',
    })
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  // Log activity
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', admin.id)
      .single();
    const adminName = profile?.full_name || admin.email || 'Admin';
    await supabaseAdmin.from('activity_logs').insert({
      user_id: admin.id,
      action_type: 'lottery_scheduled',
      description: `${adminName} scheduled draw for "${lottery.title}" at ${new Date(scheduled_at).toISOString()}.`,
      metadata: { event: 'lottery_scheduled', lotteryId, scheduled_at, pre_notify_minutes },
    });
  } catch (logErr) {
    console.error('Failed to log scheduling activity:', logErr);
  }

  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', admin.id)
      .single();
    const adminName = profile?.full_name || admin.email || 'Admin';
    await NotificationHelper.lotteryScheduled(lottery.title, scheduled_at, adminName);
  } catch (notifErr) {
    console.error('Failed to create lottery schedule notification:', notifErr);
  }

  return NextResponse.json({ success: true, schedule: newSchedule });
}

/**
 * DELETE /api/admin/lottery/schedule
 * Cancels the scheduled draw for a lottery
 * Body: { lotteryId }
 */
export async function DELETE(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { lotteryId } = body;
  if (!lotteryId) return NextResponse.json({ error: 'lotteryId is required' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('scheduled_draws')
    .update({ status: 'cancelled' })
    .eq('lottery_id', lotteryId)
    .in('status', ['pending', 'reminder_sent']);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let lotteryTitle = 'Unknown Lottery';
  try {
    const { data: lottery } = await supabaseAdmin
      .from('lotteries')
      .select('title')
      .eq('id', lotteryId)
      .single();
    lotteryTitle = lottery?.title || 'Unknown Lottery';
  } catch (_err) {
    // Silently ignore lookup failure
  }

  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', admin.id)
      .single();
    const adminName = profile?.full_name || admin.email || 'Admin';
    await supabaseAdmin.from('activity_logs').insert({
      user_id: admin.id,
      action_type: 'lottery_schedule_cancelled',
      description: `${adminName} cancelled the scheduled draw for lottery ID: ${lotteryId}.`,
      metadata: { event: 'lottery_schedule_cancelled', lotteryId },
    });
  } catch (logErr) {
    console.error('Failed to log cancel activity:', logErr);
  }

  try {
    await NotificationHelper.lotteryScheduleCancelled(lotteryTitle, admin.email || 'Admin');
  } catch (notifErr) {
    console.error('Failed to create lottery cancel notification:', notifErr);
  }

  return NextResponse.json({ success: true });
}
