-- 1. Create scheduled_draws table
CREATE TABLE IF NOT EXISTS public.scheduled_draws (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lottery_id           uuid NOT NULL REFERENCES public.lotteries(id) ON DELETE CASCADE,
  scheduled_at         timestamptz NOT NULL,
  pre_notify_minutes   integer NOT NULL DEFAULT 60,
  show_countdown       boolean NOT NULL DEFAULT true,
  include_countdown_in_email boolean NOT NULL DEFAULT true,
  status               text NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'reminder_sent', 'executed', 'cancelled')),
  reminder_sent_at     timestamptz,
  executed_at          timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_draws_lottery_id ON public.scheduled_draws(lottery_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_draws_status     ON public.scheduled_draws(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_draws_scheduled  ON public.scheduled_draws(scheduled_at);

-- RLS
ALTER TABLE public.scheduled_draws ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON public.scheduled_draws;
DROP POLICY IF EXISTS "Public can read pending draws" ON public.scheduled_draws;

-- Service role (backend) has full access
CREATE POLICY "Service role full access"
  ON public.scheduled_draws FOR ALL
  USING (auth.role() = 'service_role');

-- Anon/public can read pending/reminder_sent draws (for countdown display)
CREATE POLICY "Public can read pending draws"
  ON public.scheduled_draws FOR SELECT
  USING (status IN ('pending', 'reminder_sent'));

-- Auto-update updated_at
DROP TRIGGER IF EXISTS scheduled_draws_updated_at ON public.scheduled_draws;
CREATE TRIGGER scheduled_draws_updated_at
  BEFORE UPDATE ON public.scheduled_draws
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 2. Extend activity_logs action_type CHECK to include lottery_drawn and lottery_scheduled
ALTER TABLE public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_action_type_check;
ALTER TABLE public.activity_logs ADD CONSTRAINT activity_logs_action_type_check
  CHECK (action_type IN (
    'user_created', 'user_deleted', 'document_generated', 'document_downloaded',
    'settings_updated', 'profile_updated', 'team_created', 'team_deleted',
    'attendance_marked', 'lottery_drawn', 'lottery_scheduled', 'lottery_schedule_cancelled'
  ));
