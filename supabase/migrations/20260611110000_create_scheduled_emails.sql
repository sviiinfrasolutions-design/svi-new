CREATE TABLE IF NOT EXISTS public.scheduled_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_emails TEXT[] NOT NULL,
  cc_emails TEXT[],
  bcc_emails TEXT[],
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  reply_to TEXT,
  in_reply_to TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.scheduled_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scheduled emails" 
  ON public.scheduled_emails 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS public.email_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  content_type TEXT,
  size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.email_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email attachments" 
  ON public.email_attachments 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

NOTIFY pgrst, 'reload schema';
