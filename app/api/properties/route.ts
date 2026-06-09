import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export async function GET(request: NextRequest) {
  try {
    const { data: properties, error } = await supabaseAdmin
      .from('properties')
      .select('id, name, slug, active')
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) throw AppError.internal('Failed to fetch properties');

    return NextResponse.json({ properties: properties || [] });
  } catch (err) {
    return handleApiError(err);
  }
}
