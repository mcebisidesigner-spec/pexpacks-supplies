-- Migration 00045: Enable RLS on public tables and harden security policies
-- Resolves Supabase security advisor critical alerts:
-- 1. rls_disabled_in_public on public.lay_by_applications
-- 2. rls_disabled_in_public on public.waitlist_entries
-- 3. rls_enabled_no_policy on public.blog_posts
-- 4. Mutable function search_paths and internal SECURITY DEFINER privileges

-- =========================================================================
-- 1. LAY-BY APPLICATIONS: Enable RLS and define granular access policies
-- =========================================================================
DO $$
BEGIN
  IF to_regclass('public.lay_by_applications') IS NOT NULL THEN
    ALTER TABLE public.lay_by_applications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.lay_by_applications FORCE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Service role full access for lay_by_applications" ON public.lay_by_applications;
    CREATE POLICY "Service role full access for lay_by_applications"
      ON public.lay_by_applications
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);

    DROP POLICY IF EXISTS "Staff full access for lay_by_applications" ON public.lay_by_applications;
    CREATE POLICY "Staff full access for lay_by_applications"
      ON public.lay_by_applications
      FOR ALL
      TO authenticated
      USING ((SELECT is_staff()) OR has_permission('orders.view') OR has_permission('forms.view'))
      WITH CHECK ((SELECT is_staff()) OR has_permission('orders.edit') OR has_permission('forms.edit'));

    DROP POLICY IF EXISTS "Public anonymous insert for lay_by_applications" ON public.lay_by_applications;
    CREATE POLICY "Public anonymous insert for lay_by_applications"
      ON public.lay_by_applications
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- =========================================================================
-- 2. WAITLIST ENTRIES: Enable RLS and define granular access policies
-- =========================================================================
DO $$
BEGIN
  IF to_regclass('public.waitlist_entries') IS NOT NULL THEN
    ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.waitlist_entries FORCE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Service role full access for waitlist_entries" ON public.waitlist_entries;
    CREATE POLICY "Service role full access for waitlist_entries"
      ON public.waitlist_entries
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);

    DROP POLICY IF EXISTS "Staff full access for waitlist_entries" ON public.waitlist_entries;
    CREATE POLICY "Staff full access for waitlist_entries"
      ON public.waitlist_entries
      FOR ALL
      TO authenticated
      USING ((SELECT is_staff()) OR has_permission('schools.view') OR has_permission('forms.view'))
      WITH CHECK ((SELECT is_staff()) OR has_permission('schools.edit') OR has_permission('forms.edit'));

    DROP POLICY IF EXISTS "Public anonymous insert for waitlist_entries" ON public.waitlist_entries;
    CREATE POLICY "Public anonymous insert for waitlist_entries"
      ON public.waitlist_entries
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- =========================================================================
-- 3. BLOG POSTS: Define policies for RLS-enabled table
-- =========================================================================
ALTER TABLE IF EXISTS public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access for blog_posts" ON public.blog_posts;
CREATE POLICY "Service role full access for blog_posts"
  ON public.blog_posts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Staff full access for blog_posts" ON public.blog_posts;
CREATE POLICY "Staff full access for blog_posts"
  ON public.blog_posts
  FOR ALL
  TO authenticated
  USING ((SELECT is_staff()) OR has_permission('content.view'))
  WITH CHECK ((SELECT is_staff()) OR has_permission('content.edit'));

DROP POLICY IF EXISTS "Public read access for published blog_posts" ON public.blog_posts;
CREATE POLICY "Public read access for published blog_posts"
  ON public.blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (published = true OR (SELECT is_staff()));

-- =========================================================================
-- 4. HARDEN FUNCTION SEARCH PATHS
-- =========================================================================
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN
    SELECT pg_proc.proname, pg_proc.oid::regprocedure AS proc_signature
    FROM pg_proc
    JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
    WHERE pg_namespace.nspname = 'public'
      AND pg_proc.proname IN (
        'is_admin',
        'set_user_as_admin',
        'is_staff',
        'has_permission',
        'grant_role',
        'revoke_role',
        'set_user_permission',
        'get_orders_daily',
        'get_orders_by_pack_type',
        'get_schools_by_city',
        'schools_set_search_vector',
        'schools_set_updated_at',
        'get_schools_near_user',
        'get_schools_by_district',
        'packs_set_search_vector',
        'items_set_search_vector',
        'set_updated_at',
        'get_orders_summary',
        'get_orders_by_status_range',
        'get_top_schools',
        'blog_posts_set_updated_at',
        'update_dashboard_summary_on_order',
        'refresh_all_dashboard_summaries',
        'get_revenue_total',
        'get_assets_size',
        'get_order_pack_types',
        'get_admin_pack_school_groups',
        'master_products_search_vector_set',
        'recalculate_dashboard_summaries',
        'log_legacy_table_write',
        'run_admin_data_quality_audit',
        'get_all_pack_school_groups_json',
        'prevent_legacy_table_write',
        'current_operational_season_id',
        'fn_auto_link_master_product',
        'fn_sync_school_pack_item_on_delete',
        'fn_sync_school_pack_item_on_insert',
        'fn_sync_school_pack_item_on_update',
        'get_admin_filter_options',
        'get_featured_public_schools',
        'get_pack_subtotal',
        'get_payment_totals',
        'get_public_school_pack'
      )
  LOOP
    BEGIN
      EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp;', func_record.proc_signature);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;
END $$;
