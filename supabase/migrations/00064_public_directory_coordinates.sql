-- ============================================================================
-- 00064: Public Directory Coordinates
-- ============================================================================
-- Purpose:
--   Expose safe school coordinates through the public read model so public
--   search, featured, and nearby queries can use one publication-aware source.
-- ============================================================================

DROP VIEW IF EXISTS public.public_school_directory_view CASCADE;

CREATE VIEW public.public_school_directory_view
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
  s.latitude,
  s.longitude,
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