-- ============================================================
-- SVI Infra — Email Campaigns Feature Migration
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Create email_campaigns table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               text NOT NULL,
  subject             text NOT NULL,
  body_html           text NOT NULL,
  recipient_group     text NOT NULL DEFAULT 'all_users'
                      CHECK (recipient_group IN ('all_users', 'lottery_participants', 'custom')),
  custom_emails       text[],                        -- used when recipient_group = 'custom'
  status              text NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')),
  scheduled_at        timestamptz,                   -- main send time (UTC)
  reminder_at         timestamptz,                   -- optional reminder send time (UTC)
  reminder_subject    text,                          -- subject for reminder email (optional override)
  reminder_sent_at    timestamptz,
  sent_at             timestamptz,
  recipient_count     integer DEFAULT 0,
  created_by          uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_status       ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_at ON public.email_campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_reminder_at  ON public.email_campaigns(reminder_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by   ON public.email_campaigns(created_by);

-- RLS
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on campaigns"  ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins can manage campaigns"            ON public.email_campaigns;

-- Service role (backend/cron) has full access
CREATE POLICY "Service role full access on campaigns"
  ON public.email_campaigns FOR ALL
  USING (auth.role() = 'service_role');

-- Authenticated admins can read + write
CREATE POLICY "Admins can manage campaigns"
  ON public.email_campaigns FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Auto-update updated_at
DROP TRIGGER IF EXISTS campaigns_updated_at ON public.email_campaigns;
CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================================
-- 2. Extend activity_logs action_type if not already done
-- ============================================================
ALTER TABLE public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_action_type_check;
ALTER TABLE public.activity_logs ADD CONSTRAINT activity_logs_action_type_check
  CHECK (action_type IN (
    'user_created', 'user_deleted', 'document_generated', 'document_downloaded',
    'settings_updated', 'profile_updated', 'team_created', 'team_deleted',
    'attendance_marked', 'lottery_drawn', 'lottery_scheduled', 'lottery_schedule_cancelled',
    'campaign_created', 'campaign_sent', 'campaign_scheduled', 'campaign_deleted', 'campaign_updated'
  ));
