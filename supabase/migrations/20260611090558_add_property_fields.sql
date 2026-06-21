-- Add missing fields to properties table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric,
ADD COLUMN IF NOT EXISTS type text,
ADD COLUMN IF NOT EXISTS status text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS price numeric,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS gallery text[],
ADD COLUMN IF NOT EXISTS amenities text[];

-- Create project_images table if it doesn't exist (it was referenced in propertyRepository.ts)
CREATE TABLE IF NOT EXISTS public.project_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    alt_text text,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- RLS for project_images
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read project images" ON public.project_images;
DROP POLICY IF EXISTS "Admins can modify project images" ON public.project_images;

CREATE POLICY "Anyone can read project images"
    ON public.project_images FOR SELECT
    USING (true);

CREATE POLICY "Admins can modify project images"
    ON public.project_images FOR ALL
    USING (public.is_admin());

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

CREATE TABLE IF NOT EXISTS public.faqs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question text NOT NULL,
    answer text NOT NULL,
    category text DEFAULT 'general',
    sort_order integer DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read faqs" ON public.faqs;
DROP POLICY IF EXISTS "Admins can modify faqs" ON public.faqs;

CREATE POLICY "Anyone can read faqs"
    ON public.faqs FOR SELECT
    USING (active = true OR (auth.role() = 'authenticated' AND public.is_admin()));

CREATE POLICY "Admins can modify faqs"
    ON public.faqs FOR ALL
    USING (public.is_admin());

NOTIFY pgrst, 'reload schema';
