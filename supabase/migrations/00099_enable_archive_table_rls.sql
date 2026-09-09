-- ==============================================================================
-- Pexpacks Supplies - Archive Table RLS Hardening
-- Migration 00099: Enable RLS on public archive tables exposed to PostgREST
-- ==============================================================================
-- Supabase security advisor flagged these archive tables because they live in the
-- exposed public schema without row-level security. Archive data is operational
-- history and must never be publicly readable or writable.
-- ==============================================================================

BEGIN;

ALTER TABLE public.audit_logs_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events_archive ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.audit_logs_archive FROM anon;
REVOKE ALL ON TABLE public.security_audit_logs_archive FROM anon;
REVOKE ALL ON TABLE public.order_events_archive FROM anon;

REVOKE INSERT, UPDATE, DELETE ON TABLE public.audit_logs_archive FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.security_audit_logs_archive FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.order_events_archive FROM authenticated;

GRANT SELECT ON TABLE public.audit_logs_archive TO authenticated;
GRANT SELECT ON TABLE public.security_audit_logs_archive TO authenticated;
GRANT SELECT ON TABLE public.order_events_archive TO authenticated;

GRANT ALL ON TABLE public.audit_logs_archive TO service_role;
GRANT ALL ON TABLE public.security_audit_logs_archive TO service_role;
GRANT ALL ON TABLE public.order_events_archive TO service_role;

DROP POLICY IF EXISTS "Audit viewers read archived audit logs" ON public.audit_logs_archive;
DROP POLICY IF EXISTS "Service role manages archived audit logs" ON public.audit_logs_archive;
DROP POLICY IF EXISTS "Audit viewers read archived security audit logs" ON public.security_audit_logs_archive;
DROP POLICY IF EXISTS "Service role manages archived security audit logs" ON public.security_audit_logs_archive;
DROP POLICY IF EXISTS "Order viewers read archived order events" ON public.order_events_archive;
DROP POLICY IF EXISTS "Audit viewers read archived order events" ON public.order_events_archive;
DROP POLICY IF EXISTS "Service role manages archived order events" ON public.order_events_archive;

CREATE POLICY "Audit viewers read archived audit logs"
  ON public.audit_logs_archive
  FOR SELECT
  TO authenticated
  USING (public.has_permission('audit.view'));

CREATE POLICY "Service role manages archived audit logs"
  ON public.audit_logs_archive
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Audit viewers read archived security audit logs"
  ON public.security_audit_logs_archive
  FOR SELECT
  TO authenticated
  USING (public.has_permission('audit.view'));

CREATE POLICY "Service role manages archived security audit logs"
  ON public.security_audit_logs_archive
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Order viewers read archived order events"
  ON public.order_events_archive
  FOR SELECT
  TO authenticated
  USING (public.has_permission('orders.view'));

CREATE POLICY "Audit viewers read archived order events"
  ON public.order_events_archive
  FOR SELECT
  TO authenticated
  USING (public.has_permission('audit.view'));

CREATE POLICY "Service role manages archived order events"
  ON public.order_events_archive
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMIT;