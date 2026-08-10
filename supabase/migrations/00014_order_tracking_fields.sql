-- 00014_order_tracking_fields.sql
-- Zero-Login Guest Order Tracking Schema Extension & Security Proof Model

alter table public.orders
  add column if not exists unique_customer_id text,
  add column if not exists tracking_token text,
  add column if not exists courier_name text,
  add column if not exists waybill_number text,
  add column if not exists estimated_delivery timestamptz;

-- Unique and index constraints for tracking lookup performance and zero account enumeration
create unique index if not exists idx_orders_tracking_token on public.orders(tracking_token) where tracking_token is not null;
create index if not exists idx_orders_unique_customer_id on public.orders(unique_customer_id) where unique_customer_id is not null;
create index if not exists idx_orders_lookup_proof on public.orders(order_reference, lower(buyer_email), unique_customer_id);
