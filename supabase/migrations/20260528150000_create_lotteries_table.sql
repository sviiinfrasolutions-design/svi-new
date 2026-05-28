-- 1. Create Lotteries Table
CREATE TABLE IF NOT EXISTS public.lotteries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lotteries ENABLE ROW LEVEL SECURITY;

-- Select policy: Allow anyone (public) to view active/completed lotteries
DROP POLICY IF EXISTS "Allow public select on active lotteries" ON public.lotteries;
CREATE POLICY "Allow public select on active lotteries"
  ON public.lotteries FOR SELECT
  USING (true);

-- Admin policies: Full access for administrative profiles
DROP POLICY IF EXISTS "Allow admins full access on lotteries" ON public.lotteries;
CREATE POLICY "Allow admins full access on lotteries"
  ON public.lotteries FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- 2. Create Lottery Participants Table
CREATE TABLE IF NOT EXISTS public.lottery_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lottery_id UUID NOT NULL REFERENCES public.lotteries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  ticket_number TEXT NOT NULL,
  is_winner BOOLEAN NOT NULL DEFAULT false,
  prize_rank INT, -- 1 for Grand Prize, 2 for second, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lottery_participants ENABLE ROW LEVEL SECURITY;

-- Select policy: Allow public to view participants & winners
DROP POLICY IF EXISTS "Allow public select on participants" ON public.lottery_participants;
CREATE POLICY "Allow public select on participants"
  ON public.lottery_participants FOR SELECT
  USING (true);

-- Admin policies: Full access to add/modify participants
DROP POLICY IF EXISTS "Allow admins full access on participants" ON public.lottery_participants;
CREATE POLICY "Allow admins full access on participants"
  ON public.lottery_participants FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_lottery_participants_lottery_id ON public.lottery_participants(lottery_id);
CREATE INDEX IF NOT EXISTS idx_lottery_participants_is_winner ON public.lottery_participants(is_winner) WHERE is_winner = true;
