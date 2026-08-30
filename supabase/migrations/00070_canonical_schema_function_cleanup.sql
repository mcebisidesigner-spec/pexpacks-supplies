-- Migration 00070: Canonical schema function cleanup
-- Fix functions left referencing archived/deleted legacy objects and generated columns.

DROP FUNCTION IF EXISTS public.reconcile_legacy_to_canonical();

CREATE OR REPLACE FUNCTION public.refresh_all_dashboard_summaries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
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
BEGIN
  SELECT count(*),
         count(*) FILTER (WHERE status = 'paid'),
         count(*) FILTER (WHERE status IN ('pending_payment', 'pending', 'layby_active')),
         coalesce(sum(estimated_total) FILTER (WHERE status = 'paid'), 0.00)
  INTO v_total_orders, v_paid_orders, v_pending_orders, v_total_revenue
  FROM public.orders;

  SELECT count(*) INTO v_total_schools FROM public.schools;
  SELECT count(*) INTO v_total_packs FROM public.school_packs;

  SELECT count(*) INTO v_active_packs
  FROM public.school_packs
  WHERE visible = true
    AND coalesce(publication_status, 'published') = 'published';

  SELECT count(*) INTO v_orders_today
  FROM public.orders
  WHERE created_at >= date_trunc('day', now());

  SELECT count(*) INTO v_orders_this_week
  FROM public.orders
  WHERE created_at >= date_trunc('week', now());

  SELECT count(*) INTO v_awaiting_fulfilment
  FROM public.orders
  WHERE status IN ('paid', 'packing');

  SELECT count(*) INTO v_completed_orders
  FROM public.orders
  WHERE status = 'delivered';

  INSERT INTO public.dashboard_summaries (
    id,
    total_orders, paid_orders, pending_orders, total_revenue,
    total_schools, total_packs,
    orders_today, orders_this_week, awaiting_fulfilment, completed_orders, active_packs,
    last_updated_at
  )
  VALUES (
    'global',
    v_total_orders, v_paid_orders, v_pending_orders, v_total_revenue,
    v_total_schools, v_total_packs,
    v_orders_today, v_orders_this_week, v_awaiting_fulfilment, v_completed_orders, v_active_packs,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
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
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_pack_for_publication(p_pack_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pack record;
  v_school record;
  v_season record;
  v_item_count integer := 0;
  v_invalid_price_count integer := 0;
  v_reasons text[] := ARRAY[]::text[];
BEGIN
  SELECT * INTO v_pack FROM public.school_packs WHERE id = p_pack_id;
  IF v_pack IS NULL THEN
    RETURN jsonb_build_object(
      'is_ready', false,
      'reasons', ARRAY['School pack record does not exist.']
    );
  END IF;

  IF v_pack.school_id IS NOT NULL THEN
    SELECT * INTO v_school FROM public.schools WHERE id = v_pack.school_id;
    IF v_school IS NULL THEN
      v_reasons := array_append(v_reasons, 'Referenced school not found.');
    ELSIF v_school.publication_status NOT IN ('published', 'ready_for_review') THEN
      v_reasons := array_append(v_reasons, 'Associated school is not currently published or ready for review.');
    END IF;
  END IF;

  IF v_pack.season_id IS NOT NULL THEN
    SELECT * INTO v_season FROM public.seasons WHERE id = v_pack.season_id;
    IF v_season IS NULL THEN
      v_reasons := array_append(v_reasons, 'Referenced commercial season does not exist.');
    ELSIF v_season.status = 'archived' OR v_season.status = 'closed' THEN
      v_reasons := array_append(v_reasons, 'Cannot publish a pack into an archived or closed commercial season.');
    END IF;
  END IF;

  SELECT
    count(*),
    count(*) FILTER (
      WHERE coalesce(spi.selling_price_override, mp.current_selling_price, mp.calculated_selling_price, 0) < 0
    )
  INTO v_item_count, v_invalid_price_count
  FROM public.school_pack_items spi
  LEFT JOIN public.master_products mp ON mp.id = spi.product_id
  WHERE spi.pack_id = p_pack_id
    AND spi.active = true;

  IF v_item_count = 0 THEN
    SELECT count(*) INTO v_item_count FROM public.public_pack_items_view WHERE pack_id = p_pack_id;
  END IF;

  IF v_item_count = 0 THEN
    v_reasons := array_append(v_reasons, 'Pack must contain at least 1 stationery item before publishing.');
  END IF;

  IF v_invalid_price_count > 0 THEN
    v_reasons := array_append(v_reasons, v_invalid_price_count || ' item(s) carry invalid negative unit pricing.');
  END IF;

  IF v_pack.price < 0 THEN
    v_reasons := array_append(v_reasons, 'Pack total price cannot be negative.');
  END IF;

  RETURN jsonb_build_object(
    'is_ready', (coalesce(array_length(v_reasons, 1), 0) = 0),
    'reasons', v_reasons,
    'pack_id', p_pack_id,
    'item_count', v_item_count,
    'price', v_pack.price
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.convert_quotation_to_order(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quotation_id uuid;
  v_actor_id uuid;
  v_actor_email text;
  v_quote record;
  v_school_name text;
  v_school_slug text;
  v_order_id uuid;
  v_order_reference text;
  v_items jsonb := '[]'::jsonb;
  v_item record;
BEGIN
  v_quotation_id := (p_payload->>'quotation_id')::uuid;
  v_actor_id := NULLIF(p_payload->>'actor_id', '')::uuid;
  v_actor_email := NULLIF(p_payload->>'actor_email', '');

  SELECT * INTO v_quote FROM public.quotations WHERE id = v_quotation_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quotation not found';
  END IF;

  IF v_quote.status = 'converted_to_order' AND v_quote.converted_order_id IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'order_id', v_quote.converted_order_id, 'already_converted', true);
  END IF;

  SELECT name, slug INTO v_school_name, v_school_slug FROM public.schools WHERE id = v_quote.school_id;
  v_order_reference := 'ORD-' || to_char(CURRENT_DATE, 'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  FOR v_item IN
    SELECT qi.*, mp.description AS product_description
    FROM public.quotation_items qi
    LEFT JOIN public.master_products mp ON mp.id = qi.master_product_id
    WHERE qi.quotation_id = v_quotation_id
    ORDER BY qi.sort_order, qi.created_at
  LOOP
    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'product_id', v_item.master_product_id,
      'name', v_item.item_title,
      'sku', v_item.sku,
      'unit', v_item.unit,
      'quantity', v_item.quantity,
      'unit_price', v_item.unit_price,
      'line_total', v_item.total_price
    ));
  END LOOP;

  INSERT INTO public.orders (
    order_reference, buyer_name, buyer_email, buyer_phone, school_name, school_slug,
    grade, learner_name, pack_type, items, estimated_total, status, payment_gateway,
    gateway_reference, fulfilment_option, delivery_type, consent, metadata
  ) VALUES (
    v_order_reference,
    v_quote.recipient_name,
    v_quote.recipient_email,
    COALESCE(v_quote.recipient_phone, ''),
    COALESCE(v_school_name, 'General Order'),
    v_school_slug,
    'Quotation Conversion',
    v_quote.recipient_name,
    'custom_quotation',
    jsonb_build_array(jsonb_build_object('pack_name', 'Quotation ' || v_quote.quote_number, 'total_price', v_quote.total_amount, 'items', v_items)),
    v_quote.total_amount,
    'pending_payment',
    'manual',
    v_quote.quote_number,
    'courier',
    'Direct Delivery / Invoice',
    true,
    jsonb_build_object(
      'source', 'quotation_conversion',
      'quotation_id', v_quotation_id,
      'quote_number', v_quote.quote_number,
      'school_id', v_quote.school_id,
      'notes', v_quote.notes,
      'discount_amount', v_quote.discount_amount,
      'delivery_fee', v_quote.delivery_fee,
      'vat_amount', v_quote.vat_amount,
      'converted_by', v_actor_email
    )
  ) RETURNING id INTO v_order_id;

  FOR v_item IN
    SELECT qi.*, mp.description AS product_description
    FROM public.quotation_items qi
    LEFT JOIN public.master_products mp ON mp.id = qi.master_product_id
    WHERE qi.quotation_id = v_quotation_id
    ORDER BY qi.sort_order, qi.created_at
  LOOP
    INSERT INTO public.order_items (
      order_id, product_id, pack_id, sku_snapshot, product_name_snapshot,
      description_snapshot, quantity, unit_selling_price,
      estimated_unit_cost, expected_margin, school_name_snapshot, grade_snapshot
    ) VALUES (
      v_order_id,
      v_item.master_product_id,
      NULL,
      COALESCE(NULLIF(v_item.sku, ''), v_quote.quote_number),
      v_item.item_title,
      COALESCE(v_item.product_description, v_item.unit),
      v_item.quantity,
      v_item.unit_price,
      v_item.cost_price,
      v_item.margin_amount,
      COALESCE(v_school_name, 'General Order'),
      'Quotation Conversion'
    );
  END LOOP;

  UPDATE public.quotations
  SET status = 'converted_to_order', converted_order_id = v_order_id, updated_at = timezone('utc'::text, now())
  WHERE id = v_quotation_id;

  INSERT INTO public.quotation_events (quotation_id, event_type, actor_id, actor_email, payload)
  VALUES (v_quotation_id, 'converted_to_order', v_actor_id, v_actor_email, jsonb_build_object('order_id', v_order_id, 'order_reference', v_order_reference));

  INSERT INTO public.order_events (order_id, event_type, actor_id, actor_email, payload)
  VALUES (v_order_id, 'created_from_quotation', v_actor_id, v_actor_email, jsonb_build_object('quotation_id', v_quotation_id, 'quote_number', v_quote.quote_number));

  RETURN jsonb_build_object('ok', true, 'order_id', v_order_id, 'order_reference', v_order_reference, 'quote_number', v_quote.quote_number);
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_all_dashboard_summaries() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.validate_pack_for_publication(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.convert_quotation_to_order(jsonb) TO authenticated, service_role;

SELECT public.refresh_all_dashboard_summaries();