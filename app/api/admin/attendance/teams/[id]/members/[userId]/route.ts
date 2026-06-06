import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';

// DELETE /api/admin/attendance/teams/[id]/members/[userId] — remove member from team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, userId } = await params;
  const { error } = await supabaseAdmin
    .from('team_members')
    .delete()
    .eq('team_id', id)
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    const { data: teamData } = await supabaseAdmin
      .from('teams')
      .select('name')
      .eq('id', id)
      .single();
    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', admin.id)
      .single();
    const { data: memberProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();
    await NotificationHelper.memberRemovedFromTeam(
      teamData?.name || 'Unknown Team',
      memberProfile?.full_name || 'Unknown Member',
      profileData?.full_name || admin.email || 'Admin'
    );
  } catch (notifErr) {
    console.error('Failed to create member removed notification:', notifErr);
  }

  return NextResponse.json({ success: true });
}
