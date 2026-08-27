-- ============================================================================
-- 00053: Final Legacy Cleanup & Pure Canonical Icon Mapping
-- ============================================================================
-- Purpose:
--   1. Fully decouple runtime reads and views from legacy stationery tables.
--   2. Ensure canonical master_products.icon is the single source of truth for all
--      pack items and public school pages.
--   3. Rebuild canonical_pack_items_view, public_pack_items_view, and
--      admin_pack_items_view without legacy joins.
--   4. Recreate get_public_school_pack RPC to ensure pure canonical item output.
--   5. Archive legacy tables (stationery_items, stationery_packs) to legacy_archive schema.
-- ============================================================================

-- Step 1: Ensure master_products.icon column exists and is populated
alter table public.master_products
  add column if not exists icon text;

-- Backfill any null icons on master_products with sensible defaults
update public.master_products
set icon = 'folder'
where icon is null or icon = '' or icon = 'box' or icon = 'package';

-- Step 2: Recreate canonical_pack_items_view with 100% canonical sources
drop view if exists public.pack_subtotals cascade;
drop view if exists public.admin_pack_items_view cascade;
drop view if exists public.public_pack_items_view cascade;
drop view if exists public.canonical_pack_items_view cascade;

create view public.canonical_pack_items_view
with (security_invoker = true)
as
select
  spi.id as id,
  spi.pack_id,
  spi.product_id,
  coalesce(nullif(spi.school_wording, ''), mp.name) as name,
  coalesce(spi.pack_quantity, 1)::integer as quantity,
  coalesce(spi.selling_price_override, mp.current_selling_price, 0)::numeric(12,2) as unit_price,
  coalesce(nullif(mp.icon, ''), 'folder')::text as icon,
  coalesce(nullif(spi.school_notes, ''), mp.description) as description,
  coalesce(mp.specification, mp.packaging, mp.unit) as specification,
  mp.category,
  mp.sku,
  mp.brand,
  mp.availability,
  spi.substitution_policy,
  coalesce(spi.sort_order, 0)::integer as sort_order,
  spi.active as visible,
  'canonical'::text as source
from public.school_pack_items spi
join public.master_products mp on mp.id = spi.product_id;

create view public.public_pack_items_view
with (security_invoker = true)
as
select c.*
from public.canonical_pack_items_view c
join public.school_packs p on p.id = c.pack_id
left join public.schools s on s.id = p.school_id
where c.visible = true
  and p.visible = true
  and coalesce(s.status, 'active') = 'active'
  and coalesce(s.published, true) = true;

create view public.admin_pack_items_view
with (security_invoker = true)
as
select
  c.*,
  p.title as pack_title,
  p.slug as pack_slug,
  p.school_id,
  s.name as school_name,
  s.slug as school_slug
from public.canonical_pack_items_view c
join public.school_packs p on p.id = c.pack_id
left join public.schools s on s.id = p.school_id;

grant select on public.canonical_pack_items_view to anon, authenticated, service_role;
grant select on public.public_pack_items_view to anon, authenticated, service_role;
grant select on public.admin_pack_items_view to authenticated, service_role;

create view public.pack_subtotals
with (security_invoker = true)
as
select
  p.id as pack_id,
  p.title,
  p.school_id,
  p.price,
  coalesce(sum(c.quantity * c.unit_price) filter (where c.visible), 0)::numeric(10,2) as subtotal,
  count(c.id) filter (where c.visible)::integer as item_count
from public.school_packs p
left join public.canonical_pack_items_view c on c.pack_id = p.id
group by p.id, p.title, p.school_id, p.price;

grant select on public.pack_subtotals to anon, authenticated, service_role;

-- Step 3: Recreate get_public_school_pack RPC for ultra-fast canonical JSON
create or replace function public.get_public_school_pack(school_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'school', jsonb_build_object(
      'id', s.id,
      'name', s.name,
      'slug', s.slug,
      'city', s.city,
      'district', s.district,
      'province', s.province,
      'logo', s.logo,
      'is_partner', s.is_partner,
      'refused_partnership', coalesce(s.refused_partnership, false)
    ),
    'packs', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'title', p.title,
            'slug', p.slug,
            'price', p.price,
            'description', p.description,
            'stock', p.stock,
            'sort_order', p.sort_order,
            'items', coalesce(
              (
                select jsonb_agg(
                  jsonb_build_object(
                    'name', i.name,
                    'quantity', i.quantity,
                    'unit_price', i.unit_price,
                    'icon', i.icon,
                    'description', i.description,
                    'specification', i.specification
                  )
                  order by i.sort_order, i.name
                )
                from public.public_pack_items_view i
                where i.pack_id = p.id
              ),
              '[]'::jsonb
            )
          )
          order by p.sort_order, p.title
        )
        from public.school_packs p
        where (p.school_id = s.id or p.slug ilike s.slug || '-%')
          and p.visible = true
      ),
      '[]'::jsonb
    )
  )
  from public.schools s
  where s.slug = school_slug
    and s.status = 'active'
    and s.published is not false
  limit 1
$$;

grant execute on function public.get_public_school_pack(text) to anon, authenticated, service_role;

-- Step 4: Archive Legacy Tables into 'legacy_archive' schema
create schema if not exists legacy_archive;

do $$
begin
  if exists (
    select from pg_tables
    where schemaname = 'public' and tablename = 'stationery_items'
  ) then
    alter table public.stationery_items set schema legacy_archive;
  end if;

  if exists (
    select from pg_tables
    where schemaname = 'public' and tablename = 'stationery_packs'
  ) then
    alter table public.stationery_packs set schema legacy_archive;
  end if;

  if exists (
    select from pg_tables
    where schemaname = 'public' and tablename = 'app_settings'
  ) then
    alter table public.app_settings set schema legacy_archive;
  end if;
end $$;
