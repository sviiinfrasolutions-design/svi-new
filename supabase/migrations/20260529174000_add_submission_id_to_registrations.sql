-- Migration to add submission_id to registrations table
-- 1. Add column if it doesn't exist
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS submission_id text;

-- 2. Backfill existing registrations with sequential IDs starting from SVI2200
DO $$
DECLARE
    r RECORD;
    seq_val INT := 2200;
BEGIN
    FOR r IN (
        SELECT id 
        FROM public.registrations 
        WHERE submission_id IS NULL 
        ORDER BY created_at ASC
    ) LOOP
        -- Keep updating until we find a unique ID that isn't already taken
        -- (in case some IDs were manually set, though unlikely)
        WHILE EXISTS (SELECT 1 FROM public.registrations WHERE submission_id = 'SVI' || seq_val) LOOP
            seq_val := seq_val + 1;
        END LOOP;
        
        UPDATE public.registrations
        SET submission_id = 'SVI' || seq_val
        WHERE id = r.id;
        
        seq_val := seq_val + 1;
    END LOOP;
END $$;

-- 3. Add database-level uniqueness constraint
ALTER TABLE public.registrations
  DROP CONSTRAINT IF EXISTS registrations_submission_id_key;

ALTER TABLE public.registrations
  ADD CONSTRAINT registrations_submission_id_key UNIQUE (submission_id);

-- 4. Create index for performance
CREATE INDEX IF NOT EXISTS idx_registrations_submission_id
  ON public.registrations (submission_id);
