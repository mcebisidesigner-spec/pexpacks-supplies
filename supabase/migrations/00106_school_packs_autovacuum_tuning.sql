-- Keep the largest write-heavy public relation analyzed and vacuumed before
-- normal churn becomes expensive. This is metadata-only and does not rewrite
-- or require a full table rewrite.
BEGIN;

ALTER TABLE public.school_packs SET (
  autovacuum_vacuum_scale_factor = 0.02,
  autovacuum_analyze_scale_factor = 0.02,
  autovacuum_vacuum_threshold = 1000,
  autovacuum_analyze_threshold = 1000
);

COMMIT;