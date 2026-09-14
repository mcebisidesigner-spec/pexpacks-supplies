-- Short-lived cart selections only. Do not persist learner, document, or free-form metadata.
CREATE TABLE IF NOT EXISTS public.draft_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  item_count integer NOT NULL DEFAULT 0 CHECK (item_count >= 0),
  subtotal numeric(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  wants_pexcover boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '24 hours'
);

ALTER TABLE public.draft_carts DROP COLUMN IF EXISTS raw_extracted, DROP COLUMN IF EXISTS document_name, DROP COLUMN IF EXISTS document_type, DROP COLUMN IF EXISTS metadata;
ALTER TABLE public.draft_carts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.draft_carts FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.draft_carts TO service_role;
CREATE INDEX IF NOT EXISTS draft_carts_expires_at_idx ON public.draft_carts (expires_at);

CREATE OR REPLACE FUNCTION public.match_stationery_product(
  query_text text,
  match_threshold numeric DEFAULT 0.15,
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
  similarity numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT
    mp.id, mp.sku, mp.name, mp.category, mp.current_selling_price,
    mp.requires_pexcover, mp.pexco_code,
    CASE WHEN lower(mp.name) = lower(query_text) THEN 1::numeric ELSE 0.5::numeric END
  FROM public.master_products mp
  WHERE mp.active IS TRUE
    AND mp.name ILIKE '%' || left(trim(query_text), 120) || '%'
  ORDER BY (lower(mp.name) = lower(query_text)) DESC, mp.name ASC
  LIMIT LEAST(GREATEST(match_limit, 1), 10);
$$;

REVOKE ALL ON FUNCTION public.match_stationery_product(text, numeric, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_stationery_product(text, numeric, integer) TO service_role;
