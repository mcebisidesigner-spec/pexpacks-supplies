-- ===================================================
-- Pexpacks Supplies — Enterprise Admin & Headless CMS
-- Migration 00005: Schools CMS fields
-- Adds featured/partner flags, pricing, grades, search
-- vector and supporting indexes/triggers to schools.
-- Idempotent — safe to re-run.
-- ===================================================

alter table public.schools add column if not exists is_partner boolean not null default false;
alter table public.schools add column if not exists is_featured boolean not null default false;
alter table public.schools add column if not exists lowest_price numeric;
alter table public.schools add column if not exists grades jsonb;
alter table public.schools add column if not exists search_vector tsvector;

-- Unique slug (one school per slug on the public site)
create unique index if not exists schools_slug_unique on public.schools (slug);

-- Filter/search indexes
create index if not exists schools_city_idx on public.schools (city);
create index if not exists schools_province_idx on public.schools (province);
create index if not exists schools_status_idx on public.schools (status);
create index if not exists schools_featured_idx on public.schools (is_featured) where is_featured;
create index if not exists schools_search_idx on public.schools using gin (search_vector);

-- Maintain search_vector from name/city/province/district
create or replace function public.schools_set_search_vector() returns trigger
language plpgsql as $$
begin
  new.search_vector := to_tsvector('english',
    coalesce(new.name, '') || ' ' ||
    coalesce(new.city, '') || ' ' ||
    coalesce(new.province, '') || ' ' ||
    coalesce(new.district, ''));
  return new;
end;
$$;

drop trigger if exists schools_search_vector_trg on public.schools;
create trigger schools_search_vector_trg
  before insert or update on public.schools
  for each row execute function public.schools_set_search_vector();

-- Maintain updated_at on updates
create or replace function public.schools_set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists schools_updated_at_trg on public.schools;
create trigger schools_updated_at_trg
  before update on public.schools
  for each row execute function public.schools_set_updated_at();

-- Backfill any existing rows
update public.schools
set search_vector = to_tsvector('english',
  coalesce(name, '') || ' ' ||
  coalesce(city, '') || ' ' ||
  coalesce(province, '') || ' ' ||
  coalesce(district, ''));
