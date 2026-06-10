import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export async function POST(request: NextRequest) {
  try {
    let payload;
    try {
      payload = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    const emailData = {
      id: payload.data?.id || payload.id,
      thread_id: payload.data?.thread_id || payload.thread_id,
      subject: payload.data?.subject || payload.subject,
      from: payload.data?.from || payload.from,
      to: payload.data?.to || payload.to,
      html: payload.data?.html || payload.html,
      text: payload.data?.text || payload.text,
      created_at: payload.data?.created_at || payload.created_at,
    };

    const { error } = await supabaseAdmin.from('email_inbox').insert({
      email_id: emailData.id,
      thread_id: emailData.thread_id,
      subject: emailData.subject,
      from_email: emailData.from,
      to_emails: emailData.to,
      html_content: emailData.html,
      text_content: emailData.text,
      received_at: emailData.created_at,
      status: 'received',
    });

    if (error) {
      console.error('Webhook: Failed to store email:', error);
      throw AppError.internal('Failed to store email');
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return handleApiError(error);
  }
}
