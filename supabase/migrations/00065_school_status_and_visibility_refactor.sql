-- ============================================================================
-- 00065: School Status, Public Visibility & Checkout Mapping Refactor
-- ============================================================================
-- Purpose:
--   1. Introduce canonical operational columns on public.schools:
--      - partnership: 'partner' | 'non_partner' | 'refused_partner'
--      - feature_status: 'featured' | 'unfeatured'
--      - publication_status: 'published' | 'ready_for_review'
--   2. Backfill all existing records safely from legacy flags.
--   3. Add database check constraints enforcing authoritative values.
--   4. Keep legacy boolean columns synced during transition.
--   5. Update public_school_directory_view to reflect publication authority.
-- ============================================================================

-- 1. Add canonical columns
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS partnership varchar(32) DEFAULT 'non_partner',
  ADD COLUMN IF NOT EXISTS feature_status varchar(32) DEFAULT 'unfeatured';

-- 2. Backfill existing school records
UPDATE public.schools
SET
  partnership = CASE
    WHEN refused_partnership IS TRUE THEN 'refused_partner'
    WHEN is_partner IS TRUE THEN 'partner'
    ELSE 'non_partner'
  END,
  feature_status = CASE
    WHEN is_featured IS TRUE AND (refused_partnership IS NOT TRUE) THEN 'featured'
    ELSE 'unfeatured'
  END,
  publication_status = CASE
    WHEN publication_status = 'published' OR (publication_status IS NULL AND published IS NOT FALSE) THEN 'published'
    ELSE 'ready_for_review'
  END;

-- 3. Enforce CHECK constraints
ALTER TABLE public.schools
  DROP CONSTRAINT IF EXISTS schools_partnership_check,
  ADD CONSTRAINT schools_partnership_check
    CHECK (partnership IN ('partner', 'non_partner', 'refused_partner'));

ALTER TABLE public.schools
  DROP CONSTRAINT IF EXISTS schools_feature_status_check,
  ADD CONSTRAINT schools_feature_status_check
    CHECK (feature_status IN ('featured', 'unfeatured'));

ALTER TABLE public.schools
  DROP CONSTRAINT IF EXISTS schools_publication_status_check,
  ADD CONSTRAINT schools_publication_status_check
    CHECK (publication_status IN ('published', 'ready_for_review'));

-- 4. Bi-directional sync trigger for legacy columns during transition
CREATE OR REPLACE FUNCTION public.sync_school_status_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- When canonical fields are present, keep legacy flags synchronized
  NEW.is_partner := (NEW.partnership = 'partner');
  NEW.refused_partnership := (NEW.partnership = 'refused_partner');
  NEW.is_featured := (NEW.feature_status = 'featured');
  NEW.published := (NEW.publication_status = 'published');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_school_status_fields ON public.schools;
CREATE TRIGGER trg_sync_school_status_fields
  BEFORE INSERT OR UPDATE ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_school_status_fields();

-- 5. Recreate public_school_directory_view to reflect the new canonical model
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
  s.partnership,
  s.feature_status,
  s.parent_collection_accepted,
  s.partner_since,
  s.lowest_price,
  s.grades,
  s.principal,
  s.custom_badge,
  s.latitude,
  s.longitude,
  s.publication_status,
  s.directory_status,
  s.stationery_list_status,
  -- Backward-compatibility aliases during transition
  (s.partnership = 'partner') AS is_partner,
  (s.feature_status = 'featured') AS is_featured,
  (s.partnership = 'refused_partner') AS refused_partnership,
  (s.publication_status = 'published') AS published,
  s.created_at,
  s.updated_at
FROM public.schools s
WHERE s.publication_status = 'published';

GRANT SELECT ON public.public_school_directory_view TO anon, authenticated, service_role;
