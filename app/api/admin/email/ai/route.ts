import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { rateLimit } from '@/src/lib/api/rateLimit';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { streamText, generateText } from 'ai';
import { groq } from '@ai-sdk/groq';
import emailTemplates from '@/src/data/email-templates.json';

export const maxDuration = 30;

// ─── System prompts per action ───────────────────────────────

const EMAIL_SYSTEM_PROMPT = `You are an AI email writing assistant for SVI Infra Solutions Pvt. Ltd., a premium real estate developer in India.
Write professional business emails in Indian English. Be clear, courteous, and property-focused.
- Use respectful salutations (Dear/Respected)
- Keep paragraphs concise
- End with a professional sign-off
- Use ₹ for currency
- Reference SVI Infra's projects when relevant
- Maintain a warm yet professional tone throughout`;

const IMPROVE_PROMPT = `You are an email editor. Improve the given email HTML for grammar, tone, clarity, and professionalism.
- Preserve the original meaning and all factual details
- Keep the HTML structure intact
- Fix grammar and spelling errors
- Improve sentence flow and readability
- Make the tone more professional if needed
- Return ONLY the improved HTML, nothing else`;

const SUMMARIZE_PROMPT = `You are an email thread summarizer for SVI Infra Solutions admin team.
Analyze the email thread and return a JSON object with this exact structure:
{
  "keyPoints": ["point 1", "point 2"],
  "actionItems": ["action 1", "action 2"],
  "deadlines": ["deadline 1"],
  "sentiment": "positive|neutral|negative|urgent"
}
- Extract key discussion points as bullet points
- Identify any action items or follow-ups needed
- Note any deadlines or time-sensitive items
- Assess overall sentiment
- Return ONLY valid JSON, no markdown or explanation`;

const POPULATE_TEMPLATE_PROMPT = `You are a template variable assistant for SVI Infra Solutions.
Given a list of template variables and available recipient data, suggest values for each variable.
Return a JSON object with this exact structure:
{
  "suggestions": { "variableName": "suggested value" },
  "confidence": { "variableName": "high|medium|low" }
}
- Map available data to template variables intelligently
- "high" confidence = direct match from data
- "medium" confidence = inferred from related fields
- "low" confidence = best guess based on patterns
- For missing data, use empty string with "low" confidence
- Return ONLY valid JSON`;

const SENTIMENT_PROMPT = `You are a sentiment analysis assistant for SVI Infra Solutions admin team.
Analyze the email and return a JSON object with this exact structure:
{
  "sentiment": "positive|neutral|negative|urgent",
  "score": 0.0,
  "summary": "Brief 1-2 sentence summary of the email's tone and intent",
  "suggestedResponses": [
    { "label": "Professional Acknowledgment", "tone": "professional", "html": "<p>response html</p>" },
    { "label": "Empathetic Response", "tone": "empathetic", "html": "<p>response html</p>" },
    { "label": "Action-Oriented", "tone": "action", "html": "<p>response html</p>" }
  ]
}
- sentiment: positive (happy, grateful), neutral (informational), negative (complaint, frustrated), urgent (time-sensitive, angry)
- score: 0.0 (very negative) to 1.0 (very positive)
- Generate 2-3 suggested response drafts in HTML format
- Responses should be professional, Indian English, property-business appropriate
- Return ONLY valid JSON`;

