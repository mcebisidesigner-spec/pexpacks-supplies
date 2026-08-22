-- ============================================================================
-- 00043: School packs canonical cutover
-- ============================================================================
-- Purpose:
--   Move active pack headers from legacy stationery_packs to canonical
--   school_packs, make canonical pack reads use only school_pack_items +
--   master_products, and block accidental legacy writes.
--
-- Strategy:
--   - Preserve IDs so existing school_pack_items/order_items references remain
--     valid after their foreign keys move to school_packs.
--   - Keep legacy tables physically present as archive/rollback surfaces.
--   - Remove compatibility fallbacks from active views/functions.
-- ============================================================================

-- 1. Canonical pack header table ---------------------------------------------

create table if not exists public.school_packs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete set null,
  title text not null,
  slug text unique,
  description text,
  price numeric not null default 0,
  stock integer not null default 0,
  featured boolean not null default false,
  visible boolean not null default true,
  academic_year text,
  delivery_type text not null default 'School collection',
  pack_image text,
  sort_order integer not null default 0,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  search_vector tsvector,
  season_id uuid references public.seasons(id) on delete set null,
  list_version integer not null default 1,
  pricing_status text not null default 'canonical',
  fulfilment_deadline date
);

alter table public.school_packs enable row level security;

insert into public.school_packs (
  id,
  school_id,
  title,
  slug,
  description,
  price,
  stock,
  featured,
  visible,
  academic_year,
  delivery_type,
  pack_image,
  sort_order,
  created_by,
  updated_by,
  created_at,
  updated_at,
  search_vector,
  season_id,
  list_version,
  pricing_status,
  fulfilment_deadline
)
select
  id,
  school_id,
  title,
  slug,
  description,
  price,
  stock,
  featured,
  visible,
  academic_year,
  delivery_type,
  pack_image,
  sort_order,
  created_by,
  updated_by,
  created_at,
  updated_at,
  search_vector,
  season_id,
  list_version,
  case when pricing_status = 'legacy' then 'canonical' else pricing_status end,
  fulfilment_deadline
from public.stationery_packs
on conflict (id) do update set
  school_id = excluded.school_id,
  title = excluded.title,
  slug = excluded.slug,
  description = excluded.description,
  price = excluded.price,
  stock = excluded.stock,
  featured = excluded.featured,
  visible = excluded.visible,
  academic_year = excluded.academic_year,
  delivery_type = excluded.delivery_type,
  pack_image = excluded.pack_image,
  sort_order = excluded.sort_order,
  created_by = excluded.created_by,
  updated_by = excluded.updated_by,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  search_vector = excluded.search_vector,
  season_id = excluded.season_id,
  list_version = excluded.list_version,
  pricing_status = excluded.pricing_status,
  fulfilment_deadline = excluded.fulfilment_deadline;

drop trigger if exists school_packs_search_vector_trg on public.school_packs;
create trigger school_packs_search_vector_trg
  before insert or update on public.school_packs
  for each row execute function public.packs_set_search_vector();

drop trigger if exists school_packs_updated_at_trg on public.school_packs;
create trigger school_packs_updated_at_trg
  before update on public.school_packs
  for each row execute function public.set_updated_at();

create index if not exists idx_school_packs_school on public.school_packs (school_id);
create index if not exists idx_school_packs_school_updated on public.school_packs (school_id, updated_at desc);
create index if not exists idx_school_packs_delivery_type on public.school_packs (delivery_type);
create index if not exists idx_school_packs_featured on public.school_packs (featured) where visible;
create index if not exists idx_school_packs_school_visible on public.school_packs (school_id, visible);
create index if not exists idx_school_packs_school_visible_sort on public.school_packs (school_id, visible, sort_order);
create index if not exists idx_school_packs_slug on public.school_packs (slug);
create index if not exists school_packs_search_idx on public.school_packs using gin (search_vector);

drop policy if exists "Public read school_packs" on public.school_packs;
create policy "Public read school_packs"
  on public.school_packs
  for select
  to anon
  using (
    visible = true
    and exists (
      select 1
      from public.schools s
      where s.id = school_packs.school_id
        and s.status = 'active'
        and coalesce(s.published, true) = true
    )
  );

drop policy if exists "Staff read school_packs" on public.school_packs;
create policy "Staff read school_packs"
  on public.school_packs
  for select
  to authenticated
  using (public.has_permission('packs.view'));

drop policy if exists "Staff write school_packs" on public.school_packs;
create policy "Staff write school_packs"
  on public.school_packs
  for all
  to authenticated
  using (public.has_permission('packs.edit'))
  with check (public.has_permission('packs.edit'));

drop policy if exists "Service role manage school_packs" on public.school_packs;
create policy "Service role manage school_packs"
  on public.school_packs
  for all
  to service_role
  using (true)
  with check (true);

-- 2. Reconcile remaining legacy rows into canonical tables --------------------

