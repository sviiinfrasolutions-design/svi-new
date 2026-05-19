import { NextRequest, NextResponse } from 'next/server';

import type { CreateUserPayload } from '@/src/lib/supabase/types';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';

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

// GET /api/admin/users — list all client users
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: data });
}

// POST /api/admin/users — create a new client user
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: CreateUserPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { email, password, full_name, phone, property_interest, notes } = body;

  if (!email || !password || !full_name) {
    return NextResponse.json(
      { error: 'email, password, and full_name are required' },
      { status: 400 }
    );
  }

  // 1. Create the auth user via admin API (bypasses email confirmation)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto-confirm so they can log in immediately
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const newUserId = authData.user.id;

  // 2. Insert profile row
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: newUserId,
      email,
      full_name,
      phone: phone || null,
      property_interest: property_interest || null,
      notes: notes || null,
      role: 'client',
      created_by: admin.id,
    })
    .select()
    .single();

  if (profileError) {
    // Rollback: delete the auth user we just created
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Create notification for all admins about new user registration
  try {
    await NotificationHelper.userRegistered(full_name, newUserId);
  } catch (notifError) {
    console.error('Failed to create notification:', notifError);
    // Don't fail the request if notification fails
  }

  return NextResponse.json({ user: profile }, { status: 201 });
}
