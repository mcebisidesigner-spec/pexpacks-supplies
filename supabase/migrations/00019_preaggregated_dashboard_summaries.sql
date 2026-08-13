-- ===================================================
-- Pexpacks Supplies — High Concurrency Pre-Aggregated Metrics
-- Migration 00019: Dashboard Summary Table & pg_cron Rollup
--
-- NOTE: The dashboard reads these pre-aggregated totals (O(1) single-row
-- reads) instead of scanning orders/schools/packs on every admin visit.
-- Refresh is batched via refresh_all_dashboard_summaries() on a pg_cron
-- schedule (e.g. every 5 minutes) OR on-demand — deliberately NOT via a
-- per-row trigger, because a trigger would serialize every order write on
-- the single 'global' summary row under high concurrency.
-- ===================================================

-- 1. Create Pre-Aggregated Summary Table
CREATE TABLE IF NOT EXISTS public.dashboard_summaries (
  id TEXT PRIMARY KEY DEFAULT 'global',
  total_orders INT NOT NULL DEFAULT 0,
  paid_orders INT NOT NULL DEFAULT 0,
  pending_orders INT NOT NULL DEFAULT 0,
  total_revenue NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_schools INT NOT NULL DEFAULT 0,
  total_packs INT NOT NULL DEFAULT 0,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for instant lookup
CREATE INDEX IF NOT EXISTS idx_dashboard_summaries_id 
  ON public.dashboard_summaries(id);

-- Enable Row-Level Security
ALTER TABLE public.dashboard_summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff view dashboard_summaries" ON public.dashboard_summaries;
CREATE POLICY "Staff view dashboard_summaries" 
  ON public.dashboard_summaries FOR SELECT 
  TO authenticated
  USING ((SELECT public.is_staff()));

-- 2. Batch Refresh Procedure (for pg_cron scheduling or on-demand recalculation)
-- Suggested pg_cron schedule:
--   select cron.schedule('refresh-dashboard-summaries', '*/5 * * * *',
--                        $$select public.refresh_all_dashboard_summaries()$$);
CREATE OR REPLACE FUNCTION public.refresh_all_dashboard_summaries()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  v_total_orders INT;
  v_paid_orders INT;
  v_pending_orders INT;
  v_total_revenue NUMERIC(12,2);
  v_total_schools INT;
  v_total_packs INT;
BEGIN
  SELECT COUNT(*), 
         COUNT(*) FILTER (WHERE status = 'paid'),
         COUNT(*) FILTER (WHERE status = 'pending'),
         COALESCE(SUM(estimated_total) FILTER (WHERE status = 'paid'), 0.00)
  INTO v_total_orders, v_paid_orders, v_pending_orders, v_total_revenue
  FROM public.orders;

  SELECT COUNT(*) INTO v_total_schools FROM public.schools;
  SELECT COUNT(*) INTO v_total_packs FROM public.stationery_packs;

  INSERT INTO public.dashboard_summaries (
    id, total_orders, paid_orders, pending_orders, total_revenue, total_schools, total_packs, last_updated_at
  )
  VALUES (
    'global', v_total_orders, v_paid_orders, v_pending_orders, v_total_revenue, v_total_schools, v_total_packs, NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    total_orders = EXCLUDED.total_orders,
    paid_orders = EXCLUDED.paid_orders,
    pending_orders = EXCLUDED.pending_orders,
    total_revenue = EXCLUDED.total_revenue,
    total_schools = EXCLUDED.total_schools,
    total_packs = EXCLUDED.total_packs,
    last_updated_at = EXCLUDED.last_updated_at;
END;
$$;

-- Seed initial row data
SELECT public.refresh_all_dashboard_summaries();
