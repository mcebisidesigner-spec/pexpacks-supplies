-- Peak-traffic hardening: remove exact duplicate indexes and move dashboard aggregation
-- off the synchronous checkout write path. Retained indexes were confirmed by
-- EXPLAIN ANALYZE on the linked production database before this migration.

-- The five-minute pg_cron refresh is the canonical dashboard aggregation path.
-- Checkout and webhook code also refreshes after the payment transition.
DROP TRIGGER IF EXISTS trg_sync_dashboard_summaries ON public.orders;
DROP FUNCTION IF EXISTS public.recalculate_dashboard_summaries();

-- Capture the previously remote-only schedule for newly provisioned environments.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')
     AND NOT EXISTS (
       SELECT 1
       FROM cron.job
       WHERE jobname = 'refresh-dashboard-summaries'
     ) THEN
    PERFORM cron.schedule(
      'refresh-dashboard-summaries',
      '*/5 * * * *',
      'SELECT public.refresh_all_dashboard_summaries()'
    );
  END IF;
END;
$$;

-- Exact duplicate indexes: retain the index selected by current query plans or
-- the higher-use equivalent. Removing them reduces every insert/update cost.
DROP INDEX IF EXISTS public.idx_schools_slug;
DROP INDEX IF EXISTS public.schools_slug_unique;
DROP INDEX IF EXISTS public.idx_schools_location_gist;
DROP INDEX IF EXISTS public.idx_schools_status;

DROP INDEX IF EXISTS public.idx_dashboard_summaries_id;
DROP INDEX IF EXISTS public.order_items_order_idx;
DROP INDEX IF EXISTS public.order_items_product_idx;
DROP INDEX IF EXISTS public.idx_orders_created_at_desc;
DROP INDEX IF EXISTS public.idx_orders_status_created;
DROP INDEX IF EXISTS public.idx_orders_status_created_at;

-- Small, high-churn tables should be vacuumed/analyzed before their default
-- scale factors allow operational bloat to accumulate during order peaks.
ALTER TABLE public.auth_otp_tokens SET (
  autovacuum_vacuum_scale_factor = 0.01,
  autovacuum_vacuum_threshold = 25,
  autovacuum_analyze_scale_factor = 0.01,
  autovacuum_analyze_threshold = 25
);

ALTER TABLE public.orders SET (
  autovacuum_vacuum_scale_factor = 0.02,
  autovacuum_vacuum_threshold = 25,
  autovacuum_analyze_scale_factor = 0.02,
  autovacuum_analyze_threshold = 25
);

ALTER TABLE public.order_items SET (
  autovacuum_vacuum_scale_factor = 0.02,
  autovacuum_vacuum_threshold = 25,
  autovacuum_analyze_scale_factor = 0.02,
  autovacuum_analyze_threshold = 25
);

ALTER TABLE public.dashboard_summaries SET (
  autovacuum_vacuum_scale_factor = 0.01,
  autovacuum_vacuum_threshold = 10,
  autovacuum_analyze_scale_factor = 0.01,
  autovacuum_analyze_threshold = 10
);