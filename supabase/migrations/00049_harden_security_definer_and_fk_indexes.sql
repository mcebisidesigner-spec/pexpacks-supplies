-- Migration 00049: Database Security Hardening & Performance Optimizations

-- 1. Index Foreign Keys for Performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_learner_id ON public.orders(learner_id);
CREATE INDEX IF NOT EXISTS idx_orders_season_id ON public.orders(season_id);
CREATE INDEX IF NOT EXISTS idx_order_items_pack_id ON public.order_items(pack_id);
CREATE INDEX IF NOT EXISTS idx_school_packs_season_id ON public.school_packs(season_id);
CREATE INDEX IF NOT EXISTS idx_master_products_preferred_supplier ON public.master_products(preferred_supplier_id);
CREATE INDEX IF NOT EXISTS idx_master_products_created_by ON public.master_products(created_by);
CREATE INDEX IF NOT EXISTS idx_master_products_updated_by ON public.master_products(updated_by);
CREATE INDEX IF NOT EXISTS idx_packing_records_started_by ON public.packing_records(started_by);
CREATE INDEX IF NOT EXISTS idx_packing_records_checked_by ON public.packing_records(checked_by);
CREATE INDEX IF NOT EXISTS idx_substitutions_order_item_id ON public.substitutions(order_item_id);
CREATE INDEX IF NOT EXISTS idx_substitutions_original_product ON public.substitutions(original_product_id);
CREATE INDEX IF NOT EXISTS idx_substitutions_replacement_product ON public.substitutions(replacement_product_id);
CREATE INDEX IF NOT EXISTS idx_substitutions_requested_by ON public.substitutions(requested_by);
CREATE INDEX IF NOT EXISTS idx_substitutions_approved_by ON public.substitutions(approved_by);
CREATE INDEX IF NOT EXISTS idx_supplier_purchase_items_po_id ON public.supplier_purchase_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_supplier_purchase_items_prod_id ON public.supplier_purchase_items(product_id);
CREATE INDEX IF NOT EXISTS idx_supplier_purchase_orders_supplier ON public.supplier_purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_imports_supplier ON public.supplier_quote_imports(supplier_id);
CREATE INDEX IF NOT EXISTS idx_price_history_supplier ON public.price_history(supplier_id);
CREATE INDEX IF NOT EXISTS idx_learners_customer_id ON public.learners(customer_id);
CREATE INDEX IF NOT EXISTS idx_learners_school_id ON public.learners(school_id);
CREATE INDEX IF NOT EXISTS idx_approvals_requested_by ON public.approvals(requested_by);
CREATE INDEX IF NOT EXISTS idx_approvals_decided_by ON public.approvals(decided_by);
CREATE INDEX IF NOT EXISTS idx_operational_tasks_created_by ON public.operational_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_operational_events_actor ON public.operational_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_order_id ON public.payment_events(order_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_author_id ON public.task_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_task_mentions_user_id ON public.task_mentions(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_faqs_updated_by ON public.faqs(updated_by);
CREATE INDEX IF NOT EXISTS idx_system_settings_updated_by ON public.system_settings(updated_by);
CREATE INDEX IF NOT EXISTS idx_assets_uploaded_by ON public.assets(uploaded_by);

-- 2. Switch public store search functions to SECURITY INVOKER
ALTER FUNCTION public.get_featured_public_schools(integer) SECURITY INVOKER;
ALTER FUNCTION public.get_public_school_pack(text) SECURITY INVOKER;
ALTER FUNCTION public.search_public_schools(text, text, text, text, integer, integer) SECURITY INVOKER;

-- 3. Revoke public/anon execute on internal administrative and operational functions
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN
    SELECT proname, pg_get_function_identity_arguments(oid) as args
    FROM pg_proc
    WHERE pronamespace = 'public'::regnamespace
      AND prosecdef = true
      AND proname NOT IN ('search_public_schools', 'get_featured_public_schools', 'get_public_school_pack')
  LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM public, anon, authenticated;', func_record.proname, func_record.args);
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I(%s) TO service_role;', func_record.proname, func_record.args);
    EXCEPTION WHEN OTHERS THEN
      -- ignore if already restricted
    END;
  END LOOP;
END $$;
