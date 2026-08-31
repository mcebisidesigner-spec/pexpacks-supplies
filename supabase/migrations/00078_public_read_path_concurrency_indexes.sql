-- Migration 00079: Public read-path indexes for high-concurrency traffic
-- ============================================================================
-- These indexes target the exact public catalogue access patterns:
--   - school search/listing over published schools
--   - region filters using lower(city/province/district)
--   - grade/phase filters over schools.grades JSONB
--   - school detail pages loading published packs by school_id in display order
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_schools_public_listing_order
ON public.schools (
  (COALESCE(feature_status = 'featured', is_featured, false)) DESC,
  (COALESCE(partnership = 'partner', is_partner, false)) DESC,
  name ASC
)
WHERE publication_status = 'published';

CREATE INDEX IF NOT EXISTS idx_schools_public_city_lower
ON public.schools (lower(city))
WHERE publication_status = 'published' AND city IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_schools_public_province_lower
ON public.schools (lower(province))
WHERE publication_status = 'published' AND province IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_schools_public_district_lower
ON public.schools (lower(district))
WHERE publication_status = 'published' AND district IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_schools_public_grades
ON public.schools USING gin (grades)
WHERE publication_status = 'published';

CREATE INDEX IF NOT EXISTS idx_school_packs_public_school_order
ON public.school_packs (school_id, sort_order ASC, title ASC)
WHERE publication_status = 'published'
   OR (publication_status IS NULL AND visible IS TRUE);
