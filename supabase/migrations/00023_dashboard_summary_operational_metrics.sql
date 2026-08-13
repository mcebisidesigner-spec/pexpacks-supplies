-- ===================================================
-- Pexpacks Supplies — Operational Dashboard Metrics
-- Migration 00023: extend dashboard_summaries with
-- today/week order counts, fulfilment pipeline and
-- active-pack metrics.
--
-- Strictly additive: new columns carry DEFAULT 0, so
-- existing rows stay valid without a data migration.
-- The refresh procedure is replaced (CREATE OR REPLACE)
-- to populate the new columns; the pg_cron schedule and
-- on-demand refresh from markOrderPaid both pick it up.
-- ===================================================

-- 1. New pre-aggregated columns
alter table public.dashboard_summaries
  add column if not exists orders_today int not null default 0,
  add column if not exists orders_this_week int not null default 0,
  add column if not exists awaiting_fulfilment int not null default 0,
  add column if not exists completed_orders int not null default 0,
  add column if not exists active_packs int not null default 0;

-- 2. Replace the batch refresh procedure (supersedes 00019).
--    Status semantics align with lib/admin/order-constants.ts:
--      paid / pending_payment / pending / payment_failed /
--      layby_active / packing / delivered / cancelled / refunded
create or replace function public.refresh_all_dashboard_summaries()
returns void
language plpgsql
security definer
as $$
declare
  v_total_orders int;
  v_paid_orders int;
  v_pending_orders int;
  v_total_revenue numeric(12,2);
  v_total_schools int;
  v_total_packs int;
  v_orders_today int;
  v_orders_this_week int;
  v_awaiting_fulfilment int;
  v_completed_orders int;
  v_active_packs int;
begin
  select count(*),
         count(*) filter (where status = 'paid'),
         count(*) filter (where status in ('pending_payment', 'pending', 'layby_active')),
         coalesce(sum(estimated_total) filter (where status = 'paid'), 0.00)
  into v_total_orders, v_paid_orders, v_pending_orders, v_total_revenue
  from public.orders;

  select count(*) into v_total_schools from public.schools;
  select count(*) into v_total_packs from public.stationery_packs;

  select count(*) into v_active_packs
  from public.stationery_packs
  where visible = true;

  select count(*) into v_orders_today
  from public.orders
  where created_at >= date_trunc('day', now());

  select count(*) into v_orders_this_week
  from public.orders
  where created_at >= date_trunc('week', now());

  select count(*) into v_awaiting_fulfilment
  from public.orders
  where status in ('paid', 'packing');

  select count(*) into v_completed_orders
  from public.orders
  where status = 'delivered';

  insert into public.dashboard_summaries (
    id,
    total_orders, paid_orders, pending_orders, total_revenue,
    total_schools, total_packs,
    orders_today, orders_this_week, awaiting_fulfilment, completed_orders, active_packs,
    last_updated_at
  )
  values (
    'global',
    v_total_orders, v_paid_orders, v_pending_orders, v_total_revenue,
    v_total_schools, v_total_packs,
    v_orders_today, v_orders_this_week, v_awaiting_fulfilment, v_completed_orders, v_active_packs,
    now()
  )
  on conflict (id) do update set
    total_orders = excluded.total_orders,
    paid_orders = excluded.paid_orders,
    pending_orders = excluded.pending_orders,
    total_revenue = excluded.total_revenue,
    total_schools = excluded.total_schools,
    total_packs = excluded.total_packs,
    orders_today = excluded.orders_today,
    orders_this_week = excluded.orders_this_week,
    awaiting_fulfilment = excluded.awaiting_fulfilment,
    completed_orders = excluded.completed_orders,
    active_packs = excluded.active_packs,
    last_updated_at = excluded.last_updated_at;
end;
$$;

-- 3. Recalculate immediately so the new columns are populated.
select public.refresh_all_dashboard_summaries();
