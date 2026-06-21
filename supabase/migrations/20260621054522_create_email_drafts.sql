-- Email drafts for compose auto-save
CREATE TABLE IF NOT EXISTS public.email_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_emails TEXT DEFAULT '',
  cc_emails TEXT DEFAULT '',
  bcc_emails TEXT DEFAULT '',
  subject TEXT DEFAULT '',
  html_body TEXT DEFAULT '',
  reply_to TEXT DEFAULT '',
  from_name TEXT DEFAULT 'SVI Infra',
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast user query
CREATE INDEX IF NOT EXISTS idx_email_drafts_user_id ON public.email_drafts(user_id);

-- Only one current (auto-save) draft per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_drafts_user_current ON public.email_drafts(user_id) WHERE is_current = true;

ALTER TABLE public.email_drafts ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own drafts
DROP POLICY IF EXISTS "Users can manage their own drafts" ON public.email_drafts;
CREATE POLICY "Users can manage their own drafts"
  ON public.email_drafts
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

NOTIFY pgrst, 'reload schema';
