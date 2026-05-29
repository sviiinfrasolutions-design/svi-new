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

  // Insert into database
  const { data, error } = await supabaseAdmin
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
    })
    .select()
    .single();

  if (error) {
    console.error('Registration submission error:', error.message);
    return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 });
  }

  // Send email notification (non-blocking)
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const { Resend } = await import('resend');
      const resend = new Resend(resendApiKey);
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@sviinfra.com';

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
    }
  } catch (emailErr) {
    console.error('Email notification failed:', emailErr);
  }

  return NextResponse.json({ success: true, id: data.id });
}
