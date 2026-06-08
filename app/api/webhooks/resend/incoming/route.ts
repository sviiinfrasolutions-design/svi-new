import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Get email data
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

    // Insert into email_inbox table
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
      console.error('Failed to store email:', error);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
