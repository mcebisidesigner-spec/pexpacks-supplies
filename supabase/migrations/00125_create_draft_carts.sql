-- ==============================================================================
-- Pexpacks Supplies - AI List Converter & Draft Cart Engine
-- Migration 00125: Create draft_carts table, products view, and matching RPC
-- ==============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.draft_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'converted', 'abandoned', 'ordered')),
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  raw_extracted jsonb NOT NULL DEFAULT '[]'::jsonb,
  document_name text,
  document_type text,
  item_count integer NOT NULL DEFAULT 0,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  wants_pexcover boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

CREATE INDEX IF NOT EXISTS idx_draft_carts_created_at ON public.draft_carts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_draft_carts_status ON public.draft_carts(status);

ALTER TABLE public.draft_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read draft carts" ON public.draft_carts;
CREATE POLICY "Public read draft carts" ON public.draft_carts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert draft carts" ON public.draft_carts;
CREATE POLICY "Public insert draft carts" ON public.draft_carts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update draft carts" ON public.draft_carts;
CREATE POLICY "Public update draft carts" ON public.draft_carts
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE OR REPLACE VIEW public.products AS
SELECT * FROM public.master_products;

CREATE OR REPLACE FUNCTION public.match_stationery_product(
  query_text text,
  match_threshold float DEFAULT 0.15,
  match_limit integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  sku text,
  name text,
  category text,
  brand text,
  current_selling_price numeric(12,2),
  requires_pexcover boolean,
  pexco_code text,
  similarity float
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    mp.id,
    mp.sku,
    mp.name,
    mp.category,
    mp.brand,
    mp.current_selling_price,
    mp.requires_pexcover,
    mp.pexco_code,
    extensions.similarity(mp.name, query_text)::float AS similarity
  FROM public.master_products mp
  WHERE mp.active = true
    AND (
      extensions.similarity(mp.name, query_text) >= match_threshold
      OR mp.search_vector @@ plainto_tsquery('english', query_text)
    )
  ORDER BY similarity DESC
  LIMIT match_limit;
$$;

GRANT EXECUTE ON FUNCTION public.match_stationery_product(text, float, integer) TO anon, authenticated, service_role;

COMMIT;
