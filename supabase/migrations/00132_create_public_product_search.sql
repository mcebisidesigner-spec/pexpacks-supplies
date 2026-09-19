-- Public Pex product cards: expose only sellable catalogue data, never supplier or cost fields.
CREATE OR REPLACE FUNCTION public.search_public_products(
  search_query text,
  result_limit integer DEFAULT 6
)
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  description text,
  unit text,
  current_selling_price numeric,
  requires_pexcover boolean,
  pexco_code text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
  WITH input AS (
    SELECT NULLIF(trim(search_query), '') AS value
  )
  SELECT
    mp.id,
    mp.name,
    mp.category,
    mp.description,
    mp.unit,
    mp.current_selling_price,
    mp.requires_pexcover,
    mp.pexco_code
  FROM public.master_products AS mp
  CROSS JOIN input
  WHERE input.value IS NOT NULL
    AND mp.active IS TRUE
    AND mp.visibility = 'public'
    AND mp.availability <> 'unavailable'
    AND mp.current_selling_price IS NOT NULL
    AND (
      mp.search_vector @@ websearch_to_tsquery('english', input.value)
      OR mp.name % input.value
    )
  ORDER BY
    ts_rank_cd(mp.search_vector, websearch_to_tsquery('english', input.value)) DESC,
    extensions.similarity(mp.name, input.value) DESC,
    mp.name ASC
  LIMIT LEAST(GREATEST(result_limit, 1), 8);
$$;

REVOKE ALL ON FUNCTION public.search_public_products(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_public_products(text, integer) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.search_public_products(text, integer) IS
  'Public catalogue projection for Pex and storefront search. Excludes supplier, cost, margin, audit, and admin fields.';