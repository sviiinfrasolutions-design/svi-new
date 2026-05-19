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

  // User growth over last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: userGrowth, error: growthError } = await supabaseAdmin
    .from('profiles')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  if (growthError) return NextResponse.json({ error: growthError.message }, { status: 500 });

  // Aggregate by day
  const userGrowthByDay = aggregateByDay(userGrowth || [], 30);

  // Document stats by type
  const { data: docStats, error: docError } = await supabaseAdmin
    .from('documents')
    .select('document_type')
    .eq('status', 'completed');

  if (docError) return NextResponse.json({ error: docError.message }, { status: 500 });

  const documentStats = countByType(docStats || []);

  // Calculate trends (compare current period vs previous period)
  const trends = await calculateTrends();

  return NextResponse.json({
    userGrowth: userGrowthByDay,
    documentStats,
    trends,
  });
}

function aggregateByDay(records: Array<{ created_at: string }>, days: number) {
  const result = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const count = records.filter((r) => r.created_at.startsWith(dateStr)).length;

    result.push({
      date: `${i === 0 ? 'Today' : i + 'd ago'}`,
      users: count,
    });
  }

  return result;
}

function countByType(documents: Array<{ document_type: string }>) {
  const counts: Record<string, number> = {
    allotment_letter: 0,
    payment_receipt: 0,
    payment_plan: 0,
    offer_letter: 0,
    bba: 0,
  };

  documents.forEach((doc) => {
    if (counts[doc.document_type] !== undefined) {
      counts[doc.document_type]++;
    }
  });

  return [
    { name: 'Allotment', count: counts.allotment_letter },
    { name: 'Receipt', count: counts.payment_receipt },
    { name: 'Plan', count: counts.payment_plan },
    { name: 'Offer', count: counts.offer_letter },
    { name: 'BBA', count: counts.bba },
  ];
}

async function calculateTrends() {
  // Compare last 7 days vs previous 7 days for user growth
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 86400000);
  const prev7Days = new Date(now.getTime() - 14 * 86400000);

  const { count: recentCount } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', last7Days.toISOString());

  const { count: prevCount } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', prev7Days.toISOString())
    .lt('created_at', last7Days.toISOString());

  const userGrowthPercent =
    prevCount && prevCount > 0
      ? Math.round((((recentCount || 0) - prevCount) / prevCount) * 100)
      : 0;

  // Calculate client growth similarly
  const { count: recentClients } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'client')
    .gte('created_at', last7Days.toISOString());

  const { count: prevClients } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'client')
    .gte('created_at', prev7Days.toISOString())
    .lt('created_at', last7Days.toISOString());

  const clientGrowthPercent =
    prevClients && prevClients > 0
      ? Math.round((((recentClients || 0) - prevClients) / prevClients) * 100)
      : 0;

  return {
    userGrowth: `${userGrowthPercent >= 0 ? '+' : ''}${userGrowthPercent}%`,
    clientGrowth: `${clientGrowthPercent >= 0 ? '+' : ''}${clientGrowthPercent}%`,
    adminCount: '0%', // Stable metric
  };
}
