-- ============================================================================
-- 00135: Public catalogue version signal
-- ============================================================================
-- Keep one lightweight, public-safe version row per school so an already-open
-- school page can refresh when an admin mutation changes its catalogue.
-- The row contains no catalogue data and is readable only for public schools.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.public_catalogue_versions (
  school_id uuid PRIMARY KEY REFERENCES public.schools(id) ON DELETE CASCADE,
  version bigint NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_public_catalogue_versions_updated_at
  ON public.public_catalogue_versions (updated_at DESC);

ALTER TABLE public.public_catalogue_versions ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.public_catalogue_versions TO anon, authenticated;

DROP POLICY IF EXISTS public_catalogue_versions_read ON public.public_catalogue_versions;
CREATE POLICY public_catalogue_versions_read
  ON public.public_catalogue_versions
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.schools s
      WHERE s.id = public_catalogue_versions.school_id
        AND s.status = 'active'
        AND s.published IS TRUE
        AND COALESCE(s.publication_status, 'published') = 'published'
    )
  );

CREATE OR REPLACE FUNCTION public.touch_public_catalogue_version(p_school_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_school_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.public_catalogue_versions (school_id, version, updated_at)
  VALUES (p_school_id, 1, timezone('utc'::text, now()))
  ON CONFLICT (school_id) DO UPDATE
  SET
    version = public.public_catalogue_versions.version + 1,
    updated_at = timezone('utc'::text, now());
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_public_catalogue_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
BEGIN
  IF TG_TABLE_NAME = 'schools' THEN
    PERFORM public.touch_public_catalogue_version(
      CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END
    );
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'master_products' THEN
    FOR v_school_id IN
      SELECT DISTINCT p.school_id
      FROM public.school_pack_items spi
      JOIN public.school_packs p ON p.id = spi.pack_id
      WHERE spi.product_id = COALESCE(NEW.id, OLD.id)
    LOOP
      PERFORM public.touch_public_catalogue_version(v_school_id);
    END LOOP;
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'school_pack_items' THEN
    FOR v_school_id IN
      SELECT DISTINCT p.school_id
      FROM public.school_packs p
      WHERE p.id IN (
        CASE WHEN TG_OP = 'DELETE' THEN OLD.pack_id ELSE NEW.pack_id END,
        CASE WHEN TG_OP = 'UPDATE' THEN OLD.pack_id ELSE NULL END
      )
    LOOP
      PERFORM public.touch_public_catalogue_version(v_school_id);
    END LOOP;
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'school_packs' THEN
    PERFORM public.touch_public_catalogue_version(
      CASE WHEN TG_OP = 'DELETE' THEN OLD.school_id ELSE NEW.school_id END
    );
    IF TG_OP = 'UPDATE' AND OLD.school_id IS DISTINCT FROM NEW.school_id THEN
      PERFORM public.touch_public_catalogue_version(OLD.school_id);
    END IF;
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS public_catalogue_version_school ON public.schools;
CREATE TRIGGER public_catalogue_version_school
  AFTER INSERT OR UPDATE OR DELETE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.mark_public_catalogue_version();

DROP TRIGGER IF EXISTS public_catalogue_version_pack ON public.school_packs;
CREATE TRIGGER public_catalogue_version_pack
  AFTER INSERT OR UPDATE OR DELETE ON public.school_packs
  FOR EACH ROW EXECUTE FUNCTION public.mark_public_catalogue_version();

DROP TRIGGER IF EXISTS public_catalogue_version_item ON public.school_pack_items;
CREATE TRIGGER public_catalogue_version_item
  AFTER INSERT OR UPDATE OR DELETE ON public.school_pack_items
  FOR EACH ROW EXECUTE FUNCTION public.mark_public_catalogue_version();

DROP TRIGGER IF EXISTS public_catalogue_version_product ON public.master_products;
CREATE TRIGGER public_catalogue_version_product
  AFTER UPDATE OF active, visibility, pricing_status, current_selling_price, calculated_selling_price
  ON public.master_products
  FOR EACH ROW EXECUTE FUNCTION public.mark_public_catalogue_version();

INSERT INTO public.public_catalogue_versions (school_id, version, updated_at)
SELECT s.id, 1, timezone('utc'::text, now())
FROM public.schools s
WHERE s.status = 'active'
  AND s.published IS TRUE
  AND COALESCE(s.publication_status, 'published') = 'published'
ON CONFLICT (school_id) DO NOTHING;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
    AND NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'public_catalogue_versions'
    ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.public_catalogue_versions;
  END IF;
END;
$$;

ALTER TABLE public.public_catalogue_versions REPLICA IDENTITY FULL;

REVOKE ALL ON FUNCTION public.touch_public_catalogue_version(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touch_public_catalogue_version(uuid) TO service_role;
