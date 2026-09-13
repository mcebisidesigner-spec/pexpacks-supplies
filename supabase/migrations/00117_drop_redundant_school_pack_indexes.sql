-- These indexes duplicate existing retained indexes exactly:
--   school_packs_slug_key: UNIQUE btree (slug)
--   idx_school_packs_search_vector: GIN (search_vector)
-- Removing duplicates reduces storage and write-maintenance work without changing data.

DROP INDEX IF EXISTS public.idx_school_packs_slug;
DROP INDEX IF EXISTS public.school_packs_search_idx;