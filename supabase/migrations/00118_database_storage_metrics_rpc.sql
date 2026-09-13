-- Service-role-only database storage telemetry for operational monitoring.
CREATE OR REPLACE FUNCTION public.get_database_storage_metrics()
RETURNS TABLE (
  table_name text,
  live_rows bigint,
  dead_rows bigint,
  total_bytes bigint,
  table_bytes bigint,
  index_bytes bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT
    c.relname::text AS table_name,
    s.n_live_tup::bigint AS live_rows,
    s.n_dead_tup::bigint AS dead_rows,
    pg_catalog.pg_total_relation_size(c.oid)::bigint AS total_bytes,
    pg_catalog.pg_relation_size(c.oid)::bigint AS table_bytes,
    pg_catalog.pg_indexes_size(c.oid)::bigint AS index_bytes
  FROM pg_catalog.pg_stat_user_tables AS s
  JOIN pg_catalog.pg_class AS c
    ON c.relname = s.relname
  JOIN pg_catalog.pg_namespace AS n
    ON n.oid = c.relnamespace
   AND n.nspname = s.schemaname
  WHERE s.schemaname = 'public'
  ORDER BY pg_catalog.pg_total_relation_size(c.oid) DESC
  LIMIT 25;
$$;

REVOKE ALL ON FUNCTION public.get_database_storage_metrics() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_database_storage_metrics() FROM anon;
REVOKE ALL ON FUNCTION public.get_database_storage_metrics() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_database_storage_metrics() TO service_role;