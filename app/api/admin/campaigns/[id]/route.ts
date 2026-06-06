import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/campaigns/[id]
 */
export async function GET(request: NextRequest, { params }: Params) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('email_campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ campaign: data });
}

/**
 * PUT /api/admin/campaigns/[id]
 * Edit / reschedule a campaign (allowed while status is draft or scheduled)
 */
export async function PUT(request: NextRequest, { params }: Params) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Fetch current state
  const { data: existing, error: fetchErr } = await supabaseAdmin
    .from('email_campaigns')
    .select('status, title')
    .eq('id', id)
    .single();

  if (fetchErr || !existing)
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  if (existing.status === 'sent' || existing.status === 'cancelled') {
    return NextResponse.json(
      { error: `Cannot edit a ${existing.status} campaign` },
      { status: 400 }
    );
  }

  const {
    title,
    subject,
    body_html,
    recipient_group,
    custom_emails,
    scheduled_at,
    reminder_at,
    reminder_subject,
  } = body;

  const newStatus = scheduled_at ? 'scheduled' : 'draft';

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('email_campaigns')
    .update({
      ...(title !== undefined && { title }),
      ...(subject !== undefined && { subject }),
      ...(body_html !== undefined && { body_html }),
      ...(recipient_group !== undefined && { recipient_group }),
      custom_emails: recipient_group === 'custom' ? (custom_emails ?? null) : null,
      scheduled_at: scheduled_at || null,
      reminder_at: reminder_at || null,
      reminder_subject: reminder_subject || null,
      status: newStatus,
    })
    .eq('id', id)
    .select()
    .single();

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  try {
    await supabaseAdmin.from('activity_logs').insert({
      user_id: admin.id,
      action_type: 'campaign_updated',
      description: `Campaign "${existing.title}" updated (${newStatus}).`,
      metadata: { campaignId: id },
    });
  } catch (_err) {
    // Activity logging is non-critical
  }

  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', admin.id)
      .single();
    const adminName = profile?.full_name || admin.email || 'Admin';
    await NotificationHelper.campaignUpdated(existing.title, adminName);
  } catch (notifErr) {
    console.error('Failed to create campaign update notification:', notifErr);
  }

  return NextResponse.json({ campaign: updated });
}

/**
 * DELETE /api/admin/campaigns/[id]
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { data: existing } = await supabaseAdmin
    .from('email_campaigns')
    .select('title, status')
    .eq('id', id)
    .single();

  // Cancel instead of hard-delete if scheduled/sent (keep history)
  if (existing?.status === 'scheduled') {
    await supabaseAdmin.from('email_campaigns').update({ status: 'cancelled' }).eq('id', id);
  } else {
    const { error } = await supabaseAdmin.from('email_campaigns').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    await supabaseAdmin.from('activity_logs').insert({
      user_id: admin.id,
      action_type: 'campaign_deleted',
      description: `Campaign "${existing?.title || id}" deleted/cancelled.`,
      metadata: { campaignId: id },
    });
  } catch (_err) {
    // Activity logging is non-critical
  }

  try {
    await NotificationHelper.campaignDeleted(
      existing?.title || 'Unknown Campaign',
      admin.email || 'Admin'
    );
  } catch (notifErr) {
    console.error('Failed to create campaign delete notification:', notifErr);
  }

  return NextResponse.json({ success: true });
}
