-- ============================================================================
-- 00037: Canonical schema unification views
-- ============================================================================
-- Purpose:
--   Make the normalized operations platform the read model for fresh builds
--   while keeping legacy tables available as compatibility inputs.
--
-- Canonical:
--   products          -> master_products
--   pack composition  -> school_pack_items
--   order lines       -> order_items
--   settings          -> system_settings
--
-- Compatibility:
--   stationery_items  -> legacy pack-item input table
--   orders.items      -> legacy display/cache summary only
--   app_settings      -> legacy settings sections
-- ============================================================================

-- 1. Unified pack item view ----------------------------------------------------
-- One read surface for both public and admin pack item rendering.
-- Canonical rows come from school_pack_items + master_products.
-- Legacy rows are included only when no canonical school_pack_items row exists.

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
  coalesce(nullif(spi.school_wording, ''), li.name, mp.name) as name,
  coalesce(spi.pack_quantity, li.quantity, 1)::integer as quantity,
  coalesce(spi.selling_price_override, li.unit_price, mp.current_selling_price, 0)::numeric(12,2) as unit_price,
  coalesce(li.icon, 'box') as icon,
  coalesce(nullif(spi.school_notes, ''), li.description, mp.description) as description,
  coalesce(li.specification, mp.specification, mp.packaging, mp.unit) as specification,
  coalesce(li.category, mp.category) as category,
  mp.sku,
  mp.brand,
  mp.availability,
  spi.substitution_policy,
  coalesce(spi.sort_order, li.sort_order, 0)::integer as sort_order,
  (spi.active and coalesce(li.visible, true)) as visible,
  'canonical'::text as source
from public.school_pack_items spi
join public.master_products mp on mp.id = spi.product_id
left join public.stationery_items li on li.id = spi.legacy_item_id

union all

select
  li.id as id,
  li.pack_id,
  li.master_product_id as product_id,
  li.id as legacy_item_id,
  li.name,
  li.quantity,
  coalesce(li.unit_price, mp.current_selling_price, 0)::numeric(12,2) as unit_price,
  coalesce(li.icon, 'box') as icon,
  coalesce(li.description, mp.description) as description,
  coalesce(li.specification, mp.specification, mp.packaging, mp.unit) as specification,
  coalesce(li.category, mp.category) as category,
  mp.sku,
  mp.brand,
  mp.availability,
  'allowed'::text as substitution_policy,
  li.sort_order,
  li.visible,
  'legacy'::text as source
from public.stationery_items li
left join public.master_products mp on mp.id = li.master_product_id
where not exists (
  select 1
  from public.school_pack_items spi
  where spi.legacy_item_id = li.id
);

create view public.public_pack_items_view
with (security_invoker = true)
as
select c.*
from public.canonical_pack_items_view c
join public.stationery_packs p on p.id = c.pack_id
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
join public.stationery_packs p on p.id = c.pack_id
left join public.schools s on s.id = p.school_id;

grant select on public.canonical_pack_items_view to anon, authenticated, service_role;
grant select on public.public_pack_items_view to anon, authenticated, service_role;
grant select on public.admin_pack_items_view to authenticated, service_role;

comment on view public.canonical_pack_items_view is
  'Unified pack-item read model. Prefer school_pack_items + master_products; include legacy stationery_items only when not bridged.';
comment on table public.stationery_items is
  'Compatibility table for legacy pack item forms. Canonical product data lives in master_products; canonical pack composition lives in school_pack_items.';
comment on table public.school_pack_items is
  'Canonical school-pack composition table linking stationery_packs to master_products.';
comment on table public.master_products is
  'Canonical stationery product catalogue. One row per real product or SKU.';

-- 2. Canonical pack subtotal --------------------------------------------------

drop view if exists public.pack_subtotals;
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
from public.stationery_packs p
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

grant execute on function public.get_pack_subtotal(uuid) to anon, authenticated, service_role;

-- 3. Canonical order-line summary --------------------------------------------

drop view if exists public.order_line_summary_view;
create view public.order_line_summary_view
with (security_invoker = true)
as
select
  oi.id as order_item_id,
  oi.order_id,
  o.order_reference,
  o.status as order_status,
  o.created_at as order_created_at,
  o.paid_at,
  oi.product_id,
  oi.pack_id,
  coalesce(mp.sku, oi.sku_snapshot) as sku,
  oi.product_name_snapshot as product_name,
  oi.description_snapshot as description,
  oi.quantity,
  oi.unit_selling_price,
  oi.line_total,
  oi.estimated_unit_cost,
  oi.expected_margin,
  oi.school_name_snapshot,
  oi.grade_snapshot
from public.order_items oi
join public.orders o on o.id = oi.order_id
left join public.master_products mp on mp.id = oi.product_id;

grant select on public.order_line_summary_view to authenticated, service_role;
comment on view public.order_line_summary_view is
  'Canonical order-line reporting view. orders.items is treated as legacy display/cache summary only.';
