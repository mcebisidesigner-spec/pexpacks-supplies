-- Batch AI List Converter matching so a converted document uses one indexed catalogue query.
-- Candidate selection uses the existing pg_trgm GIN index; the explicit similarity
-- threshold remains the commercial safety gate.
CREATE OR REPLACE FUNCTION public.match_stationery_products(
  query_texts text[],
  match_threshold numeric DEFAULT 0.55
)
RETURNS TABLE (
  query_index integer,
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
SET search_path = public, extensions, pg_temp
AS $$
  WITH requested AS (
    SELECT
      (ordinality - 1)::integer AS query_index,
      trim(query_text) AS value
    FROM unnest(query_texts) WITH ORDINALITY AS source(query_text, ordinality)
    WHERE char_length(trim(query_text)) BETWEEN 2 AND 200
  )
  SELECT
    requested.query_index,
    candidate.id,
    candidate.sku,
    candidate.name,
    candidate.category,
    candidate.current_selling_price,
    candidate.requires_pexcover,
    candidate.pexco_code,
    candidate.pexco_rate_cents,
    candidate.pexco_rate_active,
    candidate.similarity
  FROM requested
  LEFT JOIN LATERAL (
    SELECT
      mp.id,
      mp.sku,
      mp.name,
      mp.category,
      mp.current_selling_price,
      mp.requires_pexcover,
      mp.pexco_code,
      pr.covering_price_cents AS pexco_rate_cents,
      COALESCE(pr.is_active, false) AS pexco_rate_active,
      extensions.similarity(mp.name, requested.value)::numeric AS similarity
    FROM public.master_products mp
    LEFT JOIN public.pexco_rates pr ON pr.code = mp.pexco_code
    WHERE mp.active IS TRUE
      AND mp.current_selling_price IS NOT NULL
      AND mp.name % requested.value
      AND extensions.similarity(mp.name, requested.value) >= LEAST(GREATEST(match_threshold, 0.35), 0.95)
    ORDER BY similarity DESC, mp.name ASC
    LIMIT 1
  ) AS candidate ON TRUE
  ORDER BY requested.query_index;
$$;

REVOKE ALL ON FUNCTION public.match_stationery_products(text[], numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_stationery_products(text[], numeric) TO service_role;

-- Keep the single-item RPC for admin tools, but use the index-backed candidate path.
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
SET search_path = public, extensions, pg_temp
AS $$
  SELECT
    matched.id,
    matched.sku,
    matched.name,
    matched.category,
    matched.current_selling_price,
    matched.requires_pexcover,
    matched.pexco_code,
    matched.pexco_rate_cents,
    matched.pexco_rate_active,
    matched.similarity
  FROM public.match_stationery_products(ARRAY[query_text], match_threshold) AS matched
  WHERE matched.id IS NOT NULL
  LIMIT LEAST(GREATEST(match_limit, 1), 1);
$$;

REVOKE ALL ON FUNCTION public.match_stationery_product(text, numeric, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_stationery_product(text, numeric, integer) TO service_role;