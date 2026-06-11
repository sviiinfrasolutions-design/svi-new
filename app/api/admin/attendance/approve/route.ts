import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    let body;
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    const { id, status } = body;

    if (!id) {
      throw AppError.badRequest('Record ID is required');
    }

    if (status !== 'present' && status !== 'absent') {
      throw AppError.badRequest('Status must be either present or absent');
    }

    const { data: updatedRecord, error } = await supabaseAdmin
      .from('attendance_records')
      .update({
        status,
        marked_by: admin.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating attendance record:', error);
      throw AppError.internal('Failed to update attendance record status');
    }

    return NextResponse.json({ success: true, record: updatedRecord });
  } catch (err) {
    return handleApiError(err);
  }
}
