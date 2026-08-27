-- ============================================================================
-- 00056: Unified Schema Powerhouse Optimization
-- ============================================================================
-- Features:
--   1. Automated Real-Time Pack Pricing Sync Triggers.
--   2. High-Performance GIN Trigram Indexes for Instant Fuzzy Search.
--   3. Data Integrity & Financial Precision Check Constraints.
--   4. Consolidated Executive Dashboard & Operational Metric RPCs.
-- ============================================================================

-- Step 1: Automated Pack Price Synchronization Functions & Triggers
CREATE OR REPLACE FUNCTION public.fn_sync_pack_total_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pack_id uuid;
BEGIN
  v_pack_id := COALESCE(NEW.pack_id, OLD.pack_id);
  IF v_pack_id IS NOT NULL THEN
    UPDATE public.school_packs
    SET 
      price = COALESCE((
        SELECT SUM(
          COALESCE(spi.selling_price_override, mp.current_selling_price, 0) * COALESCE(spi.pack_quantity, 1)
        )
        FROM public.school_pack_items spi
        JOIN public.master_products mp ON mp.id = spi.product_id
        WHERE spi.pack_id = v_pack_id
          AND spi.active = true
          AND mp.active = true
      ), 0)::numeric(10,2),
      updated_at = NOW()
    WHERE id = v_pack_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_pack_price_on_item_change ON public.school_pack_items;
CREATE TRIGGER trg_sync_pack_price_on_item_change
AFTER INSERT OR UPDATE OR DELETE ON public.school_pack_items
FOR EACH ROW
EXECUTE FUNCTION public.fn_sync_pack_total_price();

-- Master product price propagation trigger
CREATE OR REPLACE FUNCTION public.fn_sync_packs_on_product_price_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (OLD.current_selling_price IS DISTINCT FROM NEW.current_selling_price) OR (OLD.active IS DISTINCT FROM NEW.active) THEN
    UPDATE public.school_packs sp
    SET 
      price = COALESCE((
        SELECT SUM(
          COALESCE(spi.selling_price_override, mp.current_selling_price, 0) * COALESCE(spi.pack_quantity, 1)
        )
        FROM public.school_pack_items spi
        JOIN public.master_products mp ON mp.id = spi.product_id
        WHERE spi.pack_id = sp.id
          AND spi.active = true
          AND mp.active = true
      ), 0)::numeric(10,2),
      updated_at = NOW()
    WHERE sp.id IN (
      SELECT spi_inner.pack_id
      FROM public.school_pack_items spi_inner
      WHERE spi_inner.product_id = NEW.id
        AND spi_inner.selling_price_override IS NULL
    );
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_packs_on_product_price_change ON public.master_products;
CREATE TRIGGER trg_sync_packs_on_product_price_change
AFTER UPDATE OF current_selling_price, active ON public.master_products
FOR EACH ROW
EXECUTE FUNCTION public.fn_sync_packs_on_product_price_change();

-- Step 2: High-Performance Search & Autocomplete GIN Trigram Indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_master_products_sku_trgm 
  ON public.master_products USING gin (sku gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_master_products_brand_trgm 
  ON public.master_products USING gin (brand gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_master_products_category_trgm 
  ON public.master_products USING gin (category gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_schools_city_trgm 
  ON public.schools USING gin (city gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_schools_district_trgm 
  ON public.schools USING gin (district gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_school_packs_title_trgm 
  ON public.school_packs USING gin (title gin_trgm_ops);

-- Step 3: Financial & Data Integrity Check Constraints
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_master_products_selling_price_positive') THEN
    ALTER TABLE public.master_products 
      ADD CONSTRAINT chk_master_products_selling_price_positive CHECK (current_selling_price >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_master_products_cost_positive') THEN
    ALTER TABLE public.master_products 
      ADD CONSTRAINT chk_master_products_cost_positive CHECK (latest_verified_cost IS NULL OR latest_verified_cost >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_school_packs_price_positive') THEN
    ALTER TABLE public.school_packs 
      ADD CONSTRAINT chk_school_packs_price_positive CHECK (price >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_school_pack_items_quantity_positive') THEN
    ALTER TABLE public.school_pack_items 
      ADD CONSTRAINT chk_school_pack_items_quantity_positive CHECK (pack_quantity > 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_school_pack_items_override_positive') THEN
    ALTER TABLE public.school_pack_items 
      ADD CONSTRAINT chk_school_pack_items_override_positive CHECK (selling_price_override IS NULL OR selling_price_override >= 0);
  END IF;
END $$;

-- Step 4: Executive Dashboard & Operational Intelligence RPC
CREATE OR REPLACE FUNCTION public.get_admin_executive_dashboard()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'generated_at', NOW(),
    'catalog', jsonb_build_object(
      'total_products', (SELECT count(*)::integer FROM public.master_products),
      'active_products', (SELECT count(*)::integer FROM public.master_products WHERE active = true),
      'avg_selling_price', (SELECT COALESCE(round(avg(current_selling_price), 2), 0)::numeric(10,2) FROM public.master_products WHERE active = true),
      'unpriced_count', (SELECT count(*)::integer FROM public.master_products WHERE current_selling_price <= 0 OR current_selling_price IS NULL)
    ),
    'packs', jsonb_build_object(
      'total_packs', (SELECT count(*)::integer FROM public.school_packs),
      'active_packs', (SELECT count(*)::integer FROM public.school_packs WHERE visible = true),
      'total_pack_items', (SELECT count(*)::integer FROM public.school_pack_items WHERE active = true)
    ),
    'schools', jsonb_build_object(
      'total_schools', (SELECT count(*)::integer FROM public.schools),
      'partner_schools', (SELECT count(*)::integer FROM public.schools WHERE is_partner = true),
      'published_schools', (SELECT count(*)::integer FROM public.schools WHERE published = true)
    ),
    'orders', jsonb_build_object(
      'total_orders', (SELECT count(*)::integer FROM public.orders),
      'pending_payment', (SELECT count(*)::integer FROM public.orders WHERE status = 'pending_payment'),
      'paid_orders', (SELECT count(*)::integer FROM public.orders WHERE status IN ('paid', 'processing', 'packed', 'dispatched', 'delivered')),
      'total_gross_revenue', (SELECT COALESCE(sum(estimated_total), 0)::numeric(12,2) FROM public.orders WHERE status IN ('paid', 'processing', 'packed', 'dispatched', 'delivered'))
    ),
    'data_health', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object('area', area, 'issue', issue, 'issue_count', issue_count)
      ), '[]'::jsonb)
      FROM public.admin_data_quality_issues_view
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_executive_dashboard() TO authenticated, service_role;
