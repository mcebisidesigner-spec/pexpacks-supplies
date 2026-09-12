-- The tracked statement-level recalculation trigger is the authoritative
-- dashboard summary mechanism. Remove the older row-level trigger to avoid
-- duplicate work and transient double-count calculations on order writes.
BEGIN;

DROP TRIGGER IF EXISTS trg_maintain_order_summary ON public.orders;
DROP FUNCTION IF EXISTS public.update_dashboard_summary_on_order();

COMMIT;