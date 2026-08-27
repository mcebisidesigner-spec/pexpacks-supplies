
-- ============================================================================
-- 00061: Enterprise Back-Office Quotations Architecture & Performance
-- ============================================================================
-- Purpose:
--   1. Transaction-safe quotation numbers.
--   2. Atomic quotation creation and canonical quote-to-order conversion RPCs.
--   3. DB-side lifecycle events, PDF lifecycle fields, and quote expiry routine.
--   4. Full-text search vectors and one-payload admin dashboard RPCs.
--   5. Operational materialized summaries for back-office reporting.
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS public.quotation_number_seq START WITH 101;

CREATE OR REPLACE FUNCTION public.next_quotation_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year text := to_char(CURRENT_DATE, 'YYYY');
  v_next_val bigint;
BEGIN
  v_next_val := nextval('public.quotation_number_seq');
  RETURN 'PX-Q-' || v_year || '-' || lpad(v_next_val::text, 4, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION public.next_quotation_number() TO authenticated, service_role;

ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS discount_amount numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_fee numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vat_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS pdf_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS pdf_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS pdf_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS converted_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

ALTER TABLE public.quotation_items
  ADD COLUMN IF NOT EXISTS cost_price numeric(12,2),
  ADD COLUMN IF NOT EXISTS margin_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS margin_percent numeric(7,2),
  ADD COLUMN IF NOT EXISTS supplier_snapshot text,
  ADD COLUMN IF NOT EXISTS availability_snapshot text,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

ALTER TABLE public.quotations DROP CONSTRAINT IF EXISTS quotations_status_check;
ALTER TABLE public.quotations DROP CONSTRAINT IF EXISTS chk_quotations_status_valid;
ALTER TABLE public.quotations ADD CONSTRAINT chk_quotations_status_valid
  CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired', 'converted_to_order'));

ALTER TABLE public.quotations DROP CONSTRAINT IF EXISTS chk_quotations_pdf_status_valid;
ALTER TABLE public.quotations ADD CONSTRAINT chk_quotations_pdf_status_valid
  CHECK (pdf_status IN ('pending', 'generated', 'failed'));

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE public.master_products ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE public.school_packs ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION public.maintain_quotations_search_vector()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.quote_number, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.recipient_name, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.recipient_email, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.recipient_phone, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(NEW.notes, '')), 'D');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.maintain_orders_search_vector()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.order_reference, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.buyer_name, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.buyer_email, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.buyer_phone, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.school_name, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(NEW.grade, '')), 'C');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.maintain_master_products_search_vector()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.sku, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.brand, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.category, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.maintain_school_packs_search_vector()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.slug, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(NEW.academic_year, '')), 'C');
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_quotations_search_vector ON public.quotations;
CREATE TRIGGER trg_quotations_search_vector
BEFORE INSERT OR UPDATE ON public.quotations
FOR EACH ROW EXECUTE FUNCTION public.maintain_quotations_search_vector();

DROP TRIGGER IF EXISTS trg_orders_search_vector ON public.orders;
CREATE TRIGGER trg_orders_search_vector
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.maintain_orders_search_vector();

DROP TRIGGER IF EXISTS trg_master_products_search_vector ON public.master_products;
CREATE TRIGGER trg_master_products_search_vector
BEFORE INSERT OR UPDATE ON public.master_products
FOR EACH ROW EXECUTE FUNCTION public.maintain_master_products_search_vector();

DROP TRIGGER IF EXISTS trg_school_packs_search_vector ON public.school_packs;
CREATE TRIGGER trg_school_packs_search_vector
BEFORE INSERT OR UPDATE ON public.school_packs
FOR EACH ROW EXECUTE FUNCTION public.maintain_school_packs_search_vector();

