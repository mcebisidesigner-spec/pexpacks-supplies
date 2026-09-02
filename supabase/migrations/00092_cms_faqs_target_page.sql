-- Migration 00092: Add target_page to cms_faqs and per-page public FAQ RPC
-- ============================================================================
-- Allows FAQs to be categorized by page (e.g. 'homepage', 'schools', 'all')
-- so admins can see which page FAQs belong to, and storefront pages fetch
-- their respective per-page FAQs directly from the database.
-- ============================================================================

ALTER TABLE public.cms_faqs
  ADD COLUMN IF NOT EXISTS target_page text NOT NULL DEFAULT 'all';

ALTER TABLE public.cms_faqs DROP CONSTRAINT IF EXISTS cms_faqs_target_page_check;
ALTER TABLE public.cms_faqs
  ADD CONSTRAINT cms_faqs_target_page_check CHECK (target_page IN ('all', 'homepage', 'schools'));

-- Mark existing initial FAQs as homepage FAQs
UPDATE public.cms_faqs
SET target_page = 'homepage'
WHERE target_page = 'all';

-- Seed initial Schools page FAQs if they don't already exist
INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'Payments', 'Can I split my pack payments?', 'Yes — split the total into 2 interest-free payments with Happy Pay. Pay 50% today, and the rest is auto-deducted 30 days later.', 1, true, 'published', 'schools'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'Can I split my pack payments?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'School Packs', 'Are these lists for the upcoming academic year?', 'Yes, every list is updated directly from the school.', 2, true, 'published', 'schools'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'Are these lists for the upcoming academic year?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'School Packs', 'Do I have to buy the whole pack?', 'No. Select your school, then use our system to add or remove items before checkout.', 3, true, 'published', 'schools'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'Do I have to buy the whole pack?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'School Packs', 'Are the brands high quality?', 'Yes, we use teacher-approved brands like Croxley, BIC, Pritt, Staedtler, and Pilot.', 4, true, 'published', 'schools'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'Are the brands high quality?');

-- Index for per-page queries
CREATE INDEX IF NOT EXISTS idx_cms_faqs_target_page
  ON public.cms_faqs (target_page, sort_order, created_at)
  WHERE status = 'published' AND is_published = true;

-- Replace RPC to accept optional p_page parameter
DROP FUNCTION IF EXISTS public.get_public_cms_faqs();
DROP FUNCTION IF EXISTS public.get_public_cms_faqs(text);

CREATE OR REPLACE FUNCTION public.get_public_cms_faqs(p_page text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  category text,
  question text,
  answer text,
  sort_order integer,
  target_page text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    f.id,
    f.category,
    f.question,
    f.answer,
    COALESCE(f.sort_order, 0) AS sort_order,
    f.target_page
  FROM public.cms_faqs f
  WHERE f.status = 'published'
    AND f.is_published = true
    AND f.published_at <= timezone('utc', now())
    AND (f.expires_at IS NULL OR f.expires_at > timezone('utc', now()))
    AND (
      p_page IS NULL
      OR p_page = 'all'
      OR f.target_page = 'all'
      OR f.target_page = p_page
    )
  ORDER BY COALESCE(f.sort_order, 0), f.created_at;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_cms_faqs(text) TO anon, authenticated, service_role;