// ─── Handler ─────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Rate limit: 10 AI requests per admin per minute
  const limited = rateLimit(request, { limit: 10, windowSeconds: 60 });
  if (limited) return limited;

  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action field' }, { status: 400 });
    }

    // ─── Auto Compose: subject → template match or AI-generated (streaming) ───
    if (action === 'auto_compose') {
      const { subject, to, cc } = body;
      if (!subject) {
        return NextResponse.json({ error: 'Missing subject' }, { status: 400 });
      }

      // Fetch recipient context if email provided
      let recipientData: Record<string, any> = {};
      if (to) {
        recipientData = await fetchRecipientData(to);
      }

      // Build existing templates list for AI to match against
      const templatesList = getTemplatesSummary();

      const prompt = `You are an email template assistant for SVI Infra Solutions.

EXISTING TEMPLATES:
${templatesList}

TASK:
Analyze the email subject below and do ONE of the following:

1) If the subject MATCHES an existing template above, respond with:
   {"action":"template_match","templateId":"the_template_id","templateName":"Template Name","variables":{"var1":"value1",...}}
   Then on the NEXT line, output the template HTML with all variables filled in using the recipient data.

2) If the subject does NOT match any existing template, CREATE a new email template on the fly:
   {"action":"ai_template","templateId":"_ai_generated","templateName":"A Short Descriptive Name","variables":{"var1":"suggested_value",...}}
   Then on the NEXT line, output the complete email HTML. Use {{variable}} placeholders for dynamic values. Wrap the email in proper HTML structure matching SVI Infra's style (gold/navy header, professional body, footer).

RECIPIENT DATA:
${JSON.stringify(recipientData, null, 2)}

EMAIL SUBJECT: ${subject}

IMPORTANT: First line MUST be valid JSON only. Second line onwards is HTML. No other text.`;

      const result = streamText({
        model: groq('llama-3.3-70b-versatile'),
        system: EMAIL_SYSTEM_PROMPT,
        prompt,
      });

      return result.toTextStreamResponse();
    }

    // ─── Feature 1: Generate email content (streaming) ─────
    if (action === 'generate') {
      const { prompt, tone, context } = body;
      if (!prompt) {
        return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
      }

      const toneInstruction = tone ? `Write in a ${tone} tone.` : 'Write in a professional tone.';

      const contextInfo = context?.recipientName ? `Recipient: ${context.recipientName}.` : '';
      const subjectInfo = context?.subject ? `Email subject: ${context.subject}.` : '';

      const result = streamText({
        model: groq('llama-3.3-70b-versatile'),
        system: EMAIL_SYSTEM_PROMPT,
        prompt: `${toneInstruction} ${contextInfo} ${subjectInfo}\n\nWrite an email body for: ${prompt}\n\nReturn ONLY the email body HTML (no subject line, no explanation).`,
      });

      return result.toTextStreamResponse();
    }

    // ─── Feature 2: Improve email content (streaming) ──────
    if (action === 'improve') {
      const { html, instruction } = body;
      if (!html) {
        return NextResponse.json({ error: 'Missing html content' }, { status: 400 });
      }

      const instructionText = instruction
        ? `Specific instruction: ${instruction}`
        : 'General improvement for grammar, tone, and clarity.';

      const result = streamText({
        model: groq('llama-3.3-70b-versatile'),
        system: IMPROVE_PROMPT,
        prompt: `${instructionText}\n\nOriginal email HTML:\n${html}`,
      });

      return result.toTextStreamResponse();
    }

    // ─── Feature 3: Summarize email thread (non-streaming) ─
    if (action === 'summarize') {
      const { emails } = body;
      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return NextResponse.json({ error: 'Missing emails array' }, { status: 400 });
      }

      const threadText = emails
        .map(
          (e: any, i: number) =>
            `--- Email ${i + 1} ---\nFrom: ${e.from || 'Unknown'}\nSubject: ${e.subject || '(no subject)'}\nDate: ${e.created_at || 'Unknown'}\nContent:\n${stripHtml(e.html || e.text || '')}`
        )
        .join('\n\n');

      const { text } = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        system: SUMMARIZE_PROMPT,
        prompt: `Summarize this email thread:\n\n${threadText}`,
      });

      // Parse JSON response
      try {
        const summary = JSON.parse(text);
        return NextResponse.json({ success: true, summary });
      } catch {
        // Try extracting JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const summary = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, summary });
        }
        return NextResponse.json({ error: 'Failed to parse summary' }, { status: 500 });
      }
    }

    // ─── Feature 4: Populate template variables (non-streaming) ─
    if (action === 'populate_template') {
      const { templateId, variables, recipientEmail } = body;
      if (!variables || !Array.isArray(variables)) {
        return NextResponse.json({ error: 'Missing variables array' }, { status: 400 });
      }

      // Fetch recipient data if email provided
      let recipientData: Record<string, any> = {};
      if (recipientEmail) {
        recipientData = await fetchRecipientData(recipientEmail);
      }

      const { text } = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        system: POPULATE_TEMPLATE_PROMPT,
        prompt: `Template ID: ${templateId || 'unknown'}\n\nVariables to populate:\n${variables.join(', ')}\n\nRecipient data:\n${JSON.stringify(recipientData, null, 2)}`,
      });

      try {
        const result = JSON.parse(text);
        return NextResponse.json({ success: true, ...result });
      } catch {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, ...result });
        }
        return NextResponse.json({ error: 'Failed to parse suggestions' }, { status: 500 });
      }
    }

    // ─── Feature 5: Sentiment analysis (non-streaming) ─────
    if (action === 'analyze_sentiment') {
      const { emailHtml, emailText } = body;
      if (!emailHtml && !emailText) {
        return NextResponse.json({ error: 'Missing email content' }, { status: 400 });
      }

      const content = stripHtml(emailHtml || '') || emailText || '';

      const { text } = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        system: SENTIMENT_PROMPT,
        prompt: `Analyze this email:\n\n${content}`,
      });

      try {
        const result = JSON.parse(text);
        return NextResponse.json({ success: true, ...result });
      } catch {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, ...result });
        }
        return NextResponse.json({ error: 'Failed to parse sentiment analysis' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return handleApiError(err);
  }
}

// ─── Helpers ─────────────────────────────────────────────────

/** Build a summary of email templates for AI to match against */
function getTemplatesSummary(): string {
  return (emailTemplates as Array<{ id: string; name: string; subject: string; category?: string }>)
    .map((t) => `- id: ${t.id} | name: ${t.name} | subject: ${t.subject}`)
    .join('\n');
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchRecipientData(email: string): Promise<Record<string, any>> {
  const data: Record<string, any> = { email };

  try {
    // Check profiles table
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (profile) {
      data.name = profile.full_name || profile.name;
      data.phone = profile.phone;
      data.full_name = profile.full_name;
    }

    // Check registrations table
    const { data: registration } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (registration) {
      data.registration = registration;
      data.project = registration.project || registration.property_interest;
      data.property_type = registration.property_type;
      data.property_size = registration.property_size;
      data.submission_id = registration.submission_id;
      data.advisor_name = registration.advisor_name;
    }

    // Check allotment_records for this email's user
    const { data: allotment } = await supabaseAdmin
      .from('allotment_records')
      .select('*')
      .eq('form_data->>clientEmail', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (allotment) {
      const fd = allotment.form_data || {};
      data.allotment = fd;
      data.clientName = fd.clientName;
      data.projectName = fd.projectName;
      data.unitNumber = fd.unitNumber;
      data.area = fd.area;
      data.bsp = fd.bsp;
      data.ticketId = fd.ticketId;
    }

    // Check receipt_records
    const { data: receipt } = await supabaseAdmin
      .from('receipt_records')
      .select('*')
      .eq('form_data->>email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (receipt) {
      data.receipt = receipt.form_data;
    }

    // Check payment_records
    const { data: payment } = await supabaseAdmin
      .from('payment_records')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (payment) {
      data.payment = payment;
    }
  } catch (err) {
    console.error('[AI] Error fetching recipient data:', err);
  }

  return data;
}
