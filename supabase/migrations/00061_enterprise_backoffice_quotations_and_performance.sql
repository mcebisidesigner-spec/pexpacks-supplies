-- ============================================================================
-- 00061: Enterprise Back-Office Quotations Architecture & Performance
-- ============================================================================
-- Purpose:
--   1. Atomic sequence & function for quotation numbers (PX-Q-YYYY-XXXX).
--   2. Atomic RPCs for quotation creation (create_quotation_with_items) and
--      canonical conversion (convert_quotation_to_order).
--   3. High-performance aggregated dashboard RPC (admin_quotations_dashboard).
--   4. Quotation lifecycle tracking (quotation_events, order_events, pack_events).
--   5. PDF status, versions, discounts, delivery fees, and VAT controls.
--   6. Full-text search GIN vectors and operational materialized views.
-- ============================================================================

-- 1. Sequence & Generator for Quotation Numbers -------------------------------

CREATE SEQUENCE IF NOT EXISTS public.quotation_number_seq START WITH 101;

CREATE OR REPLACE FUNCTION public.next_quotation_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_year text;
  v_next_val bigint;
BEGIN
  v_year := to_char(CURRENT_DATE, 'YYYY');
  v_next_val := nextval('public.quotation_number_seq');
  RETURN 'PX-Q-' || v_year || '-' || lpad(v_next_val::text, 4, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION public.next_quotation_number() TO authenticated, service_role;

-- 2. Enhance Quotations Table Schema ------------------------------------------

ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS discount_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_fee numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vat_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS pdf_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS pdf_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS pdf_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS converted_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Search vector maintenance trigger for quotations
CREATE OR REPLACE FUNCTION public.maintain_quotations_search_vector()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := setweight(to_tsvector('simple', COALESCE(NEW.quote_number, '')), 'A') ||
                       setweight(to_tsvector('simple', COALESCE(NEW.recipient_name, '')), 'B') ||
                       setweight(to_tsvector('simple', COALESCE(NEW.recipient_email, '')), 'B') ||
                       setweight(to_tsvector('simple', COALESCE(NEW.recipient_phone, '')), 'C') ||
                       setweight(to_tsvector('simple', COALESCE(NEW.notes, '')), 'D');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_quotations_search_vector ON public.quotations;
CREATE TRIGGER trg_quotations_search_vector
BEFORE INSERT OR UPDATE ON public.quotations
FOR EACH ROW EXECUTE FUNCTION public.maintain_quotations_search_vector();

-- Populate existing rows
UPDATE public.quotations
SET search_vector = setweight(to_tsvector('simple', COALESCE(quote_number, '')), 'A') ||
                    setweight(to_tsvector('simple', COALESCE(recipient_name, '')), 'B') ||
                    setweight(to_tsvector('simple', COALESCE(recipient_email, '')), 'B') ||
                    setweight(to_tsvector('simple', COALESCE(recipient_phone, '')), 'C') ||
                    setweight(to_tsvector('simple', COALESCE(notes, '')), 'D')
WHERE search_vector IS NULL;

CREATE INDEX IF NOT EXISTS idx_quotations_search_vector ON public.quotations USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_quotations_status_created ON public.quotations(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotations_school_id ON public.quotations(school_id);
CREATE INDEX IF NOT EXISTS idx_quotations_valid_until ON public.quotations(valid_until);

-- 3. Lifecycle Events Tables --------------------------------------------------

CREATE TABLE IF NOT EXISTS public.quotation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  actor_id uuid,
  actor_email text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.quotation_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_quotation_events_qid ON public.quotation_events(quotation_id, created_at DESC);
GRANT SELECT, INSERT ON public.quotation_events TO authenticated, service_role;

DROP POLICY IF EXISTS "quotation_events_read" ON public.quotation_events;
CREATE POLICY "quotation_events_read" ON public.quotation_events FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "quotation_events_insert" ON public.quotation_events;
CREATE POLICY "quotation_events_insert" ON public.quotation_events FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  actor_id uuid,
  actor_email text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_order_events_oid ON public.order_events(order_id, created_at DESC);
GRANT SELECT, INSERT ON public.order_events TO authenticated, service_role;

DROP POLICY IF EXISTS "order_events_read" ON public.order_events;
CREATE POLICY "order_events_read" ON public.order_events FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "order_events_insert" ON public.order_events;
CREATE POLICY "order_events_insert" ON public.order_events FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.pack_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id uuid NOT NULL REFERENCES public.school_packs(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  actor_id uuid,
  actor_email text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.pack_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_pack_events_pid ON public.pack_events(pack_id, created_at DESC);
GRANT SELECT, INSERT ON public.pack_events TO authenticated, service_role;

DROP POLICY IF EXISTS "pack_events_read" ON public.pack_events;
CREATE POLICY "pack_events_read" ON public.pack_events FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "pack_events_insert" ON public.pack_events;
CREATE POLICY "pack_events_insert" ON public.pack_events FOR INSERT TO authenticated WITH CHECK (true);

-- 4. Atomic RPC: Create Quotation With Items ----------------------------------

CREATE OR REPLACE FUNCTION public.create_quotation_with_items(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_quote_id uuid;
  v_quote_number text;
  v_school_id uuid;
  v_recipient_name text;
  v_recipient_email text;
  v_recipient_phone text;
  v_valid_until date;
  v_notes text;
  v_discount_amount numeric;
  v_delivery_fee numeric;
  v_vat_enabled boolean;
  v_vat_rate numeric;
  v_subtotal numeric := 0;
  v_vat_amount numeric := 0;
  v_total_amount numeric := 0;
  v_actor_id uuid;
  v_actor_email text;
  v_item jsonb;
  v_item_total numeric;
  v_result jsonb;
BEGIN
  v_quote_number := COALESCE(NULLIF(p_payload->>'quote_number', ''), public.next_quotation_number());
  v_school_id := NULLIF(p_payload->>'school_id', '')::uuid;
  v_recipient_name := TRIM(COALESCE(p_payload->>'recipient_name', ''));
  v_recipient_email := TRIM(COALESCE(p_payload->>'recipient_email', ''));
  v_recipient_phone := NULLIF(TRIM(COALESCE(p_payload->>'recipient_phone', '')), '');
  v_valid_until := COALESCE(NULLIF(p_payload->>'valid_until', '')::date, (CURRENT_DATE + interval '30 days')::date);
  v_notes := NULLIF(TRIM(COALESCE(p_payload->>'notes', '')), '');
  v_discount_amount := COALESCE((p_payload->>'discount_amount')::numeric, 0);
  v_delivery_fee := COALESCE((p_payload->>'delivery_fee')::numeric, 0);
  v_vat_enabled := COALESCE((p_payload->>'vat_enabled')::boolean, true);
  v_vat_rate := CASE WHEN v_vat_enabled THEN 0.15 ELSE 0 END;
  v_actor_id := NULLIF(p_payload->>'actor_id', '')::uuid;
  v_actor_email := NULLIF(p_payload->>'actor_email', '');

  IF v_recipient_name = '' THEN
    RAISE EXCEPTION 'Recipient name is required';
  END IF;
  IF v_recipient_email = '' THEN
    RAISE EXCEPTION 'Recipient email is required';
  END IF;
  IF jsonb_array_length(COALESCE(p_payload->'items', '[]'::jsonb)) = 0 THEN
    RAISE EXCEPTION 'At least one quotation line item is required';
  END IF;

  -- 1. Insert Quotation Header Placeholder
  INSERT INTO public.quotations (
    quote_number,
    school_id,
    recipient_name,
    recipient_email,
    recipient_phone,
    status,
    subtotal,
    vat_rate,
    vat_amount,
    total_amount,
    valid_until,
    notes,
    discount_amount,
    delivery_fee,
    vat_enabled,
    created_by,
    pdf_status
  ) VALUES (
    v_quote_number,
    v_school_id,
    v_recipient_name,
    v_recipient_email,
    v_recipient_phone,
    'draft',
    0,
    v_vat_rate,
    0,
    0,
    v_valid_until,
    v_notes,
    v_discount_amount,
    v_delivery_fee,
    v_vat_enabled,
    v_actor_id,
    'pending'
  )
  RETURNING id INTO v_quote_id;

  -- 2. Insert Items & Calculate Subtotal
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_payload->'items')
  LOOP
    IF TRIM(COALESCE(v_item->>'item_title', '')) <> '' THEN
      v_item_total := ROUND(COALESCE((v_item->>'quantity')::numeric, 1) * COALESCE((v_item->>'unit_price')::numeric, 0), 2);
      v_subtotal := v_subtotal + v_item_total;

      INSERT INTO public.quotation_items (
        quotation_id,
        master_product_id,
        item_title,
        sku,
        unit,
        quantity,
        unit_price,
        total_price
      ) VALUES (
        v_quote_id,
        NULLIF(v_item->>'master_product_id', '')::uuid,
        TRIM(v_item->>'item_title'),
        NULLIF(TRIM(COALESCE(v_item->>'sku', '')), ''),
        COALESCE(NULLIF(TRIM(v_item->>'unit'), ''), 'Each'),
        COALESCE((v_item->>'quantity')::integer, 1),
        COALESCE((v_item->>'unit_price')::numeric, 0),
        v_item_total
      );
    END IF;
  END LOOP;

  -- Apply discount & delivery
  v_subtotal := GREATEST(0, v_subtotal - v_discount_amount);
  v_vat_amount := CASE WHEN v_vat_enabled THEN ROUND(v_subtotal * v_vat_rate, 2) ELSE 0 END;
  v_total_amount := v_subtotal + v_vat_amount + v_delivery_fee;

  -- 3. Update Quotation Header with Exact Totals
  UPDATE public.quotations
  SET
    subtotal = v_subtotal,
    vat_amount = v_vat_amount,
    total_amount = v_total_amount,
    updated_at = timezone('utc'::text, now())
  WHERE id = v_quote_id;

  -- 4. Record Lifecycle Event
  INSERT INTO public.quotation_events (
    quotation_id,
    event_type,
    actor_id,
    actor_email,
    payload
  ) VALUES (
    v_quote_id,
    'created',
    v_actor_id,
    v_actor_email,
    jsonb_build_object(
      'quote_number', v_quote_number,
      'total_amount', v_total_amount,
      'items_count', jsonb_array_length(p_payload->'items')
    )
  );

  -- 5. Return Complete Created Record
  SELECT jsonb_build_object(
    'id', q.id,
    'quote_number', q.quote_number,
    'school_id', q.school_id,
    'recipient_name', q.recipient_name,
    'recipient_email', q.recipient_email,
    'recipient_phone', q.recipient_phone,
    'status', q.status,
    'subtotal', q.subtotal,
    'vat_rate', q.vat_rate,
    'vat_amount', q.vat_amount,
    'discount_amount', q.discount_amount,
    'delivery_fee', q.delivery_fee,
    'vat_enabled', q.vat_enabled,
    'total_amount', q.total_amount,
    'valid_until', q.valid_until,
    'notes', q.notes,
    'pdf_status', q.pdf_status,
    'pdf_version', q.pdf_version,
    'created_at', q.created_at
  ) INTO v_result
  FROM public.quotations q
  WHERE q.id = v_quote_id;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_quotation_with_items(jsonb) TO authenticated, service_role;

-- 5. Atomic RPC: Convert Quotation to Canonical Order ------------------------

CREATE OR REPLACE FUNCTION public.convert_quotation_to_order(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_quotation_id uuid;
  v_actor_id uuid;
  v_actor_email text;
  v_quote record;
  v_school record;
  v_order_id uuid;
  v_order_reference text;
  v_items jsonb := '[]'::jsonb;
  v_item record;
  v_result jsonb;
BEGIN
  v_quotation_id := (p_payload->>'quotation_id')::uuid;
  v_actor_id := NULLIF(p_payload->>'actor_id', '')::uuid;
  v_actor_email := NULLIF(p_payload->>'actor_email', '');

  SELECT * INTO v_quote FROM public.quotations WHERE id = v_quotation_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quotation not found';
  END IF;

  IF v_quote.status = 'converted_to_order' AND v_quote.converted_order_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'ok', true,
      'order_id', v_quote.converted_order_id,
      'already_converted', true
    );
  END IF;

  IF v_quote.school_id IS NOT NULL THEN
    SELECT name, slug INTO v_school FROM public.schools WHERE id = v_quote.school_id;
  END IF;

  -- Generate order reference
  v_order_reference := 'ORD-' || to_char(CURRENT_DATE, 'YYMM') || '-' || lpad((floor(random() * 9000) + 1000)::text, 4, '0');

  -- Aggregate order items as jsonb pack entry
  FOR v_item IN SELECT * FROM public.quotation_items WHERE quotation_id = v_quotation_id
  LOOP
    v_items := v_items || jsonb_build_object(
      'product_id', v_item.master_product_id,
      'name', v_item.item_title,
      'sku', v_item.sku,
      'unit', v_item.unit,
      'quantity', v_item.quantity,
      'unit_price', v_item.unit_price,
      'line_total', v_item.total_price
    );
  END LOOP;

  -- Insert Canonical Order
  INSERT INTO public.orders (
    order_reference,
    buyer_name,
    buyer_email,
    buyer_phone,
    school_id,
    school_name,
    school_slug,
    grade,
    learner_name,
    pack_type,
    items,
    estimated_total,
    status,
    payment_gateway,
    gateway_reference,
    fulfilment_option,
    delivery_type,
    notes,
    metadata
  ) VALUES (
    v_order_reference,
    v_quote.recipient_name,
    v_quote.recipient_email,
    COALESCE(v_quote.recipient_phone, '—'),
    v_quote.school_id,
    COALESCE(v_school.name, 'General Order'),
    v_school.slug,
    'Quotation Conversion',
    v_quote.recipient_name,
    'custom_quotation',
    jsonb_build_array(jsonb_build_object(
      'pack_name', 'Quotation ' || v_quote.quote_number,
      'total_price', v_quote.total_amount,
      'items', v_items
    )),
    v_quote.total_amount,
    'pending_payment',
    'manual',
    v_quote.quote_number,
    'courier',
    'Direct Delivery / Invoice',
    'Converted from Quotation ' || v_quote.quote_number || COALESCE(E'\n' || v_quote.notes, ''),
    jsonb_build_object(
      'source', 'quotation_conversion',
      'quotation_id', v_quotation_id,
      'quote_number', v_quote.quote_number,
      'converted_by', v_actor_email
    )
  )
  RETURNING id INTO v_order_id;

  -- Insert into order_items for granular line item reporting
  FOR v_item IN SELECT * FROM public.quotation_items WHERE quotation_id = v_quotation_id
  LOOP
    INSERT INTO public.order_items (
      order_id,
      product_id,
      item_name,
      quantity,
      unit_price,
      total_price
    ) VALUES (
      v_order_id,
      v_item.master_product_id,
      v_item.item_title,
      v_item.quantity,
      v_item.unit_price,
      v_item.total_price
    );
  END LOOP;

  -- Update quotation status
  UPDATE public.quotations
  SET
    status = 'converted_to_order',
    converted_order_id = v_order_id,
    updated_at = timezone('utc'::text, now())
  WHERE id = v_quotation_id;

  -- Log events
  INSERT INTO public.quotation_events (quotation_id, event_type, actor_id, actor_email, payload)
  VALUES (
    v_quotation_id,
    'converted_to_order',
    v_actor_id,
    v_actor_email,
    jsonb_build_object('order_id', v_order_id, 'order_reference', v_order_reference)
  );

  INSERT INTO public.order_events (order_id, event_type, actor_id, actor_email, payload)
  VALUES (
    v_order_id,
    'created_from_quotation',
    v_actor_id,
    v_actor_email,
    jsonb_build_object('quotation_id', v_quotation_id, 'quote_number', v_quote.quote_number)
  );

  RETURN jsonb_build_object(
    'ok', true,
    'order_id', v_order_id,
    'order_reference', v_order_reference,
    'quote_number', v_quote.quote_number
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.convert_quotation_to_order(jsonb) TO authenticated, service_role;

-- 6. Dashboard Aggregation RPC: admin_quotations_dashboard ---------------------

CREATE OR REPLACE FUNCTION public.admin_quotations_dashboard(
  p_search text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats jsonb;
  v_quotations jsonb;
  v_total_count bigint;
BEGIN
  -- 1. Compute aggregated statistics across all quotations
  SELECT jsonb_build_object(
    'total', count(*)::integer,
    'draft', count(*) FILTER (WHERE status = 'draft')::integer,
    'sent', count(*) FILTER (WHERE status = 'sent' OR status = 'viewed')::integer,
    'accepted', count(*) FILTER (WHERE status = 'accepted')::integer,
    'declined', count(*) FILTER (WHERE status = 'declined')::integer,
    'converted', count(*) FILTER (WHERE status = 'converted_to_order')::integer,
    'expired', count(*) FILTER (WHERE status = 'expired' OR (status = 'sent' AND valid_until < CURRENT_DATE))::integer,
    'total_pipeline_value', COALESCE(sum(total_amount), 0)::numeric(12,2),
    'accepted_value', COALESCE(sum(total_amount) FILTER (WHERE status = 'accepted' OR status = 'converted_to_order'), 0)::numeric(12,2),
    'conversion_rate', CASE WHEN count(*) > 0 THEN ROUND((count(*) FILTER (WHERE status = 'converted_to_order')::numeric / count(*)::numeric) * 100, 1) ELSE 0 END
  ) INTO v_stats
  FROM public.quotations;

  -- 2. Count matching filtered rows
  SELECT count(*) INTO v_total_count
  FROM public.quotations q
  LEFT JOIN public.schools s ON s.id = q.school_id
  WHERE
    (p_status IS NULL OR p_status = 'all' OR q.status = p_status)
    AND (
      p_search IS NULL OR p_search = '' OR
      q.quote_number ILIKE '%' || p_search || '%' OR
      q.recipient_name ILIKE '%' || p_search || '%' OR
      q.recipient_email ILIKE '%' || p_search || '%' OR
      s.name ILIKE '%' || p_search || '%'
    );

  -- 3. Fetch paginated filtered rows with school and item counts
  SELECT COALESCE(jsonb_agg(row_data), '[]'::jsonb) INTO v_quotations
  FROM (
    SELECT jsonb_build_object(
      'id', q.id,
      'quote_number', q.quote_number,
      'school_id', q.school_id,
      'recipient_name', q.recipient_name,
      'recipient_email', q.recipient_email,
      'recipient_phone', q.recipient_phone,
      'status', q.status,
      'subtotal', q.subtotal,
      'vat_rate', q.vat_rate,
      'vat_amount', q.vat_amount,
      'discount_amount', q.discount_amount,
      'delivery_fee', q.delivery_fee,
      'vat_enabled', q.vat_enabled,
      'total_amount', q.total_amount,
      'valid_until', q.valid_until,
      'notes', q.notes,
      'pdf_status', q.pdf_status,
      'pdf_version', q.pdf_version,
      'pdf_storage_path', q.pdf_storage_path,
      'converted_order_id', q.converted_order_id,
      'created_at', q.created_at,
      'updated_at', q.updated_at,
      'items_count', (SELECT count(*)::integer FROM public.quotation_items WHERE quotation_id = q.id),
      'school', CASE WHEN s.id IS NOT NULL THEN jsonb_build_object(
        'id', s.id,
        'name', s.name,
        'slug', s.slug,
        'city', s.city,
        'province', s.province
      ) ELSE NULL END
    ) AS row_data
    FROM public.quotations q
    LEFT JOIN public.schools s ON s.id = q.school_id
    WHERE
      (p_status IS NULL OR p_status = 'all' OR q.status = p_status)
      AND (
        p_search IS NULL OR p_search = '' OR
        q.quote_number ILIKE '%' || p_search || '%' OR
        q.recipient_name ILIKE '%' || p_search || '%' OR
        q.recipient_email ILIKE '%' || p_search || '%' OR
        s.name ILIKE '%' || p_search || '%'
      )
    ORDER BY q.created_at DESC
    LIMIT p_limit OFFSET p_offset
  ) sub;

  RETURN jsonb_build_object(
    'stats', v_stats,
    'total_count', v_total_count,
    'quotations', v_quotations
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_quotations_dashboard(text, text, integer, integer) TO authenticated, service_role;

-- 7. Auto Expiry Routine ------------------------------------------------------

CREATE OR REPLACE FUNCTION public.auto_expire_quotations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_count integer;
BEGIN
  UPDATE public.quotations
  SET status = 'expired', updated_at = timezone('utc'::text, now())
  WHERE status IN ('draft', 'sent', 'viewed')
    AND valid_until < CURRENT_DATE;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.auto_expire_quotations() TO authenticated, service_role;

-- 8. Operational Materialized Views -------------------------------------------

CREATE MATERIALIZED VIEW IF NOT EXISTS public.admin_quote_pipeline_mv AS
SELECT
  date_trunc('month', created_at) AS month,
  status,
  count(*) AS quotes_count,
  COALESCE(sum(total_amount), 0)::numeric(12,2) AS total_value,
  COALESCE(avg(total_amount), 0)::numeric(12,2) AS avg_value
FROM public.quotations
GROUP BY date_trunc('month', created_at), status
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_quote_pipeline_month_status ON public.admin_quote_pipeline_mv(month, status);
GRANT SELECT ON public.admin_quote_pipeline_mv TO authenticated, service_role;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.admin_product_margin_mv AS
SELECT
  mp.id,
  mp.sku,
  mp.name,
  mp.category,
  mp.brand,
  mp.current_selling_price AS selling_price,
  COALESCE(
    (SELECT purchase_cost FROM public.master_product_suppliers WHERE master_product_id = mp.id ORDER BY is_primary DESC, last_supplied_at DESC NULLS LAST LIMIT 1),
    0
  )::numeric(10,2) AS estimated_cost,
  CASE
    WHEN mp.current_selling_price > 0 THEN
      ROUND(
        ((mp.current_selling_price - COALESCE(
          (SELECT purchase_cost FROM public.master_product_suppliers WHERE master_product_id = mp.id ORDER BY is_primary DESC, last_supplied_at DESC NULLS LAST LIMIT 1),
          0
        )) / mp.current_selling_price) * 100,
        1
      )
    ELSE 0
  END AS gross_margin_percent
FROM public.master_products mp
WHERE mp.active = true
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_margin_mv_id ON public.admin_product_margin_mv(id);
GRANT SELECT ON public.admin_product_margin_mv TO authenticated, service_role;
