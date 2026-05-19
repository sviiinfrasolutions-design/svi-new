import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

// Helper: verify the caller is an authenticated admin
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;

  // Look up user profile to confirm role = admin
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin' ? user : null;
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');

  const { data, error } = await supabaseAdmin
    .from('activity_logs')
    .select(
      `
      *,
      profiles:user_id (full_name)
    `
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Transform to match ActivityTimeline component format
  const activities = (data || []).map(
    (log: {
      id: string;
      action_type: string;
      description: string;
      created_at: string;
      profiles?: { full_name: string };
    }) => ({
      id: log.id,
      type: getActivityType(log.action_type),
      title: getActionTitle(log.action_type),
      description: log.description,
      timestamp: formatTimestamp(log.created_at),
      user: log.profiles?.full_name || 'Unknown',
    })
  );

  return NextResponse.json({ activities });
}

function getActivityType(actionType: string): 'user' | 'document' | 'settings' | 'download' {
  if (actionType.includes('user')) return 'user';
  if (actionType.includes('download')) return 'download';
  if (actionType.includes('document')) return 'document';
  return 'settings';
}

function getActionTitle(actionType: string): string {
  const titles: Record<string, string> = {
    user_created: 'New user created',
    user_deleted: 'User deleted',
    document_generated: 'Document generated',
    document_downloaded: 'Document downloaded',
    settings_updated: 'Settings updated',
    profile_updated: 'Profile updated',
  };
  return titles[actionType] || actionType;
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}
