-- 00024_admin_backoffice_performance.sql
-- Additive admin performance helpers. These RPCs reduce broad in-app scans on
-- busy back-office pages while preserving the existing table contracts.

create extension if not exists pg_trgm;

create index if not exists idx_stationery_packs_school_updated
  on public.stationery_packs (school_id, updated_at desc);

create index if not exists idx_stationery_packs_delivery_type
  on public.stationery_packs (delivery_type);

create index if not exists idx_orders_gateway_created
  on public.orders (created_at desc)
  where payment_gateway is not null or paid_at is not null;

create index if not exists idx_orders_reference_trgm
  on public.orders using gin (order_reference gin_trgm_ops);

create index if not exists idx_orders_buyer_name_trgm
  on public.orders using gin (buyer_name gin_trgm_ops);

create or replace function public.get_admin_pack_school_groups(
  q text default null,
  visible_filter text default null,
  page_size integer default 20,
  page_number integer default 1
)
returns table (
  school_id uuid,
  school_name text,
  school_slug text,
  grade_packs_count bigint,
  last_edited timestamptz,
  visible boolean,
  total_schools bigint,
  total_grade_packs bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with filtered as (
    select
      s.id as school_id,
      s.name as school_name,
      s.slug as school_slug,
      count(p.id)::bigint as grade_packs_count,
      greatest(
        coalesce(max(p.updated_at), s.updated_at),
        coalesce(s.updated_at, max(p.updated_at))
      ) as last_edited,
      bool_or(coalesce(p.visible, false)) as visible
    from public.schools s
    join public.stationery_packs p on p.school_id = s.id
    where (
      coalesce(trim(q), '') = ''
      or s.name ilike '%' || trim(q) || '%'
      or s.slug ilike '%' || trim(q) || '%'
    )
    group by s.id, s.name, s.slug, s.updated_at
  ),
  visible_filtered as (
    select *
    from filtered
    where (
      visible_filter is null
      or visible_filter = ''
      or (visible_filter = 'true' and visible)
      or (visible_filter = 'false' and not visible)
    )
  ),
  totals as (
    select
      count(*)::bigint as total_schools,
      coalesce(sum(grade_packs_count), 0)::bigint as total_grade_packs
    from visible_filtered
  )
  select
    vf.school_id,
    vf.school_name,
    vf.school_slug,
    vf.grade_packs_count,
    vf.last_edited,
    vf.visible,
    totals.total_schools,
    totals.total_grade_packs
  from visible_filtered vf
  cross join totals
  order by vf.school_name asc
  limit greatest(1, least(coalesce(page_size, 20), 50))
  offset greatest(0, coalesce(page_number, 1) - 1) * greatest(1, least(coalesce(page_size, 20), 50));
$$;

create or replace function public.get_payment_totals(
  q text default null,
  status_filter text default null,
  from_ts timestamptz default null,
  to_ts timestamptz default null
)
returns table (
  paid_count bigint,
  paid_total numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*) filter (where o.status = 'paid')::bigint as paid_count,
    coalesce(sum(o.estimated_total) filter (where o.status = 'paid'), 0)::numeric as paid_total
  from public.orders o
  where (
    o.payment_gateway is not null
    or o.paid_at is not null
    or o.status in ('paid', 'pending_payment', 'payment_failed', 'refunded', 'layby_active')
  )
  and (
    coalesce(trim(q), '') = ''
    or o.order_reference ilike '%' || trim(q) || '%'
    or o.buyer_name ilike '%' || trim(q) || '%'
    or o.buyer_email ilike '%' || trim(q) || '%'
  )
  and (status_filter is null or status_filter = '' or o.status = status_filter)
  and (from_ts is null or o.created_at >= from_ts)
  and (to_ts is null or o.created_at <= to_ts);
$$;

create or replace function public.get_admin_filter_options()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'school_cities',
    coalesce((select jsonb_agg(city order by city) from (select distinct city from public.schools where city is not null and city <> '') x), '[]'::jsonb),
    'school_provinces',
    coalesce((select jsonb_agg(province order by province) from (select distinct province from public.schools where province is not null and province <> '') x), '[]'::jsonb),
    'pack_delivery_types',
    coalesce((select jsonb_agg(delivery_type order by delivery_type) from (select distinct delivery_type from public.stationery_packs where delivery_type is not null and delivery_type <> '') x), '[]'::jsonb),
    'asset_folders',
    coalesce((select jsonb_agg(folder order by folder) from (select distinct folder from public.assets where folder is not null and folder <> '') x), '[]'::jsonb)
  );
$$;
