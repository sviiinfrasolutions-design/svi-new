import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import type { AttendanceReportRow } from '@/src/lib/supabase/types';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

// GET /api/admin/attendance/report — get attendance summary report
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Default to last 30 days if no date range specified
    const defaultFrom = new Date();
    defaultFrom.setDate(defaultFrom.getDate() - 30);
    const effectiveFrom = from || defaultFrom.toISOString().split('T')[0];

    let query = supabaseAdmin.from('attendance_records').select(`
      user_id,
      status,
      profiles!inner(full_name, email)
    `);

    if (teamId) query = query.eq('team_id', teamId);
    query = query.gte('date', effectiveFrom);
    if (to) query = query.lte('date', to);

    const { data: records, error } = await query;

    if (error) throw AppError.internal(error.message);

    // Aggregate by user
    const userMap = new Map<string, AttendanceReportRow>();

    for (const r of (records || []) as unknown as Array<{
      user_id: string;
      status: string;
      profiles: { full_name: string; email: string }[] | null;
    }>) {
      const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
      let row = userMap.get(r.user_id);
      if (!row) {
        row = {
          user_id: r.user_id,
          full_name: profile?.full_name || '',
          email: profile?.email || '',
          present: 0,
          absent: 0,
          half_day: 0,
          leave: 0,
          total_days: 0,
          attendance_percentage: 0,
        };
        userMap.set(r.user_id, row);
      }

      switch (r.status) {
        case 'present':
          row.present++;
          break;
        case 'absent':
          row.absent++;
          break;
        case 'half_day':
          row.half_day++;
          break;
        case 'leave':
          row.leave++;
          break;
      }
      row.total_days++;
    }

    const report: AttendanceReportRow[] = Array.from(userMap.values()).map((row) => ({
      ...row,
      attendance_percentage:
        row.total_days > 0
          ? Math.round(((row.present + row.half_day * 0.5) / row.total_days) * 100)
          : 0,
    }));

    report.sort((a, b) => b.attendance_percentage - a.attendance_percentage);

    return NextResponse.json({ report });
  } catch (error) {
    return handleApiError(error);
  }
}
