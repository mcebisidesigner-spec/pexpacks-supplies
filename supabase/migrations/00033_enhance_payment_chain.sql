-- Migration 00033: Enhance complete_order_payment with auto-allocation and fulfilment notification
-- Fixes integration gap: orders stuck at not_ready when stock is already secured
-- Adds fulfilment team notification alongside existing procurement notification

-- 1. Drop and recreate complete_order_payment with allocate_secured_demand calls
drop function if exists public.complete_order_payment(text,text,numeric,text,text,text,jsonb);

create or replace function public.complete_order_payment(
  p_order_reference text,
  p_gateway_reference text,
  p_amount numeric,
  p_currency text default 'ZAR',
  p_provider text default 'ozow',
  p_payment_method text default 'Ozow',
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_event_key text;
  v_requirement_id uuid;
  v_link_id uuid;
  v_item record;
  v_allocated integer;
begin
  select * into v_order
  from public.orders
  where order_reference = p_order_reference
  for update;

  if not found then
    raise exception 'Order % was not found', p_order_reference using errcode = 'P0002';
  end if;
  if upper(coalesce(p_currency, '')) <> 'ZAR' then
    raise exception 'Unsupported payment currency %', p_currency using errcode = '22023';
  end if;
  if p_amount is null or abs(p_amount - coalesce(v_order.estimated_total, 0)) > 0.01 then
    raise exception 'Payment amount does not match the order total' using errcode = '22023';
  end if;

  v_event_key := coalesce(nullif(p_gateway_reference, ''), p_order_reference || ':complete');

  insert into public.payment_events (
    order_id, provider, payment_method, gateway_reference, event_key,
    status, amount, currency, payload, processed_at
  ) values (
    v_order.id, lower(p_provider), p_payment_method, p_gateway_reference, v_event_key,
    'Complete', p_amount, upper(p_currency), coalesce(p_payload, '{}'::jsonb), now()
  ) on conflict (provider, event_key) do nothing;

  if v_order.status = 'paid' then
    return jsonb_build_object('success', true, 'already_paid', true, 'order_id', v_order.id);
  end if;

  update public.orders
  set status = 'paid',
      paid_at = now(),
      payment_gateway = lower(p_provider),
      gateway_reference = p_gateway_reference,
      commercial_snapshot_locked_at = coalesce(commercial_snapshot_locked_at, now()),
      metadata = coalesce(metadata, '{}'::jsonb) || coalesce(p_payload, '{}'::jsonb)
  where id = v_order.id;

  insert into public.payments (
    order_reference, gateway_reference, amount, currency, payment_gateway, status, metadata
  ) values (
    p_order_reference, p_gateway_reference, p_amount, upper(p_currency), lower(p_provider), 'Complete', p_payload
  ) on conflict do nothing;

  for v_item in
    select oi.* from public.order_items oi where oi.order_id = v_order.id and oi.product_id is not null
  loop
    insert into public.procurement_requirements (season_id, product_id)
    values (coalesce(v_order.season_id, public.current_operational_season_id()), v_item.product_id)
    on conflict (season_id, product_id) do update set updated_at = now()
    returning id into v_requirement_id;

    insert into public.procurement_requirement_orders (
      requirement_id, order_id, order_item_id, required_quantity
    ) values (
      v_requirement_id, v_order.id, v_item.id, v_item.quantity
    ) on conflict (order_item_id) do nothing
    returning id into v_link_id;

    if v_link_id is not null then
      update public.procurement_requirements
      set required_quantity = required_quantity + v_item.quantity,
          status = case when secured_quantity >= required_quantity + v_item.quantity then 'secured'
                        when secured_quantity > 0 then 'partially_secured'
                        else 'open' end,
          updated_at = now()
      where id = v_requirement_id;

      -- Auto-allocate already-secured stock to this requirement
      v_allocated := public.allocate_secured_demand(v_requirement_id);
    end if;
    v_link_id := null;
  end loop;

  insert into public.packing_records(order_id, status)
  values (v_order.id, 'not_ready') on conflict (order_id) do nothing;

  insert into public.fulfilment_records(order_id, method, status)
  values (
    v_order.id,
    case
      when lower(coalesce(v_order.fulfilment_option, '')) like '%school%' then 'school_collection'
      when lower(coalesce(v_order.fulfilment_option, '')) like '%delivery%' then 'delivery'
      else 'collection_point'
    end,
    'pending'
  ) on conflict (order_id) do nothing;

  insert into public.operational_events(event_key, event_type, entity_type, entity_id, data)
  values (
    'order-paid:' || v_order.id,
    'order.paid', 'order', v_order.id::text,
    jsonb_build_object('order_reference', p_order_reference, 'amount', p_amount, 'payment_method', p_payment_method)
  ) on conflict (event_key) do nothing;

  insert into public.audit_logs(actor_id, actor_name, action, entity_type, entity_id, summary, details)
  values (
    null, 'Ozow Webhook Pipeline', 'payment.completed', 'order', v_order.id::text,
    'Verified payment confirmed for ' || p_order_reference,
    jsonb_build_object('amount', p_amount, 'currency', upper(p_currency), 'provider', lower(p_provider), 'payment_method', p_payment_method)
  );

  -- Notification to procurement team
  insert into public.notifications(permission_key, type, title, body, entity_type, entity_id)
  values (
    'procurement.view', 'order_paid', 'Paid order requires procurement',
    p_order_reference || ' has been paid and added to committed demand.', 'order', v_order.id::text
  );

  -- Notification to fulfilment team
  insert into public.notifications(permission_key, type, title, body, entity_type, entity_id)
  values (
    'fulfilment.view', 'order_paid', 'Paid order ready for fulfilment',
    p_order_reference || ' has been paid and is ready for packing and dispatch.', 'order', v_order.id::text
  );

  insert into public.operational_tasks(title, description, entity_type, entity_id, priority, created_by)
  values (
    'Secure products for ' || p_order_reference,
    'Review the committed demand generated by this verified paid order.',
    'order', v_order.id::text, 'high', null
  );

  return jsonb_build_object('success', true, 'already_paid', false, 'order_id', v_order.id);
end;
$$;

revoke all on function public.complete_order_payment(text,text,numeric,text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.complete_order_payment(text,text,numeric,text,text,text,jsonb) to service_role;
