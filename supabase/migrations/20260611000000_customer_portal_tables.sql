-- ============================================================
-- Customer Portal Tables - Allotments & Payment Schedules
-- ============================================================

-- 1. Allotments Table (Customer Properties)
CREATE TABLE IF NOT EXISTS public.allotments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete restrict,
  unit_no text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Allotted', 'Registered', 'Cancelled')),
  allotted_date date not null default CURRENT_DATE,
  notes text,
  metadata jsonb default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_allotments_user_id ON public.allotments(user_id);
CREATE INDEX IF NOT EXISTS idx_allotments_property_id ON public.allotments(property_id);

-- RLS
ALTER TABLE public.allotments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own allotments" ON public.allotments;
DROP POLICY IF EXISTS "Admins can view all allotments" ON public.allotments;
DROP POLICY IF EXISTS "Service role full access on allotments" ON public.allotments;

CREATE POLICY "Users can view their own allotments"
  ON public.allotments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all allotments"
  ON public.allotments FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Service role full access on allotments"
  ON public.allotments FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger
DROP TRIGGER IF EXISTS allotments_updated_at ON public.allotments;
CREATE TRIGGER allotments_updated_at
  BEFORE UPDATE ON public.allotments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- 2. Payment Schedules Table
CREATE TABLE IF NOT EXISTS public.payment_schedules (
  id uuid primary key default uuid_generate_v4(),
  allotment_id uuid not null references public.allotments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null, -- E.g., 'Booking Amount', '1st Installment'
  amount numeric not null check (amount > 0),
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue')),
  paid_date date,
  receipt_url text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_schedules_allotment_id ON public.payment_schedules(allotment_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_user_id ON public.payment_schedules(user_id);

-- RLS
ALTER TABLE public.payment_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own payment schedules" ON public.payment_schedules;
DROP POLICY IF EXISTS "Admins can view all payment schedules" ON public.payment_schedules;
DROP POLICY IF EXISTS "Service role full access on payment schedules" ON public.payment_schedules;

CREATE POLICY "Users can view their own payment schedules"
  ON public.payment_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment schedules"
  ON public.payment_schedules FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Service role full access on payment schedules"
  ON public.payment_schedules FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger
DROP TRIGGER IF EXISTS payment_schedules_updated_at ON public.payment_schedules;
CREATE TRIGGER payment_schedules_updated_at
  BEFORE UPDATE ON public.payment_schedules
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Add 'property_image_url' and 'location' to public.properties if they don't exist
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS image_url text;

-- Add 'amount' field to documents to store receipt amounts
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS amount numeric;
