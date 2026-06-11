import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { data: records, error } = await supabaseAdmin
      .from('attendance_records')
      .select(
        `
        *,
        profiles!attendance_records_user_id_fkey(full_name),
        teams!attendance_records_team_id_fkey(name)
      `
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending records:', error);
      throw AppError.internal('Failed to fetch pending attendance records');
    }

    // Format the response for the frontend
    const formattedRecords = records.map((record: any) => ({
      ...record,
      full_name: record.profiles?.full_name,
      team_name: record.teams?.name,
    }));

    return NextResponse.json({ records: formattedRecords });
  } catch (err) {
    return handleApiError(err);
  }
}
