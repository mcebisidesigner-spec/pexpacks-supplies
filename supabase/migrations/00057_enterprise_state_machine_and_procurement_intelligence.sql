-- ============================================================================
-- 00057: Enterprise State Machine, Automated Auditing & Procurement Engine
-- ============================================================================
-- Features:
--   1. Strict State Machine CHECK Constraints for Orders, Quotes, Schools, Products.
--   2. Universal Automated JSON Audit Logging Trigger.
--   3. Real-Time Procurement Intelligence & Supplier Demand Forecast RPC.
--   4. Foreign Key Covering Indexes on Orders, Items, and Quotations.
-- ============================================================================

-- Step 1: Strict State Machine CHECK Constraints
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_status_valid') THEN
    ALTER TABLE public.orders 
      ADD CONSTRAINT chk_orders_status_valid 
      CHECK (status IN ('draft', 'pending_payment', 'paid', 'processing', 'packed', 'dispatched', 'delivered', 'cancelled', 'refunded', 'on_hold'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_quotations_status_valid') THEN
    ALTER TABLE public.quotations 
      ADD CONSTRAINT chk_quotations_status_valid 
      CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'converted', 'expired'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_schools_status_valid') THEN
    ALTER TABLE public.schools 
      ADD CONSTRAINT chk_schools_status_valid 
      CHECK (status IN ('active', 'inactive', 'archived', 'pending_verification'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_master_products_availability_valid') THEN
    ALTER TABLE public.master_products 
      ADD CONSTRAINT chk_master_products_availability_valid 
      CHECK (availability IN ('available', 'low_stock', 'out_of_stock', 'discontinued', 'unverified'));
  END IF;
END $$;

-- Step 2: High-Performance Foreign Key Indexing
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_season_id ON public.orders (season_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc ON public.orders (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_pack_id ON public.order_items (pack_id);

CREATE INDEX IF NOT EXISTS idx_quotations_school_id ON public.quotations (school_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.quotations (status);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at_desc ON public.quotations (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON public.quotation_items (quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_master_product_id ON public.quotation_items (master_product_id);

-- Step 3: Universal Automated JSON Audit Logging Trigger Function
CREATE OR REPLACE FUNCTION public.fn_audit_trail_recorder()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid;
  v_actor_email text;
  v_entity_type text;
  v_entity_id text;
  v_action text;
  v_summary text;
  v_old_json jsonb;
  v_new_json jsonb;
BEGIN
  BEGIN
    v_actor_id := (nullif(current_setting('request.jwt.claim.sub', true), ''))::uuid;
    v_actor_email := nullif(current_setting('request.jwt.claim.email', true), '');
  EXCEPTION WHEN OTHERS THEN
    v_actor_id := NULL;
    v_actor_email := 'system/migration';
  END;

  v_entity_type := TG_TABLE_NAME;
  v_action := lower(TG_OP);

  IF (TG_OP = 'DELETE') THEN
    v_entity_id := OLD.id::text;
    v_old_json := to_jsonb(OLD);
    v_new_json := NULL;
    v_summary := format('Deleted %s (%s)', v_entity_type, v_entity_id);
  ELSIF (TG_OP = 'INSERT') THEN
    v_entity_id := NEW.id::text;
    v_old_json := NULL;
    v_new_json := to_jsonb(NEW);
    v_summary := format('Created %s (%s)', v_entity_type, v_entity_id);
  ELSIF (TG_OP = 'UPDATE') THEN
    v_entity_id := NEW.id::text;
    v_old_json := to_jsonb(OLD);
    v_new_json := to_jsonb(NEW);
    v_summary := format('Updated %s (%s)', v_entity_type, v_entity_id);
  END IF;

  INSERT INTO public.audit_logs (
    created_at,
    actor_id,
    actor_name,
    action,
    entity_type,
    entity_id,
    summary,
    details
  ) VALUES (
    NOW(),
    v_actor_id,
    COALESCE(v_actor_email, 'system'),
    format('%s.%s', v_entity_type, v_action),
    v_entity_type,
    v_entity_id,
    v_summary,
    jsonb_build_object(
      'old', v_old_json,
      'new', v_new_json
    )
  );

  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Attach Audit Trigger to sensitive back-office tables
DROP TRIGGER IF EXISTS trg_audit_master_products ON public.master_products;
CREATE TRIGGER trg_audit_master_products
AFTER INSERT OR UPDATE OR DELETE ON public.master_products
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trail_recorder();

DROP TRIGGER IF EXISTS trg_audit_schools ON public.schools;
CREATE TRIGGER trg_audit_schools
AFTER INSERT OR UPDATE OR DELETE ON public.schools
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trail_recorder();

DROP TRIGGER IF EXISTS trg_audit_quotations ON public.quotations;
CREATE TRIGGER trg_audit_quotations
AFTER INSERT OR UPDATE OR DELETE ON public.quotations
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trail_recorder();

-- Step 4: Real-Time Procurement Intelligence & Supplier Demand Forecast RPC
CREATE OR REPLACE FUNCTION public.get_admin_procurement_forecast()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH item_demand AS (
    SELECT
      mp.id AS product_id,
      mp.sku,
      mp.name AS product_name,
      mp.category,
      mp.brand,
      COALESCE(mp.latest_verified_cost, 0)::numeric(10,2) AS unit_cost,
      mp.preferred_supplier_id,
      sup.name AS supplier_name,
      sup.contact_name AS supplier_contact,
      sup.email AS supplier_email,
      sup.lead_time_days,
      COALESCE(sum(spi.pack_quantity) FILTER (WHERE sp.visible = true), 0)::integer AS pack_composition_demand,
      COALESCE(sum(oi.quantity) FILTER (WHERE o.status IN ('paid', 'processing', 'packed')), 0)::integer AS order_demand
    FROM public.master_products mp
    LEFT JOIN public.suppliers sup ON sup.id = mp.preferred_supplier_id
    LEFT JOIN public.school_pack_items spi ON spi.product_id = mp.id AND spi.active = true
    LEFT JOIN public.school_packs sp ON sp.id = spi.pack_id
    LEFT JOIN public.order_items oi ON oi.product_id = mp.id
    LEFT JOIN public.orders o ON o.id = oi.order_id
    WHERE mp.active = true
    GROUP BY 
      mp.id, mp.sku, mp.name, mp.category, mp.brand, mp.latest_verified_cost, 
      mp.preferred_supplier_id, sup.name, sup.contact_name, sup.email, sup.lead_time_days
  ),
  supplier_summary AS (
    SELECT
      COALESCE(d.supplier_name, 'Unassigned Supplier') AS supplier_name,
      d.supplier_email,
      COALESCE(d.lead_time_days, 5) AS lead_time_days,
      count(DISTINCT d.product_id)::integer AS total_sku_count,
      sum(d.order_demand)::integer AS total_units_demanded,
      sum(d.order_demand * d.unit_cost)::numeric(12,2) AS estimated_procurement_cost
    FROM item_demand d
    GROUP BY d.supplier_name, d.supplier_email, d.lead_time_days
  )
  SELECT jsonb_build_object(
    'generated_at', NOW(),
    'supplier_breakdown', COALESCE(
      (SELECT jsonb_agg(to_jsonb(s)) FROM supplier_summary s),
      '[]'::jsonb
    ),
    'product_demands', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'product_id', d.product_id,
            'sku', d.sku,
            'name', d.product_name,
            'category', d.category,
            'brand', d.brand,
            'unit_cost', d.unit_cost,
            'supplier_name', COALESCE(d.supplier_name, 'Unassigned'),
            'order_demand_units', d.order_demand,
            'pack_capacity_units', d.pack_composition_demand,
            'estimated_total_cost', (d.order_demand * d.unit_cost)::numeric(12,2)
          )
          ORDER BY d.order_demand DESC, d.product_name ASC
        )
        FROM item_demand d
      ),
      '[]'::jsonb
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_procurement_forecast() TO authenticated, service_role;
