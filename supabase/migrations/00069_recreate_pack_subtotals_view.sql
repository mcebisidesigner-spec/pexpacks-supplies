-- ===================================================
-- Migration 00069: Recreate pack_subtotals view
-- The original view (00022) referenced legacy tables
-- (stationery_packs, stationery_items) which were archived
-- in migrations 00054/00055. This recreates it against
-- the canonical school_packs + school_pack_items tables.
-- ===================================================

DROP VIEW IF EXISTS public.pack_subtotals CASCADE;

CREATE OR REPLACE VIEW public.pack_subtotals AS
SELECT
  sp.school_id,
  COUNT(spi.id)::INTEGER AS item_count
FROM public.school_packs sp
LEFT JOIN public.school_pack_items spi
  ON spi.pack_id = sp.id
  AND spi.active = true
GROUP BY sp.school_id;

GRANT SELECT ON public.pack_subtotals TO anon, authenticated, service_role;
