-- Migration 00080: Tighten pricing and product search trigger work
-- ============================================================================
-- Keep Grade Pack pricing on the raw-cost formula while reducing write overhead:
-- - Grade Pack item pricing sync only runs for insert/delete or fields that affect
--   cost membership: pack_id, product_id, pack_quantity, active.
-- - Master product search vector maintenance is consolidated into one trigger;
--   updated_at is still maintained for every update, but search_vector is only
--   recomputed when searchable text changes.
-- ============================================================================

DROP TRIGGER IF EXISTS trg_sync_pack_price_on_item_change ON public.school_pack_items;
DROP TRIGGER IF EXISTS trg_sync_pack_price_on_item_pricing_update ON public.school_pack_items;

CREATE TRIGGER trg_sync_pack_price_on_item_change
  AFTER INSERT OR DELETE ON public.school_pack_items
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_trg_pack_item_pricing_sync();

CREATE TRIGGER trg_sync_pack_price_on_item_pricing_update
  AFTER UPDATE OF pack_id, product_id, pack_quantity, active ON public.school_pack_items
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_trg_pack_item_pricing_sync();

CREATE OR REPLACE FUNCTION public.maintain_master_products_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT'
     OR OLD.sku IS DISTINCT FROM NEW.sku
     OR OLD.name IS DISTINCT FROM NEW.name
     OR OLD.brand IS DISTINCT FROM NEW.brand
     OR OLD.category IS DISTINCT FROM NEW.category
     OR OLD.description IS DISTINCT FROM NEW.description
     OR OLD.specification IS DISTINCT FROM NEW.specification THEN
    NEW.search_vector :=
      setweight(to_tsvector('simple', COALESCE(NEW.sku, '')), 'A') ||
      setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'A') ||
      setweight(to_tsvector('simple', COALESCE(NEW.brand, '')), 'B') ||
      setweight(to_tsvector('simple', COALESCE(NEW.category, '')), 'B') ||
      setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'C') ||
      setweight(to_tsvector('simple', COALESCE(NEW.specification, '')), 'C');
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at := now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS master_products_search_vector_trg ON public.master_products;
DROP TRIGGER IF EXISTS trg_master_products_search_vector ON public.master_products;

CREATE TRIGGER trg_master_products_search_vector
  BEFORE INSERT OR UPDATE ON public.master_products
  FOR EACH ROW
  EXECUTE FUNCTION public.maintain_master_products_search_vector();