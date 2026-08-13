-- ===================================================
-- Pexpacks Supplies — Pack Subtotal View & RPC
-- Migration 00022: read-only, always-consistent pack
-- subtotal (sum of unit_price * quantity across a pack's
-- line items) exposed as a view and a helper function.
--
-- SAFETY: purely additive, fully idempotent. No drops of
-- production objects, no writes, no schema changes to the
-- existing tables. Crucially this NEVER writes to or
-- overrides public.stationery_packs.price — the admin-set
-- pack price stays the source of truth (bundles, markup,
-- discounts). The subtotal is derived data, computed on
-- read, so it can never go stale.
--
-- Usage:
--   SELECT * FROM public.pack_subtotals;
--   SELECT public.get_pack_subtotal('<pack_uuid>');
-- ===================================================

-- 1. VIEW: pack_subtotals -------------------------------------------------
-- One row per pack with its live line-item subtotal and item count.
-- security_invoker means the caller's RLS applies to the underlying
-- tables (anon/staff reads are already covered by existing policies).
DROP VIEW IF EXISTS public.pack_subtotals;
CREATE VIEW public.pack_subtotals
WITH (security_invoker = true)
AS
SELECT
  p.id              AS pack_id,
  p.title,
  p.school_id,
  p.price,
  COALESCE(SUM(i.quantity * i.unit_price), 0)::NUMERIC(10, 2) AS subtotal,
  COUNT(i.id)::INTEGER                                        AS item_count
FROM public.stationery_packs p
LEFT JOIN public.stationery_items i ON i.pack_id = p.id
GROUP BY p.id, p.title, p.school_id, p.price;

GRANT SELECT ON public.pack_subtotals TO anon, authenticated, service_role;

-- 2. RPC: get_pack_subtotal(pack_id) --------------------------------------
-- Single-pack convenience for server actions / reports. Mirrors the view.
CREATE OR REPLACE FUNCTION public.get_pack_subtotal(pack_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(quantity * unit_price), 0)::NUMERIC(10, 2)
  FROM public.stationery_items
  WHERE pack_id = $1;
$$;

GRANT EXECUTE ON FUNCTION public.get_pack_subtotal(UUID) TO anon, authenticated, service_role;
