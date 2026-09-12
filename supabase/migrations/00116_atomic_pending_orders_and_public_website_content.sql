-- Keep pre-payment orders and their immutable item snapshots consistent.
-- Public website content is returned through an allowlisted read model.

CREATE OR REPLACE FUNCTION public.create_pending_order_with_snapshots(
  p_order jsonb,
  p_snapshots jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_order_reference text;
  v_unique_customer_id text;
  v_tracking_token text;
BEGIN
  IF jsonb_typeof(p_order) <> 'object' THEN
    RAISE EXCEPTION 'Order payload must be an object' USING errcode = '22023';
  END IF;
  IF jsonb_typeof(p_snapshots) <> 'array' THEN
    RAISE EXCEPTION 'Order snapshots must be an array' USING errcode = '22023';
  END IF;

  INSERT INTO public.orders (
    id, order_reference, unique_customer_id, tracking_token,
    buyer_name, buyer_phone, buyer_email, learner_name,
    school_slug, school_name, grade, pack_type, items,
    estimated_total, fulfilment_option, metadata,
    payment_gateway, idempotency_key, consent, pexcover_requested, status
  ) VALUES (
    (p_order ->> 'id')::uuid,
    p_order ->> 'order_reference',
    p_order ->> 'unique_customer_id',
    p_order ->> 'tracking_token',
    p_order ->> 'buyer_name',
    p_order ->> 'buyer_phone',
    NULLIF(p_order ->> 'buyer_email', ''),
    NULLIF(p_order ->> 'learner_name', ''),
    p_order ->> 'school_slug',
    p_order ->> 'school_name',
    p_order ->> 'grade',
    p_order ->> 'pack_type',
    COALESCE(p_order -> 'items', '[]'::jsonb),
    (p_order ->> 'estimated_total')::numeric,
    p_order ->> 'fulfilment_option',
    COALESCE(p_order -> 'metadata', '{}'::jsonb),
    NULLIF(p_order ->> 'payment_gateway', ''),
    NULLIF(p_order ->> 'idempotency_key', ''),
    COALESCE((p_order ->> 'consent')::boolean, true),
    COALESCE((p_order ->> 'pexcover_requested')::boolean, false),
    'pending_payment'
  )
  RETURNING id, order_reference, unique_customer_id, tracking_token
  INTO v_order_id, v_order_reference, v_unique_customer_id, v_tracking_token;

  INSERT INTO public.order_items (
    order_id, product_id, pack_id, sku_snapshot, product_name_snapshot,
    quantity, unit_selling_price, estimated_unit_cost, expected_margin,
    pricing_version, school_name_snapshot, grade_snapshot, requires_pexcover
  )
  SELECT
    v_order_id,
    NULLIF(row.product_id, '')::uuid,
    NULLIF(row.pack_id, '')::uuid,
    row.sku_snapshot,
    row.product_name_snapshot,
    row.quantity,
    row.unit_selling_price,
    row.estimated_unit_cost,
    row.expected_margin,
    row.pricing_version,
    row.school_name_snapshot,
    row.grade_snapshot,
    COALESCE(row.requires_pexcover, false)
  FROM jsonb_to_recordset(p_snapshots) AS row(
    product_id text,
    pack_id text,
    sku_snapshot text,
    product_name_snapshot text,
    quantity integer,
    unit_selling_price numeric,
    estimated_unit_cost numeric,
    expected_margin numeric,
    pricing_version text,
    school_name_snapshot text,
    grade_snapshot text,
    requires_pexcover boolean
  );

  RETURN jsonb_build_object(
    'id', v_order_id,
    'order_reference', v_order_reference,
    'unique_customer_id', v_unique_customer_id,
    'tracking_token', v_tracking_token
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_pending_order_with_snapshots(jsonb, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_pending_order_with_snapshots(jsonb, jsonb)
  TO service_role;

CREATE OR REPLACE FUNCTION public.get_public_website_content()
RETURNS TABLE (key text, value jsonb)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT content.key, content.value
  FROM public.website_content AS content
  WHERE content.key = ANY (ARRAY[
    'homepage.hero',
    'homepage.announcement',
    'company_info',
    'footer',
    'seo_defaults',
    'schools.hero',
    'track-order.hero',
    'add-your-school.hero',
    'faq.hero',
    'partnership.hero'
  ]);
$$;

REVOKE ALL ON FUNCTION public.get_public_website_content()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_website_content()
  TO service_role;