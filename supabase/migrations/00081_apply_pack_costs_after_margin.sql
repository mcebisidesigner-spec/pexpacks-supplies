-- Migration 00081: Apply fixed Grade Pack costs after margin
-- ============================================================================
-- Business rule:
--   Master products keep their standalone selling price independent.
--   Grade Pack selling price = (sum(raw item purchase cost * quantity) / (1 - margin_rate))
--                              + packaging_cost + assembly_cost + freight_cost.
-- Packaging, assembly, and freight are fixed per-pack charges and are added after
-- the margin target has been applied to the stationery item cost.
-- ============================================================================

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
  v_items_price_after_margin numeric := 0;
  v_calculated_price numeric := 0;
  v_pricing_status text := 'ready';
BEGIN
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

  IF v_missing_cost_count > 0 THEN
    v_pricing_status := 'incomplete';
  ELSE
    v_pricing_status := 'ready';
  END IF;

  v_total_landed_cost := v_items_cost + v_packaging_cost + v_assembly_cost + v_freight_cost + v_other_cost;

  IF v_margin_rate >= 0.999 THEN
    v_margin_rate := 0.4990;
  END IF;

  IF v_items_cost > 0 THEN
    v_items_price_after_margin := ROUND(v_items_cost / (1.0 - v_margin_rate), 2);
    v_calculated_price := ROUND(v_items_price_after_margin + v_packaging_cost + v_assembly_cost + v_freight_cost + v_other_cost, 2);
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

CREATE OR REPLACE FUNCTION public.recalculate_all_grade_pack_prices()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '60s'
AS $$
DECLARE
  v_total integer := 0;
  v_ready integer := 0;
  v_incomplete integer := 0;
BEGIN
  WITH settings AS (
    SELECT
      ROUND(
        GREATEST(LEAST(
          COALESCE(NULLIF(TRIM(BOTH '"' FROM MAX(value::text) FILTER (WHERE key = 'pricing.target_margin_pct')), '')::numeric, 49.9),
          99.99), 0.01
        ) / 100.0, 4
      ) AS margin_rate,
      COALESCE(NULLIF(TRIM(BOTH '"' FROM MAX(value::text) FILTER (WHERE key = 'pricing.packaging_cost')), '')::numeric, 0) AS packaging_cost,
      COALESCE(NULLIF(TRIM(BOTH '"' FROM MAX(value::text) FILTER (WHERE key = 'pricing.assembly_cost')), '')::numeric, 0) AS assembly_cost,
      COALESCE(NULLIF(TRIM(BOTH '"' FROM MAX(value::text) FILTER (WHERE key = 'pricing.freight_cost')), '')::numeric, 0) AS freight_cost
    FROM public.system_settings
    WHERE key IN ('pricing.target_margin_pct','pricing.packaging_cost','pricing.assembly_cost','pricing.freight_cost')
  ),
  pack_item_costs AS (
    SELECT
      spi.pack_id,
      COALESCE(SUM(
        COALESCE(mp.latest_verified_cost,(
          SELECT so.unit_cost FROM public.supplier_offers so
          WHERE so.product_id = mp.id AND so.active = true
          ORDER BY so.is_preferred DESC, so.unit_cost ASC LIMIT 1
        )) * COALESCE(spi.pack_quantity, 1)
      ), 0)::numeric(12,2) AS items_cost,
      COUNT(*) FILTER (WHERE
        COALESCE(mp.latest_verified_cost,(
          SELECT so.unit_cost FROM public.supplier_offers so
          WHERE so.product_id = mp.id AND so.active = true
          ORDER BY so.is_preferred DESC, so.unit_cost ASC LIMIT 1
        )) IS NULL
        OR COALESCE(mp.latest_verified_cost,(
          SELECT so.unit_cost FROM public.supplier_offers so
          WHERE so.product_id = mp.id AND so.active = true
          ORDER BY so.is_preferred DESC, so.unit_cost ASC LIMIT 1
        )) <= 0
      ) AS missing_cost_count
    FROM public.school_pack_items spi
    JOIN public.master_products mp ON mp.id = spi.product_id
    WHERE spi.active = true AND mp.active = true
    GROUP BY spi.pack_id
  ),
  calculated AS (
    SELECT
      sp.id AS pack_id,
      COALESCE(pic.items_cost, 0) AS items_cost,
      s.packaging_cost,
      s.assembly_cost,
      s.freight_cost,
      0::numeric AS other_cost,
      COALESCE(pic.items_cost, 0) + s.packaging_cost + s.assembly_cost + s.freight_cost AS total_landed_cost,
      s.margin_rate,
      CASE
        WHEN COALESCE(pic.items_cost, 0) > 0
        THEN ROUND((COALESCE(pic.items_cost, 0) / (1.0 - s.margin_rate)) + s.packaging_cost + s.assembly_cost + s.freight_cost, 2)
        ELSE 0
      END AS calculated_price,
      CASE WHEN COALESCE(pic.missing_cost_count, 0) > 0 THEN 'incomplete' ELSE 'ready' END AS pricing_status
    FROM public.school_packs sp
    CROSS JOIN settings s
    LEFT JOIN pack_item_costs pic ON pic.pack_id = sp.id
  ),
  updated AS (
    UPDATE public.school_packs sp
    SET
      items_cost = c.items_cost,
      packaging_cost = c.packaging_cost,
      assembly_cost = c.assembly_cost,
      freight_cost = c.freight_cost,
      other_cost = c.other_cost,
      total_landed_cost = c.total_landed_cost,
      margin_rate_used = c.margin_rate,
      calculated_selling_price = c.calculated_price,
      price = c.calculated_price,
      pricing_status = c.pricing_status,
      last_price_calculated_at = now(),
      updated_at = now()
    FROM calculated c
    WHERE sp.id = c.pack_id
      AND (
        sp.calculated_selling_price IS DISTINCT FROM c.calculated_price
        OR sp.price IS DISTINCT FROM c.calculated_price
        OR sp.items_cost IS DISTINCT FROM c.items_cost
        OR sp.total_landed_cost IS DISTINCT FROM c.total_landed_cost
        OR sp.margin_rate_used IS DISTINCT FROM c.margin_rate
        OR sp.pricing_status IS DISTINCT FROM c.pricing_status
      )
    RETURNING sp.id, c.pricing_status
  )
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE pricing_status = 'ready'),
    COUNT(*) FILTER (WHERE pricing_status != 'ready')
  INTO v_total, v_ready, v_incomplete
  FROM updated;

  RETURN jsonb_build_object(
    'total_packs_evaluated', v_total,
    'successfully_recalculated', v_ready,
    'incomplete_pricing', v_incomplete,
    'timestamp', now()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.calculate_grade_pack_price(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.recalculate_all_grade_pack_prices() TO authenticated, service_role;

SELECT public.recalculate_all_grade_pack_prices();