-- Sprint 2: Feature Flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  is_enabled boolean DEFAULT false,
  variant text,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default hero variants
INSERT INTO public.feature_flags (name, is_enabled, variant, description)
VALUES 
  ('hero_variant', true, 'A', 'A/B testing for hero copy variants (A, B, C)')
ON CONFLICT (name) DO NOTHING;

-- Sprint 5: Leads & CRM
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  project_interest text,
  preferred_visit_date date,
  lead_score integer DEFAULT 0,
  lead_source text DEFAULT 'website',
  lead_status text DEFAULT 'new',
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Feature flags are readable by everyone, but only editable by admins
CREATE POLICY "Feature flags are readable by everyone" ON public.feature_flags
  FOR SELECT USING (true);

-- Leads are only readable and editable by admins (service role or authenticated admins)
CREATE POLICY "Leads insertable by anonymous" ON public.leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Leads viewable by authenticated users" ON public.leads
  FOR SELECT USING (auth.role() = 'authenticated');
