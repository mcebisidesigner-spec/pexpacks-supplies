-- ===================================================
-- Pexpacks Supplies — Database Performance Optimization
-- Migration 00017: Pre-Aggregated Dashboard Metrics
-- ===================================================

-- Push heavy aggregate computation into Postgres instead of
-- streaming all rows to the app server (JS-side SUM/dedupe).

-- 1. Total revenue from paid orders
create or replace function public.get_revenue_total()
returns table (revenue numeric)
language sql stable security definer
as $$
  select coalesce(sum(estimated_total), 0)::numeric
  from public.orders
  where status = 'paid'
    and estimated_total is not null
$$;

-- 2. Total asset storage size
create or replace function public.get_assets_size()
returns table (size_bytes bigint)
language sql stable security definer
as $$
  select coalesce(sum(size_bytes), 0)::bigint
  from public.assets
$$;

-- 3. Distinct order pack types for the admin orders filter
create or replace function public.get_order_pack_types()
returns table (pack_type text)
language sql stable security definer
as $$
  select distinct pack_type
  from public.orders
  where pack_type is not null
    and pack_type <> ''
  order by pack_type
$$;
