import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const resendApiKey = process.env.RESEND_API_KEY!;
const resend = new Resend(resendApiKey);

async function testResend() {
  console.log('Testing Resend sending capability...');
  try {
    const data = await resend.emails.send({
      from: 'SVI Infra <noreply@sviiinfrasolutions.com>',
      to: ['hr.sviinfrasolutions@gmail.com'], // using the admin email from env
      subject: 'Test Email Verification',
      html: '<p>If you receive this, the Resend integration is working perfectly.</p>',
    });
    console.log('✅ Email sent successfully:', data);
  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
  }
}

testResend().catch(console.error);
