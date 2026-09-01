-- ============================================================================
-- 00063: Public Read Models & Public School Directory View
-- ============================================================================
-- Purpose:
--   1. Establishes the authoritative public read model for public school listings.
--   2. Sanitises public queries by selecting only customer-safe school fields.
--   3. Enforces publication status and directory status filters on public pack items view.
-- ============================================================================

-- 1. Create Public School Directory View --------------------------------------

DROP VIEW IF EXISTS public.public_pack_items_view CASCADE;
DROP VIEW IF EXISTS public.public_school_directory_view CASCADE;

CREATE OR REPLACE VIEW public.public_school_directory_view
WITH (security_invoker = true)
AS
SELECT
  s.id,
  s.name,
  s.slug,
  s.city,
  s.province,
  s.district,
  s.logo,
  s.is_partner,
  s.is_featured,
  s.refused_partnership,
  s.lowest_price,
  s.grades,
  s.principal,
  s.parent_collection_accepted,
  s.custom_badge,
  s.publication_status,
  s.directory_status,
  s.stationery_list_status,
  s.created_at,
  s.updated_at
FROM public.schools s
WHERE (
    s.publication_status = 'published' 
    OR (s.publication_status IS NULL AND s.published IS NOT FALSE AND s.status = 'active')
  )
  AND (
    s.directory_status = 'listed' 
    OR s.directory_status IS NULL
  );

GRANT SELECT ON public.public_school_directory_view TO anon, authenticated, service_role;

-- 2. Refine Public Pack Items View with Explicit Publication Filters ---------

CREATE OR REPLACE VIEW public.public_pack_items_view
WITH (security_invoker = true)
AS
SELECT c.*
FROM public.canonical_pack_items_view c
JOIN public.school_packs p ON p.id = c.pack_id
LEFT JOIN public.schools s ON s.id = p.school_id
WHERE c.visible = true
  AND (
    p.publication_status = 'published'
    OR (p.publication_status IS NULL AND p.visible = true)
  )
  AND (
    s.id IS NULL
    OR s.publication_status = 'published'
    OR (s.publication_status IS NULL AND s.published IS NOT FALSE AND s.status = 'active')
  );

GRANT SELECT ON public.public_pack_items_view TO anon, authenticated, service_role;
