-- ===================================================
-- 00006 PACKS & ITEMS CMS
-- Search vectors, timestamps, indexes (idempotent)
-- ===================================================

alter table public.stationery_packs add column if not exists search_vector tsvector;
alter table public.stationery_items add column if not exists search_vector tsvector;

-- ---------------------------------------------------
-- 1. FUNCTIONS
-- ---------------------------------------------------

create or replace function public.packs_set_search_vector()
returns trigger language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.academic_year, '')), 'B');
  return new;
end;
$$;

create or replace function public.items_set_search_vector()
returns trigger language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B');
  return new;
end;
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------
-- 2. TRIGGERS
-- ---------------------------------------------------

drop trigger if exists packs_search_vector_trg on public.stationery_packs;
create trigger packs_search_vector_trg
  before insert or update on public.stationery_packs
  for each row execute function public.packs_set_search_vector();

drop trigger if exists items_search_vector_trg on public.stationery_items;
create trigger items_search_vector_trg
  before insert or update on public.stationery_items
  for each row execute function public.items_set_search_vector();

drop trigger if exists packs_updated_at_trg on public.stationery_packs;
create trigger packs_updated_at_trg
  before update on public.stationery_packs
  for each row execute function public.set_updated_at();

drop trigger if exists items_updated_at_trg on public.stationery_items;
create trigger items_updated_at_trg
  before update on public.stationery_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------
-- 3. INDEXES
-- ---------------------------------------------------

create index if not exists stationery_packs_search_idx on public.stationery_packs using gin (search_vector);
create index if not exists stationery_items_search_idx on public.stationery_items using gin (search_vector);
create index if not exists idx_stationery_packs_featured on public.stationery_packs (featured) where visible;
create index if not exists idx_stationery_packs_school_visible on public.stationery_packs (school_id, visible);
create index if not exists idx_stationery_items_pack_visible on public.stationery_items (pack_id, visible);

-- ---------------------------------------------------
-- 4. BACKFILL
-- ---------------------------------------------------

update public.stationery_packs set search_vector = to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(academic_year, ''));
update public.stationery_items set search_vector = to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''));
