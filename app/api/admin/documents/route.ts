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

// GET /api/admin/documents — list documents with optional filters
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const userId = searchParams.get('userId');
  const limit = parseInt(searchParams.get('limit') || '50');

  let query = supabaseAdmin
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (type) query = query.eq('document_type', type);
  if (userId) query = query.eq('user_id', userId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ documents: data });
}

// POST /api/admin/documents — create a new document record
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { document_type, user_id, form_data, pdf_url, image_url, status, metadata } = body;

  const { data, error } = await supabaseAdmin
    .from('documents')
    .insert({
      document_type,
      user_id,
      created_by: admin.id,
      form_data,
      pdf_url,
      image_url,
      status: status || 'draft',
      metadata,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log activity
  await supabaseAdmin.from('activity_logs').insert({
    user_id: admin.id,
    action_type: 'document_generated',
    description: `${document_type.replace(/_/g, ' ')} generated`,
    target_id: data.id,
    target_type: 'document',
    metadata: { user_id },
  });

  return NextResponse.json({ document: data }, { status: 201 });
}

// PATCH /api/admin/documents/[id] — update document status
export async function PATCH(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const urlParts = request.url.split('/');
  const documentId = urlParts[urlParts.length - 1];

  const body = await request.json();
  const { status, pdf_url, image_url } = body;

  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = status;
  if (pdf_url) updateData.pdf_url = pdf_url;
  if (image_url) updateData.image_url = image_url;

  const { data, error } = await supabaseAdmin
    .from('documents')
    .update(updateData)
    .eq('id', documentId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If status changed to completed, log download activity
  if (status === 'completed') {
    await supabaseAdmin.from('activity_logs').insert({
      user_id: admin.id,
      action_type: 'document_downloaded',
      description: `${data.document_type.replace(/_/g, ' ')} downloaded`,
      target_id: data.id,
      target_type: 'document',
    });
  }

  return NextResponse.json({ document: data });
}
