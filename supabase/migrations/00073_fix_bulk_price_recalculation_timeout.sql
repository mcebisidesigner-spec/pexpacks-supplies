-- Migration 00073: Fix recalculate_all_grade_pack_prices statement timeout
-- ============================================================================
-- ROOT CAUSE:
--   The original function loops row-by-row through every school_pack, calling
--   recalculate_grade_pack_price(id) per row. Each per-row call fires 4 separate
--   SELECT queries against system_settings. With N packs this creates:
--     - 4N system_settings reads
--     - N calculate_grade_pack_price() calls
--     - N individual UPDATE statements
--   All serialized in PL/pgSQL — extremely slow, hits statement_timeout.
--
-- FIX:
--   Replace the row-by-row loop with a single set-based UPDATE that:
--     1. Reads system settings ONCE using a CTE
--     2. Aggregates item costs for ALL packs in a single JOIN
--     3. Applies margin formula in one bulk UPDATE
--   Reduces N*5 round-trips to ~3 total queries regardless of pack count.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.recalculate_all_grade_pack_prices()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total   integer := 0;
  v_ready   integer := 0;
  v_incomplete integer := 0;
BEGIN
  -- Single set-based bulk UPDATE replacing the old row-by-row loop.
  -- Reads system_settings once, aggregates item costs in one pass,
  -- then updates all school_packs in a single statement.
  WITH settings AS (
    -- Read all pricing settings in one scan
    SELECT
      ROUND(
        GREATEST(
          LEAST(
            COALESCE(
              NULLIF(TRIM(BOTH '"' FROM MAX(value::text) FILTER (WHERE key = 'pricing.target_margin_pct')), '')::numeric,
              49.9
            ),
            99.99
          ),
          0.01
        ) / 100.0,
        4
      ) AS margin_rate,
      COALESCE(
        NULLIF(TRIM(BOTH '"' FROM MAX(value::text) FILTER (WHERE key = 'pricing.packaging_cost')), '')::numeric,
        0
      ) AS packaging_cost,
      COALESCE(
        NULLIF(TRIM(BOTH '"' FROM MAX(value::text) FILTER (WHERE key = 'pricing.assembly_cost')), '')::numeric,
        0
      ) AS assembly_cost,
      COALESCE(
        NULLIF(TRIM(BOTH '"' FROM MAX(value::text) FILTER (WHERE key = 'pricing.freight_cost')), '')::numeric,
        0
      ) AS freight_cost
    FROM public.system_settings
    WHERE key IN (
      'pricing.target_margin_pct',
      'pricing.packaging_cost',
      'pricing.assembly_cost',
      'pricing.freight_cost'
    )
  ),
  pack_item_costs AS (
    -- Aggregate raw item costs for every pack in one pass
    SELECT
      spi.pack_id,
      COALESCE(SUM(
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
        ) * COALESCE(spi.pack_quantity, 1)
      ), 0)::numeric(12,2) AS items_cost,
      COUNT(*) FILTER (
        WHERE (
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
          )
        ) IS NULL OR (
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
          )
        ) <= 0
      ) AS missing_cost_count
    FROM public.school_pack_items spi
    JOIN public.master_products mp ON mp.id = spi.product_id
    WHERE spi.active = true
      AND mp.active = true
    GROUP BY spi.pack_id
  ),
  calculated AS (
    -- Compute all final prices in one expression
    SELECT
      sp.id AS pack_id,
      COALESCE(pic.items_cost, 0)                             AS items_cost,
      s.packaging_cost,
      s.assembly_cost,
      s.freight_cost,
      0::numeric                                              AS other_cost,
      COALESCE(pic.items_cost, 0)
        + s.packaging_cost
        + s.assembly_cost
        + s.freight_cost                                      AS total_landed_cost,
      s.margin_rate,
      CASE
        WHEN COALESCE(pic.items_cost, 0)
           + s.packaging_cost
           + s.assembly_cost
           + s.freight_cost > 0
        THEN ROUND(
          (COALESCE(pic.items_cost, 0)
           + s.packaging_cost
           + s.assembly_cost
           + s.freight_cost) / (1.0 - s.margin_rate),
          2
        )
        ELSE 0
      END                                                     AS calculated_price,
      CASE
        WHEN COALESCE(pic.missing_cost_count, 0) > 0
          THEN 'incomplete'
        ELSE 'ready'
      END                                                     AS pricing_status
    FROM public.school_packs sp
    CROSS JOIN settings s
    LEFT JOIN pack_item_costs pic ON pic.pack_id = sp.id
  ),
  updated AS (
    UPDATE public.school_packs sp
    SET
      items_cost                = c.items_cost,
      packaging_cost            = c.packaging_cost,
      assembly_cost             = c.assembly_cost,
      freight_cost              = c.freight_cost,
      other_cost                = c.other_cost,
      total_landed_cost         = c.total_landed_cost,
      margin_rate_used          = c.margin_rate,
      calculated_selling_price  = c.calculated_price,
      price                     = c.calculated_price,
      pricing_status            = c.pricing_status,
      last_price_calculated_at  = now(),
      updated_at                = now()
    FROM calculated c
    WHERE sp.id = c.pack_id
    RETURNING sp.id, c.pricing_status
  )
  SELECT
    COUNT(*)                                    AS total,
    COUNT(*) FILTER (WHERE pricing_status = 'ready') AS ready,
    COUNT(*) FILTER (WHERE pricing_status != 'ready') AS incomplete
  INTO v_total, v_ready, v_incomplete
  FROM updated;

  RETURN jsonb_build_object(
    'total_packs_evaluated',     v_total,
    'successfully_recalculated', v_ready,
    'incomplete_pricing',        v_incomplete,
    'timestamp',                 now()
  );
END;
$$;

-- Permissions unchanged
GRANT EXECUTE ON FUNCTION public.recalculate_all_grade_pack_prices() TO authenticated, service_role;
