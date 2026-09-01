-- Migration 00085: Public directory RPCs and operational archive support
-- ============================================================================
-- Keeps public directory reads behind slim RPC contracts and provides an
-- opt-in archive routine for old operational history tables.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_public_featured_schools(limit_count integer DEFAULT 4)
RETURNS TABLE(
  id uuid,
  name text,
  slug text,
  city text,
  district text,
  province text,
  logo text,
  is_partner boolean,
  is_featured boolean,
  partnership text,
  lowest_price numeric,
  grades jsonb,
  custom_badge text,
  canonical_pack_item_count bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  WITH candidates AS (
    SELECT
      s.id,
      s.name,
      s.slug,
      s.city,
      s.district,
      s.province,
      s.logo,
      s.is_partner,
      s.is_featured,
      s.partnership,
      s.lowest_price,
      s.grades,
      s.custom_badge,
      COALESCE(SUM(ps.item_count), 0)::bigint AS canonical_pack_item_count,
      CASE WHEN s.feature_status = 'featured' OR s.is_featured IS TRUE THEN 0 ELSE 1 END AS feature_rank,
      CASE WHEN s.partnership = 'partner' OR s.is_partner IS TRUE THEN 0 ELSE 1 END AS partner_rank
    FROM public.public_school_directory_view s
    LEFT JOIN public.pack_subtotals ps ON ps.school_id = s.id
    WHERE COALESCE(s.partnership, CASE WHEN s.is_partner IS TRUE THEN 'partner' ELSE 'non_partner' END) IN ('partner', 'non_partner')
    GROUP BY s.id, s.name, s.slug, s.city, s.district, s.province, s.logo, s.is_partner, s.is_featured,
      s.partnership, s.lowest_price, s.grades, s.custom_badge, s.feature_status
  )
  SELECT
    c.id,
    c.name,
    c.slug,
    c.city,
    c.district,
    c.province,
    c.logo,
    c.is_partner,
    c.is_featured,
    c.partnership,
    c.lowest_price,
    c.grades,
    c.custom_badge,
    c.canonical_pack_item_count
  FROM candidates c
  ORDER BY c.feature_rank, c.partner_rank, c.name
  LIMIT LEAST(GREATEST(COALESCE(limit_count, 4), 1), 24)
$function$;

CREATE OR REPLACE FUNCTION public.get_public_nearby_schools(
  user_lat double precision,
  user_lng double precision,
  result_limit integer DEFAULT 8
)
RETURNS TABLE(
  id uuid,
  name text,
  slug text,
  city text,
  district text,
  province text,
  logo text,
  is_partner boolean,
  is_featured boolean,
  partnership text,
  lowest_price numeric,
  grades jsonb,
  custom_badge text,
  latitude double precision,
  longitude double precision,
  canonical_pack_item_count bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  WITH candidates AS (
    SELECT
      s.id,
      s.name,
      s.slug,
      s.city,
      s.district,
      s.province,
      s.logo,
      s.is_partner,
      s.is_featured,
      s.partnership,
      s.lowest_price,
      s.grades,
      s.custom_badge,
      s.latitude::double precision AS latitude,
      s.longitude::double precision AS longitude,
      COALESCE(SUM(ps.item_count), 0)::bigint AS canonical_pack_item_count,
      6371 * 2 * asin(
        sqrt(
          power(sin(radians((s.latitude::double precision - user_lat) / 2)), 2) +
          cos(radians(user_lat)) * cos(radians(s.latitude::double precision)) *
          power(sin(radians((s.longitude::double precision - user_lng) / 2)), 2)
        )
      ) AS distance_km
    FROM public.public_school_directory_view s
    LEFT JOIN public.pack_subtotals ps ON ps.school_id = s.id
    WHERE s.latitude IS NOT NULL
      AND s.longitude IS NOT NULL
      AND COALESCE(s.partnership, CASE WHEN s.is_partner IS TRUE THEN 'partner' ELSE 'non_partner' END) IN ('partner', 'non_partner')
    GROUP BY s.id, s.name, s.slug, s.city, s.district, s.province, s.logo, s.is_partner, s.is_featured,
      s.partnership, s.lowest_price, s.grades, s.custom_badge, s.latitude, s.longitude
  )
  SELECT
    c.id,
    c.name,
    c.slug,
    c.city,
    c.district,
    c.province,
    c.logo,
    c.is_partner,
    c.is_featured,
    c.partnership,
    c.lowest_price,
    c.grades,
    c.custom_badge,
    c.latitude,
    c.longitude,
    c.canonical_pack_item_count
  FROM candidates c
  ORDER BY c.distance_km, c.name
  LIMIT LEAST(GREATEST(COALESCE(result_limit, 8), 1), 24)
$function$;

DO $$
BEGIN
  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    CREATE TABLE IF NOT EXISTS public.audit_logs_archive (LIKE public.audit_logs INCLUDING DEFAULTS INCLUDING CONSTRAINTS INCLUDING INDEXES);
    ALTER TABLE public.audit_logs_archive ADD COLUMN IF NOT EXISTS archived_at timestamptz NOT NULL DEFAULT now();
    CREATE INDEX IF NOT EXISTS idx_audit_logs_archive_archived_at ON public.audit_logs_archive (archived_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_archive_created_at ON public.audit_logs_archive (created_at DESC);
  END IF;

  IF to_regclass('public.security_audit_logs') IS NOT NULL THEN
    CREATE TABLE IF NOT EXISTS public.security_audit_logs_archive (LIKE public.security_audit_logs INCLUDING DEFAULTS INCLUDING CONSTRAINTS INCLUDING INDEXES);
    ALTER TABLE public.security_audit_logs_archive ADD COLUMN IF NOT EXISTS archived_at timestamptz NOT NULL DEFAULT now();
    CREATE INDEX IF NOT EXISTS idx_security_audit_logs_archive_archived_at ON public.security_audit_logs_archive (archived_at DESC);
    CREATE INDEX IF NOT EXISTS idx_security_audit_logs_archive_created_at ON public.security_audit_logs_archive (created_at DESC);
  END IF;

  IF to_regclass('public.order_events') IS NOT NULL THEN
    CREATE TABLE IF NOT EXISTS public.order_events_archive (LIKE public.order_events INCLUDING DEFAULTS INCLUDING CONSTRAINTS INCLUDING INDEXES);
    ALTER TABLE public.order_events_archive ADD COLUMN IF NOT EXISTS archived_at timestamptz NOT NULL DEFAULT now();
    CREATE INDEX IF NOT EXISTS idx_order_events_archive_archived_at ON public.order_events_archive (archived_at DESC);
    CREATE INDEX IF NOT EXISTS idx_order_events_archive_created_at ON public.order_events_archive (created_at DESC);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.archive_operational_history(
  retention_days integer DEFAULT 730,
  dry_run boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cutoff timestamptz := now() - make_interval(days => GREATEST(COALESCE(retention_days, 730), 30));
  audit_count integer := 0;
  security_count integer := 0;
  order_event_count integer := 0;
BEGIN
  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM public.audit_logs WHERE created_at < $1' INTO audit_count USING cutoff;
    IF NOT dry_run AND audit_count > 0 THEN
      EXECUTE 'INSERT INTO public.audit_logs_archive SELECT *, now() FROM public.audit_logs WHERE created_at < $1 ON CONFLICT DO NOTHING' USING cutoff;
      EXECUTE 'DELETE FROM public.audit_logs WHERE created_at < $1' USING cutoff;
    END IF;
  END IF;

  IF to_regclass('public.security_audit_logs') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM public.security_audit_logs WHERE created_at < $1' INTO security_count USING cutoff;
    IF NOT dry_run AND security_count > 0 THEN
      EXECUTE 'INSERT INTO public.security_audit_logs_archive SELECT *, now() FROM public.security_audit_logs WHERE created_at < $1 ON CONFLICT DO NOTHING' USING cutoff;
      EXECUTE 'DELETE FROM public.security_audit_logs WHERE created_at < $1' USING cutoff;
    END IF;
  END IF;

  IF to_regclass('public.order_events') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM public.order_events WHERE created_at < $1' INTO order_event_count USING cutoff;
    IF NOT dry_run AND order_event_count > 0 THEN
      EXECUTE 'INSERT INTO public.order_events_archive SELECT *, now() FROM public.order_events WHERE created_at < $1 ON CONFLICT DO NOTHING' USING cutoff;
      EXECUTE 'DELETE FROM public.order_events WHERE created_at < $1' USING cutoff;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'dry_run', dry_run,
    'cutoff', cutoff,
    'audit_logs', audit_count,
    'security_audit_logs', security_count,
    'order_events', order_event_count
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_featured_schools(integer) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_nearby_schools(double precision, double precision, integer) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.archive_operational_history(integer, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.archive_operational_history(integer, boolean) TO service_role;
