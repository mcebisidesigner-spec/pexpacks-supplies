-- Preserve the server-verified Pexcover eligibility on each purchased order item.
-- This is internal fulfilment data only and is never exposed by public read models.
alter table public.order_items
  add column if not exists requires_pexcover boolean not null default false;

create index if not exists idx_order_items_pexcover
  on public.order_items (order_id)
  where requires_pexcover = true;