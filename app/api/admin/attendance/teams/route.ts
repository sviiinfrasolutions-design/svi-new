import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

// GET /api/admin/attendance/teams — list all teams with member counts
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { data: teams, error } = await supabaseAdmin
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw AppError.internal(error.message);

    // Get member counts for all teams in a single query instead of N+1
    const { data: allMembers } = await supabaseAdmin.from('team_members').select('team_id');

    const memberCounts = new Map<string, number>();
    for (const m of allMembers || []) {
      memberCounts.set(m.team_id, (memberCounts.get(m.team_id) || 0) + 1);
    }

    const teamsWithCounts = (teams || []).map((team) => ({
      ...team,
      member_count: memberCounts.get(team.id) || 0,
    }));

    const response = NextResponse.json({ teams: teamsWithCounts });
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/admin/attendance/teams — create a new team
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    let body: { name?: string; description?: string };
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    if (!body.name?.trim()) {
      throw AppError.badRequest('Team name is required');
    }

    const { data: team, error } = await supabaseAdmin
      .from('teams')
      .insert({
        name: body.name.trim(),
        description: body.description?.trim() || null,
        created_by: admin.id,
      })
      .select()
      .single();

    if (error) throw AppError.internal(error.message);

    // Log activity
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', admin.id)
      .single();

    await supabaseAdmin.from('activity_logs').insert({
      user_id: admin.id,
      action_type: 'team_created',
      description: `Team "${body.name.trim()}" was created`,
    });

    NotificationHelper.teamCreated(body.name.trim(), profile?.full_name || 'Admin').catch(() => {});

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
