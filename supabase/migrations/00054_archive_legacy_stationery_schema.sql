-- ============================================================================
-- 00054: Archive Legacy Stationery Schema & Break-Test Isolation
-- ============================================================================

BEGIN;

-- 1. Create Private Archive Schema
CREATE SCHEMA IF NOT EXISTS legacy_archive;
REVOKE ALL ON SCHEMA legacy_archive FROM anon, authenticated, public;
GRANT USAGE ON SCHEMA legacy_archive TO service_role, postgres;

-- 2. Drop all Dual-Sync Triggers & Obsolete Functions
DROP TRIGGER IF EXISTS trg_sync_legacy_stationery_items ON public.master_products;
DROP TRIGGER IF EXISTS trg_sync_legacy_stationery ON public.master_products;
DROP TRIGGER IF EXISTS trg_mirror_to_stationery_items ON public.master_products;

DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stationery_items') THEN 
    DROP TRIGGER IF EXISTS trg_stationery_items_audit ON public.stationery_items; 
  END IF; 
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'legacy_archive' AND tablename = 'stationery_items') THEN 
    DROP TRIGGER IF EXISTS trg_stationery_items_audit ON legacy_archive.stationery_items; 
  END IF; 
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stationery_packs') THEN 
    DROP TRIGGER IF EXISTS trg_stationery_packs_audit ON public.stationery_packs; 
  END IF; 
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'legacy_archive' AND tablename = 'stationery_packs') THEN 
    DROP TRIGGER IF EXISTS trg_stationery_packs_audit ON legacy_archive.stationery_packs; 
  END IF; 
END $$;

DROP FUNCTION IF EXISTS public.fn_sync_legacy_stationery_items() CASCADE;
DROP FUNCTION IF EXISTS public.fn_sync_legacy_stationery() CASCADE;
DROP FUNCTION IF EXISTS public.reconcile_legacy_stationery_packs() CASCADE;
DROP FUNCTION IF EXISTS public.sync_pack_items_to_legacy() CASCADE;

-- 3. Redefine Canonical Views with Zero Legacy Joins
DROP VIEW IF EXISTS public.pack_subtotals CASCADE;
DROP VIEW IF EXISTS public.admin_pack_items_view CASCADE;
DROP VIEW IF EXISTS public.public_pack_items_view CASCADE;
DROP VIEW IF EXISTS public.canonical_pack_items_view CASCADE;

CREATE VIEW public.canonical_pack_items_view
WITH (security_invoker = true)
AS
SELECT
  spi.id AS id,
  spi.pack_id,
  spi.product_id,
  COALESCE(NULLIF(spi.school_wording, ''), mp.name) AS name,
  COALESCE(spi.pack_quantity, 1)::integer AS quantity,
  COALESCE(spi.selling_price_override, mp.current_selling_price, 0)::numeric(12,2) AS unit_price,
  COALESCE(NULLIF(mp.icon, ''), 'box')::text AS icon,
  COALESCE(NULLIF(spi.school_notes, ''), mp.description) AS description,
  COALESCE(mp.specification, mp.packaging, mp.unit) AS specification,
  mp.category,
  mp.sku,
  mp.brand,
  mp.availability,
  spi.substitution_policy,
  COALESCE(spi.sort_order, 0)::integer AS sort_order,
  spi.active AS visible,
  'canonical'::text AS source
FROM public.school_pack_items spi
JOIN public.master_products mp ON mp.id = spi.product_id;

CREATE VIEW public.public_pack_items_view
WITH (security_invoker = true)
AS
SELECT c.*
FROM public.canonical_pack_items_view c
JOIN public.school_packs p ON p.id = c.pack_id
LEFT JOIN public.schools s ON s.id = p.school_id
WHERE c.visible = true
  AND p.visible = true
  AND COALESCE(s.status, 'active') = 'active'
  AND COALESCE(s.published, true) = true;

CREATE VIEW public.admin_pack_items_view
WITH (security_invoker = true)
AS
SELECT
  c.*,
  p.title AS pack_title,
  p.slug AS pack_slug,
  p.school_id,
  s.name AS school_name,
  s.slug AS school_slug
FROM public.canonical_pack_items_view c
JOIN public.school_packs p ON p.id = c.pack_id
LEFT JOIN public.schools s ON s.id = p.school_id;

GRANT SELECT ON public.canonical_pack_items_view TO anon, authenticated, service_role;
GRANT SELECT ON public.public_pack_items_view TO anon, authenticated, service_role;
GRANT SELECT ON public.admin_pack_items_view TO authenticated, service_role;

CREATE VIEW public.pack_subtotals
WITH (security_invoker = true)
AS
SELECT
  p.id AS pack_id,
  p.title,
  p.school_id,
  p.price,
  COALESCE(sum(c.quantity * c.unit_price) FILTER (WHERE c.visible), 0)::numeric(10,2) AS subtotal,
  count(c.id) FILTER (WHERE c.visible)::integer AS item_count
FROM public.school_packs p
LEFT JOIN public.canonical_pack_items_view c ON c.pack_id = p.id
GROUP BY p.id, p.title, p.school_id, p.price;

GRANT SELECT ON public.pack_subtotals TO anon, authenticated, service_role;

-- 4. Drop Foreign Key Constraints Linking to Legacy Tables
DO $$ 
BEGIN 
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'school_pack_items_legacy_item_id_fkey' AND table_schema = 'public'
  ) THEN 
    ALTER TABLE public.school_pack_items DROP CONSTRAINT school_pack_items_legacy_item_id_fkey; 
  END IF; 

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'master_products_legacy_item_id_fkey' AND table_schema = 'public'
  ) THEN 
    ALTER TABLE public.master_products DROP CONSTRAINT master_products_legacy_item_id_fkey; 
  END IF; 
END $$;

-- 5. Move Legacy Tables to Archive Schema
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stationery_items') THEN 
    ALTER TABLE public.stationery_items SET SCHEMA legacy_archive; 
  END IF; 

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stationery_packs') THEN 
    ALTER TABLE public.stationery_packs SET SCHEMA legacy_archive; 
  END IF; 
END $$;

GRANT ALL ON ALL TABLES IN SCHEMA legacy_archive TO service_role, postgres;

COMMIT;
