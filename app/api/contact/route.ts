import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, email, phone, subject, message } = body;

  if (!name || !email || !phone || !subject || !message) {
    return NextResponse.json(
      { error: 'All fields (name, email, phone, subject, message) are required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('contact_submissions')
    .insert({ name, email, phone, subject, message })
    .select()
    .single();

  if (error) {
    console.error('Contact submission error:', error.message);
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
  }

  // Send email notification (non-blocking)
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const { Resend } = await import('resend');
      const resend = new Resend(resendApiKey);

      // Fetch dynamic email settings from database
      let adminEmail = process.env.ADMIN_EMAIL || 'admin@sviinfra.com';
      let notifyOnContact = true;
      let senderName = 'SVI Infra';
      let senderEmail = 'noreply@sviiinfrasolutions.com';

      try {
        const { data: emailSetting } = await supabaseAdmin
          .from('portal_settings')
          .select('value')
          .eq('key', 'email_settings')
          .single();

        if (emailSetting?.value && typeof emailSetting.value === 'object') {
          const val = emailSetting.value as any;
          if (val.admin_email) adminEmail = val.admin_email;
          if (val.notify_on_contact !== undefined) notifyOnContact = !!val.notify_on_contact;
          if (val.sender_name) senderName = val.sender_name;
          if (val.sender_email) senderEmail = val.sender_email;
        }
      } catch (settingsErr) {
        console.warn(
          'Failed to load email settings from DB for contact form, using fallback:',
          settingsErr
        );
      }

      // Trigger email send only if notify_on_contact setting is enabled
      if (notifyOnContact) {
        const mailSubject = `[SYSTEM-AUTO] New Contact Form: ${subject}`;
        await resend.emails.send({
          from: `${senderName} <${senderEmail}>`,
          to: adminEmail,
          subject: mailSubject,
          headers: {
            'X-Auto-Response': 'true',
            'X-System-Generated': 'true',
            'X-SVI-Event': 'contact_form',
          },
          tags: [
            { name: 'category', value: 'system_automation' },
            { name: 'event', value: 'contact_form' },
          ],
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
              <div style="text-align: right; margin-bottom: 15px;">
                <span style="background-color: #c9a84c; color: #ffffff; font-size: 9px; font-weight: bold; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; font-family: sans-serif;">
                  ✨ System Automated Notification
                </span>
              </div>
              <h2>New Contact Form Submission</h2>
              <table style="border-collapse:collapse;width:100%">
                <tr><td style="padding:8px;font-weight:bold">Name:</td><td style="padding:8px">${name}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Email:</td><td style="padding:8px">${email}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Phone:</td><td style="padding:8px">${phone}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Subject:</td><td style="padding:8px">${subject}</td></tr>
              </table>
              <p style="margin-top:16px"><strong>Message:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
          `,
        });

        // Trigger dynamic admin notification center alert
        try {
          await NotificationHelper.emailDispatched(adminEmail, mailSubject, data.id);
        } catch (notifErr) {
          console.error('Failed to log email dispatched system alert:', notifErr);
        }
      } else {
        console.log(
          '[Email Audit] Contact form alerts are disabled in settings. Skipping email dispatch.'
        );
      }
    }
  } catch (emailError: any) {
    console.error('Contact email notification failed:', emailError);
    // Log failure alert in notification center
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@sviinfra.com';
      await NotificationHelper.emailDispatchFailed(
        adminEmail,
        emailError.message || String(emailError),
        data.id
      );
    } catch (notifErr) {
      console.error('Failed to log email dispatch failure system alert:', notifErr);
    }
  }

  return NextResponse.json({ success: true, id: data.id }, { status: 201 });
}
