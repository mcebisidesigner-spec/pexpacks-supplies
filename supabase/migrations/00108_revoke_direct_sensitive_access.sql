-- Restore least-privilege SQL grants on the relations that contain catalogue
-- costs, orders, suppliers, audits, and internal reports. Application reads
-- and writes use server-side service-role clients or constrained RPCs.
BEGIN;

REVOKE ALL ON TABLE
  public.admin_data_quality_issues_view,
  public.admin_letters,
  public.admin_pack_items_view,
  public.admin_product_margin_mv,
  public.admin_quote_pipeline_mv,
  public.admin_school_pack_health_mv,
  public.admin_supplier_demand_mv,
  public.approvals,
  public.assets,
  public.assigned_forms,
  public.audit_logs,
  public.canonical_pack_items_view,
  public.master_products,
  public.order_items,
  public.orders,
  public.payments,
  public.pexco_rates,
  public.quotations,
  public.school_pack_items,
  public.school_packs,
  public.schools,
  public.suppliers
FROM anon, authenticated;

-- Trigger and maintenance helpers must never be invoked through PostgREST.
-- Some helpers were added manually to remote before this reconciliation, so
-- revoke only signatures that exist in the target database.
DO $$
DECLARE
  signature text;
BEGIN
  FOREACH signature IN ARRAY ARRAY[
    'blog_posts_set_updated_at()',
    'fn_audit_trail_recorder()',
    'fn_snapshot_order_item_details()',
    'fn_sync_order_total_amount()',
    'fn_sync_pack_total_price()',
    'fn_sync_packs_on_product_price_change()',
    'items_set_search_vector()',
    'maintain_master_products_search_vector()',
    'maintain_orders_search_vector()',
    'maintain_quotation_item_totals()',
    'maintain_quotations_search_vector()',
    'maintain_school_packs_search_vector()',
    'master_products_search_vector_set()',
    'packs_set_search_vector()',
    'recalculate_quotation_totals_trigger()',
    'schools_set_search_vector()',
    'schools_set_updated_at()',
    'set_updated_at()',
    'sync_school_status_fields()',
    'update_dashboard_summary_on_order()'
  ]
  LOOP
    IF to_regprocedure('public.' || signature) IS NOT NULL THEN
      EXECUTE format(
        'REVOKE EXECUTE ON FUNCTION public.%s FROM anon, authenticated',
        signature
      );
    END IF;
  END LOOP;
END
$$;
-- Retire broad legacy public directory functions in favor of the small,
-- server-side public read-model RPCs.
DO $$
BEGIN
  IF to_regprocedure('public.get_schools_by_district(text,integer)') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_schools_by_district(text, integer) FROM anon, authenticated';
  END IF;
  IF to_regprocedure('public.get_schools_near_user(double precision,double precision,double precision,integer)') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_schools_near_user(double precision, double precision, double precision, integer) FROM anon, authenticated';
  END IF;
END
$$;

COMMIT;