UPDATE public.quotations
SET search_vector =
  setweight(to_tsvector('simple', COALESCE(quote_number, '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE(recipient_name, '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE(recipient_email, '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE(recipient_phone, '')), 'C') ||
  setweight(to_tsvector('simple', COALESCE(notes, '')), 'D');

UPDATE public.orders
SET search_vector =
  setweight(to_tsvector('simple', COALESCE(order_reference, '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE(buyer_name, '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE(buyer_email, '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE(buyer_phone, '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE(school_name, '')), 'C') ||
  setweight(to_tsvector('simple', COALESCE(grade, '')), 'C');

UPDATE public.master_products
SET search_vector =
  setweight(to_tsvector('simple', COALESCE(sku, '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE(brand, '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE(category, '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE(description, '')), 'C');

UPDATE public.school_packs
SET search_vector =
  setweight(to_tsvector('simple', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE(slug, '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE(description, '')), 'C') ||
  setweight(to_tsvector('simple', COALESCE(academic_year, '')), 'C');

CREATE INDEX IF NOT EXISTS idx_quotations_search_vector ON public.quotations USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_orders_search_vector ON public.orders USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_master_products_search_vector ON public.master_products USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_school_packs_search_vector ON public.school_packs USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_quotations_status_created ON public.quotations(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotations_school_id ON public.quotations(school_id);
CREATE INDEX IF NOT EXISTS idx_quotations_valid_until ON public.quotations(valid_until);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_school_packs_school_visible ON public.school_packs(school_id, visible, sort_order);

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

CREATE OR REPLACE FUNCTION public.maintain_quotation_item_totals()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.quantity := GREATEST(COALESCE(NEW.quantity, 1), 1);
  NEW.unit_price := COALESCE(NEW.unit_price, 0);
  NEW.total_price := ROUND(NEW.quantity::numeric * NEW.unit_price, 2);
  IF NEW.cost_price IS NOT NULL THEN
    NEW.margin_amount := ROUND(NEW.total_price - (NEW.quantity::numeric * NEW.cost_price), 2);
    NEW.margin_percent := CASE WHEN NEW.total_price > 0 THEN ROUND((NEW.margin_amount / NEW.total_price) * 100, 2) ELSE 0 END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_quotation_item_totals ON public.quotation_items;
CREATE TRIGGER trg_quotation_item_totals
BEFORE INSERT OR UPDATE ON public.quotation_items
FOR EACH ROW EXECUTE FUNCTION public.maintain_quotation_item_totals();

CREATE OR REPLACE FUNCTION public.recalculate_quotation_totals(p_quotation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_raw_subtotal numeric(12,2);
  v_discount numeric(12,2);
  v_delivery numeric(12,2);
  v_vat_enabled boolean;
  v_vat_rate numeric(5,2);
  v_taxable_subtotal numeric(12,2);
  v_vat_amount numeric(12,2);
BEGIN
  SELECT COALESCE(SUM(total_price), 0)::numeric(12,2) INTO v_raw_subtotal
  FROM public.quotation_items
  WHERE quotation_id = p_quotation_id;

  SELECT discount_amount, delivery_fee, vat_enabled, vat_rate
  INTO v_discount, v_delivery, v_vat_enabled, v_vat_rate
  FROM public.quotations
  WHERE id = p_quotation_id;

  v_taxable_subtotal := GREATEST(0, COALESCE(v_raw_subtotal, 0) - COALESCE(v_discount, 0));
  v_vat_amount := CASE WHEN COALESCE(v_vat_enabled, true) THEN ROUND(v_taxable_subtotal * (COALESCE(v_vat_rate, 15) / 100), 2) ELSE 0 END;

  UPDATE public.quotations
  SET subtotal = v_taxable_subtotal,
      vat_amount = v_vat_amount,
      total_amount = v_taxable_subtotal + v_vat_amount + COALESCE(v_delivery, 0),
      updated_at = timezone('utc'::text, now())
  WHERE id = p_quotation_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.recalculate_quotation_totals_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_quotation_totals(OLD.quotation_id);
    RETURN OLD;
  END IF;
  PERFORM public.recalculate_quotation_totals(NEW.quotation_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_recalculate_quotation_totals ON public.quotation_items;
CREATE TRIGGER trg_recalculate_quotation_totals
AFTER INSERT OR UPDATE OR DELETE ON public.quotation_items
FOR EACH ROW EXECUTE FUNCTION public.recalculate_quotation_totals_trigger();
CREATE OR REPLACE FUNCTION public.create_quotation_with_items(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quote_id uuid;
  v_quote_number text;
  v_school_id uuid;
  v_recipient_name text;
  v_recipient_email text;
  v_recipient_phone text;
  v_status text;
  v_valid_until date;
  v_notes text;
  v_discount_amount numeric(12,2);
  v_delivery_fee numeric(12,2);
  v_vat_enabled boolean;
  v_vat_rate numeric(5,2);
  v_actor_id uuid;
  v_actor_email text;
  v_item jsonb;
  v_product_id uuid;
  v_product_sku text;
  v_product_name text;
  v_product_unit text;
  v_product_price numeric(12,2);
  v_product_cost numeric(12,2);
  v_product_availability text;
  v_product_supplier text;
  v_inserted_items integer := 0;
  v_result jsonb;
BEGIN
  v_quote_number := COALESCE(NULLIF(p_payload->>'quote_number', ''), public.next_quotation_number());
  v_school_id := NULLIF(p_payload->>'school_id', '')::uuid;
  v_recipient_name := TRIM(COALESCE(p_payload->>'recipient_name', ''));
  v_recipient_email := TRIM(COALESCE(p_payload->>'recipient_email', ''));
  v_recipient_phone := NULLIF(TRIM(COALESCE(p_payload->>'recipient_phone', '')), '');
  v_status := COALESCE(NULLIF(p_payload->>'status', ''), 'draft');
  v_valid_until := COALESCE(NULLIF(p_payload->>'valid_until', '')::date, (CURRENT_DATE + interval '30 days')::date);
  v_notes := NULLIF(TRIM(COALESCE(p_payload->>'notes', '')), '');
  v_discount_amount := GREATEST(COALESCE(NULLIF(p_payload->>'discount_amount', '')::numeric, 0), 0);
  v_delivery_fee := GREATEST(COALESCE(NULLIF(p_payload->>'delivery_fee', '')::numeric, 0), 0);
  v_vat_enabled := COALESCE((p_payload->>'vat_enabled')::boolean, true);
  v_vat_rate := CASE WHEN v_vat_enabled THEN 15.00 ELSE 0 END;
  v_actor_id := NULLIF(p_payload->>'actor_id', '')::uuid;
  v_actor_email := NULLIF(p_payload->>'actor_email', '');

  IF v_status NOT IN ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired', 'converted_to_order') THEN
    RAISE EXCEPTION 'Invalid quotation status: %', v_status;
  END IF;
  IF v_recipient_name = '' THEN
    RAISE EXCEPTION 'Recipient name is required';
  END IF;
  IF v_recipient_email = '' THEN
    RAISE EXCEPTION 'Recipient email is required';
  END IF;
  IF jsonb_array_length(COALESCE(p_payload->'items', '[]'::jsonb)) = 0 THEN
    RAISE EXCEPTION 'At least one quotation line item is required';
  END IF;

  INSERT INTO public.quotations (
    quote_number, school_id, recipient_name, recipient_email, recipient_phone,
    status, subtotal, vat_rate, vat_amount, total_amount, valid_until, notes,
    discount_amount, delivery_fee, vat_enabled, created_by, pdf_status
  ) VALUES (
    v_quote_number, v_school_id, v_recipient_name, v_recipient_email, v_recipient_phone,
    v_status, 0, v_vat_rate, 0, 0, v_valid_until, v_notes,
    v_discount_amount, v_delivery_fee, v_vat_enabled, v_actor_id, 'pending'
  ) RETURNING id INTO v_quote_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_payload->'items')
  LOOP
    IF TRIM(COALESCE(v_item->>'item_title', '')) <> '' THEN
      v_product_id := NULL;
      v_product_sku := NULL;
      v_product_name := NULL;
      v_product_unit := NULL;
      v_product_price := NULL;
      v_product_cost := NULL;
      v_product_availability := NULL;
      v_product_supplier := NULL;
      IF NULLIF(v_item->>'master_product_id', '') IS NOT NULL THEN
        SELECT mp.id, mp.sku, mp.name, mp.unit, mp.current_selling_price,
               mp.latest_verified_cost, mp.availability, s.name
        INTO v_product_id, v_product_sku, v_product_name, v_product_unit, v_product_price,
             v_product_cost, v_product_availability, v_product_supplier
        FROM public.master_products mp
        LEFT JOIN public.suppliers s ON s.id = mp.preferred_supplier_id
        WHERE mp.id = NULLIF(v_item->>'master_product_id', '')::uuid;
      END IF;

      INSERT INTO public.quotation_items (
        quotation_id, master_product_id, item_title, sku, unit, quantity,
        unit_price, cost_price, supplier_snapshot, availability_snapshot, sort_order
      ) VALUES (
        v_quote_id,
        COALESCE(v_product_id, NULLIF(v_item->>'master_product_id', '')::uuid),
        COALESCE(NULLIF(TRIM(v_item->>'item_title'), ''), v_product_name),
        COALESCE(NULLIF(TRIM(COALESCE(v_item->>'sku', '')), ''), v_product_sku),
        COALESCE(NULLIF(TRIM(COALESCE(v_item->>'unit', '')), ''), v_product_unit, 'Each'),
        COALESCE(NULLIF(v_item->>'quantity', '')::integer, 1),
        COALESCE(NULLIF(v_item->>'unit_price', '')::numeric, v_product_price, 0),
        COALESCE(NULLIF(v_item->>'cost_price', '')::numeric, v_product_cost),
        COALESCE(NULLIF(TRIM(COALESCE(v_item->>'supplier_snapshot', '')), ''), v_product_supplier),
        COALESCE(NULLIF(TRIM(COALESCE(v_item->>'availability_snapshot', '')), ''), v_product_availability),
        COALESCE(NULLIF(v_item->>'sort_order', '')::integer, v_inserted_items)
      );

      v_inserted_items := v_inserted_items + 1;
    END IF;
  END LOOP;

  IF v_inserted_items = 0 THEN
    RAISE EXCEPTION 'At least one valid quotation line item is required';
  END IF;

  PERFORM public.recalculate_quotation_totals(v_quote_id);

  INSERT INTO public.quotation_events (quotation_id, event_type, actor_id, actor_email, payload)
  VALUES (v_quote_id, 'created', v_actor_id, v_actor_email, jsonb_build_object('quote_number', v_quote_number, 'items_count', v_inserted_items));

  SELECT jsonb_build_object(
    'id', q.id, 'quote_number', q.quote_number, 'school_id', q.school_id,
    'recipient_name', q.recipient_name, 'recipient_email', q.recipient_email,
    'recipient_phone', q.recipient_phone, 'status', q.status, 'subtotal', q.subtotal,
    'vat_rate', q.vat_rate, 'vat_amount', q.vat_amount, 'discount_amount', q.discount_amount,
    'delivery_fee', q.delivery_fee, 'vat_enabled', q.vat_enabled, 'total_amount', q.total_amount,
    'valid_until', q.valid_until, 'notes', q.notes, 'pdf_status', q.pdf_status,
    'pdf_version', q.pdf_version, 'created_at', q.created_at
  ) INTO v_result
  FROM public.quotations q
  WHERE q.id = v_quote_id;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_quotation_with_items(jsonb) TO authenticated, service_role;
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
      description_snapshot, quantity, unit_selling_price, line_total,
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
      v_item.total_price,
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

GRANT EXECUTE ON FUNCTION public.convert_quotation_to_order(jsonb) TO authenticated, service_role;
CREATE OR REPLACE FUNCTION public.auto_expire_quotations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.admin_quotations_dashboard(
  p_search text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats jsonb;
  v_quotations jsonb;
  v_total_count bigint;
  v_query tsquery;
BEGIN
  PERFORM public.auto_expire_quotations();
  v_query := CASE WHEN NULLIF(trim(COALESCE(p_search, '')), '') IS NULL THEN NULL ELSE websearch_to_tsquery('simple', p_search) END;

  SELECT jsonb_build_object(
    'total', count(*)::integer,
    'draft', count(*) FILTER (WHERE status = 'draft')::integer,
    'sent', count(*) FILTER (WHERE status IN ('sent', 'viewed'))::integer,
    'accepted', count(*) FILTER (WHERE status = 'accepted')::integer,
    'declined', count(*) FILTER (WHERE status = 'declined')::integer,
    'converted', count(*) FILTER (WHERE status = 'converted_to_order')::integer,
    'expired', count(*) FILTER (WHERE status = 'expired')::integer,
    'total_pipeline_value', COALESCE(sum(total_amount), 0)::numeric(12,2),
    'accepted_value', COALESCE(sum(total_amount) FILTER (WHERE status IN ('accepted', 'converted_to_order')), 0)::numeric(12,2),
    'conversion_rate', CASE WHEN count(*) > 0 THEN ROUND((count(*) FILTER (WHERE status = 'converted_to_order')::numeric / count(*)::numeric) * 100, 1) ELSE 0 END
  ) INTO v_stats
  FROM public.quotations;

  SELECT count(*) INTO v_total_count
  FROM public.quotations q
  LEFT JOIN public.schools s ON s.id = q.school_id
  WHERE (p_status IS NULL OR p_status = 'all' OR q.status = p_status)
    AND (v_query IS NULL OR q.search_vector @@ v_query OR to_tsvector('simple', COALESCE(s.name, '')) @@ v_query);

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
      'school', CASE WHEN s.id IS NOT NULL THEN jsonb_build_object('id', s.id, 'name', s.name, 'slug', s.slug, 'city', s.city, 'province', s.province) ELSE NULL END
    ) AS row_data
    FROM public.quotations q
    LEFT JOIN public.schools s ON s.id = q.school_id
    WHERE (p_status IS NULL OR p_status = 'all' OR q.status = p_status)
      AND (v_query IS NULL OR q.search_vector @@ v_query OR to_tsvector('simple', COALESCE(s.name, '')) @@ v_query)
    ORDER BY q.created_at DESC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 20), 100)) OFFSET GREATEST(COALESCE(p_offset, 0), 0)
  ) sub;

  RETURN jsonb_build_object('stats', v_stats, 'total_count', v_total_count, 'quotations', v_quotations);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_quotations_dashboard(text, text, integer, integer) TO authenticated, service_role;
CREATE OR REPLACE FUNCTION public.admin_orders_dashboard(
  p_search text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats jsonb;
  v_orders jsonb;
  v_total_count bigint;
  v_query tsquery;
BEGIN
  v_query := CASE WHEN NULLIF(trim(COALESCE(p_search, '')), '') IS NULL THEN NULL ELSE websearch_to_tsquery('simple', p_search) END;

  SELECT jsonb_build_object(
    'total', count(*)::integer,
    'pending_payment', count(*) FILTER (WHERE status = 'pending_payment')::integer,
    'paid', count(*) FILTER (WHERE status IN ('paid', 'processing', 'fulfilled'))::integer,
    'cancelled', count(*) FILTER (WHERE status = 'cancelled')::integer,
    'revenue', COALESCE(sum(estimated_total), 0)::numeric(12,2)
  ) INTO v_stats
  FROM public.orders;

  SELECT count(*) INTO v_total_count
  FROM public.orders o
  WHERE (p_status IS NULL OR p_status = 'all' OR o.status = p_status)
    AND (v_query IS NULL OR o.search_vector @@ v_query);

  SELECT COALESCE(jsonb_agg(row_data), '[]'::jsonb) INTO v_orders
  FROM (
    SELECT to_jsonb(o) AS row_data
    FROM public.orders o
    WHERE (p_status IS NULL OR p_status = 'all' OR o.status = p_status)
      AND (v_query IS NULL OR o.search_vector @@ v_query)
    ORDER BY o.created_at DESC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 20), 100)) OFFSET GREATEST(COALESCE(p_offset, 0), 0)
  ) sub;

  RETURN jsonb_build_object('stats', v_stats, 'total_count', v_total_count, 'orders', v_orders);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_orders_dashboard(text, text, integer, integer) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.admin_packs_dashboard(
  p_search text DEFAULT NULL,
  p_school_id uuid DEFAULT NULL,
  p_visible boolean DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats jsonb;
  v_packs jsonb;
  v_total_count bigint;
  v_query tsquery;
BEGIN
  v_query := CASE WHEN NULLIF(trim(COALESCE(p_search, '')), '') IS NULL THEN NULL ELSE websearch_to_tsquery('simple', p_search) END;

  SELECT jsonb_build_object(
    'total', count(*)::integer,
    'visible', count(*) FILTER (WHERE visible = true)::integer,
    'hidden', count(*) FILTER (WHERE visible = false)::integer,
    'items', COALESCE((SELECT count(*) FROM public.school_pack_items WHERE active = true), 0)::integer,
    'catalogue_value', COALESCE(sum(price), 0)::numeric(12,2)
  ) INTO v_stats
  FROM public.school_packs;

  SELECT count(*) INTO v_total_count
  FROM public.school_packs sp
  LEFT JOIN public.schools s ON s.id = sp.school_id
  WHERE (p_school_id IS NULL OR sp.school_id = p_school_id)
    AND (p_visible IS NULL OR sp.visible = p_visible)
    AND (v_query IS NULL OR sp.search_vector @@ v_query OR to_tsvector('simple', COALESCE(s.name, '')) @@ v_query);

  SELECT COALESCE(jsonb_agg(row_data), '[]'::jsonb) INTO v_packs
  FROM (
    SELECT jsonb_build_object(
      'id', sp.id,
      'school_id', sp.school_id,
      'title', sp.title,
      'slug', sp.slug,
      'description', sp.description,
      'price', sp.price,
      'stock', sp.stock,
      'featured', sp.featured,
      'visible', sp.visible,
      'academic_year', sp.academic_year,
      'delivery_type', sp.delivery_type,
      'items_count', (SELECT count(*)::integer FROM public.school_pack_items spi WHERE spi.pack_id = sp.id AND spi.active = true),
      'school', CASE WHEN s.id IS NOT NULL THEN jsonb_build_object('id', s.id, 'name', s.name, 'slug', s.slug, 'city', s.city, 'province', s.province) ELSE NULL END,
      'created_at', sp.created_at,
      'updated_at', sp.updated_at
    ) AS row_data
    FROM public.school_packs sp
    LEFT JOIN public.schools s ON s.id = sp.school_id
    WHERE (p_school_id IS NULL OR sp.school_id = p_school_id)
      AND (p_visible IS NULL OR sp.visible = p_visible)
      AND (v_query IS NULL OR sp.search_vector @@ v_query OR to_tsvector('simple', COALESCE(s.name, '')) @@ v_query)
    ORDER BY sp.created_at DESC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 20), 100)) OFFSET GREATEST(COALESCE(p_offset, 0), 0)
  ) sub;

  RETURN jsonb_build_object('stats', v_stats, 'total_count', v_total_count, 'packs', v_packs);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_packs_dashboard(text, uuid, boolean, integer, integer) TO authenticated, service_role;
DROP MATERIALIZED VIEW IF EXISTS public.admin_quote_pipeline_mv;
CREATE MATERIALIZED VIEW public.admin_quote_pipeline_mv AS
SELECT
  date_trunc('month', created_at)::date AS month,
  status,
  count(*) AS quotes_count,
  COALESCE(sum(total_amount), 0)::numeric(12,2) AS total_value,
  COALESCE(avg(total_amount), 0)::numeric(12,2) AS avg_value
FROM public.quotations
GROUP BY date_trunc('month', created_at)::date, status
WITH DATA;
CREATE UNIQUE INDEX idx_quote_pipeline_month_status ON public.admin_quote_pipeline_mv(month, status);
GRANT SELECT ON public.admin_quote_pipeline_mv TO authenticated, service_role;

DROP MATERIALIZED VIEW IF EXISTS public.admin_product_margin_mv;
CREATE MATERIALIZED VIEW public.admin_product_margin_mv AS
SELECT
  mp.id,
  mp.sku,
  mp.name,
  mp.category,
  mp.brand,
  mp.current_selling_price AS selling_price,
  COALESCE(mp.latest_verified_cost, 0)::numeric(12,2) AS estimated_cost,
  CASE WHEN mp.current_selling_price > 0 THEN ROUND(((mp.current_selling_price - COALESCE(mp.latest_verified_cost, 0)) / mp.current_selling_price) * 100, 2) ELSE 0 END AS gross_margin_percent,
  mp.availability,
  mp.pricing_status,
  mp.updated_at
FROM public.master_products mp
WHERE mp.active = true
WITH DATA;
CREATE UNIQUE INDEX idx_product_margin_mv_id ON public.admin_product_margin_mv(id);
GRANT SELECT ON public.admin_product_margin_mv TO authenticated, service_role;

DROP MATERIALIZED VIEW IF EXISTS public.admin_school_pack_health_mv;
CREATE MATERIALIZED VIEW public.admin_school_pack_health_mv AS
SELECT
  sp.id AS pack_id,
  sp.title,
  sp.slug,
  sp.school_id,
  s.name AS school_name,
  sp.visible,
  sp.price,
  count(spi.id) FILTER (WHERE spi.active = true)::integer AS active_items,
  count(spi.id) FILTER (WHERE spi.active = true AND mp.id IS NULL)::integer AS missing_products,
  count(spi.id) FILTER (WHERE spi.active = true AND mp.visibility <> 'public')::integer AS hidden_products,
  COALESCE(sum(spi.pack_quantity * mp.current_selling_price) FILTER (WHERE spi.active = true), 0)::numeric(12,2) AS item_subtotal
FROM public.school_packs sp
LEFT JOIN public.schools s ON s.id = sp.school_id
LEFT JOIN public.school_pack_items spi ON spi.pack_id = sp.id
LEFT JOIN public.master_products mp ON mp.id = spi.product_id
GROUP BY sp.id, sp.title, sp.slug, sp.school_id, s.name, sp.visible, sp.price
WITH DATA;
CREATE UNIQUE INDEX idx_school_pack_health_mv_pack_id ON public.admin_school_pack_health_mv(pack_id);
GRANT SELECT ON public.admin_school_pack_health_mv TO authenticated, service_role;

DROP MATERIALIZED VIEW IF EXISTS public.admin_supplier_demand_mv;
CREATE MATERIALIZED VIEW public.admin_supplier_demand_mv AS
SELECT
  mp.preferred_supplier_id AS supplier_id,
  s.name AS supplier_name,
  count(DISTINCT mp.id)::integer AS products_count,
  COALESCE(sum(oi.quantity), 0)::integer AS ordered_units,
  COALESCE(sum(oi.line_total), 0)::numeric(12,2) AS ordered_value,
  COALESCE(sum(oi.expected_margin), 0)::numeric(12,2) AS expected_margin
FROM public.master_products mp
LEFT JOIN public.suppliers s ON s.id = mp.preferred_supplier_id
LEFT JOIN public.order_items oi ON oi.product_id = mp.id
GROUP BY mp.preferred_supplier_id, s.name
WITH DATA;
CREATE UNIQUE INDEX idx_supplier_demand_mv_supplier_id ON public.admin_supplier_demand_mv(COALESCE(supplier_id, '00000000-0000-0000-0000-000000000000'::uuid));
GRANT SELECT ON public.admin_supplier_demand_mv TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.refresh_admin_operational_summaries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.admin_quote_pipeline_mv;
  REFRESH MATERIALIZED VIEW public.admin_product_margin_mv;
  REFRESH MATERIALIZED VIEW public.admin_school_pack_health_mv;
  REFRESH MATERIALIZED VIEW public.admin_supplier_demand_mv;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_admin_operational_summaries() TO authenticated, service_role;
