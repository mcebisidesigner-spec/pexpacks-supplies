-- 00015_order_idempotency.sql
-- C1: prevent duplicate orders on retry / double-submit / multi-tab checkout.
-- Adds a client-supplied idempotency key with a unique partial index so a
-- replayed checkout request reuses the existing order instead of inserting
-- a second one.

alter table public.orders
  add column if not exists idempotency_key text;

create unique index if not exists idx_orders_idempotency_key
  on public.orders (idempotency_key)
  where idempotency_key is not null;
