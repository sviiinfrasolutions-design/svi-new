-- Allow public to read specific site settings like lottery_page_visible
-- This lets client components check visibility without auth

DROP POLICY IF EXISTS "Public can read lottery visibility" ON public.portal_settings;
CREATE POLICY "Public can read lottery visibility"
  ON public.portal_settings FOR SELECT
  USING (key = 'lottery_page_visible');
