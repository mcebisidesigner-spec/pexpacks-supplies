-- ============================================================================
-- 00058: Commercial Snapshots, Deterministic Sequences & Global Omnibar Search
-- ============================================================================
-- Features:
--   1. Immutable Commercial & Margin Snapshotting Trigger for Order Items.
--   2. High-Speed Global Omnibar Search RPC across all Entities.
--   3. Automated Order Total Sync Trigger.
-- ============================================================================

-- Step 1: Immutable Commercial & Margin Snapshotting Trigger
CREATE OR REPLACE FUNCTION public.fn_snapshot_order_item_details()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prod record;
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    SELECT sku, name, description, latest_verified_cost
    INTO v_prod
    FROM public.master_products
    WHERE id = NEW.product_id;

    IF FOUND THEN
      NEW.sku_snapshot := COALESCE(NULLIF(NEW.sku_snapshot, ''), v_prod.sku);
      NEW.product_name_snapshot := COALESCE(NULLIF(NEW.product_name_snapshot, ''), v_prod.name);
      NEW.description_snapshot := COALESCE(NULLIF(NEW.description_snapshot, ''), v_prod.description);
      NEW.estimated_unit_cost := COALESCE(NEW.estimated_unit_cost, v_prod.latest_verified_cost, 0);
    END IF;
  END IF;

  NEW.unit_selling_price := COALESCE(NEW.unit_selling_price, 0);
  NEW.quantity := COALESCE(NEW.quantity, 1);
  NEW.line_total := (NEW.unit_selling_price * NEW.quantity)::numeric(12,2);
  NEW.expected_margin := ((NEW.unit_selling_price - COALESCE(NEW.estimated_unit_cost, 0)) * NEW.quantity)::numeric(12,2);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_snapshot_order_item ON public.order_items;
CREATE TRIGGER trg_snapshot_order_item
BEFORE INSERT OR UPDATE ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.fn_snapshot_order_item_details();

-- Step 2: Automated Order Estimated Total Recalculation Trigger
CREATE OR REPLACE FUNCTION public.fn_sync_order_total_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
BEGIN
  v_order_id := COALESCE(NEW.order_id, OLD.order_id);
  IF v_order_id IS NOT NULL THEN
    UPDATE public.orders
    SET estimated_total = COALESCE((
      SELECT SUM(line_total)
      FROM public.order_items
      WHERE order_id = v_order_id
    ), 0)::numeric(12,2),
    updated_at = NOW()
    WHERE id = v_order_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_order_total ON public.order_items;
CREATE TRIGGER trg_sync_order_total
AFTER INSERT OR UPDATE OR DELETE ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_order_total_amount();

-- Step 3: High-Speed Global Omnibar Search RPC (Admin Cmd+K)
CREATE OR REPLACE FUNCTION public.admin_global_omnibar_search(
  search_query text,
  max_results integer DEFAULT 6
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_q text;
  v_clean text;
BEGIN
  v_clean := TRIM(search_query);
  IF v_clean = '' OR v_clean IS NULL THEN
    RETURN jsonb_build_object(
      'schools', '[]'::jsonb,
      'products', '[]'::jsonb,
      'packs', '[]'::jsonb,
      'orders', '[]'::jsonb,
      'quotations', '[]'::jsonb,
      'suppliers', '[]'::jsonb
    );
  END IF;

  v_q := '%' || v_clean || '%';

  RETURN jsonb_build_object(
    'schools', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', s.id,
        'title', s.name,
        'subtitle', COALESCE(s.city || ', ' || s.province, s.province),
        'href', '/admin/schools/' || s.id,
        'badge', CASE WHEN s.is_partner THEN 'Partner' ELSE 'Standard' END
      ))
      FROM (
        SELECT id, name, city, province, is_partner
        FROM public.schools
        WHERE name ILIKE v_q OR slug ILIKE v_q OR city ILIKE v_q
        ORDER BY is_partner DESC, name ASC
        LIMIT max_results
      ) s
    ), '[]'::jsonb),

    'products', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', p.id,
        'title', p.name,
        'subtitle', 'SKU: ' || p.sku || ' • R ' || p.current_selling_price,
        'href', '/admin/products/' || p.id || '/edit',
        'badge', COALESCE(p.brand, p.category, 'Catalog')
      ))
      FROM (
        SELECT id, name, sku, current_selling_price, brand, category
        FROM public.master_products
        WHERE name ILIKE v_q OR sku ILIKE v_q OR brand ILIKE v_q
        ORDER BY active DESC, name ASC
        LIMIT max_results
      ) p
    ), '[]'::jsonb),

    'packs', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', pk.id,
        'title', pk.title,
        'subtitle', 'Price: R ' || pk.price,
        'href', '/admin/packs/' || pk.id,
        'badge', CASE WHEN pk.visible THEN 'Active' ELSE 'Hidden' END
      ))
      FROM (
        SELECT id, title, price, visible
        FROM public.school_packs
        WHERE title ILIKE v_q OR slug ILIKE v_q
        ORDER BY visible DESC, title ASC
        LIMIT max_results
      ) pk
    ), '[]'::jsonb),

    'orders', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', o.id,
        'title', o.order_reference,
        'subtitle', COALESCE(o.buyer_name, 'Unknown') || ' • R ' || o.estimated_total,
        'href', '/admin/orders/' || o.id,
        'badge', o.status
      ))
      FROM (
        SELECT id, order_reference, buyer_name, estimated_total, status
        FROM public.orders
        WHERE order_reference ILIKE v_q OR buyer_name ILIKE v_q OR buyer_email ILIKE v_q
        ORDER BY created_at DESC
        LIMIT max_results
      ) o
    ), '[]'::jsonb),

    'quotations', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', q.id,
        'title', q.quote_number,
        'subtitle', COALESCE(q.recipient_name, q.school_name, 'Quote') || ' • R ' || q.total_amount,
        'href', '/admin/quotations/' || q.id,
        'badge', q.status
      ))
      FROM (
        SELECT q.id, q.quote_number, q.recipient_name, s.name AS school_name, q.total_amount, q.status
        FROM public.quotations q
        LEFT JOIN public.schools s ON s.id = q.school_id
        WHERE q.quote_number ILIKE v_q OR q.recipient_name ILIKE v_q OR q.recipient_email ILIKE v_q OR s.name ILIKE v_q
        ORDER BY q.created_at DESC
        LIMIT max_results
      ) q
    ), '[]'::jsonb),

    'suppliers', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', sup.id,
        'title', sup.name,
        'subtitle', 'Code: ' || sup.code || COALESCE(' • ' || sup.contact_name, ''),
        'href', '/admin/suppliers/' || sup.id,
        'badge', CASE WHEN sup.active THEN 'Active' ELSE 'Inactive' END
      ))
      FROM (
        SELECT id, name, code, contact_name, active
        FROM public.suppliers
        WHERE name ILIKE v_q OR code ILIKE v_q OR contact_name ILIKE v_q
        ORDER BY active DESC, name ASC
        LIMIT max_results
      ) sup
    ), '[]'::jsonb)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_global_omnibar_search(text, integer) TO authenticated, service_role;