create or replace function public.reconcile_legacy_to_canonical()
returns table (
  reconciled_master_products bigint,
  reconciled_pack_items bigint,
  reconciled_system_settings bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prod_count bigint := 0;
  v_pack_item_count bigint := 0;
  v_settings_count bigint := 0;
begin
  with inserted_products as (
    insert into public.master_products (
      sku,
      name,
      description,
      category,
      brand,
      current_selling_price,
      calculated_selling_price,
      pricing_status,
      active
    )
    select distinct
      coalesce(nullif(trim(si.category), ''), 'LEGACY-ITEM-' || left(si.id::text, 8)) as sku,
      coalesce(nullif(trim(si.name), ''), 'Legacy Product ' || left(si.id::text, 8)) as name,
      si.description,
      coalesce(nullif(trim(si.category), ''), 'General Stationery') as category,
      'Generic' as brand,
      coalesce(si.unit_price, 0) as current_selling_price,
      coalesce(si.unit_price, 0) as calculated_selling_price,
      case when coalesce(si.unit_price, 0) > 0 then 'review' else 'unpriced' end as pricing_status,
      coalesce(si.visible, true) as active
    from public.stationery_items si
    left join public.master_products mp
      on mp.id = si.master_product_id
      or lower(mp.sku) = lower(coalesce(nullif(trim(si.category), ''), 'LEGACY-ITEM-' || left(si.id::text, 8)))
    where mp.id is null
    on conflict (sku) do update set
      name = excluded.name,
      description = coalesce(excluded.description, master_products.description),
      category = coalesce(excluded.category, master_products.category),
      current_selling_price = excluded.current_selling_price,
      calculated_selling_price = excluded.calculated_selling_price,
      active = excluded.active,
      updated_at = now()
    returning id
  )
  select count(*) into v_prod_count from inserted_products;

  update public.stationery_items si
  set master_product_id = mp.id
  from public.master_products mp
  where si.master_product_id is null
    and lower(mp.sku) = lower(coalesce(nullif(trim(si.category), ''), 'LEGACY-ITEM-' || left(si.id::text, 8)));

  with legacy_source as (
    select
      si.*,
      nullif(trim(si.name), '') as base_school_wording,
      row_number() over (
        partition by si.pack_id, si.master_product_id, nullif(trim(si.name), '')
        order by coalesce(si.sort_order, 0), si.id
      ) as duplicate_index
    from public.stationery_items si
  ),
  inserted_pack_items as (
    insert into public.school_pack_items (
      pack_id,
      product_id,
      pack_quantity,
      school_wording,
      school_notes,
      selling_price_override,
      legacy_item_id,
      sort_order,
      active
    )
    select
      si.pack_id,
      si.master_product_id as product_id,
      greatest(1, coalesce(si.quantity, 1)) as pack_quantity,
      case
        when exists (
          select 1
          from public.school_pack_items existing
          where existing.pack_id = si.pack_id
            and existing.product_id = si.master_product_id
            and existing.school_wording is not distinct from si.base_school_wording
            and existing.legacy_item_id is distinct from si.id
        ) then coalesce(si.base_school_wording, 'Legacy item') || ' #' || left(si.id::text, 8)
        when si.duplicate_index = 1 then si.base_school_wording
        else coalesce(si.base_school_wording, 'Legacy item') || ' #' || si.duplicate_index::text
      end as school_wording,
      si.description as school_notes,
      si.unit_price as selling_price_override,
      si.id as legacy_item_id,
      coalesce(si.sort_order, 0) as sort_order,
      coalesce(si.visible, true) as active
    from legacy_source si
    join public.school_packs sp on sp.id = si.pack_id
    left join public.school_pack_items spi on spi.legacy_item_id = si.id
    where si.master_product_id is not null
      and spi.id is null
    on conflict on constraint school_pack_items_pack_id_product_id_school_wording_key
    do update set
      pack_quantity = excluded.pack_quantity,
      school_notes = coalesce(excluded.school_notes, school_pack_items.school_notes),
      selling_price_override = coalesce(excluded.selling_price_override, school_pack_items.selling_price_override),
      legacy_item_id = coalesce(school_pack_items.legacy_item_id, excluded.legacy_item_id),
      sort_order = least(school_pack_items.sort_order, excluded.sort_order),
      active = school_pack_items.active or excluded.active,
      updated_at = now()
    returning id
  )
  select count(*) into v_pack_item_count from inserted_pack_items;

  with inserted_settings as (
    insert into public.system_settings (
      key,
      category,
      value,
      value_type,
      scope,
      description,
      is_public
    )
    select
      aset.key,
      'legacy' as category,
      coalesce(aset.value, 'null'::jsonb) as value,
      'json'::public.setting_value_type as value_type,
      'global'::public.setting_scope as scope,
      'Migrated from legacy app_settings' as description,
      false as is_public
    from public.app_settings aset
    left join public.system_settings sset on sset.key = aset.key
    where sset.key is null
    on conflict (key) do nothing
    returning key
  )
  select count(*) into v_settings_count from inserted_settings;

  return query select v_prod_count, v_pack_item_count, v_settings_count;
end;
$$;

grant execute on function public.reconcile_legacy_to_canonical to authenticated, service_role;

select * from public.reconcile_legacy_to_canonical();

-- 3. Move canonical foreign keys to school_packs ------------------------------

alter table public.school_pack_items
  drop constraint if exists school_pack_items_pack_id_fkey;
alter table public.school_pack_items
  add constraint school_pack_items_pack_id_fkey
  foreign key (pack_id) references public.school_packs(id) on delete cascade;

alter table public.order_items
  drop constraint if exists order_items_pack_id_fkey;
alter table public.order_items
  add constraint order_items_pack_id_fkey
  foreign key (pack_id) references public.school_packs(id) on delete set null;

-- 4. Canonical-only views and reporting functions -----------------------------

drop view if exists public.pack_subtotals;
drop view if exists public.public_pack_items_view;
drop view if exists public.admin_pack_items_view;
drop view if exists public.canonical_pack_items_view;

create view public.canonical_pack_items_view
with (security_invoker = true)
as
select
  spi.id as id,
  spi.pack_id,
  spi.product_id,
  spi.legacy_item_id,
  coalesce(nullif(spi.school_wording, ''), mp.name) as name,
  coalesce(spi.pack_quantity, 1)::integer as quantity,
  coalesce(spi.selling_price_override, mp.current_selling_price, 0)::numeric(12,2) as unit_price,
  'box'::text as icon,
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

create or replace function public.get_pack_subtotal(pack_id uuid)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(quantity * unit_price) filter (where visible), 0)::numeric(10,2)
  from public.canonical_pack_items_view
  where pack_id = $1;
