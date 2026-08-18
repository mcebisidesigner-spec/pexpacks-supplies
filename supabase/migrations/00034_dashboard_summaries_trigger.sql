-- Migration 00034: Fast pre-aggregated summary table and trigger for back-office performance

CREATE TABLE IF NOT EXISTS public.dashboard_summaries (
  id INT PRIMARY KEY DEFAULT 1,
  paid_orders_count INT NOT NULL DEFAULT 0,
  total_revenue NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  procurement_outstanding NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  ready_to_pack_count INT NOT NULL DEFAULT 0,
  orders_at_risk_count INT NOT NULL DEFAULT 0,
  procurement_coverage_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure single row initialization
INSERT INTO public.dashboard_summaries (id, paid_orders_count, total_revenue, procurement_outstanding, ready_to_pack_count, orders_at_risk_count, procurement_coverage_pct, last_updated_at)
VALUES (1, 0, 0.00, 0.00, 0, 0, 0.00, NOW())
ON CONFLICT (id) DO NOTHING;

-- Function to recalculate metrics on write events
CREATE OR REPLACE FUNCTION public.recalculate_dashboard_summaries()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.dashboard_summaries
  SET
    paid_orders_count = (SELECT COUNT(*) FROM public.orders WHERE payment_status = 'paid'),
    total_revenue = COALESCE((SELECT SUM(total_amount) FROM public.orders WHERE payment_status = 'paid'), 0.00),
    ready_to_pack_count = (SELECT COUNT(*) FROM public.orders WHERE fulfillment_status = 'ready_to_pack'),
    orders_at_risk_count = (SELECT COUNT(*) FROM public.orders WHERE fulfillment_status = 'at_risk'),
    last_updated_at = NOW()
  WHERE id = 1;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger attached to public.orders
DROP TRIGGER IF EXISTS trg_sync_dashboard_summaries ON public.orders;

CREATE TRIGGER trg_sync_dashboard_summaries
AFTER INSERT OR UPDATE OR DELETE ON public.orders
FOR EACH STATEMENT
EXECUTE FUNCTION public.recalculate_dashboard_summaries();
