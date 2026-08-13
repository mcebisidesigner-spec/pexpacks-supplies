-- ===================================================
-- Pexpacks Supplies — High Concurrency RLS Optimization
-- Migration 00018: RLS Helper Function Stability & Performance Indexes
-- ===================================================

-- 1. Mark helper functions STABLE so the planner evaluates the JWT-derived
-- result once per statement (auth.jwt() is constant for the request) instead
-- of treating the call as volatile. NOTE: must preserve the user_roles lookup
-- from 00004 — RBAC-assigned staff hold a row in user_roles, not a JWT claim.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'role'),
      ''
    ) = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT (COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') IN ('admin', 'staff'))
      OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
$$;

-- 2. Optimize Orders RLS Policies for 1,500+ Concurrent Scans
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Admin full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Staff have full access to orders" ON public.orders;

CREATE POLICY "Staff have full access to orders"
  ON public.orders
  FOR ALL TO authenticated
  USING ((SELECT public.is_staff()))
  WITH CHECK ((SELECT public.is_staff()));

-- 3. Optimize Form Submissions RLS Policies
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Admin full access to submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Staff have full access to submissions" ON public.form_submissions;

CREATE POLICY "Staff have full access to submissions"
  ON public.form_submissions
  FOR ALL TO authenticated
  USING ((SELECT public.is_staff()))
  WITH CHECK ((SELECT public.is_staff()));

-- 4. Optimize App Settings RLS Policies
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff read app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Staff write app_settings" ON public.app_settings;

CREATE POLICY "Staff read app_settings"
  ON public.app_settings
  FOR SELECT TO authenticated
  USING ((SELECT public.is_staff()));

CREATE POLICY "Staff write app_settings"
  ON public.app_settings
  FOR ALL TO authenticated
  USING ((SELECT public.is_staff()))
  WITH CHECK ((SELECT public.is_staff()));

-- 5. Optimize Audit Logs RLS Policies
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff read audit_logs" ON public.audit_logs;

CREATE POLICY "Staff read audit_logs"
  ON public.audit_logs
  FOR SELECT TO authenticated
  USING ((SELECT public.is_staff()));

-- 6. Additional High-Throughput RLS B-Tree Indexes
-- NOTE: plain CREATE INDEX (not CONCURRENTLY) to match the project convention
-- (migrations run in the SQL editor where CONCURRENTLY is unnecessary).
CREATE INDEX IF NOT EXISTS idx_orders_status_user 
  ON public.orders (status, id);

CREATE INDEX IF NOT EXISTS idx_form_submissions_type_created 
  ON public.form_submissions (form_type, created_at DESC);