$$;

drop view if exists public.settings_effective_view;
create view public.settings_effective_view
with (security_invoker = true)
as
select
  ss.key,
  ss.category,
  ss.value,
  ss.value_type::text as value_type,
  ss.scope::text as scope,
  ss.scope_id,
  ss.is_sensitive,
  ss.is_public,
  ss.requires_approval,
  ss.version,
  ss.updated_at,
  'system_settings'::text as source
from public.system_settings ss;

grant select on public.settings_effective_view to authenticated, service_role;

create or replace function public.get_orders_by_pack_type_range(from_date date, to_date date)
returns table (pack_type text, order_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(p.title, o.pack_type, 'Unknown')::text as pack_type,
    count(distinct o.id)::bigint as order_count
  from public.orders o
  left join public.order_items oi on oi.order_id = o.id
  left join public.school_packs p on p.id = oi.pack_id
  where o.created_at::date between from_date and to_date
  group by coalesce(p.title, o.pack_type, 'Unknown')
  order by order_count desc;
$$;

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

-- 5. Deletion simulation and legacy write blockers ----------------------------

create or replace view public.legacy_deletion_blockers_view
with (security_invoker = true)
as
select
  'stationery_packs'::text as legacy_object,
  count(*)::bigint as active_dependency_count,
  'code references and DB dependencies must be zero before physical deletion'::text as note
from pg_depend d
join pg_class c on c.oid = d.refobjid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'stationery_packs'
union all
select
  'stationery_items',
  count(*)::bigint,
  'code references and DB dependencies must be zero before physical deletion'
from pg_depend d
join pg_class c on c.oid = d.refobjid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'stationery_items'
union all
select
  'app_settings',
  count(*)::bigint,
  'code references and DB dependencies must be zero before physical deletion'
from pg_depend d
join pg_class c on c.oid = d.refobjid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'app_settings';

grant select on public.legacy_deletion_blockers_view to authenticated, service_role;

create or replace function public.prevent_legacy_table_write()
returns trigger
language plpgsql
security definer
as $$
begin
  if current_setting('app.allow_legacy_write', true) = 'on' then
    return coalesce(new, old);
  end if;

  raise exception 'Legacy table %.% is archived. Write to canonical tables instead.', TG_TABLE_SCHEMA, TG_TABLE_NAME
    using errcode = 'read_only_sql_transaction';
end;
$$;

drop trigger if exists block_stationery_packs_writes on public.stationery_packs;
create trigger block_stationery_packs_writes
  before insert or update or delete on public.stationery_packs
  for each row execute function public.prevent_legacy_table_write();

drop trigger if exists block_stationery_items_writes on public.stationery_items;
create trigger block_stationery_items_writes
  before insert or update or delete on public.stationery_items
  for each row execute function public.prevent_legacy_table_write();

drop trigger if exists block_app_settings_writes on public.app_settings;
create trigger block_app_settings_writes
  before insert or update or delete on public.app_settings
  for each row execute function public.prevent_legacy_table_write();

comment on table public.school_packs is
  'Canonical school-pack header table. Replaces legacy stationery_packs for active app reads and writes.';
comment on table public.stationery_packs is
  'Archived legacy school-pack header table. Do not write; canonical replacement is school_packs.';
comment on table public.stationery_items is
  'Archived legacy pack item table. Do not write; canonical replacement is school_pack_items + master_products.';
comment on table public.app_settings is
  'Archived legacy settings table. Do not write; canonical replacement is system_settings.';
