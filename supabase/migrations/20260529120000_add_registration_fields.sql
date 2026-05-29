-- Add comprehensive registration fields and storage bucket
-- Idempotent: uses IF NOT EXISTS throughout

-- 1. Add new columns to registrations table
-- Existing columns: name, email, phone, property_interest, preferred_date, message
-- We keep existing columns and add new ones
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS so_wo_do text,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS pan_card_file_url text,
  ADD COLUMN IF NOT EXISTS aadhar_number text,
  ADD COLUMN IF NOT EXISTS pan_number text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS advisor_name text,
  ADD COLUMN IF NOT EXISTS project text,
  ADD COLUMN IF NOT EXISTS property_size text,
  ADD COLUMN IF NOT EXISTS property_type text,
  ADD COLUMN IF NOT EXISTS plot_preference text,
  ADD COLUMN IF NOT EXISTS payment_plan text,
  ADD COLUMN IF NOT EXISTS payment_mode text,
  ADD COLUMN IF NOT EXISTS scheme_amount text;

-- 2. Create indexes for new queryable columns
CREATE INDEX IF NOT EXISTS idx_registrations_advisor_name
  ON public.registrations (advisor_name);

CREATE INDEX IF NOT EXISTS idx_registrations_project
  ON public.registrations (project);

CREATE INDEX IF NOT EXISTS idx_registrations_aadhar_number
  ON public.registrations (aadhar_number);

-- 3. Create Supabase Storage bucket for registration documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'registration-docs',
  'registration-docs',
  false,  -- private bucket
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage RLS policies (restrict to service role only)
DROP POLICY IF EXISTS "Allow service role full access to registration-docs" ON storage.objects;
CREATE POLICY "Allow service role full access to registration-docs"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'registration-docs' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'registration-docs' AND auth.role() = 'service_role');
