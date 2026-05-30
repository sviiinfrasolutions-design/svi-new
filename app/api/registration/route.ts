import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

const STORAGE_BUCKET = 'registration-docs';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function uploadFile(
  file: File,
  folder: string
): Promise<{ path: string; url: string } | null> {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).upload(fileName, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error('File upload error:', error.message);
    return null;
  }

  const { data } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days

  return { path: fileName, url: data?.signedUrl ?? '' };
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const mobileNo = formData.get('mobileNo') as string;
  const email = formData.get('email') as string;
  const soWoDo = formData.get('soWoDo') as string;
  const dob = formData.get('dob') as string;
  const aadharNumber = formData.get('aadharNumber') as string;
  const panNumber = formData.get('panNumber') as string;
  const state = formData.get('state') as string;
  const city = formData.get('city') as string;
  const address = formData.get('address') as string;
  const advisorName = formData.get('advisorName') as string;
  const project = formData.get('project') as string;
  const propertySize = formData.get('propertySize') as string;
  const propertyType = formData.get('propertyType') as string;
  const plotPreference = formData.get('plotPreference') as string;
  const paymentPlan = formData.get('paymentPlan') as string;
  const paymentMode = formData.get('paymentMode') as string;
  const schemeAmount = formData.get('schemeAmount') as string;

  // Validate required fields
  if (
    !firstName ||
    !mobileNo ||
    !email ||
    !soWoDo ||
    !dob ||
    !aadharNumber ||
    !state ||
    !city ||
    !address ||
    !advisorName ||
    !project ||
    !propertySize ||
    !propertyType ||
    !plotPreference ||
    !paymentPlan ||
    !paymentMode ||
    !schemeAmount
  ) {
    return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 });
  }

  // Handle file uploads
  const photoFile = formData.get('photo') as File | null;
  const panCardFile = formData.get('panCard') as File | null;

  let photoUrl: string | null = null;
  let panCardFileUrl: string | null = null;

  if (photoFile && photoFile.size > 0) {
    const result = await uploadFile(photoFile, 'photos');
    photoUrl = result?.url ?? null;
  }
  if (panCardFile && panCardFile.size > 0) {
    const result = await uploadFile(panCardFile, 'pan-cards');
    panCardFileUrl = result?.url ?? null;
  }

  // Insert into database with automatic, collision-safe submission ID generation
  let data: any = null;
  let success = false;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts && !success) {
    attempts++;

    // 1. Retrieve the highest currently assigned submission ID to avoid duplication
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('registrations')
      .select('submission_id')
      .not('submission_id', 'is', null)
      .order('submission_id', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error(
        `[Attempt ${attempts}] Database fetch error during ID generation:`,
        fetchError.message
      );
      return NextResponse.json(
        { error: 'Database connection failure during ID generation' },
        { status: 500 }
      );
    }

    let nextId = 'SVI2200';
    if (existing && existing.length > 0 && existing[0].submission_id) {
      const highestId = existing[0].submission_id;
      const match = highestId.match(/^SVI(\d+)$/);
      if (match) {
        const numericPart = parseInt(match[1], 10);
        const nextNumeric = numericPart + 1;
        const paddingLength = Math.max(4, match[1].length);
        nextId = `SVI${String(nextNumeric).padStart(paddingLength, '0')}`;
      } else {
        console.warn(
          `Highest submission ID has unexpected format: ${highestId}. Sequence continues from next index.`
        );
      }
    }

    // 2. Attach the generated submission_id and insert the user registration record
    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from('registrations')
      .insert({
        name: firstName,
        last_name: lastName || null,
        email,
        phone: mobileNo,
        so_wo_do: soWoDo,
        preferred_date: dob || null,
        aadhar_number: aadharNumber,
        pan_number: panNumber || null,
        photo_url: photoUrl,
        pan_card_file_url: panCardFileUrl,
        state,
        city,
        address,
        advisor_name: advisorName,
        project,
        property_size: propertySize,
        property_type: propertyType,
        plot_preference: plotPreference,
        payment_plan: paymentPlan,
        payment_mode: paymentMode,
        scheme_amount: schemeAmount,
        property_interest: project, // backward compat
        submission_id: nextId,
      })
      .select()
      .single();

    if (insertError) {
      // Check for unique key violation (PostgreSQL code 23505) and retry
      if (insertError.code === '23505') {
        console.warn(
          `[Registration Concurrency] Submission ID collision detected on ID ${nextId}. Retrying... (Attempt ${attempts}/${maxAttempts})`
        );
        continue;
      }

      console.error('Registration insertion error:', insertError.message);
      return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 });
    }

    data = insertedData;
    success = true;
  }

  if (!success) {
    console.error(`Failed to assign a unique submission ID after ${maxAttempts} attempts.`);
    return NextResponse.json(
      { error: 'Concurrent registration conflict. Please try again.' },
      { status: 500 }
    );
  }

  // Log successfully generated submission ID along with timestamp for auditing
  console.log(
    `[Registration Audit] Generated submission ID: ${data.submission_id} for user: ${data.name} ${data.last_name || ''} at timestamp: ${data.created_at || new Date().toISOString()}`
  );

  // Send email notification (non-blocking)
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const { Resend } = await import('resend');
      const resend = new Resend(resendApiKey);

      // Fetch dynamic email settings from database
      let adminEmail = process.env.ADMIN_EMAIL || 'admin@sviinfra.com';
      let sendUserCopy = false;

      try {
        const { data: emailSetting } = await supabaseAdmin
          .from('portal_settings')
          .select('value')
          .eq('key', 'email_settings')
          .single();

        if (emailSetting?.value && typeof emailSetting.value === 'object') {
          const val = emailSetting.value as any;
          if (val.admin_email) adminEmail = val.admin_email;
          if (val.send_user_copy !== undefined) sendUserCopy = !!val.send_user_copy;
        }
      } catch (settingsErr) {
        console.warn('Failed to load email settings from DB, using fallback:', settingsErr);
      }

      // 1. Send admin notification email
      await resend.emails.send({
        from: 'SVI Infra <noreply@sviiinfrasolutions.com>',
        to: adminEmail,
        subject: `New Registration: ${firstName} ${lastName || ''} - ${project}`,
        html: `
          <h2>New Property Registration</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;font-weight:bold">Name:</td><td style="padding:8px">${escapeHtml(firstName)} ${escapeHtml(lastName || '')}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Email:</td><td style="padding:8px">${escapeHtml(email)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Mobile:</td><td style="padding:8px">${escapeHtml(mobileNo)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">S/O, W/O, D/O:</td><td style="padding:8px">${escapeHtml(soWoDo)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Date of Birth:</td><td style="padding:8px">${escapeHtml(dob)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Aadhar Number:</td><td style="padding:8px">${escapeHtml(aadharNumber)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">PAN Number:</td><td style="padding:8px">${escapeHtml(panNumber || 'N/A')}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">State:</td><td style="padding:8px">${escapeHtml(state)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">City:</td><td style="padding:8px">${escapeHtml(city)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Address:</td><td style="padding:8px">${escapeHtml(address)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Advisor:</td><td style="padding:8px">${escapeHtml(advisorName)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Project:</td><td style="padding:8px">${escapeHtml(project)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Property Size:</td><td style="padding:8px">${escapeHtml(propertySize)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Property Type:</td><td style="padding:8px">${escapeHtml(propertyType)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Plot Preference:</td><td style="padding:8px">${escapeHtml(plotPreference)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Payment Plan:</td><td style="padding:8px">${escapeHtml(paymentPlan)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Payment Mode:</td><td style="padding:8px">${escapeHtml(paymentMode)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Scheme Amount:</td><td style="padding:8px">${escapeHtml(schemeAmount)}</td></tr>
          </table>
          ${photoUrl ? `<p><a href="${photoUrl}">View Photo</a></p>` : ''}
          ${panCardFileUrl ? `<p><a href="${panCardFileUrl}">View PAN Card</a></p>` : ''}
        `,
      });

      // 2. If user copy is enabled, dispatch a styled copy/confirmation email to the applicant
      if (sendUserCopy && email) {
        await resend.emails.send({
          from: 'SVI Infra <noreply@sviiinfrasolutions.com>',
          to: email,
          subject: `Registration Received: ${firstName} ${lastName || ''} - Submission ${data.submission_id}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
              <h2 style="color: #c9a84c; font-family: serif; border-bottom: 2px solid #f0d080; padding-bottom: 10px;">Registration Acknowledgment</h2>
              <p>Dear <strong>${escapeHtml(firstName)} ${escapeHtml(lastName || '')}</strong>,</p>
              <p>Thank you for registering with SVI Infra Solutions. We are pleased to acknowledge receipt of your property registration inquiry details.</p>
              
              <div style="background-color: #f9f9f9; color: #333333; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c9a84c;">
                <h3 style="margin-top: 0; color: #111; font-size: 14px;">Submission Details</h3>
                <p style="margin: 5px 0; font-size: 13px;"><strong>Submission ID:</strong> ${data.submission_id}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>Project Name:</strong> ${escapeHtml(project)}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>Property Details:</strong> ${escapeHtml(propertyType)} (${escapeHtml(propertySize)})</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>Advisor:</strong> ${escapeHtml(advisorName)}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>Payment Plan:</strong> ${escapeHtml(paymentPlan)}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>Scheme Registration Amount:</strong> INR ${escapeHtml(schemeAmount)}</p>
              </div>
              
              <p>Our dedicated property advisor will review your preferences and get in touch with you shortly to assist with the next steps.</p>
              <p>If you have any questions or require modifications to your submission, feel free to contact us at <a href="mailto:${adminEmail}" style="color: #c9a84c; text-decoration: none;">${adminEmail}</a>.</p>
              
              <br>
              <hr style="border: none; border-top: 1px solid #eaeaea;" />
              <p style="font-size: 11px; color: #888; text-align: center; margin-top: 15px;">
                This is an automated administrative notification. Please do not reply directly to this message.<br>
                <strong>SVI Infra Solutions Pvt. Ltd.</strong>
              </p>
            </div>
          `,
        });
      }
    }
  } catch (emailErr) {
    console.error('Email notification failed:', emailErr);
  }

  return NextResponse.json({ success: true, id: data.id, submissionId: data.submission_id });
}

// GET /api/registration — retrieve active advisor names
export async function GET(request: NextRequest) {
  try {
    const { data: settingData, error: settingError } = await supabaseAdmin
      .from('portal_settings')
      .select('value')
      .eq('key', 'active_advisors')
      .single();

    if (
      settingError ||
      !settingData?.value ||
      typeof settingData.value !== 'object' ||
      !('ids' in settingData.value) ||
      !Array.isArray(settingData.value.ids) ||
      settingData.value.ids.length === 0
    ) {
      return NextResponse.json({ advisors: [] });
    }

    const advisorIds: string[] = settingData.value.ids;

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .in('id', advisorIds);

    if (profilesError) {
      console.error('Error fetching advisor profiles:', profilesError.message);
      return NextResponse.json({ error: 'Failed to fetch advisors' }, { status: 500 });
    }

    const advisorNames = (profiles || [])
      .map((p) => p.full_name)
      .sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ advisors: advisorNames });
  } catch (err: any) {
    console.error('GET registration error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
