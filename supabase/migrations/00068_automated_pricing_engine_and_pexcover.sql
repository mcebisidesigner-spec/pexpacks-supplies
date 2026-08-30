-- Migration 00068: Automated Grade Pack Pricing Engine and Dynamic Pexcover™ Service
-- Single source of truth: /admin/settings -> Pricing & Margin (target gross margin 49.9%)
-- Applied at Grade Pack level from raw supplier costs + pack-level landed costs.

-- ============================================================================
-- 1. PEXCO RATE MASTER
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pexco_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  covering_price_cents integer NOT NULL CHECK (covering_price_cents >= 0),
  cost_price_cents integer CHECK (cost_price_cents >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

-- Seed standard initial PEXCO rates
INSERT INTO public.pexco_rates (code, title, description, covering_price_cents, cost_price_cents, is_active)
VALUES
  ('PEXCO01', '10–30 Page Exercise Book', 'Standard exercise books up to 30 pages with durable plastic cover & learner label', 800, 450, true),
  ('PEXCO02', '192 Page Hardcover', 'Standard 192-page hardcover books with reinforced edge covering & learner label', 1400, 800, true),
  ('PEXCO03', 'Softcover Textbook / Reader', 'Softcover textbooks, readers, and workbooks with heavy gauge wrap & learner label', 1100, 600, true),
  ('PEXCO04', 'Heavy Hardcover Textbook / Atlas', 'Large hardcover textbooks, atlases, and dictionaries with full bound protection', 1800, 1050, true)
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  covering_price_cents = EXCLUDED.covering_price_cents,
  cost_price_cents = EXCLUDED.cost_price_cents,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- RLS on pexco_rates
ALTER TABLE public.pexco_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for active pexco rates" ON public.pexco_rates;
CREATE POLICY "Public read access for active pexco rates"
  ON public.pexco_rates FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin write access for pexco rates" ON public.pexco_rates;
CREATE POLICY "Admin write access for pexco rates"
  ON public.pexco_rates FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- ============================================================================
-- 2. MASTER PRODUCTS PEXCOVER CLASSIFICATION
-- ============================================================================

ALTER TABLE public.master_products
  ADD COLUMN IF NOT EXISTS requires_pexcover boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pexco_code text REFERENCES public.pexco_rates(code) ON UPDATE CASCADE ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_master_products_pexco_code ON public.master_products(pexco_code) WHERE pexco_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_master_products_requires_pexcover ON public.master_products(requires_pexcover) WHERE requires_pexcover = true;

-- ============================================================================
-- 3. SCHOOL PACKS PRICING BREAKDOWN COLUMNS
-- ============================================================================

ALTER TABLE public.school_packs
  ADD COLUMN IF NOT EXISTS items_cost numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS packaging_cost numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS assembly_cost numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS freight_cost numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS other_cost numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_landed_cost numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS margin_rate_used numeric(5,4) NOT NULL DEFAULT 0.4990,
  ADD COLUMN IF NOT EXISTS calculated_selling_price numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_price_calculated_at timestamptz;

-- ============================================================================
-- 4. SYSTEM SETTINGS FOR PRICING & MARGIN
-- ============================================================================

-- Ensure target gross margin is set to 49.9%
INSERT INTO public.system_settings (key, category, value, value_type, scope, description, is_sensitive, is_public, requires_approval)
VALUES
  ('pricing.target_margin_pct', 'pricing', '49.9'::jsonb, 'percentage', 'global', 'Target gross margin percentage applied to cost prices', true, false, true),
  ('pricing.low_margin_warning_pct', 'pricing', '35.0'::jsonb, 'percentage', 'global', 'Threshold percentage below which items trigger low-margin alerts', false, false, false),
  ('pricing.critical_margin_pct', 'pricing', '10.0'::jsonb, 'percentage', 'global', 'Critical margin floor requiring superuser approval', true, false, true),
  ('pricing.packaging_cost', 'pricing', '0.0'::jsonb, 'currency', 'global', 'Applicable pack packaging and protective bagging cost in Rands', false, false, false),
  ('pricing.assembly_cost', 'pricing', '0.0'::jsonb, 'currency', 'global', 'Applicable pack assembly, picking, and packing labor cost in Rands', false, false, false),
  ('pricing.freight_cost', 'pricing', '0.0'::jsonb, 'currency', 'global', 'Applicable inward courier and freight cost per pack in Rands', false, false, false)
ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = now();

-- ============================================================================
-- 5. CANONICAL PRICING CALCULATION ENGINE
-- ============================================================================

-- Helper: Calculate pack price breakdown (Pure Query)
CREATE OR REPLACE FUNCTION public.calculate_grade_pack_price(p_pack_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_margin_pct numeric := 49.9;
  v_margin_rate numeric := 0.4990;
  v_packaging_cost numeric := 0;
  v_assembly_cost numeric := 0;
  v_freight_cost numeric := 0;
  v_other_cost numeric := 0;
  
  v_items_cost numeric := 0;
  v_missing_cost_count integer := 0;
  v_missing_items jsonb := '[]'::jsonb;
  v_total_landed_cost numeric := 0;
  v_calculated_price numeric := 0;
  v_pricing_status text := 'ready';
BEGIN
  -- 1. Read live settings from public.system_settings
  SELECT COALESCE(NULLIF(TRIM(BOTH '"' FROM value::text), '')::numeric, 49.9)
  INTO v_margin_pct
  FROM public.system_settings
  WHERE key = 'pricing.target_margin_pct';
  
  IF v_margin_pct IS NULL OR v_margin_pct < 0 OR v_margin_pct >= 100 THEN
    v_margin_pct := 49.9;
  END IF;
  v_margin_rate := ROUND(v_margin_pct / 100.0, 4);

  SELECT COALESCE(NULLIF(TRIM(BOTH '"' FROM value::text), '')::numeric, 0)
  INTO v_packaging_cost
  FROM public.system_settings
  WHERE key = 'pricing.packaging_cost';

  SELECT COALESCE(NULLIF(TRIM(BOTH '"' FROM value::text), '')::numeric, 0)
  INTO v_assembly_cost
  FROM public.system_settings
  WHERE key = 'pricing.assembly_cost';

  SELECT COALESCE(NULLIF(TRIM(BOTH '"' FROM value::text), '')::numeric, 0)
  INTO v_freight_cost
  FROM public.system_settings
  WHERE key = 'pricing.freight_cost';

  v_packaging_cost := COALESCE(v_packaging_cost, 0);
  v_assembly_cost := COALESCE(v_assembly_cost, 0);
  v_freight_cost := COALESCE(v_freight_cost, 0);

  -- 2. Aggregate raw supplier cost for active pack items
  WITH item_costs AS (
    SELECT 
      spi.id AS item_id,
      COALESCE(NULLIF(spi.school_wording, ''), mp.name) AS item_name,
      COALESCE(spi.pack_quantity, 1) AS quantity,
      COALESCE(
        mp.latest_verified_cost,
        (
          SELECT so.unit_cost 
          FROM public.supplier_offers so 
          WHERE so.product_id = mp.id 
            AND so.active = true 
          ORDER BY so.is_preferred DESC, so.unit_cost ASC 
          LIMIT 1
        )
      ) AS unit_cost
    FROM public.school_pack_items spi
    JOIN public.master_products mp ON mp.id = spi.product_id
    WHERE spi.pack_id = p_pack_id
      AND spi.active = true
      AND mp.active = true
  )
  SELECT 
    COALESCE(SUM(COALESCE(unit_cost, 0) * quantity), 0)::numeric(12,2),
    COUNT(*) FILTER (WHERE unit_cost IS NULL OR unit_cost <= 0),
    COALESCE(
      jsonb_agg(
        jsonb_build_object('item_id', item_id, 'name', item_name, 'quantity', quantity)
      ) FILTER (WHERE unit_cost IS NULL OR unit_cost <= 0),
      '[]'::jsonb
    )
  INTO v_items_cost, v_missing_cost_count, v_missing_items
  FROM item_costs;

  -- 3. Check for incomplete pricing
  IF v_missing_cost_count > 0 THEN
    v_pricing_status := 'incomplete';
  ELSE
    v_pricing_status := 'ready';
  END IF;

  -- 4. Calculate total landed cost
  v_total_landed_cost := v_items_cost + v_packaging_cost + v_assembly_cost + v_freight_cost + v_other_cost;

  -- 5. Apply Gross Margin formula: Selling Price = Landed Cost / (1 - Margin Rate)
  IF v_margin_rate >= 0.999 THEN
    v_margin_rate := 0.4990;
  END IF;

  IF v_total_landed_cost > 0 THEN
    v_calculated_price := ROUND(v_total_landed_cost / (1.0 - v_margin_rate), 2);
  ELSE
    v_calculated_price := 0;
  END IF;

  RETURN jsonb_build_object(
    'pack_id', p_pack_id,
    'items_cost', v_items_cost,
    'packaging_cost', v_packaging_cost,
    'assembly_cost', v_assembly_cost,
    'freight_cost', v_freight_cost,
    'other_cost', v_other_cost,
    'total_landed_cost', v_total_landed_cost,
    'margin_rate_used', v_margin_rate,
    'calculated_selling_price', v_calculated_price,
    'pricing_status', v_pricing_status,
    'missing_cost_count', v_missing_cost_count,
    'missing_items', v_missing_items
  );
END;
$$;

-- Stored Function: Recalculate & Persist single pack price
CREATE OR REPLACE FUNCTION public.recalculate_grade_pack_price(p_pack_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_calculated_price numeric;
  v_items_cost numeric;
  v_packaging_cost numeric;
  v_assembly_cost numeric;
  v_freight_cost numeric;
  v_other_cost numeric;
  v_total_landed_cost numeric;
  v_margin_rate numeric;
  v_pricing_status text;
BEGIN
  IF p_pack_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Prevent trigger recursion
  IF pg_trigger_depth() > 2 THEN
    RETURN NULL;
  END IF;

  v_result := public.calculate_grade_pack_price(p_pack_id);
  
  v_calculated_price := (v_result->>'calculated_selling_price')::numeric;
  v_items_cost := (v_result->>'items_cost')::numeric;
  v_packaging_cost := (v_result->>'packaging_cost')::numeric;
  v_assembly_cost := (v_result->>'assembly_cost')::numeric;
  v_freight_cost := (v_result->>'freight_cost')::numeric;
  v_other_cost := (v_result->>'other_cost')::numeric;
  v_total_landed_cost := (v_result->>'total_landed_cost')::numeric;
  v_margin_rate := (v_result->>'margin_rate_used')::numeric;
  v_pricing_status := (v_result->>'pricing_status');

  UPDATE public.school_packs
  SET
    price = v_calculated_price,
    items_cost = v_items_cost,
    packaging_cost = v_packaging_cost,
    assembly_cost = v_assembly_cost,
    freight_cost = v_freight_cost,
    other_cost = v_other_cost,
    total_landed_cost = v_total_landed_cost,
    margin_rate_used = v_margin_rate,
    calculated_selling_price = v_calculated_price,
    pricing_status = v_pricing_status,
    last_price_calculated_at = now(),
    updated_at = now()
  WHERE id = p_pack_id;

  RETURN v_result;
END;
$$;

-- Stored Function: Recalculate all active Grade Packs
CREATE OR REPLACE FUNCTION public.recalculate_all_grade_pack_prices()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rec record;
  v_total integer := 0;
  v_ready integer := 0;
  v_incomplete integer := 0;
  v_calc jsonb;
BEGIN
  FOR v_rec IN 
    SELECT id 
    FROM public.school_packs
    ORDER BY created_at ASC
  LOOP
    v_total := v_total + 1;
    v_calc := public.recalculate_grade_pack_price(v_rec.id);
    IF (v_calc->>'pricing_status') = 'ready' THEN
      v_ready := v_ready + 1;
    ELSE
      v_incomplete := v_incomplete + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'total_packs_evaluated', v_total,
    'successfully_recalculated', v_ready,
    'incomplete_pricing', v_incomplete,
    'timestamp', now()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.calculate_grade_pack_price(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.recalculate_grade_pack_price(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.recalculate_all_grade_pack_prices() TO authenticated, service_role;

-- ============================================================================
-- 6. AUTOMATIC DATABASE TRIGGERS
-- ============================================================================

-- A. Trigger on school_pack_items (INSERT, UPDATE, DELETE)
CREATE OR REPLACE FUNCTION public.fn_trg_pack_item_pricing_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_grade_pack_price(OLD.pack_id);
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    PERFORM public.recalculate_grade_pack_price(NEW.pack_id);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If pack_id changed, recalculate both old and new packs
    IF OLD.pack_id IS DISTINCT FROM NEW.pack_id THEN
      PERFORM public.recalculate_grade_pack_price(OLD.pack_id);
      PERFORM public.recalculate_grade_pack_price(NEW.pack_id);
    ELSIF (OLD.pack_quantity IS DISTINCT FROM NEW.pack_quantity)
       OR (OLD.product_id IS DISTINCT FROM NEW.product_id)
       OR (OLD.active IS DISTINCT FROM NEW.active) THEN
      PERFORM public.recalculate_grade_pack_price(NEW.pack_id);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_pack_price_on_item_change ON public.school_pack_items;
CREATE TRIGGER trg_sync_pack_price_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON public.school_pack_items
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_trg_pack_item_pricing_sync();

-- B. Trigger on master_products (supplier cost change)
CREATE OR REPLACE FUNCTION public.fn_trg_product_cost_pricing_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pack_rec record;
BEGIN
  -- Only recalculate when supplier cost or active status actually changes
  IF (OLD.latest_verified_cost IS DISTINCT FROM NEW.latest_verified_cost)
     OR (OLD.active IS DISTINCT FROM NEW.active) THEN
    FOR v_pack_rec IN
      SELECT DISTINCT pack_id
      FROM public.school_pack_items
      WHERE product_id = NEW.id
    LOOP
      PERFORM public.recalculate_grade_pack_price(v_pack_rec.pack_id);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_packs_on_product_price_change ON public.master_products;
CREATE TRIGGER trg_sync_packs_on_product_price_change
  AFTER UPDATE OF latest_verified_cost, active ON public.master_products
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_trg_product_cost_pricing_sync();

-- C. Trigger on supplier_offers (supplier price change)
CREATE OR REPLACE FUNCTION public.fn_trg_supplier_offer_pricing_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prod_id uuid;
  v_pack_rec record;
BEGIN
  v_prod_id := COALESCE(NEW.product_id, OLD.product_id);
  IF v_prod_id IS NOT NULL THEN
    FOR v_pack_rec IN
      SELECT DISTINCT spi.pack_id
      FROM public.school_pack_items spi
      JOIN public.master_products mp ON mp.id = spi.product_id
      WHERE spi.product_id = v_prod_id
        AND mp.latest_verified_cost IS NULL
    LOOP
      PERFORM public.recalculate_grade_pack_price(v_pack_rec.pack_id);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_supplier_offer_pricing_sync ON public.supplier_offers;
CREATE TRIGGER trg_supplier_offer_pricing_sync
  AFTER INSERT OR UPDATE OF unit_cost, is_preferred, active OR DELETE ON public.supplier_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_trg_supplier_offer_pricing_sync();

-- D. Trigger on system_settings (pricing & margin changes)
CREATE OR REPLACE FUNCTION public.fn_trg_pricing_settings_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.key LIKE 'pricing.%' AND (OLD.value IS DISTINCT FROM NEW.value) THEN
    PERFORM public.recalculate_all_grade_pack_prices();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pricing_settings_sync ON public.system_settings;
CREATE TRIGGER trg_pricing_settings_sync
  AFTER UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_trg_pricing_settings_sync();

-- ============================================================================
-- 7. RECREATE CANONICAL VIEWS WITH PEXCOVER FIELDS
-- ============================================================================

DROP VIEW IF EXISTS public.public_pack_items_view CASCADE;
DROP VIEW IF EXISTS public.admin_pack_items_view CASCADE;
DROP VIEW IF EXISTS public.canonical_pack_items_view CASCADE;

CREATE OR REPLACE VIEW public.canonical_pack_items_view AS
SELECT 
  spi.id,
  spi.pack_id,
  spi.product_id,
  COALESCE(NULLIF(spi.school_wording, ''), mp.name) AS name,
  COALESCE(spi.pack_quantity, 1) AS quantity,
  COALESCE(spi.selling_price_override, mp.current_selling_price, 0::numeric)::numeric(12,2) AS unit_price,
  COALESCE(NULLIF(mp.icon, ''), 'box') AS icon,
  COALESCE(NULLIF(spi.school_notes, ''), mp.description) AS description,
  COALESCE(mp.specification, mp.packaging, mp.unit) AS specification,
  mp.category,
  mp.sku,
  mp.brand,
  mp.availability,
  spi.substitution_policy,
  COALESCE(spi.sort_order, 0) AS sort_order,
  spi.active AS visible,
  'canonical'::text AS source,
  -- Pexcover Fields
  COALESCE(mp.requires_pexcover, false) AS requires_pexcover,
  mp.pexco_code,
  pr.title AS pexco_title,
  pr.covering_price_cents AS pexco_rate_cents,
  COALESCE(pr.is_active, false) AS pexco_rate_active
FROM public.school_pack_items spi
JOIN public.master_products mp ON mp.id = spi.product_id
LEFT JOIN public.pexco_rates pr ON pr.code = mp.pexco_code;

CREATE OR REPLACE VIEW public.public_pack_items_view AS
SELECT 
  c.id,
  c.pack_id,
  c.product_id,
  c.name,
  c.quantity,
  c.unit_price,
  c.icon,
  c.description,
  c.specification,
  c.category,
  c.sku,
  c.brand,
  c.availability,
  c.substitution_policy,
  c.sort_order,
  c.visible,
  c.source,
  c.requires_pexcover,
  c.pexco_code,
  c.pexco_title,
  c.pexco_rate_cents,
  c.pexco_rate_active
FROM public.canonical_pack_items_view c
JOIN public.school_packs p ON p.id = c.pack_id
LEFT JOIN public.schools s ON s.id = p.school_id
WHERE c.visible = true 
  AND (p.publication_status::text = 'published' OR (p.publication_status IS NULL AND p.visible = true)) 
  AND (s.id IS NULL OR s.publication_status::text = 'published' OR (s.publication_status IS NULL AND s.published IS NOT FALSE AND s.status = 'active'));

CREATE OR REPLACE VIEW public.admin_pack_items_view AS
SELECT 
  c.id,
  c.pack_id,
  c.product_id,
  c.name,
  c.quantity,
  c.unit_price,
  c.icon,
  c.description,
  c.specification,
  c.category,
  c.sku,
  c.brand,
  c.availability,
  c.substitution_policy,
  c.sort_order,
  c.visible,
  c.source,
  c.requires_pexcover,
  c.pexco_code,
  c.pexco_title,
  c.pexco_rate_cents,
  c.pexco_rate_active
FROM public.canonical_pack_items_view c;

GRANT SELECT ON public.canonical_pack_items_view TO anon, authenticated, service_role;
GRANT SELECT ON public.public_pack_items_view TO anon, authenticated, service_role;
GRANT SELECT ON public.admin_pack_items_view TO anon, authenticated, service_role;

-- ============================================================================
-- 8. UPDATE RPC: get_public_school_pack (WITH DYNAMIC PEXCOVER ITEM FIELDS)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_public_school_pack(school_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'school', jsonb_build_object(
      'id', s.id,
      'name', s.name,
      'slug', s.slug,
      'city', s.city,
      'district', s.district,
      'province', s.province,
      'logo', s.logo,
      'partnership', COALESCE(s.partnership, CASE WHEN s.is_partner IS TRUE THEN 'partner' WHEN s.refused_partnership IS TRUE THEN 'refused_partner' ELSE 'non_partner' END),
      'is_partner', COALESCE(s.partnership = 'partner', s.is_partner, false),
      'refused_partnership', COALESCE(s.partnership = 'refused_partner', s.refused_partnership, false),
      'is_featured', COALESCE(s.feature_status = 'featured', s.is_featured, false),
      'parent_collection_accepted', COALESCE(s.parent_collection_accepted, true),
      'principal', s.principal,
      'custom_badge', s.custom_badge,
      'publication_status', COALESCE(s.publication_status, 'published'),
      'stationery_list_status', COALESCE(s.stationery_list_status, 'verified')
    ),
    'packs', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'title', p.title,
            'slug', p.slug,
            'price', p.price,
            'description', p.description,
            'stock', p.stock,
            'sort_order', p.sort_order,
            'publication_status', COALESCE(p.publication_status, 'published'),
            'version', COALESCE(p.version, 1),
            'items_cost', p.items_cost,
            'total_landed_cost', p.total_landed_cost,
            'margin_rate_used', p.margin_rate_used,
            'pricing_status', p.pricing_status,
            'items', COALESCE(
              (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'name', i.name,
                    'quantity', i.quantity,
                    'unit_price', i.unit_price,
                    'icon', i.icon,
                    'description', i.description,
                    'specification', i.specification,
                    'requires_pexcover', COALESCE(i.requires_pexcover, false),
                    'pexco_code', i.pexco_code,
                    'pexco_rate_cents', i.pexco_rate_cents,
                    'pexco_rate_active', COALESCE(i.pexco_rate_active, false)
                  )
                  ORDER BY i.sort_order, i.name
                )
                FROM public.public_pack_items_view i
                WHERE i.pack_id = p.id
              ),
              '[]'::jsonb
            )
          )
          ORDER BY p.sort_order, p.title
        )
        FROM public.school_packs p
        WHERE (p.school_id = s.id OR p.slug ILIKE s.slug || '-%')
          AND (
            p.publication_status = 'published' 
            OR (p.publication_status IS NULL AND p.visible IS TRUE)
          )
      ),
      '[]'::jsonb
    )
  )
  FROM public.schools s
  WHERE lower(s.slug) = lower(school_slug)
    AND (
      s.publication_status = 'published'
      OR (s.publication_status IS NULL AND s.published IS NOT FALSE AND s.status = 'active')
    )
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.get_public_school_pack(text) TO anon, authenticated, service_role;

-- ============================================================================
-- 9. INITIAL BACKFILL EXECUTION
-- ============================================================================
SELECT public.recalculate_all_grade_pack_prices();
