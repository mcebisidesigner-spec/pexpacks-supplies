-- AI List Converter: score against the live catalogue and return only public sales fields.
-- Prices are re-read authoritatively at checkout; this function is for review only.
DROP FUNCTION IF EXISTS public.match_stationery_product(text, numeric, integer);

CREATE OR REPLACE FUNCTION public.match_stationery_product(
  query_text text,
  match_threshold numeric DEFAULT 0.55,
  match_limit integer DEFAULT 1
)
RETURNS TABLE (
  id uuid,
  sku text,
  name text,
  category text,
  current_selling_price numeric,
  requires_pexcover boolean,
  pexco_code text,
  pexco_rate_cents integer,
  pexco_rate_active boolean,
  similarity numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  WITH query AS (
    SELECT regexp_replace(lower(trim(query_text)), '[^a-z0-9]+', ' ', 'g') AS value
  )
  SELECT
    mp.id,
    mp.sku,
    mp.name,
    mp.category,
    mp.current_selling_price,
    mp.requires_pexcover,
    mp.pexco_code,
    pr.covering_price_cents,
    COALESCE(pr.is_active, false),
    extensions.similarity(
      regexp_replace(lower(mp.name), '[^a-z0-9]+', ' ', 'g'),
      query.value
    )::numeric
  FROM public.master_products mp
  CROSS JOIN query
  LEFT JOIN public.pexco_rates pr
    ON pr.code = mp.pexco_code
  WHERE mp.active IS TRUE
    AND mp.current_selling_price IS NOT NULL
    AND extensions.similarity(
      regexp_replace(lower(mp.name), '[^a-z0-9]+', ' ', 'g'),
      query.value
    ) >= LEAST(GREATEST(match_threshold, 0.35), 0.95)
  ORDER BY similarity DESC, mp.name ASC
  LIMIT LEAST(GREATEST(match_limit, 1), 10);
$$;

REVOKE ALL ON FUNCTION public.match_stationery_product(text, numeric, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_stationery_product(text, numeric, integer) TO service_role;