comment on column public.orders.items is
  'Legacy order item summary. Business logic should use order_items/order_line_summary_view.';

create or replace function public.get_orders_summary(from_date date, to_date date)
returns table (
  total_orders bigint,
  paid_orders bigint,
  refunded_orders bigint,
  cancelled_orders bigint,
  revenue numeric,
  avg_order_value numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with filtered_orders as (
    select o.id, o.status
    from public.orders o
    where o.created_at::date between from_date and to_date
  ),
  order_totals as (
    select ol.order_id, coalesce(sum(ol.line_total), 0)::numeric(12,2) as order_total
    from public.order_line_summary_view ol
    join filtered_orders fo on fo.id = ol.order_id
    group by ol.order_id
  )
  select
    count(*)::bigint as total_orders,
    count(*) filter (where fo.status in ('paid', 'processing', 'fulfilled'))::bigint as paid_orders,
    count(*) filter (where fo.status = 'refunded')::bigint as refunded_orders,
    count(*) filter (where fo.status = 'cancelled')::bigint as cancelled_orders,
    coalesce(sum(ot.order_total) filter (where fo.status in ('paid', 'processing', 'fulfilled')), 0)::numeric(12,2) as revenue,
    coalesce(avg(ot.order_total) filter (where fo.status in ('paid', 'processing', 'fulfilled')), 0)::numeric(12,2) as avg_order_value
  from filtered_orders fo
  left join order_totals ot on ot.order_id = fo.id;
$$;

create or replace function public.get_orders_by_status_range(from_date date, to_date date)
returns table (status text, order_count bigint, revenue numeric)
language sql
stable
security definer
set search_path = public
as $$
  with filtered_orders as (
    select o.id, o.status
    from public.orders o
    where o.created_at::date between from_date and to_date
  ),
  order_totals as (
    select ol.order_id, coalesce(sum(ol.line_total), 0)::numeric(12,2) as order_total
    from public.order_line_summary_view ol
    join filtered_orders fo on fo.id = ol.order_id
    group by ol.order_id
  )
  select
    coalesce(fo.status, 'unknown')::text as status,
    count(*)::bigint as order_count,
    coalesce(sum(ot.order_total), 0)::numeric(12,2) as revenue
  from filtered_orders fo
  left join order_totals ot on ot.order_id = fo.id
  group by coalesce(fo.status, 'unknown')
  order by order_count desc;
$$;

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
  left join public.stationery_packs p on p.id = oi.pack_id
  where o.created_at::date between from_date and to_date
  group by coalesce(p.title, o.pack_type, 'Unknown')
  order by order_count desc;
$$;

create or replace function public.get_top_schools(from_date date, to_date date, result_limit integer default 10)
returns table (school_name text, order_count bigint, revenue numeric)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(ol.school_name_snapshot, 'Unknown')::text as school_name,
    count(distinct ol.order_id)::bigint as order_count,
    coalesce(sum(ol.line_total), 0)::numeric(12,2) as revenue
  from public.order_line_summary_view ol
  where ol.order_created_at::date between from_date and to_date
  group by coalesce(ol.school_name_snapshot, 'Unknown')
  order by revenue desc, order_count desc
  limit greatest(result_limit, 1);
$$;

grant execute on function public.get_orders_summary(date, date) to authenticated, service_role;
grant execute on function public.get_orders_by_status_range(date, date) to authenticated, service_role;
grant execute on function public.get_orders_by_pack_type_range(date, date) to authenticated, service_role;
grant execute on function public.get_top_schools(date, date, integer) to authenticated, service_role;

-- 4. Effective settings view --------------------------------------------------

insert into public.system_settings (
  key, category, value, value_type, scope, description,
  is_sensitive, is_public, requires_approval
) values
  ('orders.pexcover_enabled', 'orders', 'true'::jsonb, 'boolean', 'global', 'Offer PexCover protection at checkout', false, false, false),
  ('orders.currency', 'orders', '"ZAR"'::jsonb, 'string', 'global', 'Default checkout and reporting currency', false, false, false)
on conflict (key) do nothing;

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
from public.system_settings ss

union all

select
  'legacy.' || aps.key as key,
  aps.key as category,
  aps.value,
  'json'::text as value_type,
  'global'::text as scope,
  null::varchar(100) as scope_id,
  false as is_sensitive,
  false as is_public,
  false as requires_approval,
  1 as version,
  aps.updated_at,
  'app_settings'::text as source
from public.app_settings aps
where not exists (
  select 1
  from public.system_settings ss
  where ss.key = 'legacy.' || aps.key
);

grant select on public.settings_effective_view to authenticated, service_role;
comment on table public.app_settings is
  'Compatibility settings table. New settings should use system_settings.';
comment on view public.settings_effective_view is
  'Unified settings read model. system_settings is canonical; app_settings appears as legacy.* compatibility keys.';

-- 5. Public school pack RPC now reads the unified pack-item view ---------------

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
        from public.stationery_packs p
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
