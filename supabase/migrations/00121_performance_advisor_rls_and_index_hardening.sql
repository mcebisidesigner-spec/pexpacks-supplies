-- Performance advisor remediation: exact duplicate indexes and RLS init plans.
-- No table data, grants, or public read contracts are changed.

-- Retain the more descriptive or observed-used equivalent in each exact pair.
DROP INDEX IF EXISTS public.audit_logs_archive_created_at_idx;
DROP INDEX IF EXISTS public.idx_form_submissions_created;
DROP INDEX IF EXISTS public.idx_master_products_search_vector;
DROP INDEX IF EXISTS public.idx_quotation_items_master_product;
DROP INDEX IF EXISTS public.idx_quotations_school;

-- Resolve auth.uid() once per permission evaluation instead of per candidate row.
CREATE OR REPLACE FUNCTION public.has_permission(p_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT CASE
    WHEN EXISTS (
      SELECT 1
      FROM public.user_permissions up
      JOIN public.permissions p ON p.id = up.permission_id
      WHERE up.user_id = (SELECT auth.uid())
        AND p.key = p_key
    ) THEN COALESCE((
      SELECT up.granted
      FROM public.user_permissions up
      JOIN public.permissions p ON p.id = up.permission_id
      WHERE up.user_id = (SELECT auth.uid())
        AND p.key = p_key
      LIMIT 1
    ), false)
    ELSE EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.role_permissions rp ON rp.role_id = ur.role_id
      JOIN public.permissions p ON p.id = rp.permission_id
      WHERE ur.user_id = (SELECT auth.uid())
        AND p.key = p_key
    )
  END;
$$;

DROP POLICY IF EXISTS "Users read own profile" ON public.user_profiles;
CREATE POLICY "Users read own profile"
  ON public.user_profiles
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR (SELECT public.has_permission('users.view'))
  );

DROP POLICY IF EXISTS "Users update own profile" ON public.user_profiles;
CREATE POLICY "Users update own profile"
  ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR (SELECT public.has_permission('users.edit'))
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    OR (SELECT public.has_permission('users.edit'))
  );

DROP POLICY IF EXISTS "Users read notifications" ON public.notifications;
CREATE POLICY "Users read notifications"
  ON public.notifications
  FOR SELECT TO authenticated
  USING (
    (user_id IS NULL AND (
      permission_key IS NULL OR public.has_permission(permission_key)
    ))
    OR user_id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "Users mark notifications" ON public.notifications;
CREATE POLICY "Users mark notifications"
  ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admin full access for orders" ON public.orders;
CREATE POLICY "Admin full access for orders"
  ON public.orders
  FOR ALL TO authenticated
  USING (
    ((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (SELECT public.has_permission('orders.view'))
  )
  WITH CHECK (
    ((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (SELECT public.has_permission('orders.edit'))
  );

DROP POLICY IF EXISTS "Admin full access to quotations" ON public.quotations;
CREATE POLICY "Admin full access to quotations"
  ON public.quotations
  FOR ALL TO authenticated
  USING (
    ((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin', 'service_role')
  )
  WITH CHECK (
    ((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin', 'service_role')
  );

DROP POLICY IF EXISTS "Admin full access to quotation items" ON public.quotation_items;
CREATE POLICY "Admin full access to quotation items"
  ON public.quotation_items
  FOR ALL TO authenticated
  USING (
    ((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin', 'service_role')
  )
  WITH CHECK (
    ((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin', 'service_role')
  );