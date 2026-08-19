-- Migration 00034: Fast pre-aggregated summary table and trigger for back-office performance
-- FIXED: Table exists from 00023 with `id TEXT PRIMARY KEY DEFAULT 'global'`.
--        Orders table uses single `status` column (not payment_status/fulfillment_status)
--        and `estimated_total` (not total_amount).

-- 1. Add new columns (idempotent)
ALTER TABLE public.dashboard_summaries
  ADD COLUMN IF NOT EXISTS paid_orders_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS procurement_outstanding NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS ready_to_pack_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS orders_at_risk_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS procurement_coverage_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00;

-- 2. Populate from existing data (using actual columns: status, estimated_total)
UPDATE public.dashboard_summaries
SET
  paid_orders_count = (SELECT COUNT(*) FROM public.orders WHERE status = 'paid'),
  total_revenue = COALESCE((SELECT SUM(estimated_total) FROM public.orders WHERE status = 'paid'), 0.00),
  ready_to_pack_count = (SELECT COUNT(*) FROM public.orders WHERE status IN ('paid', 'packing')),
  orders_at_risk_count = (SELECT COUNT(*) FROM public.orders WHERE status = 'cancelled'),
  last_updated_at = NOW()
WHERE id = 'global';

-- 3. Function to recalculate metrics on write events
CREATE OR REPLACE FUNCTION public.recalculate_dashboard_summaries()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.dashboard_summaries
  SET
    paid_orders_count = (SELECT COUNT(*) FROM public.orders WHERE status = 'paid'),
    total_revenue = COALESCE((SELECT SUM(estimated_total) FROM public.orders WHERE status = 'paid'), 0.00),
    ready_to_pack_count = (SELECT COUNT(*) FROM public.orders WHERE status IN ('paid', 'packing')),
    orders_at_risk_count = (SELECT COUNT(*) FROM public.orders WHERE status = 'cancelled'),
    last_updated_at = NOW()
  WHERE id = 'global';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger attached to public.orders
DROP TRIGGER IF EXISTS trg_sync_dashboard_summaries ON public.orders;

CREATE TRIGGER trg_sync_dashboard_summaries
AFTER INSERT OR UPDATE OR DELETE ON public.orders
FOR EACH STATEMENT
EXECUTE FUNCTION public.recalculate_dashboard_summaries();
