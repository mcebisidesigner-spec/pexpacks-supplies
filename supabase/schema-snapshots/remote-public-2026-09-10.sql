


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."setting_scope" AS ENUM (
    'global',
    'season',
    'school',
    'category',
    'product'
);


ALTER TYPE "public"."setting_scope" OWNER TO "postgres";


CREATE TYPE "public"."setting_value_type" AS ENUM (
    'string',
    'number',
    'boolean',
    'json',
    'email',
    'percentage',
    'currency'
);


ALTER TYPE "public"."setting_value_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_global_omnibar_search"("search_query" "text", "max_results" integer DEFAULT 6) RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_q text;
  v_clean text;
BEGIN
  v_clean := TRIM(search_query);
  IF v_clean = '' OR v_clean IS NULL THEN
    RETURN jsonb_build_object(
      'schools', '[]'::jsonb,
      'products', '[]'::jsonb,
      'packs', '[]'::jsonb,
      'orders', '[]'::jsonb,
      'quotations', '[]'::jsonb,
      'suppliers', '[]'::jsonb
    );
  END IF;

  v_q := '%' || v_clean || '%';

  RETURN jsonb_build_object(
    'schools', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', s.id,
        'title', s.name,
        'subtitle', COALESCE(s.city || ', ' || s.province, s.province),
        'href', '/admin/schools/' || s.id,
        'badge', CASE WHEN s.is_partner THEN 'Partner' ELSE 'Standard' END
      ))
      FROM (
        SELECT id, name, city, province, is_partner
        FROM public.schools
        WHERE name ILIKE v_q OR slug ILIKE v_q OR city ILIKE v_q
        ORDER BY is_partner DESC, name ASC
        LIMIT max_results
      ) s
    ), '[]'::jsonb),

    'products', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', p.id,
        'title', p.name,
        'subtitle', 'SKU: ' || p.sku || ' • R ' || p.current_selling_price,
        'href', '/admin/products/' || p.id || '/edit',
        'badge', COALESCE(p.brand, p.category, 'Catalog')
      ))
      FROM (
        SELECT id, name, sku, current_selling_price, brand, category
        FROM public.master_products
        WHERE name ILIKE v_q OR sku ILIKE v_q OR brand ILIKE v_q
        ORDER BY active DESC, name ASC
        LIMIT max_results
      ) p
    ), '[]'::jsonb),

    'packs', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', pk.id,
        'title', pk.title,
        'subtitle', 'Price: R ' || pk.price,
        'href', '/admin/packs/' || pk.id,
        'badge', CASE WHEN pk.visible THEN 'Active' ELSE 'Hidden' END
      ))
      FROM (
        SELECT id, title, price, visible
        FROM public.school_packs
        WHERE title ILIKE v_q OR slug ILIKE v_q
        ORDER BY visible DESC, title ASC
        LIMIT max_results
      ) pk
    ), '[]'::jsonb),

    'orders', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', o.id,
        'title', o.order_reference,
        'subtitle', COALESCE(o.buyer_name, 'Unknown') || ' • R ' || o.estimated_total,
        'href', '/admin/orders/' || o.id,
        'badge', o.status
      ))
      FROM (
        SELECT id, order_reference, buyer_name, estimated_total, status
        FROM public.orders
        WHERE order_reference ILIKE v_q OR buyer_name ILIKE v_q OR buyer_email ILIKE v_q
        ORDER BY created_at DESC
        LIMIT max_results
      ) o
    ), '[]'::jsonb),

    'quotations', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', q.id,
        'title', q.quote_number,
        'subtitle', COALESCE(q.recipient_name, q.school_name, 'Quote') || ' • R ' || q.total_amount,
        'href', '/admin/quotations/' || q.id,
        'badge', q.status
      ))
      FROM (
        SELECT q.id, q.quote_number, q.recipient_name, s.name AS school_name, q.total_amount, q.status
        FROM public.quotations q
        LEFT JOIN public.schools s ON s.id = q.school_id
        WHERE q.quote_number ILIKE v_q OR q.recipient_name ILIKE v_q OR q.recipient_email ILIKE v_q OR s.name ILIKE v_q
        ORDER BY q.created_at DESC
        LIMIT max_results
      ) q
    ), '[]'::jsonb),

    'suppliers', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', sup.id,
        'title', sup.name,
        'subtitle', 'Code: ' || sup.code || COALESCE(' • ' || sup.contact_name, ''),
        'href', '/admin/suppliers/' || sup.id,
        'badge', CASE WHEN sup.active THEN 'Active' ELSE 'Inactive' END
      ))
      FROM (
        SELECT id, name, code, contact_name, active
        FROM public.suppliers
        WHERE name ILIKE v_q OR code ILIKE v_q OR contact_name ILIKE v_q
        ORDER BY active DESC, name ASC
        LIMIT max_results
      ) sup
    ), '[]'::jsonb)
  );
END;
$$;


ALTER FUNCTION "public"."admin_global_omnibar_search"("search_query" "text", "max_results" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_orders_dashboard"("p_search" "text" DEFAULT NULL::"text", "p_status" "text" DEFAULT NULL::"text", "p_limit" integer DEFAULT 20, "p_offset" integer DEFAULT 0) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."admin_orders_dashboard"("p_search" "text", "p_status" "text", "p_limit" integer, "p_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_packs_dashboard"("p_search" "text" DEFAULT NULL::"text", "p_school_id" "uuid" DEFAULT NULL::"uuid", "p_visible" boolean DEFAULT NULL::boolean, "p_limit" integer DEFAULT 20, "p_offset" integer DEFAULT 0) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."admin_packs_dashboard"("p_search" "text", "p_school_id" "uuid", "p_visible" boolean, "p_limit" integer, "p_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_quotations_dashboard"("p_search" "text" DEFAULT NULL::"text", "p_status" "text" DEFAULT NULL::"text", "p_limit" integer DEFAULT 20, "p_offset" integer DEFAULT 0) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."admin_quotations_dashboard"("p_search" "text", "p_status" "text", "p_limit" integer, "p_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."allocate_secured_demand"("p_requirement_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_requirement public.procurement_requirements%rowtype;
  v_available integer;
  v_needed integer;
  v_allocate integer;
  v_total integer := 0;
  v_line record;
begin
  select * into v_requirement
  from public.procurement_requirements
  where id = p_requirement_id
  for update;
  if not found then raise exception 'Procurement requirement not found' using errcode = 'P0002'; end if;

  v_available := greatest(v_requirement.secured_quantity - v_requirement.allocated_quantity, 0);
  if v_available = 0 then return 0; end if;

  for v_line in
    select
      oi.id as order_item_id,
      oi.quantity,
      coalesce((select sum(a.quantity) from public.order_product_allocations a where a.order_item_id = oi.id), 0) as already_allocated
    from public.procurement_requirement_orders pro
    join public.order_items oi on oi.id = pro.order_item_id
    join public.orders o on o.id = pro.order_id
    where pro.requirement_id = p_requirement_id and o.status = 'paid'
    order by coalesce((select fr.target_date from public.fulfilment_records fr where fr.order_id = o.id), '9999-12-31'::date), o.paid_at, o.created_at
  loop
    exit when v_available <= 0;
    v_needed := greatest(v_line.quantity - v_line.already_allocated, 0);
    if v_needed > 0 then
      v_allocate := least(v_available, v_needed);
      insert into public.order_product_allocations(order_item_id, quantity)
      values (v_line.order_item_id, v_allocate);
      v_available := v_available - v_allocate;
      v_total := v_total + v_allocate;
    end if;
  end loop;

  update public.procurement_requirements
  set allocated_quantity = allocated_quantity + v_total, updated_at = now()
  where id = p_requirement_id;

  update public.packing_records pr
  set status = 'ready', updated_at = now()
  from public.order_readiness_view readiness
  where readiness.order_id = pr.order_id
    and readiness.readiness_percent >= 100
    and pr.status = 'not_ready';

  return v_total;
end;
$$;


ALTER FUNCTION "public"."allocate_secured_demand"("p_requirement_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."archive_operational_history"("retention_days" integer DEFAULT 730, "dry_run" boolean DEFAULT true) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
DECLARE
  cutoff timestamptz := now() - make_interval(days => GREATEST(COALESCE(retention_days, 730), 30));
  audit_count integer := 0;
  security_count integer := 0;
  order_event_count integer := 0;
BEGIN
  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM public.audit_logs WHERE created_at < $1' INTO audit_count USING cutoff;
    IF NOT dry_run AND audit_count > 0 THEN
      EXECUTE 'INSERT INTO public.audit_logs_archive SELECT *, now() FROM public.audit_logs WHERE created_at < $1 ON CONFLICT DO NOTHING' USING cutoff;
      EXECUTE 'DELETE FROM public.audit_logs WHERE created_at < $1' USING cutoff;
    END IF;
  END IF;

  IF to_regclass('public.security_audit_logs') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM public.security_audit_logs WHERE created_at < $1' INTO security_count USING cutoff;
    IF NOT dry_run AND security_count > 0 THEN
      EXECUTE 'INSERT INTO public.security_audit_logs_archive SELECT *, now() FROM public.security_audit_logs WHERE created_at < $1 ON CONFLICT DO NOTHING' USING cutoff;
      EXECUTE 'DELETE FROM public.security_audit_logs WHERE created_at < $1' USING cutoff;
    END IF;
  END IF;

  IF to_regclass('public.order_events') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM public.order_events WHERE created_at < $1' INTO order_event_count USING cutoff;
    IF NOT dry_run AND order_event_count > 0 THEN
      EXECUTE 'INSERT INTO public.order_events_archive SELECT *, now() FROM public.order_events WHERE created_at < $1 ON CONFLICT DO NOTHING' USING cutoff;
      EXECUTE 'DELETE FROM public.order_events WHERE created_at < $1' USING cutoff;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'dry_run', dry_run,
    'cutoff', cutoff,
    'audit_logs', audit_count,
    'security_audit_logs', security_count,
    'order_events', order_event_count
  );
END;
$_$;


ALTER FUNCTION "public"."archive_operational_history"("retention_days" integer, "dry_run" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_expire_quotations"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."auto_expire_quotations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."blog_posts_set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;


ALTER FUNCTION "public"."blog_posts_set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_grade_pack_price"("p_pack_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_margin_pct numeric := 49.9;
  v_margin_rate numeric := 0.4990;
  v_packaging_cost numeric := 0;
  v_assembly_cost numeric := 0;
  v_freight_cost numeric := 0;
  v_other_cost numeric := 0;

  v_items_cost numeric := 0;
  v_missing_price_count integer := 0;
  v_missing_items jsonb := '[]'::jsonb;
  v_total_landed_cost numeric := 0;
  v_items_price_after_margin numeric := 0;
  v_calculated_price numeric := 0;
  v_pricing_status text := 'ready';
BEGIN
  SELECT COALESCE(NULLIF(TRIM(BOTH '"' FROM value::text), '')::numeric, 49.9)
  INTO v_margin_pct
  FROM public.system_settings
  WHERE key = 'pricing.target_margin_pct';

  IF v_margin_pct IS NULL OR v_margin_pct < 0 OR v_margin_pct >= 100 THEN
    v_margin_pct := 49.9;
  END IF;
  v_margin_rate := ROUND(v_margin_pct / 100.0, 4);

  SELECT COALESCE(NULLIF(TRIM(BOTH '"' FROM value::text), '')::numeric, 0)
  INTO v_packaging_cost
  FROM public.system_settings
  WHERE key = 'pricing.packaging_cost';

  SELECT COALESCE(NULLIF(TRIM(BOTH '"' FROM value::text), '')::numeric, 0)
  INTO v_assembly_cost
  FROM public.system_settings
  WHERE key = 'pricing.assembly_cost';

  SELECT COALESCE(NULLIF(TRIM(BOTH '"' FROM value::text), '')::numeric, 0)
  INTO v_freight_cost
  FROM public.system_settings
  WHERE key = 'pricing.freight_cost';

  v_packaging_cost := COALESCE(v_packaging_cost, 0);
  v_assembly_cost := COALESCE(v_assembly_cost, 0);
  v_freight_cost := COALESCE(v_freight_cost, 0);

  WITH item_prices AS (
    SELECT
      spi.id AS item_id,
      COALESCE(NULLIF(spi.school_wording, ''), mp.name) AS item_name,
      COALESCE(spi.pack_quantity, 1) AS quantity,
      COALESCE(spi.selling_price_override, mp.current_selling_price, mp.calculated_selling_price, 0) AS unit_price
    FROM public.school_pack_items spi
    JOIN public.master_products mp ON mp.id = spi.product_id
    WHERE spi.pack_id = p_pack_id
      AND spi.active = true
      AND mp.active = true
  )
  SELECT
    COALESCE(SUM(COALESCE(unit_price, 0) * quantity), 0)::numeric(12,2),
    COUNT(*) FILTER (WHERE unit_price IS NULL OR unit_price <= 0),
    COALESCE(
      jsonb_agg(
        jsonb_build_object('item_id', item_id, 'name', item_name, 'quantity', quantity)
      ) FILTER (WHERE unit_price IS NULL OR unit_price <= 0),
      '[]'::jsonb
    )
  INTO v_items_cost, v_missing_price_count, v_missing_items
  FROM item_prices;

  IF v_missing_price_count > 0 THEN
    v_pricing_status := 'incomplete';
  ELSE
    v_pricing_status := 'ready';
  END IF;

  v_total_landed_cost := v_items_cost + v_packaging_cost + v_assembly_cost + v_freight_cost + v_other_cost;

  IF v_margin_rate >= 0.999 THEN
    v_margin_rate := 0.4990;
  END IF;

  IF v_items_cost > 0 THEN
    v_items_price_after_margin := ROUND(v_items_cost / (1.0 - v_margin_rate), 2);
    v_calculated_price := ROUND(v_items_price_after_margin + v_packaging_cost + v_assembly_cost + v_freight_cost + v_other_cost, 2);
  ELSE
    v_calculated_price := 0;
  END IF;

  RETURN jsonb_build_object(
    'pack_id', p_pack_id,
    'items_cost', v_items_cost,
    'packaging_cost', v_packaging_cost,
    'assembly_cost', v_assembly_cost,
    'freight_cost', v_freight_cost,
    'other_cost', v_other_cost,
    'total_landed_cost', v_total_landed_cost,
    'margin_rate_used', v_margin_rate,
    'calculated_selling_price', v_calculated_price,
    'pricing_status', v_pricing_status,
    'missing_cost_count', v_missing_price_count,
    'missing_items', v_missing_items
  );
END;
$$;


ALTER FUNCTION "public"."calculate_grade_pack_price"("p_pack_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_order_receipt_delivery"("p_order_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_claim_token uuid;
BEGIN
  UPDATE public.orders
  SET
    receipt_email_processing_at = now(),
    receipt_email_claim_token = gen_random_uuid(),
    receipt_email_last_error = NULL
  WHERE id = p_order_id
    AND status = 'paid'
    AND receipt_email_sent_at IS NULL
    AND (
      receipt_email_processing_at IS NULL
      OR receipt_email_processing_at < now() - interval '15 minutes'
    )
  RETURNING receipt_email_claim_token INTO v_claim_token;

  RETURN v_claim_token;
END;
$$;


ALTER FUNCTION "public"."claim_order_receipt_delivery"("p_order_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."complete_order_payment"("p_order_reference" "text", "p_gateway_reference" "text", "p_amount" numeric, "p_currency" "text" DEFAULT 'ZAR'::"text", "p_provider" "text" DEFAULT 'ozow'::"text", "p_payment_method" "text" DEFAULT 'Ozow'::"text", "p_payload" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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


ALTER FUNCTION "public"."complete_order_payment"("p_order_reference" "text", "p_gateway_reference" "text", "p_amount" numeric, "p_currency" "text", "p_provider" "text", "p_payment_method" "text", "p_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."complete_order_receipt_delivery"("p_order_id" "uuid", "p_claim_token" "uuid", "p_sent" boolean, "p_error" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.orders
  SET
    receipt_email_sent_at = CASE WHEN p_sent THEN now() ELSE receipt_email_sent_at END,
    receipt_email_processing_at = NULL,
    receipt_email_claim_token = NULL,
    receipt_email_last_error = CASE WHEN p_sent THEN NULL ELSE left(coalesce(p_error, 'Receipt email delivery failed.'), 1000) END
  WHERE id = p_order_id
    AND receipt_email_claim_token = p_claim_token;
END;
$$;


ALTER FUNCTION "public"."complete_order_receipt_delivery"("p_order_id" "uuid", "p_claim_token" "uuid", "p_sent" boolean, "p_error" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."convert_quotation_to_order"("p_payload" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."convert_quotation_to_order"("p_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_quotation_with_items"("p_payload" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."create_quotation_with_items"("p_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_operational_season_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select id
  from public.seasons
  order by is_default desc, (status = 'active') desc, academic_year desc
  limit 1
$$;


ALTER FUNCTION "public"."current_operational_season_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."explain_public_read_paths"("school_slug" "text" DEFAULT 'primrose-hill-primary-school'::"text", "search_query" "text" DEFAULT 'primrose'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
DECLARE
  v_school_plan jsonb;
  v_search_plan jsonb;
BEGIN
  EXECUTE 'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT public.get_public_school_pack($1)'
    USING school_slug
    INTO v_school_plan;

  EXECUTE 'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.search_public_schools($1, $2, $3, $4, $5, $6)'
    USING search_query, '', '', '', 12, 0
    INTO v_search_plan;

  RETURN jsonb_build_object(
    'get_public_school_pack', v_school_plan,
    'search_public_schools', v_search_plan
  );
END;
$_$;


ALTER FUNCTION "public"."explain_public_read_paths"("school_slug" "text", "search_query" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_audit_trail_recorder"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_actor_id uuid;
  v_actor_email text;
  v_entity_type text;
  v_entity_id text;
  v_action text;
  v_summary text;
  v_old_json jsonb;
  v_new_json jsonb;
BEGIN
  BEGIN
    v_actor_id := (nullif(current_setting('request.jwt.claim.sub', true), ''))::uuid;
    v_actor_email := nullif(current_setting('request.jwt.claim.email', true), '');
  EXCEPTION WHEN OTHERS THEN
    v_actor_id := NULL;
    v_actor_email := 'system/migration';
  END;

  v_entity_type := TG_TABLE_NAME;
  v_action := lower(TG_OP);

  IF (TG_OP = 'DELETE') THEN
    v_entity_id := OLD.id::text;
    v_old_json := to_jsonb(OLD);
    v_new_json := NULL;
    v_summary := format('Deleted %s (%s)', v_entity_type, v_entity_id);
  ELSIF (TG_OP = 'INSERT') THEN
    v_entity_id := NEW.id::text;
    v_old_json := NULL;
    v_new_json := to_jsonb(NEW);
    v_summary := format('Created %s (%s)', v_entity_type, v_entity_id);
  ELSIF (TG_OP = 'UPDATE') THEN
    v_entity_id := NEW.id::text;
    v_old_json := to_jsonb(OLD);
    v_new_json := to_jsonb(NEW);
    v_summary := format('Updated %s (%s)', v_entity_type, v_entity_id);
  END IF;

  INSERT INTO public.audit_logs (
    created_at,
    actor_id,
    actor_name,
    action,
    entity_type,
    entity_id,
    summary,
    details
  ) VALUES (
    NOW(),
    v_actor_id,
    COALESCE(v_actor_email, 'system'),
    format('%s.%s', v_entity_type, v_action),
    v_entity_type,
    v_entity_id,
    v_summary,
    jsonb_build_object(
      'old', v_old_json,
      'new', v_new_json
    )
  );

  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;


ALTER FUNCTION "public"."fn_audit_trail_recorder"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_auto_link_master_product"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  if new.master_product_id is null then
    select p.id into new.master_product_id
    from public.master_products p
    where lower(trim(p.name)) = lower(trim(new.name))
    limit 1;
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."fn_auto_link_master_product"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_snapshot_order_item_details"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_prod record;
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    SELECT sku, name, description, latest_verified_cost
    INTO v_prod
    FROM public.master_products
    WHERE id = NEW.product_id;

    IF FOUND THEN
      NEW.sku_snapshot := COALESCE(NULLIF(NEW.sku_snapshot, ''), v_prod.sku);
      NEW.product_name_snapshot := COALESCE(NULLIF(NEW.product_name_snapshot, ''), v_prod.name);
      NEW.description_snapshot := COALESCE(NULLIF(NEW.description_snapshot, ''), v_prod.description);
      NEW.estimated_unit_cost := COALESCE(NEW.estimated_unit_cost, v_prod.latest_verified_cost, 0);
    END IF;
  END IF;

  NEW.unit_selling_price := COALESCE(NEW.unit_selling_price, 0);
  NEW.quantity := COALESCE(NEW.quantity, 1);
  NEW.line_total := (NEW.unit_selling_price * NEW.quantity)::numeric(12,2);
  NEW.expected_margin := ((NEW.unit_selling_price - COALESCE(NEW.estimated_unit_cost, 0)) * NEW.quantity)::numeric(12,2);

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_snapshot_order_item_details"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_sync_order_total_amount"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_order_id uuid;
BEGIN
  v_order_id := COALESCE(NEW.order_id, OLD.order_id);
  IF v_order_id IS NOT NULL THEN
    UPDATE public.orders
    SET estimated_total = COALESCE((
      SELECT SUM(line_total)
      FROM public.order_items
      WHERE order_id = v_order_id
    ), 0)::numeric(12,2),
    updated_at = NOW()
    WHERE id = v_order_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."fn_sync_order_total_amount"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_sync_pack_total_price"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_pack_id uuid;
BEGIN
  v_pack_id := COALESCE(NEW.pack_id, OLD.pack_id);
  IF v_pack_id IS NOT NULL THEN
    UPDATE public.school_packs
    SET 
      price = COALESCE((
        SELECT SUM(
          COALESCE(spi.selling_price_override, mp.current_selling_price, 0) * COALESCE(spi.pack_quantity, 1)
        )
        FROM public.school_pack_items spi
        JOIN public.master_products mp ON mp.id = spi.product_id
        WHERE spi.pack_id = v_pack_id
          AND spi.active = true
          AND mp.active = true
      ), 0)::numeric(10,2),
      updated_at = NOW()
    WHERE id = v_pack_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."fn_sync_pack_total_price"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_sync_packs_on_product_price_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF (OLD.current_selling_price IS DISTINCT FROM NEW.current_selling_price) OR (OLD.active IS DISTINCT FROM NEW.active) THEN
    UPDATE public.school_packs sp
    SET 
      price = COALESCE((
        SELECT SUM(
          COALESCE(spi.selling_price_override, mp.current_selling_price, 0) * COALESCE(spi.pack_quantity, 1)
        )
        FROM public.school_pack_items spi
        JOIN public.master_products mp ON mp.id = spi.product_id
        WHERE spi.pack_id = sp.id
          AND spi.active = true
          AND mp.active = true
      ), 0)::numeric(10,2),
      updated_at = NOW()
    WHERE sp.id IN (
      SELECT spi_inner.pack_id
      FROM public.school_pack_items spi_inner
      WHERE spi_inner.product_id = NEW.id
        AND spi_inner.selling_price_override IS NULL
    );
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."fn_sync_packs_on_product_price_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_sync_school_pack_item_on_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  delete from public.school_pack_items
  where legacy_item_id = old.id;
  return old;
end;
$$;


ALTER FUNCTION "public"."fn_sync_school_pack_item_on_delete"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_sync_school_pack_item_on_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  if new.master_product_id is not null and new.pack_id is not null then
    insert into public.school_pack_items (
      pack_id, product_id, legacy_item_id, pack_quantity,
      school_wording, prescribed_brand, substitution_policy, school_notes
    ) values (
      new.pack_id, new.master_product_id, new.id, new.quantity,
      new.name, null, 'allowed', null
    )
    on conflict (pack_id, product_id, school_wording) do update set
      legacy_item_id = excluded.legacy_item_id,
      pack_quantity = excluded.pack_quantity;
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."fn_sync_school_pack_item_on_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_sync_school_pack_item_on_update"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  if old.master_product_id is not null then
    update public.school_pack_items set
      pack_quantity = new.quantity,
      school_wording = new.name,
      product_id = coalesce(new.master_product_id, old.master_product_id),
      selling_price_override = new.unit_price
    where legacy_item_id = new.id;
  end if;

  if new.master_product_id is distinct from old.master_product_id and new.master_product_id is not null then
    update public.school_pack_items set
      product_id = new.master_product_id
    where legacy_item_id = new.id;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."fn_sync_school_pack_item_on_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_trg_pack_item_pricing_sync"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_grade_pack_price(OLD.pack_id);
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    PERFORM public.recalculate_grade_pack_price(NEW.pack_id);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If pack_id changed, recalculate both old and new packs
    IF OLD.pack_id IS DISTINCT FROM NEW.pack_id THEN
      PERFORM public.recalculate_grade_pack_price(OLD.pack_id);
      PERFORM public.recalculate_grade_pack_price(NEW.pack_id);
    ELSIF (OLD.pack_quantity IS DISTINCT FROM NEW.pack_quantity)
       OR (OLD.product_id IS DISTINCT FROM NEW.product_id)
       OR (OLD.active IS DISTINCT FROM NEW.active) THEN
      PERFORM public.recalculate_grade_pack_price(NEW.pack_id);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."fn_trg_pack_item_pricing_sync"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_trg_pricing_settings_sync"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.key LIKE 'pricing.%' AND (OLD.value IS DISTINCT FROM NEW.value) THEN
    PERFORM public.recalculate_all_grade_pack_prices();
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_trg_pricing_settings_sync"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_trg_product_cost_pricing_sync"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_pack_rec record;
BEGIN
  IF (OLD.current_selling_price IS DISTINCT FROM NEW.current_selling_price)
     OR (OLD.calculated_selling_price IS DISTINCT FROM NEW.calculated_selling_price)
     OR (OLD.active IS DISTINCT FROM NEW.active) THEN
    FOR v_pack_rec IN
      SELECT DISTINCT pack_id
      FROM public.school_pack_items
      WHERE product_id = NEW.id
    LOOP
      PERFORM public.recalculate_grade_pack_price(v_pack_rec.pack_id);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_trg_product_cost_pricing_sync"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_trg_supplier_offer_pricing_sync"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_prod_id uuid;
  v_pack_rec record;
BEGIN
  v_prod_id := COALESCE(NEW.product_id, OLD.product_id);
  IF v_prod_id IS NOT NULL THEN
    FOR v_pack_rec IN
      SELECT DISTINCT spi.pack_id
      FROM public.school_pack_items spi
      JOIN public.master_products mp ON mp.id = spi.product_id
      WHERE spi.product_id = v_prod_id
        AND mp.latest_verified_cost IS NULL
    LOOP
      PERFORM public.recalculate_grade_pack_price(v_pack_rec.pack_id);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_trg_supplier_offer_pricing_sync"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_executive_dashboard"() RETURNS "jsonb"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT jsonb_build_object(
    'generated_at', NOW(),
    'catalog', jsonb_build_object(
      'total_products', (SELECT count(*)::integer FROM public.master_products),
      'active_products', (SELECT count(*)::integer FROM public.master_products WHERE active = true),
      'avg_selling_price', (SELECT COALESCE(round(avg(current_selling_price), 2), 0)::numeric(10,2) FROM public.master_products WHERE active = true),
      'unpriced_count', (SELECT count(*)::integer FROM public.master_products WHERE current_selling_price <= 0 OR current_selling_price IS NULL)
    ),
    'packs', jsonb_build_object(
      'total_packs', (SELECT count(*)::integer FROM public.school_packs),
      'active_packs', (SELECT count(*)::integer FROM public.school_packs WHERE visible = true),
      'total_pack_items', (SELECT count(*)::integer FROM public.school_pack_items WHERE active = true)
    ),
    'schools', jsonb_build_object(
      'total_schools', (SELECT count(*)::integer FROM public.schools),
      'partner_schools', (SELECT count(*)::integer FROM public.schools WHERE is_partner = true),
      'published_schools', (SELECT count(*)::integer FROM public.schools WHERE published = true)
    ),
    'orders', jsonb_build_object(
      'total_orders', (SELECT count(*)::integer FROM public.orders),
      'pending_payment', (SELECT count(*)::integer FROM public.orders WHERE status = 'pending_payment'),
      'paid_orders', (SELECT count(*)::integer FROM public.orders WHERE status IN ('paid', 'processing', 'packed', 'dispatched', 'delivered')),
      'total_gross_revenue', (SELECT COALESCE(sum(estimated_total), 0)::numeric(12,2) FROM public.orders WHERE status IN ('paid', 'processing', 'packed', 'dispatched', 'delivered'))
    ),
    'data_health', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object('area', area, 'issue', issue, 'issue_count', issue_count)
      ), '[]'::jsonb)
      FROM public.admin_data_quality_issues_view
    )
  );
$$;


ALTER FUNCTION "public"."get_admin_executive_dashboard"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_filter_options"() RETURNS "jsonb"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select jsonb_build_object(
    'school_cities',
    coalesce((select jsonb_agg(city order by city) from (select distinct city from public.schools where city is not null and city <> '') x), '[]'::jsonb),
    'school_provinces',
    coalesce((select jsonb_agg(province order by province) from (select distinct province from public.schools where province is not null and province <> '') x), '[]'::jsonb),
    'pack_delivery_types',
    coalesce((select jsonb_agg(delivery_type order by delivery_type) from (select distinct delivery_type from public.stationery_packs where delivery_type is not null and delivery_type <> '') x), '[]'::jsonb),
    'asset_folders',
    coalesce((select jsonb_agg(folder order by folder) from (select distinct folder from public.assets where folder is not null and folder <> '') x), '[]'::jsonb)
  );
$$;


ALTER FUNCTION "public"."get_admin_filter_options"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_pack_school_groups"("q" "text" DEFAULT NULL::"text", "visible_filter" "text" DEFAULT NULL::"text", "page_size" integer DEFAULT 10000, "page_number" integer DEFAULT 1) RETURNS TABLE("school_id" "uuid", "school_name" "text", "school_slug" "text", "grade_packs_count" bigint, "last_edited" timestamp with time zone, "visible" boolean, "total_schools" bigint, "total_grade_packs" bigint)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  with filtered as (
    select
      s.id as school_id,
      s.name as school_name,
      s.slug as school_slug,
      count(p.id)::bigint as grade_packs_count,
      greatest(
        coalesce(max(p.updated_at), s.updated_at),
        coalesce(s.updated_at, max(p.updated_at))
      ) as last_edited,
      coalesce(bool_or(p.visible), true) as visible
    from public.schools s
    left join public.stationery_packs p on p.school_id = s.id
    where (
      coalesce(trim(q), '') = ''
      or s.name ilike '%' || trim(q) || '%'
      or s.slug ilike '%' || trim(q) || '%'
    )
    group by s.id, s.name, s.slug, s.updated_at
  ),
  visible_filtered as (
    select *
    from filtered
    where (
      visible_filter is null
      or visible_filter = ''
      or (visible_filter = 'true' and visible)
      or (visible_filter = 'false' and not visible)
    )
  ),
  totals as (
    select
      count(*)::bigint as total_schools,
      coalesce(sum(grade_packs_count), 0)::bigint as total_grade_packs
    from visible_filtered
  )
  select
    vf.school_id,
    vf.school_name,
    vf.school_slug,
    vf.grade_packs_count,
    vf.last_edited,
    vf.visible,
    totals.total_schools,
    totals.total_grade_packs
  from visible_filtered vf
  cross join totals
  order by vf.school_name asc
  limit greatest(1, coalesce(page_size, 10000))
  offset greatest(0, coalesce(page_number, 1) - 1)
    * greatest(1, coalesce(page_size, 10000));
$$;


ALTER FUNCTION "public"."get_admin_pack_school_groups"("q" "text", "visible_filter" "text", "page_size" integer, "page_number" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_procurement_forecast"() RETURNS "jsonb"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  WITH item_demand AS (
    SELECT
      mp.id AS product_id,
      mp.sku,
      mp.name AS product_name,
      mp.category,
      mp.brand,
      COALESCE(mp.latest_verified_cost, 0)::numeric(10,2) AS unit_cost,
      mp.preferred_supplier_id,
      sup.name AS supplier_name,
      sup.contact_name AS supplier_contact,
      sup.email AS supplier_email,
      sup.lead_time_days,
      COALESCE(sum(spi.pack_quantity) FILTER (WHERE sp.visible = true), 0)::integer AS pack_composition_demand,
      COALESCE(sum(oi.quantity) FILTER (WHERE o.status IN ('paid', 'processing', 'packed')), 0)::integer AS order_demand
    FROM public.master_products mp
    LEFT JOIN public.suppliers sup ON sup.id = mp.preferred_supplier_id
    LEFT JOIN public.school_pack_items spi ON spi.product_id = mp.id AND spi.active = true
    LEFT JOIN public.school_packs sp ON sp.id = spi.pack_id
    LEFT JOIN public.order_items oi ON oi.product_id = mp.id
    LEFT JOIN public.orders o ON o.id = oi.order_id
    WHERE mp.active = true
    GROUP BY 
      mp.id, mp.sku, mp.name, mp.category, mp.brand, mp.latest_verified_cost, 
      mp.preferred_supplier_id, sup.name, sup.contact_name, sup.email, sup.lead_time_days
  ),
  supplier_summary AS (
    SELECT
      COALESCE(d.supplier_name, 'Unassigned Supplier') AS supplier_name,
      d.supplier_email,
      COALESCE(d.lead_time_days, 5) AS lead_time_days,
      count(DISTINCT d.product_id)::integer AS total_sku_count,
      sum(d.order_demand)::integer AS total_units_demanded,
      sum(d.order_demand * d.unit_cost)::numeric(12,2) AS estimated_procurement_cost
    FROM item_demand d
    GROUP BY d.supplier_name, d.supplier_email, d.lead_time_days
  )
  SELECT jsonb_build_object(
    'generated_at', NOW(),
    'supplier_breakdown', COALESCE(
      (SELECT jsonb_agg(to_jsonb(s)) FROM supplier_summary s),
      '[]'::jsonb
    ),
    'product_demands', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'product_id', d.product_id,
            'sku', d.sku,
            'name', d.product_name,
            'category', d.category,
            'brand', d.brand,
            'unit_cost', d.unit_cost,
            'supplier_name', COALESCE(d.supplier_name, 'Unassigned'),
            'order_demand_units', d.order_demand,
            'pack_capacity_units', d.pack_composition_demand,
            'estimated_total_cost', (d.order_demand * d.unit_cost)::numeric(12,2)
          )
          ORDER BY d.order_demand DESC, d.product_name ASC
        )
        FROM item_demand d
      ),
      '[]'::jsonb
    )
  );
$$;


ALTER FUNCTION "public"."get_admin_procurement_forecast"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_pack_school_groups_json"("q" "text" DEFAULT NULL::"text", "visible_filter" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  WITH pack_item_counts AS (
    SELECT
      p.id AS pack_id,
      p.school_id,
      p.visible,
      p.updated_at,
      count(spi.id)::bigint AS item_count
    FROM public.school_packs p
    LEFT JOIN public.school_pack_items spi ON spi.pack_id = p.id
    GROUP BY p.id, p.school_id, p.visible, p.updated_at
  ),
  school_pack_aggs AS (
    SELECT
      s.id AS school_id,
      s.name AS school_name,
      s.slug AS school_slug,
      s.updated_at AS school_updated_at,
      s.is_partner,
      s.refused_partnership,
      count(pic.pack_id)::bigint AS grade_packs_count,
      count(CASE WHEN pic.visible AND pic.item_count > 0 THEN 1 END)::bigint AS active_packs_with_items_count,
      coalesce(sum(CASE WHEN pic.visible THEN pic.item_count ELSE 0 END), 0)::bigint AS pack_items_count,
      greatest(
        coalesce(max(pic.updated_at), s.updated_at),
        coalesce(s.updated_at, max(pic.updated_at))
      ) AS last_edited,
      CASE
        WHEN coalesce(s.refused_partnership, false) THEN false
        WHEN count(pic.pack_id) > 0 THEN coalesce(bool_or(pic.visible), true)
        ELSE coalesce(s.is_partner, true)
      END AS visible
    FROM public.schools s
    LEFT JOIN pack_item_counts pic ON pic.school_id = s.id
    WHERE (
      coalesce(trim(q), '') = ''
      OR s.name ILIKE '%' || trim(q) || '%'
      OR s.slug ILIKE '%' || trim(q) || '%'
    )
    GROUP BY s.id, s.name, s.slug, s.updated_at, s.is_partner, s.refused_partnership
  ),
  visible_filtered AS (
    SELECT *
    FROM school_pack_aggs
    WHERE (
      visible_filter IS NULL
      OR visible_filter = ''
      OR (visible_filter = 'true' AND visible)
      OR (visible_filter = 'false' AND NOT visible)
    )
  ),
  totals AS (
    SELECT
      count(*)::bigint AS total_schools,
      coalesce(sum(grade_packs_count), 0)::bigint AS total_grade_packs,
      coalesce(sum(active_packs_with_items_count), 0)::bigint AS active_packs_count,
      coalesce(sum(pack_items_count), 0)::bigint AS total_pack_items
    FROM visible_filtered
  )
  SELECT jsonb_build_object(
    'total_schools', (SELECT total_schools FROM totals),
    'total_grade_packs', (SELECT total_grade_packs FROM totals),
    'active_packs_count', (SELECT active_packs_count FROM totals),
    'total_pack_items', (SELECT total_pack_items FROM totals),
    'schools', coalesce(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'school_id', vf.school_id,
            'school_name', vf.school_name,
            'school_slug', vf.school_slug,
            'grade_packs_count', vf.grade_packs_count,
            'active_packs_count', vf.active_packs_with_items_count,
            'pack_items_count', vf.pack_items_count,
            'last_edited', vf.last_edited,
            'visible', vf.visible
          )
          ORDER BY vf.school_name ASC
        )
        FROM visible_filtered vf
      ),
      '[]'::jsonb
    )
  );
$$;


ALTER FUNCTION "public"."get_all_pack_school_groups_json"("q" "text", "visible_filter" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_assets_size"() RETURNS TABLE("size_bytes" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select coalesce(sum(size_bytes), 0)::bigint
  from public.assets
$$;


ALTER FUNCTION "public"."get_assets_size"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_featured_public_schools"("result_limit" integer DEFAULT 4) RETURNS TABLE("id" "uuid", "name" "text", "slug" "text", "city" "text", "district" "text", "province" "text", "logo" "text", "is_partner" boolean, "is_featured" boolean, "lowest_price" numeric, "grades" "jsonb", "custom_badge" "text")
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select
    s.id,
    s.name,
    s.slug,
    s.city,
    s.district,
    s.province,
    s.logo,
    s.is_partner,
    s.is_featured,
    s.lowest_price,
    coalesce(s.grades, '[]'::jsonb),
    s.custom_badge
  from public.schools s
  where s.status = 'active'
    and s.published is not false
  order by s.is_featured desc, s.is_partner desc, s.name asc
  limit least(greatest(result_limit, 1), 12)
$$;


ALTER FUNCTION "public"."get_featured_public_schools"("result_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_order_pack_types"() RETURNS TABLE("pack_type" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select distinct pack_type
  from public.orders
  where pack_type is not null
    and pack_type <> ''
  order by pack_type
$$;


ALTER FUNCTION "public"."get_order_pack_types"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_orders_by_pack_type"() RETURNS TABLE("pack_type" "text", "order_count" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select coalesce(nullif(pack_type, ''), 'custom') as pack_type,
         count(*)::bigint as order_count
  from public.orders
  group by 1
  order by 2 desc
$$;


ALTER FUNCTION "public"."get_orders_by_pack_type"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_orders_daily"("from_date" "date", "to_date" "date") RETURNS TABLE("day" "date", "order_count" bigint, "revenue" numeric)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select date_trunc('day', created_at)::date as day,
         count(*)::bigint as order_count,
         coalesce(sum(case when status = 'paid' then estimated_total else 0 end), 0)::numeric as revenue
  from public.orders
  where created_at >= from_date
    and created_at < (to_date + interval '1 day')
  group by 1
  order by 1
$$;


ALTER FUNCTION "public"."get_orders_daily"("from_date" "date", "to_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_pack_subtotal"("pack_id" "uuid") RETURNS numeric
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $_$
  select coalesce(sum(quantity * unit_price) filter (where visible), 0)::numeric(10,2)
  from public.canonical_pack_items_view
  where pack_id = $1;
$_$;


ALTER FUNCTION "public"."get_pack_subtotal"("pack_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_payment_totals"("q" "text" DEFAULT NULL::"text", "status_filter" "text" DEFAULT NULL::"text", "from_ts" timestamp with time zone DEFAULT NULL::timestamp with time zone, "to_ts" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE("paid_count" bigint, "paid_total" numeric)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select
    count(*) filter (where o.status = 'paid')::bigint as paid_count,
    coalesce(sum(o.estimated_total) filter (where o.status = 'paid'), 0)::numeric as paid_total
  from public.orders o
  where (
    o.payment_gateway is not null
    or o.paid_at is not null
    or o.status in ('paid', 'pending_payment', 'payment_failed', 'refunded', 'layby_active')
  )
  and (
    coalesce(trim(q), '') = ''
    or o.order_reference ilike '%' || trim(q) || '%'
    or o.buyer_name ilike '%' || trim(q) || '%'
    or o.buyer_email ilike '%' || trim(q) || '%'
  )
  and (status_filter is null or status_filter = '' or o.status = status_filter)
  and (from_ts is null or o.created_at >= from_ts)
  and (to_ts is null or o.created_at <= to_ts);
$$;


ALTER FUNCTION "public"."get_payment_totals"("q" "text", "status_filter" "text", "from_ts" timestamp with time zone, "to_ts" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_public_cms_announcements"("p_location" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "badge_text" "text", "message" "text", "link_url" "text", "link_label" "text", "display_location" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT a.id, a.badge_text, a.message, a.link_url, a.link_label, a.display_location
  FROM public.cms_announcements a
  WHERE a.status = 'published'
    AND a.is_active = true
    AND a.published_at <= timezone('utc', now())
    AND (a.expires_at IS NULL OR a.expires_at > timezone('utc', now()))
    AND (
      p_location IS NULL
      OR p_location = 'all'
      OR (p_location = 'site_header' AND a.display_location IN ('global_top', 'hero_banner'))
      OR a.display_location = p_location
    )
  ORDER BY 
    CASE 
      WHEN p_location = 'site_header' AND a.display_location = 'global_top' THEN 1
      WHEN p_location = 'site_header' AND a.display_location = 'hero_banner' THEN 2
      ELSE 3
    END,
    a.updated_at DESC, a.created_at DESC
  LIMIT 1;
$$;


ALTER FUNCTION "public"."get_public_cms_announcements"("p_location" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_public_cms_faqs"("p_page" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "category" "text", "question" "text", "answer" "text", "sort_order" integer, "target_page" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT
    f.id,
    f.category,
    f.question,
    f.answer,
    COALESCE(f.sort_order, 0) AS sort_order,
    f.target_page
  FROM public.cms_faqs f
  WHERE f.status = 'published'
    AND f.is_published = true
    AND f.published_at <= timezone('utc', now())
    AND (f.expires_at IS NULL OR f.expires_at > timezone('utc', now()))
    AND (
      p_page IS NULL
      OR p_page = 'all'
      OR f.target_page = 'all'
      OR f.target_page = p_page
    )
  ORDER BY COALESCE(f.sort_order, 0), f.created_at;
$$;


ALTER FUNCTION "public"."get_public_cms_faqs"("p_page" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_public_cms_resources"() RETURNS TABLE("id" "uuid", "kind" "text", "title" "text", "description" "text", "category" "text", "file_url" "text", "file_type" "text", "file_size_label" "text", "download_count" integer, "slug" "text", "author" "text", "image" "text", "content" "jsonb", "published_at" timestamp with time zone, "sort_order" integer)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT
    r.id, r.kind, r.title, r.description, r.category, r.file_url, r.file_type,
    r.file_size_label, COALESCE(r.download_count, 0) AS download_count,
    r.slug, r.author, r.image, r.content, r.published_at, r.sort_order
  FROM public.cms_resources r
  WHERE r.status = 'published'
    AND r.is_public = true
    AND r.published_at <= timezone('utc', now())
    AND (r.expires_at IS NULL OR r.expires_at > timezone('utc', now()))
  ORDER BY COALESCE(r.sort_order, 0), r.created_at;
$$;


ALTER FUNCTION "public"."get_public_cms_resources"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_public_cms_testimonials"() RETURNS TABLE("id" "uuid", "author_name" "text", "author_role" "text", "school_name" "text", "quote" "text", "rating" integer, "avatar_url" "text", "school_id" "uuid")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT t.id, t.author_name, t.author_role, COALESCE(t.school_name, s.name) as school_name, t.quote, t.rating, t.avatar_url, t.school_id
  FROM public.cms_testimonials t
  LEFT JOIN public.schools s ON s.id = t.school_id
  WHERE t.status = 'published'
    AND t.is_featured = true
    AND t.published_at <= timezone('utc', now())
    AND (t.expires_at IS NULL OR t.expires_at > timezone('utc', now()))
  ORDER BY COALESCE(t.sort_order, 0), t.created_at;
$$;


ALTER FUNCTION "public"."get_public_cms_testimonials"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_public_featured_schools"("limit_count" integer DEFAULT 4) RETURNS TABLE("id" "uuid", "name" "text", "slug" "text", "city" "text", "district" "text", "province" "text", "logo" "text", "is_partner" boolean, "is_featured" boolean, "partnership" "text", "lowest_price" numeric, "grades" "jsonb", "custom_badge" "text", "canonical_pack_item_count" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  WITH candidates AS (
    SELECT
      s.id,
      s.name,
      s.slug,
      s.city,
      s.district,
      s.province,
      s.logo,
      s.is_partner,
      s.is_featured,
      s.partnership,
      s.lowest_price,
      s.grades,
      s.custom_badge,
      COALESCE(SUM(ps.item_count), 0)::bigint AS canonical_pack_item_count,
      CASE WHEN s.feature_status = 'featured' OR s.is_featured IS TRUE THEN 0 ELSE 1 END AS feature_rank,
      CASE WHEN s.partnership = 'partner' OR s.is_partner IS TRUE THEN 0 ELSE 1 END AS partner_rank
    FROM public.public_school_directory_view s
    LEFT JOIN public.pack_subtotals ps ON ps.school_id = s.id
    WHERE COALESCE(s.partnership, CASE WHEN s.is_partner IS TRUE THEN 'partner' ELSE 'non_partner' END) IN ('partner', 'non_partner')
    GROUP BY s.id, s.name, s.slug, s.city, s.district, s.province, s.logo, s.is_partner, s.is_featured,
      s.partnership, s.lowest_price, s.grades, s.custom_badge, s.feature_status
  )
  SELECT
    c.id,
    c.name,
    c.slug,
    c.city,
    c.district,
    c.province,
    c.logo,
    c.is_partner,
    c.is_featured,
    c.partnership,
    c.lowest_price,
    c.grades,
    c.custom_badge,
    c.canonical_pack_item_count
  FROM candidates c
  ORDER BY c.feature_rank, c.partner_rank, c.name
  LIMIT LEAST(GREATEST(COALESCE(limit_count, 4), 1), 24)
$$;


ALTER FUNCTION "public"."get_public_featured_schools"("limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_public_nearby_schools"("user_lat" double precision, "user_lng" double precision, "result_limit" integer DEFAULT 8) RETURNS TABLE("id" "uuid", "name" "text", "slug" "text", "city" "text", "district" "text", "province" "text", "logo" "text", "is_partner" boolean, "is_featured" boolean, "partnership" "text", "lowest_price" numeric, "grades" "jsonb", "custom_badge" "text", "latitude" double precision, "longitude" double precision, "canonical_pack_item_count" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  WITH candidates AS (
    SELECT
      s.id,
      s.name,
      s.slug,
      s.city,
      s.district,
      s.province,
      s.logo,
      s.is_partner,
      s.is_featured,
      s.partnership,
      s.lowest_price,
      s.grades,
      s.custom_badge,
      s.latitude::double precision AS latitude,
      s.longitude::double precision AS longitude,
      COALESCE(SUM(ps.item_count), 0)::bigint AS canonical_pack_item_count,
      6371 * 2 * asin(
        sqrt(
          power(sin(radians((s.latitude::double precision - user_lat) / 2)), 2) +
          cos(radians(user_lat)) * cos(radians(s.latitude::double precision)) *
          power(sin(radians((s.longitude::double precision - user_lng) / 2)), 2)
        )
      ) AS distance_km
    FROM public.public_school_directory_view s
    LEFT JOIN public.pack_subtotals ps ON ps.school_id = s.id
    WHERE s.latitude IS NOT NULL
      AND s.longitude IS NOT NULL
      AND COALESCE(s.partnership, CASE WHEN s.is_partner IS TRUE THEN 'partner' ELSE 'non_partner' END) IN ('partner', 'non_partner')
    GROUP BY s.id, s.name, s.slug, s.city, s.district, s.province, s.logo, s.is_partner, s.is_featured,
      s.partnership, s.lowest_price, s.grades, s.custom_badge, s.latitude, s.longitude
  )
  SELECT
    c.id,
    c.name,
    c.slug,
    c.city,
    c.district,
    c.province,
    c.logo,
    c.is_partner,
    c.is_featured,
    c.partnership,
    c.lowest_price,
    c.grades,
    c.custom_badge,
    c.latitude,
    c.longitude,
    c.canonical_pack_item_count
  FROM candidates c
  ORDER BY c.distance_km, c.name
  LIMIT LEAST(GREATEST(COALESCE(result_limit, 8), 1), 24)
$$;


ALTER FUNCTION "public"."get_public_nearby_schools"("user_lat" double precision, "user_lng" double precision, "result_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_public_school_pack"("school_slug" "text") RETURNS "jsonb"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT jsonb_build_object(
    'school', jsonb_build_object(
      'id', s.id,
      'name', s.name,
      'slug', s.slug,
      'city', s.city,
      'district', s.district,
      'province', s.province,
      'logo', s.logo,
      'is_partner', COALESCE(s.is_partner, false),
      'partnership', COALESCE(s.partnership, CASE WHEN s.is_partner IS TRUE THEN 'partner' WHEN s.refused_partnership IS TRUE THEN 'refused_partner' ELSE 'non_partner' END),
      'refused_partnership', COALESCE(s.partnership = 'refused_partner', s.refused_partnership, false),
      'is_featured', COALESCE(s.feature_status = 'featured', s.is_featured, false),
      'parent_collection_accepted', COALESCE(s.parent_collection_accepted, true),
      'principal', s.principal,
      'custom_badge', s.custom_badge,
      'stationery_list_status', COALESCE(s.stationery_list_status, 'verified')
    ),
    'packs', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'title', p.title,
            'slug', p.slug,
            'price', p.price,
            'description', p.description,
            'stock', p.stock,
            'sort_order', p.sort_order,
            'items', COALESCE(
              (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'id', i.id,
                    'pack_id', i.pack_id,
                    'name', i.name,
                    'quantity', i.quantity,
                    'unit_price', i.unit_price,
                    'icon', i.icon,
                    'description', i.description,
                    'specification', i.specification,
                    'category', i.category,
                    'requires_pexcover', COALESCE(i.requires_pexcover, false),
                    'pexco_code', i.pexco_code,
                    'pexco_rate_cents', i.pexco_rate_cents,
                    'pexco_rate_active', COALESCE(i.pexco_rate_active, false)
                  )
                  ORDER BY i.sort_order, i.name
                )
                FROM public.public_pack_items_view i
                WHERE i.pack_id = p.id
              ),
              '[]'::jsonb
            )
          )
          ORDER BY p.sort_order, p.title
        )
        FROM public.school_packs p
        WHERE p.school_id = s.id
          AND (
            p.publication_status = 'published'
            OR (p.publication_status IS NULL AND p.visible IS TRUE)
          )
      ),
      '[]'::jsonb
    )
  )
  FROM public.schools s
  WHERE s.slug = lower(trim(school_slug))
    AND (
      s.publication_status = 'published'
      OR (s.publication_status IS NULL AND s.published IS NOT FALSE AND s.status = 'active')
    )
  LIMIT 1
$$;


ALTER FUNCTION "public"."get_public_school_pack"("school_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_public_school_visibility"("school_slugs" "text"[] DEFAULT NULL::"text"[]) RETURNS TABLE("slug" "text", "parent_collection_accepted" boolean)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT
    s.slug,
    COALESCE(s.parent_collection_accepted, true) AS parent_collection_accepted
  FROM public.schools s
  WHERE (
      s.publication_status = 'published'
      OR (s.publication_status IS NULL AND s.published IS NOT FALSE AND s.status = 'active')
    )
    AND (
      school_slugs IS NULL
      OR cardinality(school_slugs) = 0
      OR s.slug = ANY(school_slugs)
    )
  ORDER BY s.slug
$$;


ALTER FUNCTION "public"."get_public_school_visibility"("school_slugs" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_revenue_total"() RETURNS TABLE("revenue" numeric)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select coalesce(sum(estimated_total), 0)::numeric
  from public.orders
  where status = 'paid'
    and estimated_total is not null
$$;


ALTER FUNCTION "public"."get_revenue_total"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_schools_by_city"() RETURNS TABLE("city" "text", "school_count" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select nullif(city, '') as city,
         count(*)::bigint as school_count
  from public.schools
  group by 1
  order by 2 desc
$$;


ALTER FUNCTION "public"."get_schools_by_city"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_schools_by_district"("target_district" "text", "limit_count" integer DEFAULT 6) RETURNS TABLE("id" "uuid", "name" "text", "slug" "text", "city" "text", "province" "text", "logo" "text", "is_partner" boolean, "is_featured" boolean, "lowest_price" numeric)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT
    s.id,
    s.name,
    s.slug,
    s.city,
    s.province,
    s.logo,
    s.is_partner,
    s.is_featured,
    s.lowest_price
  FROM public.schools s
  WHERE LOWER(s.city) ILIKE '%' || LOWER(target_district) || '%'
     OR LOWER(target_district) ILIKE '%' || LOWER(s.city) || '%'
  ORDER BY s.is_partner DESC, s.is_featured DESC, s.name
  LIMIT limit_count;
$$;


ALTER FUNCTION "public"."get_schools_by_district"("target_district" "text", "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_schools_near_user"("user_lat" double precision, "user_lng" double precision, "radius_meters" double precision DEFAULT 50000, "limit_count" integer DEFAULT 6) RETURNS TABLE("id" "uuid", "name" "text", "slug" "text", "city" "text", "province" "text", "logo" "text", "is_partner" boolean, "is_featured" boolean, "lowest_price" numeric, "distance_km" double precision)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT
    s.id,
    s.name,
    s.slug,
    s.city,
    s.province,
    s.logo,
    s.is_partner,
    s.is_featured,
    s.lowest_price,
    ROUND(
      (ST_Distance(
        s.location::geography,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
      ) / 1000.0)::numeric,
      1
    )::double precision AS distance_km
  FROM public.schools s
  WHERE s.location IS NOT NULL
    AND ST_DWithin(
      s.location::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY distance_km
  LIMIT limit_count;
$$;


ALTER FUNCTION "public"."get_schools_near_user"("user_lat" double precision, "user_lng" double precision, "radius_meters" double precision, "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."grant_role"("target_user_id" "uuid", "role_slug" "text", "granted_by" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare v_role_id uuid;
begin
  select id into v_role_id from public.roles where slug = role_slug;
  if v_role_id is null then
    raise exception 'Unknown role: %', role_slug;
  end if;
  insert into public.user_roles (user_id, role_id, created_by)
  values (target_user_id, v_role_id, granted_by)
  on conflict (user_id, role_id) do nothing;
  update auth.users set raw_app_meta_data =
    raw_app_meta_data || jsonb_build_object('roles',
      coalesce(raw_app_meta_data -> 'roles', '[]'::jsonb) || jsonb_build_array(role_slug))
  where id = target_user_id;
end;
$$;


ALTER FUNCTION "public"."grant_role"("target_user_id" "uuid", "role_slug" "text", "granted_by" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_permission"("p_key" "text") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select case
    when exists (
      select 1 from public.user_permissions up
      join public.permissions p on p.id = up.permission_id
      where up.user_id = auth.uid() and p.key = p_key
    ) then coalesce((
      select up.granted from public.user_permissions up
      join public.permissions p on p.id = up.permission_id
      where up.user_id = auth.uid() and p.key = p_key
      limit 1
    ), false)
    else exists (
      select 1 from public.user_roles ur
      join public.role_permissions rp on rp.role_id = ur.role_id
      join public.permissions p on p.id = rp.permission_id
      where ur.user_id = auth.uid() and p.key = p_key
    )
  end
$$;


ALTER FUNCTION "public"."has_permission"("p_key" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  RETURN (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'role'),
      ''
    ) = 'admin'
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_staff"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT (COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') IN ('admin', 'staff'))
      OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
$$;


ALTER FUNCTION "public"."is_staff"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."items_set_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B');
  return new;
end;
$$;


ALTER FUNCTION "public"."items_set_search_vector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."maintain_master_products_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF TG_OP = 'INSERT'
     OR OLD.sku IS DISTINCT FROM NEW.sku
     OR OLD.name IS DISTINCT FROM NEW.name
     OR OLD.brand IS DISTINCT FROM NEW.brand
     OR OLD.category IS DISTINCT FROM NEW.category
     OR OLD.description IS DISTINCT FROM NEW.description
     OR OLD.specification IS DISTINCT FROM NEW.specification THEN
    NEW.search_vector :=
      setweight(to_tsvector('simple', COALESCE(NEW.sku, '')), 'A') ||
      setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'A') ||
      setweight(to_tsvector('simple', COALESCE(NEW.brand, '')), 'B') ||
      setweight(to_tsvector('simple', COALESCE(NEW.category, '')), 'B') ||
      setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'C') ||
      setweight(to_tsvector('simple', COALESCE(NEW.specification, '')), 'C');
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at := now();
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."maintain_master_products_search_vector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."maintain_orders_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."maintain_orders_search_vector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."maintain_quotation_item_totals"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."maintain_quotation_item_totals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."maintain_quotations_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."maintain_quotations_search_vector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."maintain_school_packs_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."maintain_school_packs_search_vector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."master_products_search_vector_set"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  new.search_vector := to_tsvector('english', concat_ws(' ', new.sku, new.name, new.description, new.category, new.brand, new.specification));
  new.updated_at := now();
  return new;
end;
$$;


ALTER FUNCTION "public"."master_products_search_vector_set"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."next_quotation_number"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_year text := to_char(CURRENT_DATE, 'YYYY');
  v_next_val bigint;
BEGIN
  v_next_val := nextval('public.quotation_number_seq');
  RETURN 'PX-Q-' || v_year || '-' || lpad(v_next_val::text, 4, '0');
END;
$$;


ALTER FUNCTION "public"."next_quotation_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."packs_set_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.academic_year, '')), 'B');
  return new;
end;
$$;


ALTER FUNCTION "public"."packs_set_search_vector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."publish_school_pack"("p_pack_id" "uuid", "p_user_id" "uuid" DEFAULT NULL::"uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_validation jsonb;
  v_new_version integer;
BEGIN
  -- Perform deterministic readiness validation
  v_validation := public.validate_pack_for_publication(p_pack_id);

  IF (v_validation->>'is_ready')::boolean IS NOT TRUE THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Publication validation failed.',
      'reasons', v_validation->'reasons'
    );
  END IF;

  -- Atomic transition to published
  UPDATE public.school_packs
  SET 
    publication_status = 'published',
    visible = true,
    published_at = timezone('utc'::text, now()),
    published_by = coalesce(p_user_id, auth.uid()),
    version = coalesce(version, 0) + 1,
    updated_at = timezone('utc'::text, now())
  WHERE id = p_pack_id
  RETURNING version INTO v_new_version;

  RETURN jsonb_build_object(
    'success', true,
    'pack_id', p_pack_id,
    'version', v_new_version,
    'publication_status', 'published'
  );
END;
$$;


ALTER FUNCTION "public"."publish_school_pack"("p_pack_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recalculate_all_grade_pack_prices"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "statement_timeout" TO '60s'
    AS $$
DECLARE
  v_total integer := 0;
  v_ready integer := 0;
  v_incomplete integer := 0;
BEGIN
  WITH settings AS (
    SELECT
      ROUND(
        GREATEST(LEAST(
          COALESCE(NULLIF(TRIM(BOTH '"' FROM MAX(value::text) FILTER (WHERE key = 'pricing.target_margin_pct')), '')::numeric, 49.9),
          99.99), 0.01
        ) / 100.0, 4
      ) AS margin_rate,
      COALESCE(NULLIF(TRIM(BOTH '"' FROM MAX(value::text) FILTER (WHERE key = 'pricing.packaging_cost')), '')::numeric, 0) AS packaging_cost,
      COALESCE(NULLIF(TRIM(BOTH '"' FROM MAX(value::text) FILTER (WHERE key = 'pricing.assembly_cost')), '')::numeric, 0) AS assembly_cost,
      COALESCE(NULLIF(TRIM(BOTH '"' FROM MAX(value::text) FILTER (WHERE key = 'pricing.freight_cost')), '')::numeric, 0) AS freight_cost
    FROM public.system_settings
    WHERE key IN ('pricing.target_margin_pct','pricing.packaging_cost','pricing.assembly_cost','pricing.freight_cost')
  ),
  pack_item_costs AS (
    SELECT
      spi.pack_id,
      COALESCE(SUM(
        COALESCE(spi.selling_price_override, mp.current_selling_price, mp.calculated_selling_price, 0) * COALESCE(spi.pack_quantity, 1)
      ), 0)::numeric(12,2) AS items_cost,
      COUNT(*) FILTER (
        WHERE COALESCE(spi.selling_price_override, mp.current_selling_price, mp.calculated_selling_price, 0) <= 0
      ) AS missing_cost_count
    FROM public.school_pack_items spi
    JOIN public.master_products mp ON mp.id = spi.product_id
    WHERE spi.active = true AND mp.active = true
    GROUP BY spi.pack_id
  ),
  calculated AS (
    SELECT
      sp.id AS pack_id,
      COALESCE(pic.items_cost, 0) AS items_cost,
      s.packaging_cost,
      s.assembly_cost,
      s.freight_cost,
      0::numeric AS other_cost,
      COALESCE(pic.items_cost, 0) + s.packaging_cost + s.assembly_cost + s.freight_cost AS total_landed_cost,
      s.margin_rate,
      CASE
        WHEN COALESCE(pic.items_cost, 0) > 0
        THEN ROUND((COALESCE(pic.items_cost, 0) / (1.0 - s.margin_rate)) + s.packaging_cost + s.assembly_cost + s.freight_cost, 2)
        ELSE 0
      END AS calculated_price,
      CASE WHEN COALESCE(pic.missing_cost_count, 0) > 0 THEN 'incomplete' ELSE 'ready' END AS pricing_status
    FROM public.school_packs sp
    CROSS JOIN settings s
    LEFT JOIN pack_item_costs pic ON pic.pack_id = sp.id
  ),
  updated AS (
    UPDATE public.school_packs sp
    SET
      items_cost = c.items_cost,
      packaging_cost = c.packaging_cost,
      assembly_cost = c.assembly_cost,
      freight_cost = c.freight_cost,
      other_cost = c.other_cost,
      total_landed_cost = c.total_landed_cost,
      margin_rate_used = c.margin_rate,
      calculated_selling_price = c.calculated_price,
      price = c.calculated_price,
      pricing_status = c.pricing_status,
      last_price_calculated_at = now(),
      updated_at = now()
    FROM calculated c
    WHERE sp.id = c.pack_id
      AND (
        sp.calculated_selling_price IS DISTINCT FROM c.calculated_price
        OR sp.price IS DISTINCT FROM c.calculated_price
        OR sp.items_cost IS DISTINCT FROM c.items_cost
        OR sp.total_landed_cost IS DISTINCT FROM c.total_landed_cost
        OR sp.margin_rate_used IS DISTINCT FROM c.margin_rate
        OR sp.pricing_status IS DISTINCT FROM c.pricing_status
      )
    RETURNING sp.id, c.pricing_status
  )
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE pricing_status = 'ready'),
    COUNT(*) FILTER (WHERE pricing_status != 'ready')
  INTO v_total, v_ready, v_incomplete
  FROM updated;

  RETURN jsonb_build_object(
    'total_packs_evaluated', v_total,
    'successfully_recalculated', v_ready,
    'incomplete_pricing', v_incomplete,
    'timestamp', now()
  );
END;
$$;


ALTER FUNCTION "public"."recalculate_all_grade_pack_prices"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recalculate_dashboard_summaries"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  UPDATE public.dashboard_summaries
  SET
    paid_orders_count = (SELECT COUNT(*) FROM public.orders WHERE status = 'paid'),
    total_revenue = COALESCE((SELECT SUM(estimated_total) FROM public.orders WHERE status = 'paid'), 0.00),
    ready_to_pack_count = (SELECT COUNT(*) FROM public.orders WHERE status IN ('paid', 'packing')),
    orders_at_risk_count = (SELECT COUNT(*) FROM public.orders WHERE status = 'cancelled'),
    last_updated_at = NOW()
  WHERE id = 'global';
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."recalculate_dashboard_summaries"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recalculate_grade_pack_price"("p_pack_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_result jsonb;
  v_calculated_price numeric;
  v_items_cost numeric;
  v_packaging_cost numeric;
  v_assembly_cost numeric;
  v_freight_cost numeric;
  v_other_cost numeric;
  v_total_landed_cost numeric;
  v_margin_rate numeric;
  v_pricing_status text;
BEGIN
  IF p_pack_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Prevent trigger recursion
  IF pg_trigger_depth() > 2 THEN
    RETURN NULL;
  END IF;

  v_result := public.calculate_grade_pack_price(p_pack_id);
  
  v_calculated_price := (v_result->>'calculated_selling_price')::numeric;
  v_items_cost := (v_result->>'items_cost')::numeric;
  v_packaging_cost := (v_result->>'packaging_cost')::numeric;
  v_assembly_cost := (v_result->>'assembly_cost')::numeric;
  v_freight_cost := (v_result->>'freight_cost')::numeric;
  v_other_cost := (v_result->>'other_cost')::numeric;
  v_total_landed_cost := (v_result->>'total_landed_cost')::numeric;
  v_margin_rate := (v_result->>'margin_rate_used')::numeric;
  v_pricing_status := (v_result->>'pricing_status');

  UPDATE public.school_packs
  SET
    price = v_calculated_price,
    items_cost = v_items_cost,
    packaging_cost = v_packaging_cost,
    assembly_cost = v_assembly_cost,
    freight_cost = v_freight_cost,
    other_cost = v_other_cost,
    total_landed_cost = v_total_landed_cost,
    margin_rate_used = v_margin_rate,
    calculated_selling_price = v_calculated_price,
    pricing_status = v_pricing_status,
    last_price_calculated_at = now(),
    updated_at = now()
  WHERE id = p_pack_id;

  RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."recalculate_grade_pack_price"("p_pack_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recalculate_quotation_totals"("p_quotation_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."recalculate_quotation_totals"("p_quotation_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recalculate_quotation_totals_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."recalculate_quotation_totals_trigger"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_order_payment_status"("p_order_reference" "text", "p_gateway_reference" "text", "p_status" "text", "p_amount" numeric, "p_currency" "text" DEFAULT 'ZAR'::"text", "p_payload" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare v_order public.orders%rowtype; v_event_key text; v_order_status text;
begin
  select * into v_order from public.orders where order_reference = p_order_reference for update;
  if not found then raise exception 'Order % was not found', p_order_reference using errcode = 'P0002'; end if;
  if v_order.status = 'paid' then return jsonb_build_object('success', true, 'ignored', true); end if;
  v_event_key := coalesce(nullif(p_gateway_reference, ''), p_order_reference) || ':' || lower(p_status);
  insert into public.payment_events(order_id,provider,payment_method,gateway_reference,event_key,status,amount,currency,payload,processed_at)
  values(v_order.id,'ozow','Ozow',p_gateway_reference,v_event_key,p_status,p_amount,upper(coalesce(p_currency,'ZAR')),coalesce(p_payload,'{}'::jsonb),now())
  on conflict(provider,event_key) do nothing;
  v_order_status := case
    when lower(p_status) in ('cancelled','abandoned') then 'cancelled'
    when lower(p_status) in ('pending','pendinginvestigation') then 'pending_payment'
    else 'payment_failed'
  end;
  update public.orders set status = v_order_status, gateway_reference = coalesce(p_gateway_reference,gateway_reference), metadata = coalesce(metadata,'{}'::jsonb) || coalesce(p_payload,'{}'::jsonb)
  where id = v_order.id and status in ('pending','pending_payment','payment_failed','cancelled');
  insert into public.operational_events(event_key,event_type,entity_type,entity_id,data)
  values('payment-status:' || v_event_key,'payment.' || lower(p_status),'order',v_order.id::text,jsonb_build_object('status',p_status))
  on conflict(event_key) do nothing;
  return jsonb_build_object('success', true, 'ignored', false, 'order_status', v_order_status);
end;
$$;


ALTER FUNCTION "public"."record_order_payment_status"("p_order_reference" "text", "p_gateway_reference" "text", "p_status" "text", "p_amount" numeric, "p_currency" "text", "p_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_admin_operational_summaries"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.admin_quote_pipeline_mv;
  REFRESH MATERIALIZED VIEW public.admin_product_margin_mv;
  REFRESH MATERIALIZED VIEW public.admin_school_pack_health_mv;
  REFRESH MATERIALIZED VIEW public.admin_supplier_demand_mv;
END;
$$;


ALTER FUNCTION "public"."refresh_admin_operational_summaries"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_all_dashboard_summaries"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."refresh_all_dashboard_summaries"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."revoke_role"("target_user_id" "uuid", "role_slug" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare v_role_id uuid;
begin
  select id into v_role_id from public.roles where slug = role_slug;
  if v_role_id is not null then
    delete from public.user_roles where user_id = target_user_id and role_id = v_role_id;
  end if;
  update auth.users set raw_app_meta_data =
    raw_app_meta_data || jsonb_build_object('roles',
      coalesce(raw_app_meta_data -> 'roles', '[]'::jsonb) - role_slug)
  where id = target_user_id;
end;
$$;


ALTER FUNCTION "public"."revoke_role"("target_user_id" "uuid", "role_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."run_admin_data_quality_audit"() RETURNS TABLE("area" "text", "issue" "text", "issue_count" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select area, issue, issue_count
  from public.admin_data_quality_issues_view
  order by area, issue;
$$;


ALTER FUNCTION "public"."run_admin_data_quality_audit"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."run_admin_data_quality_audit"() IS 'Runs operational data quality audit across canonical and legacy tables. Should be executed after bulk imports and before production releases.';



CREATE OR REPLACE FUNCTION "public"."school_search_query"("input" "text") RETURNS "tsquery"
    LANGUAGE "sql" IMMUTABLE
    SET "search_path" TO 'public'
    AS $$
  select to_tsquery(
    'english',
    coalesce(
      nullif(
        string_agg(quote_literal(token) || ':*', ' & '),
        ''
      ),
      quote_literal('__no_school_search_match__')
    )
  )
  from regexp_split_to_table(lower(trim(coalesce(input, ''))), E'\\s+') as token
  where token ~ '[a-z0-9]'
$$;


ALTER FUNCTION "public"."school_search_query"("input" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."schools_set_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  new.search_vector := to_tsvector('english',
    coalesce(new.name, '') || ' ' ||
    coalesce(new.city, '') || ' ' ||
    coalesce(new.province, '') || ' ' ||
    coalesce(new.district, ''));
  return new;
end;
$$;


ALTER FUNCTION "public"."schools_set_search_vector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."schools_set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;


ALTER FUNCTION "public"."schools_set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_public_schools"("search_query" "text" DEFAULT ''::"text", "grade_filter" "text" DEFAULT ''::"text", "phase_filter" "text" DEFAULT ''::"text", "region_filter" "text" DEFAULT ''::"text", "result_limit" integer DEFAULT 12, "result_offset" integer DEFAULT 0) RETURNS TABLE("id" "uuid", "name" "text", "slug" "text", "city" "text", "district" "text", "province" "text", "logo" "text", "is_partner" boolean, "is_featured" boolean, "lowest_price" numeric, "grades" "jsonb", "custom_badge" "text", "total_count" bigint)
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_clean_q text := TRIM(COALESCE(search_query, ''));
  v_tsquery tsquery := NULL;
  v_clean_grade text := LOWER(TRIM(COALESCE(grade_filter, '')));
  v_clean_region text := LOWER(TRIM(COALESCE(region_filter, '')));
  v_limit integer := LEAST(GREATEST(result_limit, 1), 24);
  v_offset integer := GREATEST(result_offset, 0);
BEGIN
  IF v_clean_q <> '' THEN
    v_tsquery := public.school_search_query(v_clean_q);
  END IF;

  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.slug,
    s.city,
    s.district,
    s.province,
    s.logo,
    (COALESCE(s.partnership = 'partner', s.is_partner, false)) AS is_partner,
    (COALESCE(s.feature_status = 'featured', s.is_featured, false)) AS is_featured,
    s.lowest_price,
    COALESCE(s.grades, '[]'::jsonb),
    s.custom_badge,
    COUNT(*) OVER () AS total_count
  FROM public.schools s
  WHERE s.publication_status = 'published'
    AND (v_tsquery IS NULL OR s.search_vector @@ v_tsquery)
    AND (
      v_clean_grade = ''
      OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(COALESCE(s.grades, '[]'::jsonb)) grade
        WHERE LOWER(grade ->> 'grade') = v_clean_grade
      )
    )
    AND (
      v_clean_region = ''
      OR LOWER(COALESCE(s.city, '')) = v_clean_region
      OR LOWER(COALESCE(s.province, '')) = v_clean_region
      OR LOWER(COALESCE(s.district, '')) = v_clean_region
    )
    AND (
      phase_filter IS NULL OR phase_filter = ''
      OR (
        phase_filter = 'pre-schools'
        AND LOWER(s.name) ~ '(creche|pre-school|preschool|pre school|nursery|playschool|play school|early childhood|kindergarten|ecd)'
      )
      OR (
        phase_filter = 'primary-schools'
        AND EXISTS (
          SELECT 1
          FROM jsonb_array_elements(COALESCE(s.grades, '[]'::jsonb)) grade
          WHERE LOWER(grade ->> 'grade') IN (
            'grade r', 'grade 1', 'grade 2', 'grade 3',
            'grade 4', 'grade 5', 'grade 6', 'grade 7'
          )
        )
      )
      OR (
        phase_filter = 'high-schools'
        AND EXISTS (
          SELECT 1
          FROM jsonb_array_elements(COALESCE(s.grades, '[]'::jsonb)) grade
          WHERE LOWER(grade ->> 'grade') IN (
            'grade 8', 'grade 9', 'grade 10', 'grade 11', 'grade 12'
          )
        )
      )
    )
  ORDER BY
    CASE
      WHEN v_tsquery IS NULL THEN 0
      ELSE ts_rank_cd(s.search_vector, v_tsquery)
    END DESC,
    (COALESCE(s.feature_status = 'featured', s.is_featured, false)) DESC,
    (COALESCE(s.partnership = 'partner', s.is_partner, false)) DESC,
    s.name ASC
  LIMIT v_limit
  OFFSET v_offset;
END;
$$;


ALTER FUNCTION "public"."search_public_schools"("search_query" "text", "grade_filter" "text", "phase_filter" "text", "region_filter" "text", "result_limit" integer, "result_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_user_as_admin"("target_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  update auth.users
  set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', 'admin')
  where id = target_user_id;
end;
$$;


ALTER FUNCTION "public"."set_user_as_admin"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_user_permission"("target_user_id" "uuid", "permission_key" "text", "granted" boolean, "granted_by" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare v_permission_id uuid;
begin
  select id into v_permission_id from public.permissions where key = permission_key;
  if v_permission_id is null then
    raise exception 'Unknown permission: %', permission_key;
  end if;
  insert into public.user_permissions (user_id, permission_id, granted, created_by)
  values (target_user_id, v_permission_id, granted, granted_by)
  on conflict (user_id, permission_id)
  do update set granted = excluded.granted, created_by = excluded.created_by,
                created_at = timezone('utc'::text, now());
end;
$$;


ALTER FUNCTION "public"."set_user_permission"("target_user_id" "uuid", "permission_key" "text", "granted" boolean, "granted_by" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_school_status_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- When canonical fields are present, keep legacy flags synchronized
  NEW.is_partner := (NEW.partnership = 'partner');
  NEW.refused_partnership := (NEW.partnership = 'refused_partner');
  NEW.is_featured := (NEW.feature_status = 'featured');
  NEW.published := (NEW.publication_status = 'published');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_school_status_fields"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_dashboard_summary_on_order"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.dashboard_summaries (
      id, total_orders, paid_orders, pending_orders, total_revenue, last_updated_at
    )
    VALUES (
      'global',
      1,
      CASE WHEN NEW.status = 'paid' THEN 1 ELSE 0 END,
      CASE WHEN NEW.status = 'pending' THEN 1 ELSE 0 END,
      CASE WHEN NEW.status = 'paid' AND NEW.estimated_total IS NOT NULL THEN NEW.estimated_total ELSE 0.00 END,
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      total_orders = dashboard_summaries.total_orders + 1,
      paid_orders = dashboard_summaries.paid_orders + (CASE WHEN NEW.status = 'paid' THEN 1 ELSE 0 END),
      pending_orders = dashboard_summaries.pending_orders + (CASE WHEN NEW.status = 'pending' THEN 1 ELSE 0 END),
      total_revenue = dashboard_summaries.total_revenue + (CASE WHEN NEW.status = 'paid' AND NEW.estimated_total IS NOT NULL THEN NEW.estimated_total ELSE 0.00 END),
      last_updated_at = NOW();

  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.status <> NEW.status) THEN
      UPDATE public.dashboard_summaries
      SET 
        pending_orders = GREATEST(0, pending_orders + (CASE WHEN NEW.status = 'pending' THEN 1 ELSE 0 END) - (CASE WHEN OLD.status = 'pending' THEN 1 ELSE 0 END)),
        paid_orders = paid_orders + (CASE WHEN NEW.status = 'paid' THEN 1 ELSE 0 END) - (CASE WHEN OLD.status = 'paid' THEN 1 ELSE 0 END),
        total_revenue = GREATEST(0.00, total_revenue + (CASE WHEN NEW.status = 'paid' AND NEW.estimated_total IS NOT NULL THEN NEW.estimated_total ELSE 0.00 END) - (CASE WHEN OLD.status = 'paid' AND OLD.estimated_total IS NOT NULL THEN OLD.estimated_total ELSE 0.00 END)),
        last_updated_at = NOW()
      WHERE id = 'global';
    END IF;

  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.dashboard_summaries
    SET 
      total_orders = GREATEST(0, total_orders - 1),
      paid_orders = CASE WHEN OLD.status = 'paid' THEN GREATEST(0, paid_orders - 1) ELSE paid_orders END,
      pending_orders = CASE WHEN OLD.status = 'pending' THEN GREATEST(0, pending_orders - 1) ELSE pending_orders END,
      total_revenue = CASE WHEN OLD.status = 'paid' AND OLD.estimated_total IS NOT NULL THEN GREATEST(0.00, total_revenue - OLD.estimated_total) ELSE total_revenue END,
      last_updated_at = NOW()
    WHERE id = 'global';
  END IF;

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_dashboard_summary_on_order"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_pack_for_publication"("p_pack_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."validate_pack_for_publication"("p_pack_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."master_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sku" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category" "text",
    "brand" "text",
    "unit" "text",
    "packaging" "text",
    "specification" "text",
    "visibility" "text" DEFAULT 'internal'::"text" NOT NULL,
    "availability" "text" DEFAULT 'unverified'::"text" NOT NULL,
    "calculated_selling_price" numeric(12,2),
    "selling_price_override" numeric(12,2),
    "current_selling_price" numeric(12,2) DEFAULT 0 NOT NULL,
    "latest_verified_cost" numeric(12,2),
    "target_markup" numeric(8,4),
    "target_margin" numeric(8,4),
    "pricing_status" "text" DEFAULT 'unpriced'::"text" NOT NULL,
    "preferred_supplier_id" "uuid",
    "last_verified_at" timestamp with time zone,
    "active" boolean DEFAULT true NOT NULL,
    "search_vector" "tsvector",
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "icon" "text",
    "requires_pexcover" boolean DEFAULT false NOT NULL,
    "pexco_code" "text",
    CONSTRAINT "chk_master_products_availability_valid" CHECK (("availability" = ANY (ARRAY['available'::"text", 'low_stock'::"text", 'out_of_stock'::"text", 'discontinued'::"text", 'unverified'::"text"]))),
    CONSTRAINT "chk_master_products_cost_positive" CHECK ((("latest_verified_cost" IS NULL) OR ("latest_verified_cost" >= (0)::numeric))),
    CONSTRAINT "chk_master_products_selling_price_positive" CHECK (("current_selling_price" >= (0)::numeric)),
    CONSTRAINT "master_products_availability_check" CHECK (("availability" = ANY (ARRAY['available'::"text", 'limited'::"text", 'unavailable'::"text", 'unverified'::"text"]))),
    CONSTRAINT "master_products_pricing_status_check" CHECK (("pricing_status" = ANY (ARRAY['unpriced'::"text", 'current'::"text", 'stale'::"text", 'review'::"text", 'approved'::"text"]))),
    CONSTRAINT "master_products_visibility_check" CHECK (("visibility" = ANY (ARRAY['internal'::"text", 'public'::"text", 'hidden'::"text"])))
);


ALTER TABLE "public"."master_products" OWNER TO "postgres";


COMMENT ON TABLE "public"."master_products" IS 'Canonical stationery product catalogue. One row per real product or SKU.';



CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid",
    "pack_id" "uuid",
    "sku_snapshot" "text" NOT NULL,
    "product_name_snapshot" "text" NOT NULL,
    "description_snapshot" "text",
    "quantity" integer NOT NULL,
    "unit_selling_price" numeric(12,2) NOT NULL,
    "line_total" numeric(12,2) GENERATED ALWAYS AS ((("quantity")::numeric * "unit_selling_price")) STORED,
    "estimated_unit_cost" numeric(12,2),
    "expected_margin" numeric(8,4),
    "pricing_version" "text",
    "school_name_snapshot" "text",
    "grade_snapshot" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "order_items_quantity_check" CHECK (("quantity" > 0)),
    CONSTRAINT "order_items_unit_selling_price_check" CHECK (("unit_selling_price" >= (0)::numeric))
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "order_reference" "text" NOT NULL,
    "buyer_name" "text" NOT NULL,
    "buyer_email" "text" NOT NULL,
    "buyer_phone" "text" NOT NULL,
    "preferred_contact_method" "text" DEFAULT 'WhatsApp'::"text",
    "school_name" "text" NOT NULL,
    "learner_name" "text",
    "grade" "text" NOT NULL,
    "delivery_type" "text" DEFAULT 'School collection'::"text",
    "items" "jsonb",
    "pexcover_addon" boolean DEFAULT false,
    "estimated_total" numeric(10,2) NOT NULL,
    "status" "text" DEFAULT 'pending_payment'::"text" NOT NULL,
    "pack_type" "text",
    "payment_reference" "text",
    "payment_gateway" "text" DEFAULT 'ozow'::"text",
    "paid_at" timestamp with time zone,
    "delivery_address" "jsonb",
    "street_address" "text",
    "suburb" "text",
    "city" "text",
    "province" "text",
    "postal_code" "text",
    "school_slug" "text",
    "fulfilment_option" "text",
    "metadata" "jsonb",
    "pexcover_requested" boolean DEFAULT false NOT NULL,
    "consent" boolean DEFAULT false NOT NULL,
    "submission_id" "uuid",
    "removed_items" "jsonb",
    "gateway_reference" "text",
    "pexcover_data" "jsonb",
    "sibling_group_id" "text",
    "unique_customer_id" "text",
    "tracking_token" "text",
    "courier_name" "text",
    "waybill_number" "text",
    "estimated_delivery" timestamp with time zone,
    "idempotency_key" "text",
    "customer_id" "uuid",
    "learner_id" "uuid",
    "season_id" "uuid" DEFAULT "public"."current_operational_season_id"(),
    "commercial_snapshot_locked_at" timestamp with time zone,
    "search_vector" "tsvector",
    "receipt_email_sent_at" timestamp with time zone,
    "receipt_email_processing_at" timestamp with time zone,
    "receipt_email_claim_token" "uuid",
    "receipt_email_last_error" "text",
    CONSTRAINT "chk_orders_status_valid" CHECK (("status" = ANY (ARRAY['draft'::"text", 'pending_payment'::"text", 'paid'::"text", 'processing'::"text", 'packed'::"text", 'dispatched'::"text", 'delivered'::"text", 'cancelled'::"text", 'refunded'::"text", 'on_hold'::"text"])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


COMMENT ON COLUMN "public"."orders"."items" IS 'Legacy order item summary. Business logic should use order_items/order_line_summary_view.';



CREATE TABLE IF NOT EXISTS "public"."school_pack_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pack_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "pack_quantity" integer DEFAULT 1 NOT NULL,
    "school_wording" "text",
    "prescribed_brand" "text",
    "substitution_policy" "text" DEFAULT 'approval_required'::"text" NOT NULL,
    "school_notes" "text",
    "selling_price_override" numeric(12,2),
    "sort_order" integer DEFAULT 0 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_school_pack_items_override_positive" CHECK ((("selling_price_override" IS NULL) OR ("selling_price_override" >= (0)::numeric))),
    CONSTRAINT "chk_school_pack_items_quantity_positive" CHECK (("pack_quantity" > 0)),
    CONSTRAINT "school_pack_items_pack_quantity_check" CHECK (("pack_quantity" > 0)),
    CONSTRAINT "school_pack_items_substitution_policy_check" CHECK (("substitution_policy" = ANY (ARRAY['allowed'::"text", 'approval_required'::"text", 'not_allowed'::"text"])))
);


ALTER TABLE "public"."school_pack_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."school_pack_items" IS 'Canonical school-pack composition table linking stationery_packs to master_products.';



CREATE TABLE IF NOT EXISTS "public"."school_packs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "school_id" "uuid",
    "title" "text" NOT NULL,
    "slug" "text",
    "description" "text",
    "price" numeric DEFAULT 0 NOT NULL,
    "stock" integer DEFAULT 0 NOT NULL,
    "featured" boolean DEFAULT false NOT NULL,
    "visible" boolean DEFAULT true NOT NULL,
    "academic_year" "text",
    "delivery_type" "text" DEFAULT 'School collection'::"text" NOT NULL,
    "pack_image" "text",
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "search_vector" "tsvector",
    "season_id" "uuid",
    "list_version" integer DEFAULT 1 NOT NULL,
    "pricing_status" "text" DEFAULT 'canonical'::"text" NOT NULL,
    "fulfilment_deadline" "date",
    "publication_status" character varying(32) DEFAULT 'published'::character varying,
    "published_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "published_by" "uuid",
    "version" integer DEFAULT 1,
    "items_cost" numeric(12,2) DEFAULT 0 NOT NULL,
    "packaging_cost" numeric(12,2) DEFAULT 0 NOT NULL,
    "assembly_cost" numeric(12,2) DEFAULT 0 NOT NULL,
    "freight_cost" numeric(12,2) DEFAULT 0 NOT NULL,
    "other_cost" numeric(12,2) DEFAULT 0 NOT NULL,
    "total_landed_cost" numeric(12,2) DEFAULT 0 NOT NULL,
    "margin_rate_used" numeric(5,4) DEFAULT 0.4990 NOT NULL,
    "calculated_selling_price" numeric(12,2) DEFAULT 0 NOT NULL,
    "last_price_calculated_at" timestamp with time zone,
    CONSTRAINT "chk_school_packs_price_positive" CHECK (("price" >= (0)::numeric)),
    CONSTRAINT "school_packs_publication_status_check" CHECK ((("publication_status")::"text" = ANY ((ARRAY['draft'::character varying, 'ready_for_review'::character varying, 'published'::character varying, 'archived'::character varying])::"text"[]))),
    CONSTRAINT "school_packs_version_check" CHECK (("version" >= 1))
);


ALTER TABLE "public"."school_packs" OWNER TO "postgres";


COMMENT ON TABLE "public"."school_packs" IS 'Canonical school-pack header table. Replaces legacy stationery_packs for active app reads and writes.';



CREATE TABLE IF NOT EXISTS "public"."schools" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text",
    "city" "text",
    "province" "text",
    "district" "text",
    "address" "text",
    "email" "text",
    "telephone" "text",
    "principal" "text",
    "description" "text",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "partner_since" "date",
    "latitude" double precision,
    "longitude" double precision,
    "published" boolean DEFAULT true NOT NULL,
    "logo" "text",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "is_partner" boolean DEFAULT false NOT NULL,
    "is_featured" boolean DEFAULT false NOT NULL,
    "lowest_price" numeric,
    "grades" "jsonb",
    "search_vector" "tsvector",
    "lat" double precision,
    "lng" double precision,
    "location" "extensions"."geometry"(Point,4326),
    "custom_badge" "text" DEFAULT '2026 Packs'::"text",
    "parent_collection_accepted" boolean DEFAULT false NOT NULL,
    "refused_partnership" boolean DEFAULT false NOT NULL,
    "publication_status" character varying(32) DEFAULT 'published'::character varying,
    "directory_status" character varying(32) DEFAULT 'listed'::character varying,
    "stationery_list_status" character varying(32) DEFAULT 'verified'::character varying,
    "partnership" character varying(32) DEFAULT 'non_partner'::character varying,
    "feature_status" character varying(32) DEFAULT 'unfeatured'::character varying,
    CONSTRAINT "chk_schools_status_valid" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'archived'::"text", 'pending_verification'::"text"]))),
    CONSTRAINT "schools_directory_status_check" CHECK ((("directory_status")::"text" = ANY ((ARRAY['listed'::character varying, 'hidden'::character varying, 'archived'::character varying])::"text"[]))),
    CONSTRAINT "schools_feature_status_check" CHECK ((("feature_status")::"text" = ANY ((ARRAY['featured'::character varying, 'unfeatured'::character varying])::"text"[]))),
    CONSTRAINT "schools_partnership_check" CHECK ((("partnership")::"text" = ANY ((ARRAY['partner'::character varying, 'non_partner'::character varying, 'refused_partner'::character varying])::"text"[]))),
    CONSTRAINT "schools_publication_status_check" CHECK ((("publication_status")::"text" = ANY ((ARRAY['published'::character varying, 'ready_for_review'::character varying])::"text"[]))),
    CONSTRAINT "schools_stationery_list_status_check" CHECK ((("stationery_list_status")::"text" = ANY ((ARRAY['not_received'::character varying, 'received'::character varying, 'being_digitised'::character varying, 'verified'::character varying])::"text"[])))
);


ALTER TABLE "public"."schools" OWNER TO "postgres";


COMMENT ON COLUMN "public"."schools"."parent_collection_accepted" IS 'Whether parents may collect stationery for this school.';



CREATE OR REPLACE VIEW "public"."admin_data_quality_issues_view" WITH ("security_invoker"='true') AS
 SELECT 'schools'::"text" AS "area",
    'missing_name_or_slug'::"text" AS "issue",
    "count"(*) AS "issue_count"
   FROM "public"."schools"
  WHERE ((NULLIF(TRIM(BOTH FROM "schools"."name"), ''::"text") IS NULL) OR (NULLIF(TRIM(BOTH FROM "schools"."slug"), ''::"text") IS NULL))
UNION ALL
 SELECT 'schools'::"text" AS "area",
    'duplicate_slug'::"text" AS "issue",
    "count"(*) AS "issue_count"
   FROM ( SELECT "lower"("schools"."slug") AS "lower"
           FROM "public"."schools"
          WHERE ("schools"."slug" IS NOT NULL)
          GROUP BY ("lower"("schools"."slug"))
         HAVING ("count"(*) > 1)) "d"
UNION ALL
 SELECT 'packs'::"text" AS "area",
    'missing_title_or_slug'::"text" AS "issue",
    "count"(*) AS "issue_count"
   FROM "public"."school_packs"
  WHERE ((NULLIF(TRIM(BOTH FROM "school_packs"."title"), ''::"text") IS NULL) OR (NULLIF(TRIM(BOTH FROM "school_packs"."slug"), ''::"text") IS NULL))
UNION ALL
 SELECT 'packs'::"text" AS "area",
    'negative_price'::"text" AS "issue",
    "count"(*) AS "issue_count"
   FROM "public"."school_packs"
  WHERE ("school_packs"."price" < (0)::numeric)
UNION ALL
 SELECT 'products'::"text" AS "area",
    'missing_sku_or_name'::"text" AS "issue",
    "count"(*) AS "issue_count"
   FROM "public"."master_products"
  WHERE ((NULLIF(TRIM(BOTH FROM "master_products"."sku"), ''::"text") IS NULL) OR (NULLIF(TRIM(BOTH FROM "master_products"."name"), ''::"text") IS NULL))
UNION ALL
 SELECT 'products'::"text" AS "area",
    'duplicate_sku'::"text" AS "issue",
    "count"(*) AS "issue_count"
   FROM ( SELECT "upper"("master_products"."sku") AS "upper"
           FROM "public"."master_products"
          WHERE ("master_products"."sku" IS NOT NULL)
          GROUP BY ("upper"("master_products"."sku"))
         HAVING ("count"(*) > 1)) "d"
UNION ALL
 SELECT 'products'::"text" AS "area",
    'negative_price'::"text" AS "issue",
    "count"(*) AS "issue_count"
   FROM "public"."master_products"
  WHERE ("master_products"."current_selling_price" < (0)::numeric)
UNION ALL
 SELECT 'pack_composition'::"text" AS "area",
    'missing_pack_or_product_reference'::"text" AS "issue",
    "count"(*) AS "issue_count"
   FROM (("public"."school_pack_items" "spi"
     LEFT JOIN "public"."school_packs" "p" ON (("p"."id" = "spi"."pack_id")))
     LEFT JOIN "public"."master_products" "mp" ON (("mp"."id" = "spi"."product_id")))
  WHERE (("p"."id" IS NULL) OR ("mp"."id" IS NULL))
UNION ALL
 SELECT 'pack_composition'::"text" AS "area",
    'bad_quantity_or_price'::"text" AS "issue",
    "count"(*) AS "issue_count"
   FROM "public"."school_pack_items"
  WHERE (("school_pack_items"."pack_quantity" <= 0) OR (COALESCE("school_pack_items"."selling_price_override", (0)::numeric) < (0)::numeric))
UNION ALL
 SELECT 'orders'::"text" AS "area",
    'orders_without_order_items'::"text" AS "issue",
    "count"(*) AS "issue_count"
   FROM "public"."orders" "o"
  WHERE (NOT (EXISTS ( SELECT 1
           FROM "public"."order_items" "oi"
          WHERE ("oi"."order_id" = "o"."id"))))
UNION ALL
 SELECT 'orders'::"text" AS "area",
    'bad_order_item_quantity_or_total'::"text" AS "issue",
    "count"(*) AS "issue_count"
   FROM "public"."order_items"
  WHERE (("order_items"."quantity" <= 0) OR ("order_items"."unit_selling_price" < (0)::numeric) OR ("order_items"."line_total" < (0)::numeric));


ALTER VIEW "public"."admin_data_quality_issues_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_letter_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "body_markdown" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."admin_letter_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_letters" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reference_number" "text" NOT NULL,
    "school_id" "uuid",
    "quotation_id" "uuid",
    "recipient_type" "text" NOT NULL,
    "recipient_organization" "text" NOT NULL,
    "recipient_title" "text",
    "recipient_name" "text" NOT NULL,
    "recipient_email" "text" NOT NULL,
    "recipient_country" "text" DEFAULT 'South Africa'::"text",
    "recipient_address" "text",
    "subject" "text" NOT NULL,
    "body_markdown" "text" NOT NULL,
    "include_quotation" boolean DEFAULT false,
    "quotation_data" "jsonb" DEFAULT '{}'::"jsonb",
    "signatory_name" "text" DEFAULT 'Mcebisi Hlatshwayo'::"text" NOT NULL,
    "signatory_title" "text" DEFAULT 'Managing Director'::"text" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "last_emailed_at" timestamp with time zone,
    "pdf_storage_path" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    CONSTRAINT "admin_letters_recipient_type_check" CHECK (("recipient_type" = ANY (ARRAY['registered_school'::"text", 'private_client'::"text"]))),
    CONSTRAINT "admin_letters_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'generated'::"text", 'emailed'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."admin_letters" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pexco_rates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "covering_price_cents" integer NOT NULL,
    "cost_price_cents" integer,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by" "uuid",
    CONSTRAINT "pexco_rates_cost_price_cents_check" CHECK (("cost_price_cents" >= 0)),
    CONSTRAINT "pexco_rates_covering_price_cents_check" CHECK (("covering_price_cents" >= 0))
);


ALTER TABLE "public"."pexco_rates" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."canonical_pack_items_view" AS
 SELECT "spi"."id",
    "spi"."pack_id",
    "spi"."product_id",
    COALESCE(NULLIF("spi"."school_wording", ''::"text"), "mp"."name") AS "name",
    COALESCE("spi"."pack_quantity", 1) AS "quantity",
    (COALESCE("spi"."selling_price_override", "mp"."current_selling_price", (0)::numeric))::numeric(12,2) AS "unit_price",
    COALESCE(NULLIF("mp"."icon", ''::"text"), 'box'::"text") AS "icon",
    COALESCE(NULLIF("spi"."school_notes", ''::"text"), "mp"."description") AS "description",
    COALESCE("mp"."specification", "mp"."packaging", "mp"."unit") AS "specification",
    "mp"."category",
    "mp"."sku",
    "mp"."brand",
    "mp"."availability",
    "spi"."substitution_policy",
    COALESCE("spi"."sort_order", 0) AS "sort_order",
    "spi"."active" AS "visible",
    'canonical'::"text" AS "source",
    COALESCE("mp"."requires_pexcover", false) AS "requires_pexcover",
    "mp"."pexco_code",
    "pr"."title" AS "pexco_title",
    "pr"."covering_price_cents" AS "pexco_rate_cents",
    COALESCE("pr"."is_active", false) AS "pexco_rate_active"
   FROM (("public"."school_pack_items" "spi"
     JOIN "public"."master_products" "mp" ON (("mp"."id" = "spi"."product_id")))
     LEFT JOIN "public"."pexco_rates" "pr" ON (("pr"."code" = "mp"."pexco_code")));


ALTER VIEW "public"."canonical_pack_items_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."admin_pack_items_view" AS
 SELECT "id",
    "pack_id",
    "product_id",
    "name",
    "quantity",
    "unit_price",
    "icon",
    "description",
    "specification",
    "category",
    "sku",
    "brand",
    "availability",
    "substitution_policy",
    "sort_order",
    "visible",
    "source",
    "requires_pexcover",
    "pexco_code",
    "pexco_title",
    "pexco_rate_cents",
    "pexco_rate_active"
   FROM "public"."canonical_pack_items_view" "c";


ALTER VIEW "public"."admin_pack_items_view" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "public"."admin_product_margin_mv" AS
 SELECT "id",
    "sku",
    "name",
    "category",
    "brand",
    "current_selling_price" AS "selling_price",
    (COALESCE("latest_verified_cost", (0)::numeric))::numeric(12,2) AS "estimated_cost",
        CASE
            WHEN ("current_selling_price" > (0)::numeric) THEN "round"(((("current_selling_price" - COALESCE("latest_verified_cost", (0)::numeric)) / "current_selling_price") * (100)::numeric), 2)
            ELSE (0)::numeric
        END AS "gross_margin_percent",
    "availability",
    "pricing_status",
    "updated_at"
   FROM "public"."master_products" "mp"
  WHERE ("active" = true)
  WITH NO DATA;


ALTER MATERIALIZED VIEW "public"."admin_product_margin_mv" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quotations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "quote_number" character varying(32) NOT NULL,
    "school_id" "uuid",
    "recipient_name" "text" NOT NULL,
    "recipient_email" "text" NOT NULL,
    "recipient_phone" "text",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "subtotal" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "vat_rate" numeric(5,2) DEFAULT 15.00 NOT NULL,
    "vat_amount" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "total_amount" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "valid_until" "date" DEFAULT (CURRENT_DATE + '30 days'::interval) NOT NULL,
    "notes" "text",
    "pdf_storage_path" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "discount_amount" numeric DEFAULT 0 NOT NULL,
    "delivery_fee" numeric DEFAULT 0 NOT NULL,
    "vat_enabled" boolean DEFAULT true NOT NULL,
    "pdf_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "pdf_generated_at" timestamp with time zone,
    "pdf_version" integer DEFAULT 1 NOT NULL,
    "converted_order_id" "uuid",
    "search_vector" "tsvector",
    "created_by" "uuid",
    CONSTRAINT "chk_quotations_pdf_status_valid" CHECK (("pdf_status" = ANY (ARRAY['pending'::"text", 'generated'::"text", 'failed'::"text"]))),
    CONSTRAINT "chk_quotations_status_valid" CHECK (("status" = ANY (ARRAY['draft'::"text", 'sent'::"text", 'viewed'::"text", 'accepted'::"text", 'declined'::"text", 'expired'::"text", 'converted_to_order'::"text"])))
);


ALTER TABLE "public"."quotations" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "public"."admin_quote_pipeline_mv" AS
 SELECT ("date_trunc"('month'::"text", "created_at"))::"date" AS "month",
    "status",
    "count"(*) AS "quotes_count",
    (COALESCE("sum"("total_amount"), (0)::numeric))::numeric(12,2) AS "total_value",
    (COALESCE("avg"("total_amount"), (0)::numeric))::numeric(12,2) AS "avg_value"
   FROM "public"."quotations"
  GROUP BY (("date_trunc"('month'::"text", "created_at"))::"date"), "status"
  WITH NO DATA;


ALTER MATERIALIZED VIEW "public"."admin_quote_pipeline_mv" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "public"."admin_school_pack_health_mv" AS
 SELECT "sp"."id" AS "pack_id",
    "sp"."title",
    "sp"."slug",
    "sp"."school_id",
    "s"."name" AS "school_name",
    "sp"."visible",
    "sp"."price",
    ("count"("spi"."id") FILTER (WHERE ("spi"."active" = true)))::integer AS "active_items",
    ("count"("spi"."id") FILTER (WHERE (("spi"."active" = true) AND ("mp"."id" IS NULL))))::integer AS "missing_products",
    ("count"("spi"."id") FILTER (WHERE (("spi"."active" = true) AND ("mp"."visibility" <> 'public'::"text"))))::integer AS "hidden_products",
    (COALESCE("sum"((("spi"."pack_quantity")::numeric * "mp"."current_selling_price")) FILTER (WHERE ("spi"."active" = true)), (0)::numeric))::numeric(12,2) AS "item_subtotal"
   FROM ((("public"."school_packs" "sp"
     LEFT JOIN "public"."schools" "s" ON (("s"."id" = "sp"."school_id")))
     LEFT JOIN "public"."school_pack_items" "spi" ON (("spi"."pack_id" = "sp"."id")))
     LEFT JOIN "public"."master_products" "mp" ON (("mp"."id" = "spi"."product_id")))
  GROUP BY "sp"."id", "sp"."title", "sp"."slug", "sp"."school_id", "s"."name", "sp"."visible", "sp"."price"
  WITH NO DATA;


ALTER MATERIALIZED VIEW "public"."admin_school_pack_health_mv" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."suppliers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "contact_name" "text",
    "email" "text",
    "telephone" "text",
    "address" "text",
    "payment_terms" "text",
    "lead_time_days" integer,
    "active" boolean DEFAULT true NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."suppliers" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "public"."admin_supplier_demand_mv" AS
 SELECT "mp"."preferred_supplier_id" AS "supplier_id",
    "s"."name" AS "supplier_name",
    ("count"(DISTINCT "mp"."id"))::integer AS "products_count",
    (COALESCE("sum"("oi"."quantity"), (0)::bigint))::integer AS "ordered_units",
    (COALESCE("sum"("oi"."line_total"), (0)::numeric))::numeric(12,2) AS "ordered_value",
    (COALESCE("sum"("oi"."expected_margin"), (0)::numeric))::numeric(12,2) AS "expected_margin"
   FROM (("public"."master_products" "mp"
     LEFT JOIN "public"."suppliers" "s" ON (("s"."id" = "mp"."preferred_supplier_id")))
     LEFT JOIN "public"."order_items" "oi" ON (("oi"."product_id" = "mp"."id")))
  GROUP BY "mp"."preferred_supplier_id", "s"."name"
  WITH NO DATA;


ALTER MATERIALIZED VIEW "public"."admin_supplier_demand_mv" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."approvals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "text" NOT NULL,
    "approval_type" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "requested_by" "uuid",
    "decided_by" "uuid",
    "reason" "text",
    "decision_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "decided_at" timestamp with time zone,
    CONSTRAINT "approvals_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."approvals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "bucket" "text" DEFAULT 'school-assets'::"text" NOT NULL,
    "folder" "text" DEFAULT 'misc'::"text" NOT NULL,
    "path" "text" NOT NULL,
    "public_url" "text",
    "mime_type" "text",
    "size_bytes" bigint DEFAULT 0 NOT NULL,
    "width" integer,
    "height" integer,
    "alt_text" "text",
    "uploaded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."assigned_forms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "form_key" "text" NOT NULL,
    "label" "text" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."assigned_forms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "actor_id" "uuid",
    "actor_name" "text",
    "action" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "text",
    "summary" "text" NOT NULL,
    "details" "jsonb",
    "ip" "text",
    "user_agent" "text"
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs_archive" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "actor_id" "uuid",
    "actor_name" "text",
    "action" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "text",
    "summary" "text" NOT NULL,
    "details" "jsonb",
    "ip" "text",
    "user_agent" "text",
    "archived_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."audit_logs_archive" OWNER TO "postgres";


ALTER TABLE "public"."audit_logs" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."audit_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."auth_otp_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "otp_code" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "used" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."auth_otp_tokens" OWNER TO "postgres";


COMMENT ON TABLE "public"."auth_otp_tokens" IS 'Stores 6-digit administrative 2FA security tokens for physical email OTP verification.';



CREATE TABLE IF NOT EXISTS "public"."blog_posts" (
    "id" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "excerpt" "text",
    "content" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "author" "text",
    "category" "text",
    "image" "text",
    "published" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."blog_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."brand_package_claims" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "submission_id" "uuid",
    "business_name" "text" NOT NULL,
    "applicant_name" "text" NOT NULL,
    "phone" "text",
    "email" "text",
    "website" "text",
    "business_description" "text",
    "branding_preferences" "text",
    "existing_branding" "text",
    "target_audience" "text",
    "deadline" "date",
    "notes" "text",
    "consent" boolean DEFAULT false NOT NULL,
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."brand_package_claims" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cms_announcements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "badge_text" "text" NOT NULL,
    "message" "text" NOT NULL,
    "link_url" "text",
    "link_label" "text",
    "is_active" boolean DEFAULT true,
    "display_location" "text" DEFAULT 'global_top'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "status" "text" DEFAULT 'published'::"text" NOT NULL,
    "published_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "expires_at" timestamp with time zone,
    "updated_by" "uuid",
    CONSTRAINT "cms_announcements_display_location_check" CHECK (("display_location" = ANY (ARRAY['global_top'::"text", 'hero_banner'::"text", 'schools_page'::"text"]))),
    CONSTRAINT "cms_announcements_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."cms_announcements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cms_faqs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category" "text" DEFAULT 'General'::"text" NOT NULL,
    "question" "text" NOT NULL,
    "answer" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "is_published" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "status" "text" DEFAULT 'published'::"text" NOT NULL,
    "published_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "expires_at" timestamp with time zone,
    "updated_by" "uuid",
    "target_page" "text" DEFAULT 'all'::"text" NOT NULL,
    CONSTRAINT "cms_faqs_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"]))),
    CONSTRAINT "cms_faqs_target_page_check" CHECK (("target_page" = ANY (ARRAY['all'::"text", 'homepage'::"text", 'schools'::"text", 'track_order'::"text", 'happy_pay'::"text", 'add_your_school'::"text", 'partnership'::"text"])))
);


ALTER TABLE "public"."cms_faqs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cms_resources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "category" "text" DEFAULT 'Parent Guides'::"text" NOT NULL,
    "file_url" "text",
    "file_type" "text" DEFAULT 'PDF'::"text",
    "file_size_label" "text",
    "download_count" integer DEFAULT 0,
    "is_public" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "status" "text" DEFAULT 'published'::"text" NOT NULL,
    "published_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "expires_at" timestamp with time zone,
    "updated_by" "uuid",
    "kind" "text" DEFAULT 'file'::"text" NOT NULL,
    "slug" "text",
    "author" "text",
    "image" "text",
    "content" "jsonb",
    "featured" boolean DEFAULT false NOT NULL,
    CONSTRAINT "cms_resources_kind_check" CHECK (("kind" = ANY (ARRAY['file'::"text", 'article'::"text"]))),
    CONSTRAINT "cms_resources_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."cms_resources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cms_testimonials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_name" "text" NOT NULL,
    "author_role" "text" NOT NULL,
    "school_id" "uuid",
    "quote" "text" NOT NULL,
    "rating" integer DEFAULT 5,
    "avatar_url" "text",
    "is_featured" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "status" "text" DEFAULT 'published'::"text" NOT NULL,
    "published_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "expires_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_by" "uuid",
    "school_name" "text",
    CONSTRAINT "cms_testimonials_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5))),
    CONSTRAINT "cms_testimonials_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."cms_testimonials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text",
    "phone" "text",
    "full_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dashboard_summaries" (
    "id" "text" DEFAULT 'global'::"text" NOT NULL,
    "total_orders" integer DEFAULT 0 NOT NULL,
    "paid_orders" integer DEFAULT 0 NOT NULL,
    "pending_orders" integer DEFAULT 0 NOT NULL,
    "total_revenue" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "total_schools" integer DEFAULT 0 NOT NULL,
    "total_packs" integer DEFAULT 0 NOT NULL,
    "last_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "orders_today" integer DEFAULT 0 NOT NULL,
    "orders_this_week" integer DEFAULT 0 NOT NULL,
    "awaiting_fulfilment" integer DEFAULT 0 NOT NULL,
    "completed_orders" integer DEFAULT 0 NOT NULL,
    "active_packs" integer DEFAULT 0 NOT NULL,
    "paid_orders_count" integer DEFAULT 0 NOT NULL,
    "procurement_outstanding" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "ready_to_pack_count" integer DEFAULT 0 NOT NULL,
    "orders_at_risk_count" integer DEFAULT 0 NOT NULL,
    "procurement_coverage_pct" numeric(5,2) DEFAULT 0.00 NOT NULL
);


ALTER TABLE "public"."dashboard_summaries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."faqs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "question" "text" NOT NULL,
    "answer" "text" NOT NULL,
    "category" "text" DEFAULT 'general'::"text" NOT NULL,
    "visible" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "updated_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "slug" "text",
    "links" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL
);


ALTER TABLE "public"."faqs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."form_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "form_type" "text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "data" "jsonb",
    "source_url" "text",
    "user_agent" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."form_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fulfilment_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "method" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "target_date" "date",
    "school_open_day" "date",
    "courier_name" "text",
    "waybill_number" "text",
    "completed_at" timestamp with time zone,
    "notes" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "fulfilment_records_method_check" CHECK (("method" = ANY (ARRAY['school_collection'::"text", 'collection_point'::"text", 'delivery'::"text"]))),
    CONSTRAINT "fulfilment_records_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'scheduled'::"text", 'ready'::"text", 'dispatched'::"text", 'collected'::"text", 'delivered'::"text", 'failed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."fulfilment_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."learners" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "school_id" "uuid",
    "full_name" "text" NOT NULL,
    "grade" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."learners" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."legacy_write_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "table_name" "text" NOT NULL,
    "operation" "text" NOT NULL,
    "record_id" "text",
    "payload" "jsonb",
    "written_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "written_by" "uuid" DEFAULT "auth"."uid"()
);


ALTER TABLE "public"."legacy_write_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "permission_key" "text",
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text",
    "entity_type" "text",
    "entity_id" "text",
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."operational_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_key" "text",
    "event_type" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "text" NOT NULL,
    "actor_id" "uuid",
    "data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."operational_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."operational_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "entity_type" "text",
    "entity_id" "text",
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "priority" "text" DEFAULT 'normal'::"text" NOT NULL,
    "assigned_to" "uuid",
    "due_at" timestamp with time zone,
    "created_by" "uuid",
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "operational_tasks_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text", 'urgent'::"text"]))),
    CONSTRAINT "operational_tasks_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'in_progress'::"text", 'blocked'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."operational_tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "actor_id" "uuid",
    "actor_email" "text",
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."order_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_events_archive" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "actor_id" "uuid",
    "actor_email" "text",
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "archived_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."order_events_archive" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."order_line_summary_view" WITH ("security_invoker"='true') AS
 SELECT "oi"."id" AS "order_item_id",
    "oi"."order_id",
    "o"."order_reference",
    "o"."status" AS "order_status",
    "o"."created_at" AS "order_created_at",
    "o"."paid_at",
    "oi"."product_id",
    "oi"."pack_id",
    COALESCE("mp"."sku", "oi"."sku_snapshot") AS "sku",
    "oi"."product_name_snapshot" AS "product_name",
    "oi"."description_snapshot" AS "description",
    "oi"."quantity",
    "oi"."unit_selling_price",
    "oi"."line_total",
    "oi"."estimated_unit_cost",
    "oi"."expected_margin",
    "oi"."school_name_snapshot",
    "oi"."grade_snapshot"
   FROM (("public"."order_items" "oi"
     JOIN "public"."orders" "o" ON (("o"."id" = "oi"."order_id")))
     LEFT JOIN "public"."master_products" "mp" ON (("mp"."id" = "oi"."product_id")));


ALTER VIEW "public"."order_line_summary_view" OWNER TO "postgres";


COMMENT ON VIEW "public"."order_line_summary_view" IS 'Canonical order-line reporting view. orders.items is treated as legacy display/cache summary only.';



CREATE TABLE IF NOT EXISTS "public"."order_product_allocations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_item_id" "uuid" NOT NULL,
    "purchase_item_id" "uuid",
    "quantity" integer NOT NULL,
    "allocated_by" "uuid",
    "allocated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "order_product_allocations_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."order_product_allocations" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."order_readiness_view" WITH ("security_invoker"='true') AS
 SELECT "o"."id" AS "order_id",
    "o"."order_reference",
    "o"."status" AS "order_status",
    "count"("oi"."id") AS "line_count",
    COALESCE("sum"("oi"."quantity"), (0)::bigint) AS "required_units",
    COALESCE("sum"(LEAST(("oi"."quantity")::bigint, COALESCE("a"."allocated_quantity", (0)::bigint))), (0)::numeric) AS "allocated_units",
        CASE
            WHEN (COALESCE("sum"("oi"."quantity"), (0)::bigint) = 0) THEN (0)::numeric
            ELSE "round"(((COALESCE("sum"(LEAST(("oi"."quantity")::bigint, COALESCE("a"."allocated_quantity", (0)::bigint))), (0)::numeric) / ("sum"("oi"."quantity"))::numeric) * (100)::numeric), 1)
        END AS "readiness_percent"
   FROM (("public"."orders" "o"
     LEFT JOIN "public"."order_items" "oi" ON (("oi"."order_id" = "o"."id")))
     LEFT JOIN ( SELECT "order_product_allocations"."order_item_id",
            "sum"("order_product_allocations"."quantity") AS "allocated_quantity"
           FROM "public"."order_product_allocations"
          GROUP BY "order_product_allocations"."order_item_id") "a" ON (("a"."order_item_id" = "oi"."id")))
  GROUP BY "o"."id", "o"."order_reference", "o"."status";


ALTER VIEW "public"."order_readiness_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pack_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pack_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "actor_id" "uuid",
    "actor_email" "text",
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."pack_events" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."pack_subtotals" WITH ("security_invoker"='true') AS
 SELECT "sp"."school_id",
    ("count"("spi"."id"))::integer AS "item_count"
   FROM ("public"."school_packs" "sp"
     LEFT JOIN "public"."school_pack_items" "spi" ON ((("spi"."pack_id" = "sp"."id") AND ("spi"."active" = true))))
  GROUP BY "sp"."school_id";


ALTER VIEW "public"."pack_subtotals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."packing_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'not_ready'::"text" NOT NULL,
    "started_by" "uuid",
    "checked_by" "uuid",
    "started_at" timestamp with time zone,
    "checked_at" timestamp with time zone,
    "packed_at" timestamp with time zone,
    "notes" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "packing_records_status_check" CHECK (("status" = ANY (ARRAY['not_ready'::"text", 'ready'::"text", 'packing'::"text", 'quality_check'::"text", 'packed'::"text", 'exception'::"text"])))
);


ALTER TABLE "public"."packing_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "provider" "text" DEFAULT 'ozow'::"text" NOT NULL,
    "payment_method" "text" DEFAULT 'Ozow'::"text" NOT NULL,
    "gateway_reference" "text",
    "event_key" "text" NOT NULL,
    "status" "text" NOT NULL,
    "amount" numeric(12,2),
    "currency" "text" DEFAULT 'ZAR'::"text" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "processed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."payment_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_reference" "text",
    "gateway_reference" "text",
    "amount" numeric(10,2),
    "currency" "text" DEFAULT 'ZAR'::"text",
    "payment_gateway" "text" DEFAULT 'ozow'::"text",
    "status" "text" DEFAULT 'Complete'::"text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."price_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "supplier_id" "uuid",
    "previous_cost" numeric(12,2),
    "new_cost" numeric(12,2),
    "previous_selling_price" numeric(12,2),
    "new_selling_price" numeric(12,2),
    "previous_margin" numeric(8,4),
    "new_margin" numeric(8,4),
    "reason" "text",
    "source" "text",
    "changed_by" "uuid",
    "approved_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."price_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pricing_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "scope" "text" NOT NULL,
    "scope_value" "text",
    "method" "text" NOT NULL,
    "rate" numeric(8,4) NOT NULL,
    "rounding_increment" numeric(8,2) DEFAULT 0.01 NOT NULL,
    "priority" integer DEFAULT 100 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "pricing_rules_method_check" CHECK (("method" = ANY (ARRAY['markup'::"text", 'margin'::"text"]))),
    CONSTRAINT "pricing_rules_rate_check" CHECK ((("rate" >= (0)::numeric) AND ("rate" < (1)::numeric))),
    CONSTRAINT "pricing_rules_rounding_increment_check" CHECK (("rounding_increment" > (0)::numeric)),
    CONSTRAINT "pricing_rules_scope_check" CHECK (("scope" = ANY (ARRAY['global'::"text", 'category'::"text", 'brand'::"text", 'product'::"text"])))
);


ALTER TABLE "public"."pricing_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."procurement_requirements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "season_id" "uuid" DEFAULT "public"."current_operational_season_id"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "required_quantity" integer DEFAULT 0 NOT NULL,
    "requested_quantity" integer DEFAULT 0 NOT NULL,
    "supplier_confirmed_quantity" integer DEFAULT 0 NOT NULL,
    "secured_quantity" integer DEFAULT 0 NOT NULL,
    "received_quantity" integer DEFAULT 0 NOT NULL,
    "allocated_quantity" integer DEFAULT 0 NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "procurement_requirements_allocated_quantity_check" CHECK (("allocated_quantity" >= 0)),
    CONSTRAINT "procurement_requirements_received_quantity_check" CHECK (("received_quantity" >= 0)),
    CONSTRAINT "procurement_requirements_requested_quantity_check" CHECK (("requested_quantity" >= 0)),
    CONSTRAINT "procurement_requirements_required_quantity_check" CHECK (("required_quantity" >= 0)),
    CONSTRAINT "procurement_requirements_secured_quantity_check" CHECK (("secured_quantity" >= 0)),
    CONSTRAINT "procurement_requirements_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'requested'::"text", 'partially_secured'::"text", 'secured'::"text", 'closed'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "procurement_requirements_supplier_confirmed_quantity_check" CHECK (("supplier_confirmed_quantity" >= 0))
);


ALTER TABLE "public"."procurement_requirements" OWNER TO "postgres";


COMMENT ON TABLE "public"."procurement_requirements" IS 'Committed demand created only from fully paid orders.';



COMMENT ON COLUMN "public"."procurement_requirements"."secured_quantity" IS 'Purchased or otherwise secured quantity; not speculative warehouse stock.';



CREATE OR REPLACE VIEW "public"."procurement_command_view" WITH ("security_invoker"='true') AS
 SELECT "pr"."id",
    "pr"."season_id",
    "pr"."product_id",
    "mp"."sku",
    "mp"."name" AS "product_name",
    "mp"."category",
    "pr"."required_quantity",
    "pr"."requested_quantity",
    "pr"."supplier_confirmed_quantity",
    "pr"."secured_quantity",
    "pr"."received_quantity",
    "pr"."allocated_quantity",
    GREATEST(("pr"."required_quantity" - "pr"."secured_quantity"), 0) AS "outstanding_quantity",
        CASE
            WHEN ("pr"."required_quantity" = 0) THEN (100)::numeric
            ELSE "round"((((LEAST("pr"."secured_quantity", "pr"."required_quantity"))::numeric / ("pr"."required_quantity")::numeric) * (100)::numeric), 1)
        END AS "procurement_coverage_percent",
    "pr"."status",
    "pr"."updated_at"
   FROM ("public"."procurement_requirements" "pr"
     JOIN "public"."master_products" "mp" ON (("mp"."id" = "pr"."product_id")));


ALTER VIEW "public"."procurement_command_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."procurement_requirement_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "requirement_id" "uuid" NOT NULL,
    "order_id" "uuid" NOT NULL,
    "order_item_id" "uuid" NOT NULL,
    "required_quantity" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "procurement_requirement_orders_required_quantity_check" CHECK (("required_quantity" > 0))
);


ALTER TABLE "public"."procurement_requirement_orders" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."public_pack_items_view" AS
 SELECT "c"."id",
    "c"."pack_id",
    "c"."product_id",
    "c"."name",
    "c"."quantity",
    "c"."unit_price",
    "c"."icon",
    "c"."description",
    "c"."specification",
    "c"."category",
    "c"."sku",
    "c"."brand",
    "c"."availability",
    "c"."substitution_policy",
    "c"."sort_order",
    "c"."visible",
    "c"."source",
    "c"."requires_pexcover",
    "c"."pexco_code",
    "c"."pexco_title",
    "c"."pexco_rate_cents",
    "c"."pexco_rate_active"
   FROM (("public"."canonical_pack_items_view" "c"
     JOIN "public"."school_packs" "p" ON (("p"."id" = "c"."pack_id")))
     LEFT JOIN "public"."schools" "s" ON (("s"."id" = "p"."school_id")))
  WHERE (("c"."visible" = true) AND ((("p"."publication_status")::"text" = 'published'::"text") OR (("p"."publication_status" IS NULL) AND ("p"."visible" = true))) AND (("s"."id" IS NULL) OR (("s"."publication_status")::"text" = 'published'::"text") OR (("s"."publication_status" IS NULL) AND ("s"."published" IS NOT FALSE) AND ("s"."status" = 'active'::"text"))));


ALTER VIEW "public"."public_pack_items_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."public_school_directory_view" WITH ("security_invoker"='true') AS
 SELECT "id",
    "name",
    "slug",
    "city",
    "province",
    "district",
    "logo",
    "partnership",
    "feature_status",
    "parent_collection_accepted",
    "partner_since",
    "lowest_price",
    "grades",
    "principal",
    "custom_badge",
    "latitude",
    "longitude",
    "publication_status",
    "directory_status",
    "stationery_list_status",
    (("partnership")::"text" = 'partner'::"text") AS "is_partner",
    (("feature_status")::"text" = 'featured'::"text") AS "is_featured",
    (("partnership")::"text" = 'refused_partner'::"text") AS "refused_partnership",
    (("publication_status")::"text" = 'published'::"text") AS "published",
    "created_at",
    "updated_at"
   FROM "public"."schools" "s"
  WHERE (("publication_status")::"text" = 'published'::"text");


ALTER VIEW "public"."public_school_directory_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quotation_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "quotation_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "actor_id" "uuid",
    "actor_email" "text",
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."quotation_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quotation_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "quotation_id" "uuid" NOT NULL,
    "master_product_id" "uuid",
    "item_title" "text" NOT NULL,
    "sku" "text",
    "unit" "text" DEFAULT 'Each'::"text",
    "quantity" integer DEFAULT 1 NOT NULL,
    "unit_price" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "total_price" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "cost_price" numeric(12,2),
    "margin_amount" numeric(12,2),
    "margin_percent" numeric(7,2),
    "supplier_snapshot" "text",
    "availability_snapshot" "text",
    "sort_order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."quotation_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."quotation_number_seq"
    START WITH 101
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."quotation_number_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "role_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."seasons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "academic_year" integer NOT NULL,
    "starts_on" "date",
    "ordering_closes_on" "date",
    "fulfilment_starts_on" "date",
    "fulfilment_ends_on" "date",
    "status" "text" DEFAULT 'planning'::"text" NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "seasons_status_check" CHECK (("status" = ANY (ARRAY['planning'::"text", 'active'::"text", 'closed'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."seasons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."security_audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ip_address" "text" NOT NULL,
    "user_agent" "text",
    "event_type" "text" NOT NULL,
    "email_masked" "text",
    "user_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "security_audit_logs_event_type_check" CHECK (("event_type" = ANY (ARRAY['LOGIN_SUCCESS'::"text", 'LOGIN_FAILED'::"text", 'OTP_FAILED'::"text", 'RATE_LIMITED'::"text", 'PASSWORD_VERIFIED'::"text", 'UNAUTHORIZED_ACCESS'::"text", 'OTP_RESENT'::"text"])))
);


ALTER TABLE "public"."security_audit_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."security_audit_logs" IS 'Tracks authentication attempts, 2FA failures, rate limit events, and security audit metrics for administrative routes.';



CREATE TABLE IF NOT EXISTS "public"."security_audit_logs_archive" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ip_address" "text" NOT NULL,
    "user_agent" "text",
    "event_type" "text" NOT NULL,
    "email_masked" "text",
    "user_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "archived_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "security_audit_logs_event_type_check" CHECK (("event_type" = ANY (ARRAY['LOGIN_SUCCESS'::"text", 'LOGIN_FAILED'::"text", 'OTP_FAILED'::"text", 'RATE_LIMITED'::"text", 'PASSWORD_VERIFIED'::"text", 'UNAUTHORIZED_ACCESS'::"text", 'OTP_RESENT'::"text"])))
);


ALTER TABLE "public"."security_audit_logs_archive" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_settings" (
    "key" character varying(120) NOT NULL,
    "category" character varying(60) NOT NULL,
    "value" "jsonb" NOT NULL,
    "value_type" "public"."setting_value_type" DEFAULT 'string'::"public"."setting_value_type" NOT NULL,
    "scope" "public"."setting_scope" DEFAULT 'global'::"public"."setting_scope" NOT NULL,
    "scope_id" character varying(100),
    "description" "text" NOT NULL,
    "is_sensitive" boolean DEFAULT false NOT NULL,
    "is_public" boolean DEFAULT false NOT NULL,
    "requires_approval" boolean DEFAULT false NOT NULL,
    "updated_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "version" integer DEFAULT 1 NOT NULL
);


ALTER TABLE "public"."system_settings" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."settings_effective_view" WITH ("security_invoker"='true') AS
 SELECT "key",
    "category",
    "value",
    ("value_type")::"text" AS "value_type",
    ("scope")::"text" AS "scope",
    "scope_id",
    "is_sensitive",
    "is_public",
    "requires_approval",
    "version",
    "updated_at",
    'system_settings'::"text" AS "source"
   FROM "public"."system_settings" "ss";


ALTER VIEW "public"."settings_effective_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."substitutions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_item_id" "uuid" NOT NULL,
    "original_product_id" "uuid",
    "replacement_product_id" "uuid" NOT NULL,
    "quantity" integer NOT NULL,
    "reason" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "requested_by" "uuid",
    "approved_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "resolved_at" timestamp with time zone,
    CONSTRAINT "substitutions_quantity_check" CHECK (("quantity" > 0)),
    CONSTRAINT "substitutions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'applied'::"text"])))
);


ALTER TABLE "public"."substitutions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."supplier_offers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "supplier_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quote_import_id" "uuid",
    "supplier_sku" "text",
    "unit_cost" numeric(12,2) NOT NULL,
    "currency" "text" DEFAULT 'ZAR'::"text" NOT NULL,
    "minimum_order_quantity" integer DEFAULT 1 NOT NULL,
    "available_quantity" integer,
    "lead_time_days" integer,
    "valid_from" "date" DEFAULT CURRENT_DATE NOT NULL,
    "valid_until" "date",
    "verified_at" timestamp with time zone,
    "is_preferred" boolean DEFAULT false NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "supplier_offers_minimum_order_quantity_check" CHECK (("minimum_order_quantity" > 0)),
    CONSTRAINT "supplier_offers_unit_cost_check" CHECK (("unit_cost" >= (0)::numeric))
);


ALTER TABLE "public"."supplier_offers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."supplier_purchase_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "purchase_order_id" "uuid" NOT NULL,
    "requirement_id" "uuid",
    "product_id" "uuid" NOT NULL,
    "ordered_quantity" integer NOT NULL,
    "confirmed_quantity" integer DEFAULT 0 NOT NULL,
    "received_quantity" integer DEFAULT 0 NOT NULL,
    "unit_cost" numeric(12,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "supplier_purchase_items_confirmed_quantity_check" CHECK (("confirmed_quantity" >= 0)),
    CONSTRAINT "supplier_purchase_items_ordered_quantity_check" CHECK (("ordered_quantity" > 0)),
    CONSTRAINT "supplier_purchase_items_received_quantity_check" CHECK (("received_quantity" >= 0)),
    CONSTRAINT "supplier_purchase_items_unit_cost_check" CHECK (("unit_cost" >= (0)::numeric))
);


ALTER TABLE "public"."supplier_purchase_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."supplier_purchase_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "purchase_order_number" "text" NOT NULL,
    "supplier_id" "uuid" NOT NULL,
    "season_id" "uuid",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "currency" "text" DEFAULT 'ZAR'::"text" NOT NULL,
    "expected_on" "date",
    "notes" "text",
    "created_by" "uuid",
    "approved_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "supplier_purchase_orders_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'sent'::"text", 'confirmed'::"text", 'partially_received'::"text", 'received'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."supplier_purchase_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."supplier_quote_imports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "supplier_id" "uuid" NOT NULL,
    "source_file_name" "text",
    "storage_path" "text",
    "status" "text" DEFAULT 'processing'::"text" NOT NULL,
    "imported_rows" integer DEFAULT 0 NOT NULL,
    "rejected_rows" integer DEFAULT 0 NOT NULL,
    "errors" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "imported_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    CONSTRAINT "supplier_quote_imports_status_check" CHECK (("status" = ANY (ARRAY['processing'::"text", 'review'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."supplier_quote_imports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."supplier_receipts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "purchase_order_id" "uuid" NOT NULL,
    "reference" "text",
    "received_by" "uuid",
    "received_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "notes" "text"
);


ALTER TABLE "public"."supplier_receipts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_settings_audit" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "setting_key" character varying(120) NOT NULL,
    "old_value" "jsonb",
    "new_value" "jsonb" NOT NULL,
    "change_reason" "text",
    "actor_id" "uuid",
    "actor_email" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."system_settings_audit" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."task_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "task_id" "uuid" NOT NULL,
    "author_id" "uuid",
    "body" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."task_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."task_mentions" (
    "comment_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."task_mentions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."testimonials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "role" "text" DEFAULT ''::"text" NOT NULL,
    "quote" "text" NOT NULL,
    "rating" smallint DEFAULT 5 NOT NULL,
    "visible" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "updated_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "context" "text" DEFAULT ''::"text" NOT NULL,
    "avatar" "text",
    CONSTRAINT "testimonials_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."testimonials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_permissions" (
    "user_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL,
    "granted" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."user_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "user_id" "uuid" NOT NULL,
    "display_name" "text",
    "avatar_url" "text",
    "telephone" "text",
    "job_title" "text",
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "user_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."website_content" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "title" "text" DEFAULT ''::"text" NOT NULL,
    "value" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "updated_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."website_content" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_letter_templates"
    ADD CONSTRAINT "admin_letter_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_letters"
    ADD CONSTRAINT "admin_letters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_letters"
    ADD CONSTRAINT "admin_letters_reference_number_key" UNIQUE ("reference_number");



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_path_key" UNIQUE ("path");



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assigned_forms"
    ADD CONSTRAINT "assigned_forms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assigned_forms"
    ADD CONSTRAINT "assigned_forms_user_id_form_key_key" UNIQUE ("user_id", "form_key");



ALTER TABLE ONLY "public"."audit_logs_archive"
    ADD CONSTRAINT "audit_logs_archive_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_otp_tokens"
    ADD CONSTRAINT "auth_otp_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brand_package_claims"
    ADD CONSTRAINT "brand_package_claims_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cms_announcements"
    ADD CONSTRAINT "cms_announcements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cms_faqs"
    ADD CONSTRAINT "cms_faqs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cms_resources"
    ADD CONSTRAINT "cms_resources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cms_testimonials"
    ADD CONSTRAINT "cms_testimonials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dashboard_summaries"
    ADD CONSTRAINT "dashboard_summaries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."faqs"
    ADD CONSTRAINT "faqs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_submissions"
    ADD CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fulfilment_records"
    ADD CONSTRAINT "fulfilment_records_order_id_key" UNIQUE ("order_id");



ALTER TABLE ONLY "public"."fulfilment_records"
    ADD CONSTRAINT "fulfilment_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."learners"
    ADD CONSTRAINT "learners_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."legacy_write_audit_log"
    ADD CONSTRAINT "legacy_write_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."master_products"
    ADD CONSTRAINT "master_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."master_products"
    ADD CONSTRAINT "master_products_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."operational_events"
    ADD CONSTRAINT "operational_events_event_key_key" UNIQUE ("event_key");



ALTER TABLE ONLY "public"."operational_events"
    ADD CONSTRAINT "operational_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."operational_tasks"
    ADD CONSTRAINT "operational_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_events_archive"
    ADD CONSTRAINT "order_events_archive_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_events"
    ADD CONSTRAINT "order_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_product_allocations"
    ADD CONSTRAINT "order_product_allocations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_reference_key" UNIQUE ("order_reference");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pack_events"
    ADD CONSTRAINT "pack_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."packing_records"
    ADD CONSTRAINT "packing_records_order_id_key" UNIQUE ("order_id");



ALTER TABLE ONLY "public"."packing_records"
    ADD CONSTRAINT "packing_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_events"
    ADD CONSTRAINT "payment_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_events"
    ADD CONSTRAINT "payment_events_provider_event_key_key" UNIQUE ("provider", "event_key");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pexco_rates"
    ADD CONSTRAINT "pexco_rates_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."pexco_rates"
    ADD CONSTRAINT "pexco_rates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."price_history"
    ADD CONSTRAINT "price_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pricing_rules"
    ADD CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."procurement_requirement_orders"
    ADD CONSTRAINT "procurement_requirement_orders_order_item_id_key" UNIQUE ("order_item_id");



ALTER TABLE ONLY "public"."procurement_requirement_orders"
    ADD CONSTRAINT "procurement_requirement_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."procurement_requirements"
    ADD CONSTRAINT "procurement_requirements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."procurement_requirements"
    ADD CONSTRAINT "procurement_requirements_season_id_product_id_key" UNIQUE ("season_id", "product_id");



ALTER TABLE ONLY "public"."quotation_events"
    ADD CONSTRAINT "quotation_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quotation_items"
    ADD CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quotations"
    ADD CONSTRAINT "quotations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quotations"
    ADD CONSTRAINT "quotations_quote_number_key" UNIQUE ("quote_number");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."school_pack_items"
    ADD CONSTRAINT "school_pack_items_pack_id_product_id_school_wording_key" UNIQUE ("pack_id", "product_id", "school_wording");



ALTER TABLE ONLY "public"."school_pack_items"
    ADD CONSTRAINT "school_pack_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."school_packs"
    ADD CONSTRAINT "school_packs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."school_packs"
    ADD CONSTRAINT "school_packs_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."schools"
    ADD CONSTRAINT "schools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schools"
    ADD CONSTRAINT "schools_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."seasons"
    ADD CONSTRAINT "seasons_academic_year_key" UNIQUE ("academic_year");



ALTER TABLE ONLY "public"."seasons"
    ADD CONSTRAINT "seasons_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."seasons"
    ADD CONSTRAINT "seasons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."security_audit_logs_archive"
    ADD CONSTRAINT "security_audit_logs_archive_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."security_audit_logs"
    ADD CONSTRAINT "security_audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."substitutions"
    ADD CONSTRAINT "substitutions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_offers"
    ADD CONSTRAINT "supplier_offers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_purchase_items"
    ADD CONSTRAINT "supplier_purchase_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_purchase_orders"
    ADD CONSTRAINT "supplier_purchase_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_purchase_orders"
    ADD CONSTRAINT "supplier_purchase_orders_purchase_order_number_key" UNIQUE ("purchase_order_number");



ALTER TABLE ONLY "public"."supplier_quote_imports"
    ADD CONSTRAINT "supplier_quote_imports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_receipts"
    ADD CONSTRAINT "supplier_receipts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_settings_audit"
    ADD CONSTRAINT "system_settings_audit_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."task_comments"
    ADD CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."task_mentions"
    ADD CONSTRAINT "task_mentions_pkey" PRIMARY KEY ("comment_id", "user_id");



ALTER TABLE ONLY "public"."testimonials"
    ADD CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("user_id", "permission_id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id", "role_id");



ALTER TABLE ONLY "public"."website_content"
    ADD CONSTRAINT "website_content_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."website_content"
    ADD CONSTRAINT "website_content_pkey" PRIMARY KEY ("id");



CREATE INDEX "audit_logs_archive_action_created_at_idx" ON "public"."audit_logs_archive" USING "btree" ("action", "created_at" DESC);



CREATE INDEX "audit_logs_archive_action_idx" ON "public"."audit_logs_archive" USING "btree" ("action");



CREATE INDEX "audit_logs_archive_actor_id_created_at_idx" ON "public"."audit_logs_archive" USING "btree" ("actor_id", "created_at" DESC);



CREATE INDEX "audit_logs_archive_actor_id_idx" ON "public"."audit_logs_archive" USING "btree" ("actor_id");



CREATE INDEX "audit_logs_archive_created_at_idx" ON "public"."audit_logs_archive" USING "btree" ("created_at" DESC);



CREATE INDEX "audit_logs_archive_entity_type_created_at_idx" ON "public"."audit_logs_archive" USING "btree" ("entity_type", "created_at" DESC);



CREATE INDEX "audit_logs_archive_entity_type_entity_id_idx" ON "public"."audit_logs_archive" USING "btree" ("entity_type", "entity_id");



CREATE UNIQUE INDEX "customers_email_unique_idx" ON "public"."customers" USING "btree" ("lower"("email")) WHERE (("email" IS NOT NULL) AND ("email" <> ''::"text"));



CREATE INDEX "idx_admin_letter_templates_sort" ON "public"."admin_letter_templates" USING "btree" ("sort_order", "created_at");



CREATE INDEX "idx_admin_letters_created" ON "public"."admin_letters" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_admin_letters_quotation" ON "public"."admin_letters" USING "btree" ("quotation_id");



CREATE INDEX "idx_admin_letters_ref" ON "public"."admin_letters" USING "btree" ("reference_number");



CREATE INDEX "idx_admin_letters_school" ON "public"."admin_letters" USING "btree" ("school_id");



CREATE INDEX "idx_admin_letters_status" ON "public"."admin_letters" USING "btree" ("status");



CREATE INDEX "idx_approvals_decided_by" ON "public"."approvals" USING "btree" ("decided_by");



CREATE INDEX "idx_approvals_requested_by" ON "public"."approvals" USING "btree" ("requested_by");



CREATE INDEX "idx_assets_created" ON "public"."assets" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_assets_folder" ON "public"."assets" USING "btree" ("bucket", "folder");



CREATE INDEX "idx_assets_uploaded_by" ON "public"."assets" USING "btree" ("uploaded_by");



CREATE INDEX "idx_audit_logs_action" ON "public"."audit_logs" USING "btree" ("action");



CREATE INDEX "idx_audit_logs_action_created" ON "public"."audit_logs" USING "btree" ("action", "created_at" DESC);



CREATE INDEX "idx_audit_logs_actor" ON "public"."audit_logs" USING "btree" ("actor_id");



CREATE INDEX "idx_audit_logs_actor_id_created" ON "public"."audit_logs" USING "btree" ("actor_id", "created_at" DESC);



CREATE INDEX "idx_audit_logs_archive_archived_at" ON "public"."audit_logs_archive" USING "btree" ("archived_at" DESC);



CREATE INDEX "idx_audit_logs_archive_created_at" ON "public"."audit_logs_archive" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_logs_created_at" ON "public"."audit_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_logs_entity" ON "public"."audit_logs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_audit_logs_entity_type_created" ON "public"."audit_logs" USING "btree" ("entity_type", "created_at" DESC);



CREATE INDEX "idx_auth_otp_tokens_lookup" ON "public"."auth_otp_tokens" USING "btree" ("email", "otp_code", "used", "expires_at" DESC);



CREATE UNIQUE INDEX "idx_blog_posts_slug" ON "public"."blog_posts" USING "btree" ("slug");



CREATE INDEX "idx_brand_package_claims_created_at" ON "public"."brand_package_claims" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_brand_package_claims_status" ON "public"."brand_package_claims" USING "btree" ("status");



CREATE UNIQUE INDEX "idx_cms_announcements_one_active_global_top" ON "public"."cms_announcements" USING "btree" ("display_location") WHERE (("display_location" = 'global_top'::"text") AND ("is_active" = true) AND ("status" = 'published'::"text"));



CREATE UNIQUE INDEX "idx_cms_announcements_one_active_hero_banner" ON "public"."cms_announcements" USING "btree" ("display_location") WHERE (("display_location" = 'hero_banner'::"text") AND ("is_active" = true) AND ("status" = 'published'::"text"));



CREATE UNIQUE INDEX "idx_cms_announcements_one_active_schools_page" ON "public"."cms_announcements" USING "btree" ("display_location") WHERE (("display_location" = 'schools_page'::"text") AND ("is_active" = true) AND ("status" = 'published'::"text"));



CREATE INDEX "idx_cms_announcements_public_schedule" ON "public"."cms_announcements" USING "btree" ("display_location", "published_at" DESC, "updated_at" DESC) WHERE (("status" = 'published'::"text") AND ("is_active" = true));



CREATE INDEX "idx_cms_faqs_public_schedule" ON "public"."cms_faqs" USING "btree" ("category", "sort_order", "created_at") WHERE (("status" = 'published'::"text") AND ("is_published" = true));



CREATE INDEX "idx_cms_faqs_target_page" ON "public"."cms_faqs" USING "btree" ("target_page", "sort_order", "created_at") WHERE (("status" = 'published'::"text") AND ("is_published" = true));



CREATE UNIQUE INDEX "idx_cms_resources_article_slug" ON "public"."cms_resources" USING "btree" ("slug") WHERE (("kind" = 'article'::"text") AND ("slug" IS NOT NULL));



CREATE INDEX "idx_cms_resources_public_schedule" ON "public"."cms_resources" USING "btree" ("category", "sort_order", "created_at") WHERE (("status" = 'published'::"text") AND ("is_public" = true));



CREATE INDEX "idx_cms_testimonials_public_schedule" ON "public"."cms_testimonials" USING "btree" ("sort_order", "created_at") WHERE (("status" = 'published'::"text") AND ("is_featured" = true));



CREATE INDEX "idx_dashboard_summaries_id" ON "public"."dashboard_summaries" USING "btree" ("id");



CREATE UNIQUE INDEX "idx_faqs_slug" ON "public"."faqs" USING "btree" ("slug");



CREATE INDEX "idx_faqs_updated_by" ON "public"."faqs" USING "btree" ("updated_by");



CREATE INDEX "idx_faqs_visible_sort" ON "public"."faqs" USING "btree" ("visible", "sort_order");



CREATE INDEX "idx_form_submissions_created" ON "public"."form_submissions" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_form_submissions_created_at_desc" ON "public"."form_submissions" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_form_submissions_type_created" ON "public"."form_submissions" USING "btree" ("form_type", "created_at" DESC);



CREATE INDEX "idx_learners_customer_id" ON "public"."learners" USING "btree" ("customer_id");



CREATE INDEX "idx_learners_school_id" ON "public"."learners" USING "btree" ("school_id");



CREATE INDEX "idx_master_products_brand_trgm" ON "public"."master_products" USING "gin" ("brand" "extensions"."gin_trgm_ops");



CREATE INDEX "idx_master_products_category_trgm" ON "public"."master_products" USING "gin" ("category" "extensions"."gin_trgm_ops");



CREATE INDEX "idx_master_products_created_by" ON "public"."master_products" USING "btree" ("created_by");



CREATE INDEX "idx_master_products_pexco_code" ON "public"."master_products" USING "btree" ("pexco_code") WHERE ("pexco_code" IS NOT NULL);



CREATE INDEX "idx_master_products_preferred_supplier" ON "public"."master_products" USING "btree" ("preferred_supplier_id");



CREATE INDEX "idx_master_products_requires_pexcover" ON "public"."master_products" USING "btree" ("requires_pexcover") WHERE ("requires_pexcover" = true);



CREATE INDEX "idx_master_products_search_vector" ON "public"."master_products" USING "gin" ("search_vector");



CREATE INDEX "idx_master_products_sku_trgm" ON "public"."master_products" USING "gin" ("sku" "extensions"."gin_trgm_ops");



CREATE INDEX "idx_master_products_updated_by" ON "public"."master_products" USING "btree" ("updated_by");



CREATE INDEX "idx_operational_events_actor" ON "public"."operational_events" USING "btree" ("actor_id");



CREATE INDEX "idx_operational_tasks_created_by" ON "public"."operational_tasks" USING "btree" ("created_by");



CREATE INDEX "idx_order_events_archive_archived_at" ON "public"."order_events_archive" USING "btree" ("archived_at" DESC);



CREATE INDEX "idx_order_events_archive_created_at" ON "public"."order_events_archive" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_order_events_oid" ON "public"."order_events" USING "btree" ("order_id", "created_at" DESC);



CREATE INDEX "idx_order_items_composite" ON "public"."order_items" USING "btree" ("order_id", "pack_id");



CREATE INDEX "idx_order_items_order_id" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "idx_order_items_pack_id" ON "public"."order_items" USING "btree" ("pack_id");



CREATE INDEX "idx_order_items_product_id" ON "public"."order_items" USING "btree" ("product_id");



CREATE INDEX "idx_orders_buyer_email" ON "public"."orders" USING "btree" ("buyer_email");



CREATE INDEX "idx_orders_buyer_name_trgm" ON "public"."orders" USING "gin" ("buyer_name" "extensions"."gin_trgm_ops");



CREATE INDEX "idx_orders_created_at" ON "public"."orders" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_orders_created_at_desc" ON "public"."orders" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_orders_created_pack_type" ON "public"."orders" USING "btree" ("created_at", "pack_type");



CREATE INDEX "idx_orders_created_school" ON "public"."orders" USING "btree" ("created_at", "school_name");



CREATE INDEX "idx_orders_created_status" ON "public"."orders" USING "btree" ("created_at", "status");



CREATE INDEX "idx_orders_customer_id" ON "public"."orders" USING "btree" ("customer_id");



CREATE INDEX "idx_orders_gateway_created" ON "public"."orders" USING "btree" ("created_at" DESC) WHERE (("payment_gateway" IS NOT NULL) OR ("paid_at" IS NOT NULL));



CREATE UNIQUE INDEX "idx_orders_idempotency_key" ON "public"."orders" USING "btree" ("idempotency_key") WHERE ("idempotency_key" IS NOT NULL);



CREATE INDEX "idx_orders_learner_id" ON "public"."orders" USING "btree" ("learner_id");



CREATE INDEX "idx_orders_lookup_proof" ON "public"."orders" USING "btree" ("order_reference", "lower"("buyer_email"), "unique_customer_id");



CREATE INDEX "idx_orders_lookup_status" ON "public"."orders" USING "btree" ("buyer_email", "status", "created_at" DESC);



CREATE INDEX "idx_orders_pack_type" ON "public"."orders" USING "btree" ("pack_type") WHERE ("pack_type" IS NOT NULL);



CREATE INDEX "idx_orders_paid_at" ON "public"."orders" USING "btree" ("paid_at") WHERE ("paid_at" IS NOT NULL);



CREATE INDEX "idx_orders_paid_receipt_pending" ON "public"."orders" USING "btree" ("id") WHERE (("status" = 'paid'::"text") AND ("receipt_email_sent_at" IS NULL));



CREATE INDEX "idx_orders_reference_trgm" ON "public"."orders" USING "gin" ("order_reference" "extensions"."gin_trgm_ops");



CREATE INDEX "idx_orders_school_name_grade" ON "public"."orders" USING "btree" ("school_name", "grade");



CREATE INDEX "idx_orders_school_slug_grade" ON "public"."orders" USING "btree" ("school_slug", "grade");



CREATE INDEX "idx_orders_search_vector" ON "public"."orders" USING "gin" ("search_vector");



CREATE INDEX "idx_orders_season_id" ON "public"."orders" USING "btree" ("season_id");



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "idx_orders_status_created" ON "public"."orders" USING "btree" ("status", "created_at" DESC);



CREATE INDEX "idx_orders_status_created_at" ON "public"."orders" USING "btree" ("status", "created_at" DESC);



CREATE INDEX "idx_orders_status_created_composite" ON "public"."orders" USING "btree" ("status", "created_at" DESC);



CREATE INDEX "idx_orders_status_school_slug" ON "public"."orders" USING "btree" ("status", "school_slug");



CREATE INDEX "idx_orders_status_user" ON "public"."orders" USING "btree" ("status", "id");



CREATE UNIQUE INDEX "idx_orders_tracking_token" ON "public"."orders" USING "btree" ("tracking_token") WHERE ("tracking_token" IS NOT NULL);



CREATE INDEX "idx_orders_unique_customer_id" ON "public"."orders" USING "btree" ("unique_customer_id") WHERE ("unique_customer_id" IS NOT NULL);



CREATE INDEX "idx_pack_events_pid" ON "public"."pack_events" USING "btree" ("pack_id", "created_at" DESC);



CREATE INDEX "idx_packing_records_checked_by" ON "public"."packing_records" USING "btree" ("checked_by");



CREATE INDEX "idx_packing_records_started_by" ON "public"."packing_records" USING "btree" ("started_by");



CREATE INDEX "idx_payment_events_order_id" ON "public"."payment_events" USING "btree" ("order_id");



CREATE INDEX "idx_payments_gateway_reference" ON "public"."payments" USING "btree" ("gateway_reference");



CREATE INDEX "idx_payments_order_reference" ON "public"."payments" USING "btree" ("order_reference");



CREATE INDEX "idx_price_history_supplier" ON "public"."price_history" USING "btree" ("supplier_id");



CREATE UNIQUE INDEX "idx_product_margin_mv_id" ON "public"."admin_product_margin_mv" USING "btree" ("id");



CREATE INDEX "idx_quotation_events_qid" ON "public"."quotation_events" USING "btree" ("quotation_id", "created_at" DESC);



CREATE INDEX "idx_quotation_items_master_product" ON "public"."quotation_items" USING "btree" ("master_product_id");



CREATE INDEX "idx_quotation_items_master_product_id" ON "public"."quotation_items" USING "btree" ("master_product_id");



CREATE INDEX "idx_quotation_items_quotation_id" ON "public"."quotation_items" USING "btree" ("quotation_id");



CREATE INDEX "idx_quotations_created_at_desc" ON "public"."quotations" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_quotations_number" ON "public"."quotations" USING "btree" ("quote_number");



CREATE INDEX "idx_quotations_school" ON "public"."quotations" USING "btree" ("school_id");



CREATE INDEX "idx_quotations_school_id" ON "public"."quotations" USING "btree" ("school_id");



CREATE INDEX "idx_quotations_search_vector" ON "public"."quotations" USING "gin" ("search_vector");



CREATE INDEX "idx_quotations_status" ON "public"."quotations" USING "btree" ("status");



CREATE INDEX "idx_quotations_status_created" ON "public"."quotations" USING "btree" ("status", "created_at" DESC);



CREATE INDEX "idx_quotations_valid_until" ON "public"."quotations" USING "btree" ("valid_until");



CREATE UNIQUE INDEX "idx_quote_pipeline_month_status" ON "public"."admin_quote_pipeline_mv" USING "btree" ("month", "status");



CREATE UNIQUE INDEX "idx_school_pack_health_mv_pack_id" ON "public"."admin_school_pack_health_mv" USING "btree" ("pack_id");



CREATE INDEX "idx_school_pack_items_active_pack_order" ON "public"."school_pack_items" USING "btree" ("pack_id", "sort_order", "id") WHERE ("active" IS TRUE);



CREATE INDEX "idx_school_pack_items_pack_calc" ON "public"."school_pack_items" USING "btree" ("pack_id", "pack_quantity", "selling_price_override");



CREATE INDEX "idx_school_packs_delivery_type" ON "public"."school_packs" USING "btree" ("delivery_type");



CREATE INDEX "idx_school_packs_featured" ON "public"."school_packs" USING "btree" ("featured") WHERE "visible";



CREATE INDEX "idx_school_packs_public_school_order" ON "public"."school_packs" USING "btree" ("school_id", "sort_order", "title") WHERE ((("publication_status")::"text" = 'published'::"text") OR (("publication_status" IS NULL) AND ("visible" IS TRUE)));



CREATE INDEX "idx_school_packs_public_slug_lookup" ON "public"."school_packs" USING "btree" ("slug") WHERE ((("publication_status")::"text" = 'published'::"text") OR (("publication_status" IS NULL) AND ("visible" IS TRUE)));



CREATE INDEX "idx_school_packs_publication_status" ON "public"."school_packs" USING "btree" ("publication_status", "season_id");



CREATE INDEX "idx_school_packs_school" ON "public"."school_packs" USING "btree" ("school_id");



CREATE INDEX "idx_school_packs_school_pub" ON "public"."school_packs" USING "btree" ("school_id", "publication_status");



CREATE INDEX "idx_school_packs_school_updated" ON "public"."school_packs" USING "btree" ("school_id", "updated_at" DESC);



CREATE INDEX "idx_school_packs_school_visible" ON "public"."school_packs" USING "btree" ("school_id", "visible");



CREATE INDEX "idx_school_packs_school_visible_order" ON "public"."school_packs" USING "btree" ("school_id", "visible", "sort_order") WHERE ("visible" IS TRUE);



CREATE INDEX "idx_school_packs_school_visible_sort" ON "public"."school_packs" USING "btree" ("school_id", "visible", "sort_order");



CREATE INDEX "idx_school_packs_school_visible_title" ON "public"."school_packs" USING "btree" ("school_id", "visible", "title") WHERE ("visible" = true);



CREATE INDEX "idx_school_packs_search_vector" ON "public"."school_packs" USING "gin" ("search_vector");



CREATE INDEX "idx_school_packs_season_id" ON "public"."school_packs" USING "btree" ("season_id");



CREATE INDEX "idx_school_packs_slug" ON "public"."school_packs" USING "btree" ("slug");



CREATE INDEX "idx_school_packs_title_trgm" ON "public"."school_packs" USING "gin" ("title" "extensions"."gin_trgm_ops");



CREATE INDEX "idx_schools_city_trgm" ON "public"."schools" USING "gin" ("city" "extensions"."gin_trgm_ops");



CREATE INDEX "idx_schools_district_trgm" ON "public"."schools" USING "gin" ("district" "extensions"."gin_trgm_ops");



CREATE INDEX "idx_schools_grades" ON "public"."schools" USING "gin" ("grades");



CREATE INDEX "idx_schools_location" ON "public"."schools" USING "gist" ("location");



CREATE INDEX "idx_schools_location_gist" ON "public"."schools" USING "gist" ("location");



CREATE INDEX "idx_schools_name" ON "public"."schools" USING "btree" ("lower"("name"));



CREATE INDEX "idx_schools_name_trgm" ON "public"."schools" USING "gin" ("name" "extensions"."gin_trgm_ops");



CREATE INDEX "idx_schools_public_city_lower" ON "public"."schools" USING "btree" ("lower"("city")) WHERE ((("publication_status")::"text" = 'published'::"text") AND ("city" IS NOT NULL));



CREATE INDEX "idx_schools_public_district_lower" ON "public"."schools" USING "btree" ("lower"("district")) WHERE ((("publication_status")::"text" = 'published'::"text") AND ("district" IS NOT NULL));



CREATE INDEX "idx_schools_public_grades" ON "public"."schools" USING "gin" ("grades") WHERE (("publication_status")::"text" = 'published'::"text");



CREATE INDEX "idx_schools_public_listing_order" ON "public"."schools" USING "btree" (COALESCE((("feature_status")::"text" = 'featured'::"text"), "is_featured", false) DESC, COALESCE((("partnership")::"text" = 'partner'::"text"), "is_partner", false) DESC, "name") WHERE (("publication_status")::"text" = 'published'::"text");



CREATE INDEX "idx_schools_public_province_lower" ON "public"."schools" USING "btree" ("lower"("province")) WHERE ((("publication_status")::"text" = 'published'::"text") AND ("province" IS NOT NULL));



CREATE INDEX "idx_schools_public_slug_lookup" ON "public"."schools" USING "btree" ("slug") WHERE ((("publication_status")::"text" = 'published'::"text") OR (("publication_status" IS NULL) AND ("published" IS NOT FALSE) AND ("status" = 'active'::"text")));



CREATE INDEX "idx_schools_publication_status" ON "public"."schools" USING "btree" ("publication_status");



CREATE INDEX "idx_schools_published" ON "public"."schools" USING "btree" ("published");



CREATE INDEX "idx_schools_published_search" ON "public"."schools" USING "gin" ("search_vector") WHERE (("publication_status")::"text" = 'published'::"text");



CREATE INDEX "idx_schools_search_composite" ON "public"."schools" USING "btree" ("status", "published", "is_partner" DESC, "is_featured" DESC, "name") WHERE (("status" = 'active'::"text") AND ("published" = true));



CREATE INDEX "idx_schools_slug" ON "public"."schools" USING "btree" ("slug");



CREATE INDEX "idx_schools_status" ON "public"."schools" USING "btree" ("status");



CREATE INDEX "idx_security_audit_logs_archive_archived_at" ON "public"."security_audit_logs_archive" USING "btree" ("archived_at" DESC);



CREATE INDEX "idx_security_audit_logs_archive_created_at" ON "public"."security_audit_logs_archive" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_security_audit_logs_event" ON "public"."security_audit_logs" USING "btree" ("event_type", "created_at" DESC);



CREATE INDEX "idx_security_audit_logs_ip_created" ON "public"."security_audit_logs" USING "btree" ("ip_address", "created_at" DESC);



CREATE INDEX "idx_security_audit_logs_user_id" ON "public"."security_audit_logs" USING "btree" ("user_id");



CREATE INDEX "idx_substitutions_approved_by" ON "public"."substitutions" USING "btree" ("approved_by");



CREATE INDEX "idx_substitutions_order_item_id" ON "public"."substitutions" USING "btree" ("order_item_id");



CREATE INDEX "idx_substitutions_original_product" ON "public"."substitutions" USING "btree" ("original_product_id");



CREATE INDEX "idx_substitutions_replacement_product" ON "public"."substitutions" USING "btree" ("replacement_product_id");



CREATE INDEX "idx_substitutions_requested_by" ON "public"."substitutions" USING "btree" ("requested_by");



CREATE UNIQUE INDEX "idx_supplier_demand_mv_supplier_id" ON "public"."admin_supplier_demand_mv" USING "btree" (COALESCE("supplier_id", '00000000-0000-0000-0000-000000000000'::"uuid"));



CREATE INDEX "idx_supplier_purchase_items_po_id" ON "public"."supplier_purchase_items" USING "btree" ("purchase_order_id");



CREATE INDEX "idx_supplier_purchase_items_prod_id" ON "public"."supplier_purchase_items" USING "btree" ("product_id");



CREATE INDEX "idx_supplier_purchase_orders_supplier" ON "public"."supplier_purchase_orders" USING "btree" ("supplier_id");



CREATE INDEX "idx_supplier_quote_imports_supplier" ON "public"."supplier_quote_imports" USING "btree" ("supplier_id");



CREATE INDEX "idx_system_settings_audit_key" ON "public"."system_settings_audit" USING "btree" ("setting_key", "created_at" DESC);



CREATE INDEX "idx_system_settings_category" ON "public"."system_settings" USING "btree" ("category");



CREATE INDEX "idx_system_settings_public" ON "public"."system_settings" USING "btree" ("is_public") WHERE ("is_public" = true);



CREATE INDEX "idx_system_settings_updated_by" ON "public"."system_settings" USING "btree" ("updated_by");



CREATE INDEX "idx_task_comments_author_id" ON "public"."task_comments" USING "btree" ("author_id");



CREATE INDEX "idx_task_comments_task_id" ON "public"."task_comments" USING "btree" ("task_id");



CREATE INDEX "idx_task_mentions_user_id" ON "public"."task_mentions" USING "btree" ("user_id");



CREATE INDEX "idx_testimonials_visible_sort" ON "public"."testimonials" USING "btree" ("visible", "sort_order");



CREATE INDEX "idx_website_content_updated" ON "public"."website_content" USING "btree" ("updated_at" DESC);



CREATE INDEX "master_products_name_trgm_idx" ON "public"."master_products" USING "gin" ("name" "extensions"."gin_trgm_ops");



CREATE INDEX "master_products_pricing_status_idx" ON "public"."master_products" USING "btree" ("pricing_status", "active");



CREATE INDEX "master_products_search_idx" ON "public"."master_products" USING "gin" ("search_vector");



CREATE UNIQUE INDEX "master_products_sku_unique_idx" ON "public"."master_products" USING "btree" ("upper"("sku"));



CREATE INDEX "notifications_user_unread_idx" ON "public"."notifications" USING "btree" ("user_id", "created_at" DESC) WHERE ("read_at" IS NULL);



CREATE INDEX "operational_events_entity_idx" ON "public"."operational_events" USING "btree" ("entity_type", "entity_id", "created_at" DESC);



CREATE INDEX "operational_tasks_assignee_status_idx" ON "public"."operational_tasks" USING "btree" ("assigned_to", "status", "due_at");



CREATE INDEX "order_events_archive_order_id_created_at_idx" ON "public"."order_events_archive" USING "btree" ("order_id", "created_at" DESC);



CREATE INDEX "order_items_order_idx" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "order_items_product_idx" ON "public"."order_items" USING "btree" ("product_id");



CREATE INDEX "order_product_allocations_order_item_idx" ON "public"."order_product_allocations" USING "btree" ("order_item_id");



CREATE UNIQUE INDEX "payments_gateway_reference_unique_idx" ON "public"."payments" USING "btree" ("payment_gateway", "gateway_reference") WHERE ("gateway_reference" IS NOT NULL);



CREATE UNIQUE INDEX "payments_order_complete_unique_idx" ON "public"."payments" USING "btree" ("order_reference") WHERE ("status" = 'Complete'::"text");



CREATE INDEX "price_history_product_created_idx" ON "public"."price_history" USING "btree" ("product_id", "created_at" DESC);



CREATE INDEX "procurement_requirements_status_idx" ON "public"."procurement_requirements" USING "btree" ("status", "updated_at" DESC);



CREATE INDEX "school_pack_items_pack_idx" ON "public"."school_pack_items" USING "btree" ("pack_id", "active", "sort_order");



CREATE INDEX "school_pack_items_product_idx" ON "public"."school_pack_items" USING "btree" ("product_id", "active");



CREATE INDEX "school_packs_search_idx" ON "public"."school_packs" USING "gin" ("search_vector");



CREATE INDEX "schools_city_idx" ON "public"."schools" USING "btree" ("city");



CREATE INDEX "schools_featured_idx" ON "public"."schools" USING "btree" ("is_featured") WHERE "is_featured";



CREATE INDEX "schools_province_idx" ON "public"."schools" USING "btree" ("province");



CREATE INDEX "schools_search_idx" ON "public"."schools" USING "gin" ("search_vector");



CREATE UNIQUE INDEX "schools_slug_unique" ON "public"."schools" USING "btree" ("slug");



CREATE INDEX "schools_status_idx" ON "public"."schools" USING "btree" ("status");



CREATE UNIQUE INDEX "seasons_one_default_idx" ON "public"."seasons" USING "btree" ("is_default") WHERE "is_default";



CREATE INDEX "security_audit_logs_archive_event_type_created_at_idx" ON "public"."security_audit_logs_archive" USING "btree" ("event_type", "created_at" DESC);



CREATE INDEX "security_audit_logs_archive_ip_address_created_at_idx" ON "public"."security_audit_logs_archive" USING "btree" ("ip_address", "created_at" DESC);



CREATE INDEX "security_audit_logs_archive_user_id_idx" ON "public"."security_audit_logs_archive" USING "btree" ("user_id");



CREATE UNIQUE INDEX "supplier_offers_one_preferred_idx" ON "public"."supplier_offers" USING "btree" ("product_id") WHERE ("is_preferred" AND "active");



CREATE INDEX "supplier_offers_product_idx" ON "public"."supplier_offers" USING "btree" ("product_id", "active", "unit_cost");



CREATE OR REPLACE TRIGGER "blog_posts_updated_at_trg" BEFORE UPDATE ON "public"."blog_posts" FOR EACH ROW EXECUTE FUNCTION "public"."blog_posts_set_updated_at"();



CREATE OR REPLACE TRIGGER "brand_package_claims_updated_at_trg" BEFORE UPDATE ON "public"."brand_package_claims" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "orders_updated_at_trg" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "school_packs_updated_at_trg" BEFORE UPDATE ON "public"."school_packs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "schools_search_vector_trg" BEFORE INSERT OR UPDATE ON "public"."schools" FOR EACH ROW EXECUTE FUNCTION "public"."schools_set_search_vector"();



CREATE OR REPLACE TRIGGER "schools_updated_at_trg" BEFORE UPDATE ON "public"."schools" FOR EACH ROW EXECUTE FUNCTION "public"."schools_set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_audit_master_products" AFTER INSERT OR DELETE OR UPDATE ON "public"."master_products" FOR EACH ROW EXECUTE FUNCTION "public"."fn_audit_trail_recorder"();



CREATE OR REPLACE TRIGGER "trg_audit_quotations" AFTER INSERT OR DELETE OR UPDATE ON "public"."quotations" FOR EACH ROW EXECUTE FUNCTION "public"."fn_audit_trail_recorder"();



CREATE OR REPLACE TRIGGER "trg_audit_schools" AFTER INSERT OR DELETE OR UPDATE ON "public"."schools" FOR EACH ROW EXECUTE FUNCTION "public"."fn_audit_trail_recorder"();



CREATE OR REPLACE TRIGGER "trg_maintain_order_summary" AFTER INSERT OR DELETE OR UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_dashboard_summary_on_order"();



CREATE OR REPLACE TRIGGER "trg_master_products_search_vector" BEFORE INSERT OR UPDATE ON "public"."master_products" FOR EACH ROW EXECUTE FUNCTION "public"."maintain_master_products_search_vector"();



CREATE OR REPLACE TRIGGER "trg_orders_search_vector" BEFORE INSERT OR UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."maintain_orders_search_vector"();



CREATE OR REPLACE TRIGGER "trg_quotation_item_totals" BEFORE INSERT OR UPDATE ON "public"."quotation_items" FOR EACH ROW EXECUTE FUNCTION "public"."maintain_quotation_item_totals"();



CREATE OR REPLACE TRIGGER "trg_quotations_search_vector" BEFORE INSERT OR UPDATE ON "public"."quotations" FOR EACH ROW EXECUTE FUNCTION "public"."maintain_quotations_search_vector"();



CREATE OR REPLACE TRIGGER "trg_recalculate_quotation_totals" AFTER INSERT OR DELETE OR UPDATE ON "public"."quotation_items" FOR EACH ROW EXECUTE FUNCTION "public"."recalculate_quotation_totals_trigger"();



CREATE OR REPLACE TRIGGER "trg_school_packs_search_vector" BEFORE INSERT OR UPDATE OF "title", "slug", "description", "academic_year" ON "public"."school_packs" FOR EACH ROW EXECUTE FUNCTION "public"."maintain_school_packs_search_vector"();



CREATE OR REPLACE TRIGGER "trg_snapshot_order_item" BEFORE INSERT OR UPDATE ON "public"."order_items" FOR EACH ROW EXECUTE FUNCTION "public"."fn_snapshot_order_item_details"();



CREATE OR REPLACE TRIGGER "trg_supplier_offer_pricing_sync" AFTER INSERT OR DELETE OR UPDATE OF "unit_cost", "is_preferred", "active" ON "public"."supplier_offers" FOR EACH ROW EXECUTE FUNCTION "public"."fn_trg_supplier_offer_pricing_sync"();



CREATE OR REPLACE TRIGGER "trg_sync_dashboard_summaries" AFTER INSERT OR DELETE OR UPDATE ON "public"."orders" FOR EACH STATEMENT EXECUTE FUNCTION "public"."recalculate_dashboard_summaries"();



CREATE OR REPLACE TRIGGER "trg_sync_order_total" AFTER INSERT OR DELETE OR UPDATE ON "public"."order_items" FOR EACH ROW EXECUTE FUNCTION "public"."fn_sync_order_total_amount"();



CREATE OR REPLACE TRIGGER "trg_sync_pack_price_on_item_change" AFTER INSERT OR DELETE ON "public"."school_pack_items" FOR EACH ROW EXECUTE FUNCTION "public"."fn_trg_pack_item_pricing_sync"();



CREATE OR REPLACE TRIGGER "trg_sync_pack_price_on_item_pricing_update" AFTER UPDATE OF "pack_id", "product_id", "pack_quantity", "selling_price_override", "active" ON "public"."school_pack_items" FOR EACH ROW EXECUTE FUNCTION "public"."fn_trg_pack_item_pricing_sync"();



CREATE OR REPLACE TRIGGER "trg_sync_packs_on_product_price_change" AFTER UPDATE OF "current_selling_price", "calculated_selling_price", "active" ON "public"."master_products" FOR EACH ROW EXECUTE FUNCTION "public"."fn_trg_product_cost_pricing_sync"();



CREATE OR REPLACE TRIGGER "trg_sync_school_status_fields" BEFORE INSERT OR UPDATE ON "public"."schools" FOR EACH ROW EXECUTE FUNCTION "public"."sync_school_status_fields"();



ALTER TABLE ONLY "public"."admin_letters"
    ADD CONSTRAINT "admin_letters_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."admin_letters"
    ADD CONSTRAINT "admin_letters_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_decided_by_fkey" FOREIGN KEY ("decided_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."assigned_forms"
    ADD CONSTRAINT "assigned_forms_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."assigned_forms"
    ADD CONSTRAINT "assigned_forms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cms_testimonials"
    ADD CONSTRAINT "cms_testimonials_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."faqs"
    ADD CONSTRAINT "faqs_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fulfilment_records"
    ADD CONSTRAINT "fulfilment_records_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."learners"
    ADD CONSTRAINT "learners_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."learners"
    ADD CONSTRAINT "learners_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."master_products"
    ADD CONSTRAINT "master_products_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."master_products"
    ADD CONSTRAINT "master_products_pexco_code_fkey" FOREIGN KEY ("pexco_code") REFERENCES "public"."pexco_rates"("code") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."master_products"
    ADD CONSTRAINT "master_products_preferred_supplier_id_fkey" FOREIGN KEY ("preferred_supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."master_products"
    ADD CONSTRAINT "master_products_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."operational_events"
    ADD CONSTRAINT "operational_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."operational_tasks"
    ADD CONSTRAINT "operational_tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."operational_tasks"
    ADD CONSTRAINT "operational_tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_events"
    ADD CONSTRAINT "order_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "public"."school_packs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."master_products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_product_allocations"
    ADD CONSTRAINT "order_product_allocations_allocated_by_fkey" FOREIGN KEY ("allocated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_product_allocations"
    ADD CONSTRAINT "order_product_allocations_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_product_allocations"
    ADD CONSTRAINT "order_product_allocations_purchase_item_id_fkey" FOREIGN KEY ("purchase_item_id") REFERENCES "public"."supplier_purchase_items"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."pack_events"
    ADD CONSTRAINT "pack_events_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "public"."school_packs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."packing_records"
    ADD CONSTRAINT "packing_records_checked_by_fkey" FOREIGN KEY ("checked_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."packing_records"
    ADD CONSTRAINT "packing_records_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."packing_records"
    ADD CONSTRAINT "packing_records_started_by_fkey" FOREIGN KEY ("started_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payment_events"
    ADD CONSTRAINT "payment_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."price_history"
    ADD CONSTRAINT "price_history_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."price_history"
    ADD CONSTRAINT "price_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."price_history"
    ADD CONSTRAINT "price_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."master_products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."price_history"
    ADD CONSTRAINT "price_history_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."pricing_rules"
    ADD CONSTRAINT "pricing_rules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."procurement_requirement_orders"
    ADD CONSTRAINT "procurement_requirement_orders_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."procurement_requirement_orders"
    ADD CONSTRAINT "procurement_requirement_orders_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."procurement_requirement_orders"
    ADD CONSTRAINT "procurement_requirement_orders_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "public"."procurement_requirements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."procurement_requirements"
    ADD CONSTRAINT "procurement_requirements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."master_products"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."procurement_requirements"
    ADD CONSTRAINT "procurement_requirements_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."quotation_events"
    ADD CONSTRAINT "quotation_events_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quotation_items"
    ADD CONSTRAINT "quotation_items_master_product_id_fkey" FOREIGN KEY ("master_product_id") REFERENCES "public"."master_products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."quotation_items"
    ADD CONSTRAINT "quotation_items_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quotations"
    ADD CONSTRAINT "quotations_converted_order_id_fkey" FOREIGN KEY ("converted_order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."quotations"
    ADD CONSTRAINT "quotations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."school_pack_items"
    ADD CONSTRAINT "school_pack_items_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "public"."school_packs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."school_pack_items"
    ADD CONSTRAINT "school_pack_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."master_products"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."school_packs"
    ADD CONSTRAINT "school_packs_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."school_packs"
    ADD CONSTRAINT "school_packs_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."school_packs"
    ADD CONSTRAINT "school_packs_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."schools"
    ADD CONSTRAINT "schools_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."security_audit_logs"
    ADD CONSTRAINT "security_audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."substitutions"
    ADD CONSTRAINT "substitutions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."substitutions"
    ADD CONSTRAINT "substitutions_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."substitutions"
    ADD CONSTRAINT "substitutions_original_product_id_fkey" FOREIGN KEY ("original_product_id") REFERENCES "public"."master_products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."substitutions"
    ADD CONSTRAINT "substitutions_replacement_product_id_fkey" FOREIGN KEY ("replacement_product_id") REFERENCES "public"."master_products"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."substitutions"
    ADD CONSTRAINT "substitutions_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."supplier_offers"
    ADD CONSTRAINT "supplier_offers_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."master_products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_offers"
    ADD CONSTRAINT "supplier_offers_quote_import_id_fkey" FOREIGN KEY ("quote_import_id") REFERENCES "public"."supplier_quote_imports"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."supplier_offers"
    ADD CONSTRAINT "supplier_offers_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_purchase_items"
    ADD CONSTRAINT "supplier_purchase_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."master_products"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."supplier_purchase_items"
    ADD CONSTRAINT "supplier_purchase_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."supplier_purchase_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_purchase_items"
    ADD CONSTRAINT "supplier_purchase_items_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "public"."procurement_requirements"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."supplier_purchase_orders"
    ADD CONSTRAINT "supplier_purchase_orders_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."supplier_purchase_orders"
    ADD CONSTRAINT "supplier_purchase_orders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."supplier_purchase_orders"
    ADD CONSTRAINT "supplier_purchase_orders_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."supplier_purchase_orders"
    ADD CONSTRAINT "supplier_purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."supplier_quote_imports"
    ADD CONSTRAINT "supplier_quote_imports_imported_by_fkey" FOREIGN KEY ("imported_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."supplier_quote_imports"
    ADD CONSTRAINT "supplier_quote_imports_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_receipts"
    ADD CONSTRAINT "supplier_receipts_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."supplier_purchase_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_receipts"
    ADD CONSTRAINT "supplier_receipts_received_by_fkey" FOREIGN KEY ("received_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."system_settings_audit"
    ADD CONSTRAINT "system_settings_audit_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."system_settings_audit"
    ADD CONSTRAINT "system_settings_audit_setting_key_fkey" FOREIGN KEY ("setting_key") REFERENCES "public"."system_settings"("key") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."task_comments"
    ADD CONSTRAINT "task_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."task_comments"
    ADD CONSTRAINT "task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."operational_tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."task_mentions"
    ADD CONSTRAINT "task_mentions_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."task_comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."task_mentions"
    ADD CONSTRAINT "task_mentions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."testimonials"
    ADD CONSTRAINT "testimonials_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."website_content"
    ADD CONSTRAINT "website_content_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Admin full access for orders" ON "public"."orders" TO "authenticated" USING (((( SELECT (("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text")) = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])) OR "public"."has_permission"('orders.view'::"text"))) WITH CHECK (((( SELECT (("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text")) = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])) OR "public"."has_permission"('orders.edit'::"text")));



CREATE POLICY "Admin full access to quotation items" ON "public"."quotation_items" TO "authenticated" USING ((( SELECT (("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text")) = ANY (ARRAY['admin'::"text", 'super_admin'::"text", 'service_role'::"text"]))) WITH CHECK ((( SELECT (("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text")) = ANY (ARRAY['admin'::"text", 'super_admin'::"text", 'service_role'::"text"])));



CREATE POLICY "Admin full access to quotations" ON "public"."quotations" TO "authenticated" USING ((( SELECT (("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text")) = ANY (ARRAY['admin'::"text", 'super_admin'::"text", 'service_role'::"text"]))) WITH CHECK ((( SELECT (("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text")) = ANY (ARRAY['admin'::"text", 'super_admin'::"text", 'service_role'::"text"])));



CREATE POLICY "Admin write access for pexco rates" ON "public"."pexco_rates" USING ("public"."is_staff"()) WITH CHECK ("public"."is_staff"());



CREATE POLICY "Allocation managers" ON "public"."order_product_allocations" TO "authenticated" USING ("public"."has_permission"('procurement.manage'::"text")) WITH CHECK ("public"."has_permission"('procurement.manage'::"text"));



CREATE POLICY "Allocation readers" ON "public"."order_product_allocations" FOR SELECT TO "authenticated" USING ("public"."has_permission"('procurement.view'::"text"));



CREATE POLICY "Approval managers" ON "public"."approvals" TO "authenticated" USING ("public"."has_permission"('approvals.manage'::"text")) WITH CHECK ("public"."has_permission"('approvals.manage'::"text"));



CREATE POLICY "Approval readers" ON "public"."approvals" FOR SELECT TO "authenticated" USING ("public"."is_staff"());



CREATE POLICY "Audit viewers read archived audit logs" ON "public"."audit_logs_archive" FOR SELECT TO "authenticated" USING ("public"."has_permission"('audit.view'::"text"));



CREATE POLICY "Audit viewers read archived order events" ON "public"."order_events_archive" FOR SELECT TO "authenticated" USING ("public"."has_permission"('audit.view'::"text"));



CREATE POLICY "Audit viewers read archived security audit logs" ON "public"."security_audit_logs_archive" FOR SELECT TO "authenticated" USING ("public"."has_permission"('audit.view'::"text"));



CREATE POLICY "Authenticated staff full access" ON "public"."admin_letters" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Brand package claims: anonymous insert" ON "public"."brand_package_claims" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Brand package claims: staff full access" ON "public"."brand_package_claims" TO "authenticated" USING ("public"."is_staff"()) WITH CHECK ("public"."is_staff"());



CREATE POLICY "CMS managers write FAQs" ON "public"."cms_faqs" TO "authenticated" USING ("public"."has_permission"('content.manage'::"text")) WITH CHECK ("public"."has_permission"('content.manage'::"text"));



CREATE POLICY "CMS managers write announcements" ON "public"."cms_announcements" TO "authenticated" USING ("public"."has_permission"('content.manage'::"text")) WITH CHECK ("public"."has_permission"('content.manage'::"text"));



CREATE POLICY "CMS managers write resources" ON "public"."cms_resources" TO "authenticated" USING ("public"."has_permission"('content.manage'::"text")) WITH CHECK ("public"."has_permission"('content.manage'::"text"));



CREATE POLICY "CMS managers write testimonials" ON "public"."cms_testimonials" TO "authenticated" USING ("public"."has_permission"('content.manage'::"text")) WITH CHECK ("public"."has_permission"('content.manage'::"text"));



CREATE POLICY "CMS viewers read FAQs" ON "public"."cms_faqs" FOR SELECT TO "authenticated" USING ("public"."has_permission"('content.view'::"text"));



CREATE POLICY "CMS viewers read announcements" ON "public"."cms_announcements" FOR SELECT TO "authenticated" USING ("public"."has_permission"('content.view'::"text"));



CREATE POLICY "CMS viewers read resources" ON "public"."cms_resources" FOR SELECT TO "authenticated" USING ("public"."has_permission"('content.view'::"text"));



CREATE POLICY "CMS viewers read testimonials" ON "public"."cms_testimonials" FOR SELECT TO "authenticated" USING ("public"."has_permission"('content.view'::"text"));



CREATE POLICY "Catalogue managers" ON "public"."master_products" TO "authenticated" USING ("public"."has_permission"('catalogue.manage'::"text")) WITH CHECK ("public"."has_permission"('catalogue.manage'::"text"));



CREATE POLICY "Catalogue readers" ON "public"."master_products" FOR SELECT TO "authenticated" USING ("public"."has_permission"('catalogue.view'::"text"));



CREATE POLICY "Comment readers" ON "public"."task_comments" FOR SELECT TO "authenticated" USING ("public"."has_permission"('tasks.view'::"text"));



CREATE POLICY "Comment writers" ON "public"."task_comments" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_permission"('tasks.manage'::"text"));



CREATE POLICY "Enable anonymous insert for orders" ON "public"."orders" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Enable anonymous insert for submissions" ON "public"."form_submissions" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Event readers" ON "public"."operational_events" FOR SELECT TO "authenticated" USING ("public"."is_staff"());



CREATE POLICY "Finance read payment events" ON "public"."payment_events" FOR SELECT TO "authenticated" USING ("public"."has_permission"('payments.view'::"text"));



CREATE POLICY "Finance read payments ledger" ON "public"."payments" FOR SELECT TO "authenticated" USING ("public"."has_permission"('payments.view'::"text"));



CREATE POLICY "Fulfilment managers packing" ON "public"."packing_records" TO "authenticated" USING ("public"."has_permission"('fulfilment.manage'::"text")) WITH CHECK ("public"."has_permission"('fulfilment.manage'::"text"));



CREATE POLICY "Fulfilment managers records" ON "public"."fulfilment_records" TO "authenticated" USING ("public"."has_permission"('fulfilment.manage'::"text")) WITH CHECK ("public"."has_permission"('fulfilment.manage'::"text"));



CREATE POLICY "Fulfilment readers packing" ON "public"."packing_records" FOR SELECT TO "authenticated" USING ("public"."has_permission"('fulfilment.view'::"text"));



CREATE POLICY "Fulfilment readers records" ON "public"."fulfilment_records" FOR SELECT TO "authenticated" USING ("public"."has_permission"('fulfilment.view'::"text"));



CREATE POLICY "Mention readers" ON "public"."task_mentions" FOR SELECT TO "authenticated" USING ("public"."has_permission"('tasks.view'::"text"));



CREATE POLICY "Mention writers" ON "public"."task_mentions" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_permission"('tasks.manage'::"text"));



CREATE POLICY "Operations read customers" ON "public"."customers" FOR SELECT TO "authenticated" USING ("public"."has_permission"('orders.view'::"text"));



CREATE POLICY "Operations read learners" ON "public"."learners" FOR SELECT TO "authenticated" USING ("public"."has_permission"('orders.view'::"text"));



CREATE POLICY "Operations read order items" ON "public"."order_items" FOR SELECT TO "authenticated" USING ("public"."has_permission"('orders.view'::"text"));



CREATE POLICY "Order editors manage letter templates" ON "public"."admin_letter_templates" TO "authenticated" USING ("public"."has_permission"('orders.edit'::"text")) WITH CHECK ("public"."has_permission"('orders.edit'::"text"));



CREATE POLICY "Order viewers read archived order events" ON "public"."order_events_archive" FOR SELECT TO "authenticated" USING ("public"."has_permission"('orders.view'::"text"));



CREATE POLICY "Order viewers read letter templates" ON "public"."admin_letter_templates" FOR SELECT TO "authenticated" USING ("public"."has_permission"('orders.view'::"text"));



CREATE POLICY "Pack item managers" ON "public"."school_pack_items" TO "authenticated" USING ("public"."has_permission"('packs.edit'::"text")) WITH CHECK ("public"."has_permission"('packs.edit'::"text"));



CREATE POLICY "Pack item readers" ON "public"."school_pack_items" FOR SELECT TO "authenticated" USING ("public"."has_permission"('packs.view'::"text"));



CREATE POLICY "Price history managers" ON "public"."price_history" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_permission"('pricing.manage'::"text"));



CREATE POLICY "Price history readers" ON "public"."price_history" FOR SELECT TO "authenticated" USING ("public"."has_permission"('pricing.view'::"text"));



CREATE POLICY "Pricing managers" ON "public"."pricing_rules" TO "authenticated" USING ("public"."has_permission"('pricing.manage'::"text")) WITH CHECK ("public"."has_permission"('pricing.manage'::"text"));



CREATE POLICY "Pricing readers" ON "public"."pricing_rules" FOR SELECT TO "authenticated" USING ("public"."has_permission"('pricing.view'::"text"));



CREATE POLICY "Procurement managers" ON "public"."procurement_requirements" TO "authenticated" USING ("public"."has_permission"('procurement.manage'::"text")) WITH CHECK ("public"."has_permission"('procurement.manage'::"text"));



CREATE POLICY "Procurement order managers" ON "public"."procurement_requirement_orders" TO "authenticated" USING ("public"."has_permission"('procurement.manage'::"text")) WITH CHECK ("public"."has_permission"('procurement.manage'::"text"));



CREATE POLICY "Procurement order readers" ON "public"."procurement_requirement_orders" FOR SELECT TO "authenticated" USING ("public"."has_permission"('procurement.view'::"text"));



CREATE POLICY "Procurement readers" ON "public"."procurement_requirements" FOR SELECT TO "authenticated" USING ("public"."has_permission"('procurement.view'::"text"));



CREATE POLICY "Public read access for published blog_posts" ON "public"."blog_posts" FOR SELECT TO "authenticated", "anon" USING ((("published" = true) OR ( SELECT "public"."is_staff"() AS "is_staff")));



CREATE POLICY "Public read assets" ON "public"."assets" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Public read faqs" ON "public"."faqs" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Public read for public system settings" ON "public"."system_settings" FOR SELECT TO "authenticated", "anon" USING ((("is_public" = true) AND ("is_sensitive" = false)));



CREATE POLICY "Public read school_packs" ON "public"."school_packs" FOR SELECT TO "authenticated", "anon" USING ((("visible" IS TRUE) AND ((("publication_status")::"text" = 'published'::"text") OR ("publication_status" IS NULL))));



CREATE POLICY "Public read schools" ON "public"."schools" FOR SELECT TO "anon" USING (((COALESCE("status", 'active'::"text") = 'active'::"text") AND (COALESCE("published", true) = true)));



CREATE POLICY "Public read testimonials" ON "public"."testimonials" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Purchase item managers" ON "public"."supplier_purchase_items" TO "authenticated" USING ("public"."has_permission"('procurement.manage'::"text")) WITH CHECK ("public"."has_permission"('procurement.manage'::"text"));



CREATE POLICY "Purchase item readers" ON "public"."supplier_purchase_items" FOR SELECT TO "authenticated" USING ("public"."has_permission"('procurement.view'::"text"));



CREATE POLICY "Purchase order managers" ON "public"."supplier_purchase_orders" TO "authenticated" USING ("public"."has_permission"('procurement.manage'::"text")) WITH CHECK ("public"."has_permission"('procurement.manage'::"text"));



CREATE POLICY "Purchase order readers" ON "public"."supplier_purchase_orders" FOR SELECT TO "authenticated" USING ("public"."has_permission"('procurement.view'::"text"));



CREATE POLICY "Quote import managers" ON "public"."supplier_quote_imports" TO "authenticated" USING ("public"."has_permission"('suppliers.manage'::"text")) WITH CHECK ("public"."has_permission"('suppliers.manage'::"text"));



CREATE POLICY "Quote import readers" ON "public"."supplier_quote_imports" FOR SELECT TO "authenticated" USING ("public"."has_permission"('suppliers.view'::"text"));



CREATE POLICY "Receipt managers" ON "public"."supplier_receipts" TO "authenticated" USING ("public"."has_permission"('procurement.manage'::"text")) WITH CHECK ("public"."has_permission"('procurement.manage'::"text"));



CREATE POLICY "Receipt readers" ON "public"."supplier_receipts" FOR SELECT TO "authenticated" USING ("public"."has_permission"('procurement.view'::"text"));



CREATE POLICY "Role managers write assigned_forms" ON "public"."assigned_forms" TO "authenticated" USING ("public"."has_permission"('forms.assign'::"text")) WITH CHECK ("public"."has_permission"('forms.assign'::"text"));



CREATE POLICY "Role managers write user_permissions" ON "public"."user_permissions" TO "authenticated" USING ("public"."has_permission"('users.edit'::"text")) WITH CHECK ("public"."has_permission"('users.edit'::"text"));



CREATE POLICY "Role managers write user_roles" ON "public"."user_roles" TO "authenticated" USING ("public"."has_permission"('users.edit'::"text")) WITH CHECK ("public"."has_permission"('users.edit'::"text"));



CREATE POLICY "Service role full access for blog_posts" ON "public"."blog_posts" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access for orders" ON "public"."orders" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manage auth_otp_tokens" ON "public"."auth_otp_tokens" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manage legacy_write_audit_log" ON "public"."legacy_write_audit_log" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manage school_packs" ON "public"."school_packs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manage security_audit_logs" ON "public"."security_audit_logs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manage system settings" ON "public"."system_settings" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manage system settings audit" ON "public"."system_settings_audit" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manages archived audit logs" ON "public"."audit_logs_archive" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manages archived order events" ON "public"."order_events_archive" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manages archived security audit logs" ON "public"."security_audit_logs_archive" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Staff full access for blog_posts" ON "public"."blog_posts" TO "authenticated" USING ((( SELECT "public"."is_staff"() AS "is_staff") OR "public"."has_permission"('content.view'::"text"))) WITH CHECK ((( SELECT "public"."is_staff"() AS "is_staff") OR "public"."has_permission"('content.edit'::"text")));



CREATE POLICY "Staff have full access to orders" ON "public"."orders" TO "authenticated" USING (( SELECT "public"."is_staff"() AS "is_staff")) WITH CHECK (( SELECT "public"."is_staff"() AS "is_staff"));



CREATE POLICY "Staff have full access to submissions" ON "public"."form_submissions" TO "authenticated" USING (( SELECT "public"."is_staff"() AS "is_staff")) WITH CHECK (( SELECT "public"."is_staff"() AS "is_staff"));



CREATE POLICY "Staff manage seasons" ON "public"."seasons" TO "authenticated" USING ("public"."has_permission"('settings.manage'::"text")) WITH CHECK ("public"."has_permission"('settings.manage'::"text"));



CREATE POLICY "Staff manage system settings" ON "public"."system_settings" TO "authenticated" USING ("public"."has_permission"('settings.manage'::"text")) WITH CHECK ("public"."has_permission"('settings.manage'::"text"));



CREATE POLICY "Staff manage system settings audit" ON "public"."system_settings_audit" TO "authenticated" USING ("public"."has_permission"('settings.manage'::"text")) WITH CHECK ("public"."has_permission"('settings.manage'::"text"));



CREATE POLICY "Staff read assigned_forms" ON "public"."assigned_forms" FOR SELECT TO "authenticated" USING ("public"."is_staff"());



CREATE POLICY "Staff read audit_logs" ON "public"."audit_logs" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_staff"() AS "is_staff"));



CREATE POLICY "Staff read legacy_write_audit_log" ON "public"."legacy_write_audit_log" FOR SELECT TO "authenticated" USING ("public"."has_permission"('settings.manage'::"text"));



CREATE POLICY "Staff read permissions" ON "public"."permissions" FOR SELECT TO "authenticated" USING ("public"."is_staff"());



CREATE POLICY "Staff read role_permissions" ON "public"."role_permissions" FOR SELECT TO "authenticated" USING ("public"."is_staff"());



CREATE POLICY "Staff read roles" ON "public"."roles" FOR SELECT TO "authenticated" USING ("public"."is_staff"());



CREATE POLICY "Staff read school_packs" ON "public"."school_packs" FOR SELECT TO "authenticated" USING ("public"."has_permission"('packs.view'::"text"));



CREATE POLICY "Staff read seasons" ON "public"."seasons" FOR SELECT TO "authenticated" USING ("public"."is_staff"());



CREATE POLICY "Staff read security_audit_logs" ON "public"."security_audit_logs" FOR SELECT TO "authenticated" USING ("public"."has_permission"('audit.view'::"text"));



CREATE POLICY "Staff read user_permissions" ON "public"."user_permissions" FOR SELECT TO "authenticated" USING ("public"."is_staff"());



CREATE POLICY "Staff read user_roles" ON "public"."user_roles" FOR SELECT TO "authenticated" USING ("public"."is_staff"());



CREATE POLICY "Staff view dashboard_summaries" ON "public"."dashboard_summaries" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_staff"() AS "is_staff"));



CREATE POLICY "Staff write assets" ON "public"."assets" TO "authenticated" USING ("public"."is_staff"()) WITH CHECK ("public"."is_staff"());



CREATE POLICY "Staff write faqs" ON "public"."faqs" TO "authenticated" USING ("public"."is_staff"()) WITH CHECK ("public"."is_staff"());



CREATE POLICY "Staff write school_packs" ON "public"."school_packs" TO "authenticated" USING ("public"."has_permission"('packs.edit'::"text")) WITH CHECK ("public"."has_permission"('packs.edit'::"text"));



CREATE POLICY "Staff write schools" ON "public"."schools" TO "authenticated" USING ("public"."is_staff"()) WITH CHECK ("public"."is_staff"());



CREATE POLICY "Staff write testimonials" ON "public"."testimonials" TO "authenticated" USING ("public"."is_staff"()) WITH CHECK ("public"."is_staff"());



CREATE POLICY "Staff write website_content" ON "public"."website_content" TO "authenticated" USING ("public"."is_staff"()) WITH CHECK ("public"."is_staff"());



CREATE POLICY "Substitution managers" ON "public"."substitutions" TO "authenticated" USING ("public"."has_permission"('fulfilment.manage'::"text")) WITH CHECK ("public"."has_permission"('fulfilment.manage'::"text"));



CREATE POLICY "Substitution readers" ON "public"."substitutions" FOR SELECT TO "authenticated" USING ("public"."has_permission"('fulfilment.view'::"text"));



CREATE POLICY "Supplier managers" ON "public"."suppliers" TO "authenticated" USING ("public"."has_permission"('suppliers.manage'::"text")) WITH CHECK ("public"."has_permission"('suppliers.manage'::"text"));



CREATE POLICY "Supplier offer managers" ON "public"."supplier_offers" TO "authenticated" USING ("public"."has_permission"('suppliers.manage'::"text")) WITH CHECK ("public"."has_permission"('suppliers.manage'::"text"));



CREATE POLICY "Supplier offer readers" ON "public"."supplier_offers" FOR SELECT TO "authenticated" USING ("public"."has_permission"('suppliers.view'::"text"));



CREATE POLICY "Supplier readers" ON "public"."suppliers" FOR SELECT TO "authenticated" USING ("public"."has_permission"('suppliers.view'::"text"));



CREATE POLICY "Task managers" ON "public"."operational_tasks" TO "authenticated" USING ("public"."has_permission"('tasks.manage'::"text")) WITH CHECK ("public"."has_permission"('tasks.manage'::"text"));



CREATE POLICY "Task readers" ON "public"."operational_tasks" FOR SELECT TO "authenticated" USING ("public"."has_permission"('tasks.view'::"text"));



CREATE POLICY "Users mark notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users read notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING (((("user_id" IS NULL) AND (("permission_key" IS NULL) OR "public"."has_permission"("permission_key"))) OR ("user_id" = "auth"."uid"())));



CREATE POLICY "Users read own profile" ON "public"."user_profiles" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."has_permission"('users.view'::"text")));



CREATE POLICY "Users update own profile" ON "public"."user_profiles" FOR UPDATE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."has_permission"('users.edit'::"text"))) WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."has_permission"('users.edit'::"text")));



ALTER TABLE "public"."admin_letter_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_letters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approvals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assigned_forms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs_archive" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auth_otp_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blog_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."brand_package_claims" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cms_announcements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cms_faqs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cms_resources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cms_testimonials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dashboard_summaries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."faqs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."form_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fulfilment_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."learners" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."legacy_write_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."master_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."operational_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."operational_tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_events_archive" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_product_allocations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pack_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."packing_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pexco_rates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."price_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pricing_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."procurement_requirement_orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."procurement_requirements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quotation_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quotation_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quotations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."school_pack_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."school_packs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schools" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."seasons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."security_audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."security_audit_logs_archive" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."substitutions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supplier_offers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supplier_purchase_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supplier_purchase_orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supplier_quote_imports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supplier_receipts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."suppliers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_settings_audit" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."task_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."task_mentions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."testimonials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."website_content" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_global_omnibar_search"("search_query" "text", "max_results" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_global_omnibar_search"("search_query" "text", "max_results" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_orders_dashboard"("p_search" "text", "p_status" "text", "p_limit" integer, "p_offset" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_orders_dashboard"("p_search" "text", "p_status" "text", "p_limit" integer, "p_offset" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_packs_dashboard"("p_search" "text", "p_school_id" "uuid", "p_visible" boolean, "p_limit" integer, "p_offset" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_packs_dashboard"("p_search" "text", "p_school_id" "uuid", "p_visible" boolean, "p_limit" integer, "p_offset" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_quotations_dashboard"("p_search" "text", "p_status" "text", "p_limit" integer, "p_offset" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_quotations_dashboard"("p_search" "text", "p_status" "text", "p_limit" integer, "p_offset" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."allocate_secured_demand"("p_requirement_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."allocate_secured_demand"("p_requirement_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."archive_operational_history"("retention_days" integer, "dry_run" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."archive_operational_history"("retention_days" integer, "dry_run" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."auto_expire_quotations"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."auto_expire_quotations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."blog_posts_set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."blog_posts_set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."blog_posts_set_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."calculate_grade_pack_price"("p_pack_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."calculate_grade_pack_price"("p_pack_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."claim_order_receipt_delivery"("p_order_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."claim_order_receipt_delivery"("p_order_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."complete_order_payment"("p_order_reference" "text", "p_gateway_reference" "text", "p_amount" numeric, "p_currency" "text", "p_provider" "text", "p_payment_method" "text", "p_payload" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."complete_order_payment"("p_order_reference" "text", "p_gateway_reference" "text", "p_amount" numeric, "p_currency" "text", "p_provider" "text", "p_payment_method" "text", "p_payload" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."complete_order_receipt_delivery"("p_order_id" "uuid", "p_claim_token" "uuid", "p_sent" boolean, "p_error" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."complete_order_receipt_delivery"("p_order_id" "uuid", "p_claim_token" "uuid", "p_sent" boolean, "p_error" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."convert_quotation_to_order"("p_payload" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."convert_quotation_to_order"("p_payload" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_quotation_with_items"("p_payload" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_quotation_with_items"("p_payload" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."current_operational_season_id"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."current_operational_season_id"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."explain_public_read_paths"("school_slug" "text", "search_query" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."explain_public_read_paths"("school_slug" "text", "search_query" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."fn_audit_trail_recorder"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."fn_audit_trail_recorder"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."fn_auto_link_master_product"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."fn_auto_link_master_product"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."fn_snapshot_order_item_details"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."fn_snapshot_order_item_details"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."fn_sync_order_total_amount"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."fn_sync_order_total_amount"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."fn_sync_pack_total_price"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."fn_sync_pack_total_price"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."fn_sync_packs_on_product_price_change"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."fn_sync_packs_on_product_price_change"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."fn_sync_school_pack_item_on_delete"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."fn_sync_school_pack_item_on_delete"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."fn_sync_school_pack_item_on_insert"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."fn_sync_school_pack_item_on_insert"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."fn_sync_school_pack_item_on_update"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."fn_sync_school_pack_item_on_update"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."fn_trg_pack_item_pricing_sync"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."fn_trg_pack_item_pricing_sync"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."fn_trg_pricing_settings_sync"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."fn_trg_pricing_settings_sync"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."fn_trg_product_cost_pricing_sync"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."fn_trg_product_cost_pricing_sync"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."fn_trg_supplier_offer_pricing_sync"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."fn_trg_supplier_offer_pricing_sync"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_admin_executive_dashboard"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_admin_executive_dashboard"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_admin_filter_options"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_admin_filter_options"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_admin_pack_school_groups"("q" "text", "visible_filter" "text", "page_size" integer, "page_number" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_admin_pack_school_groups"("q" "text", "visible_filter" "text", "page_size" integer, "page_number" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_admin_procurement_forecast"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_admin_procurement_forecast"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_all_pack_school_groups_json"("q" "text", "visible_filter" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_all_pack_school_groups_json"("q" "text", "visible_filter" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_assets_size"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_assets_size"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_featured_public_schools"("result_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_featured_public_schools"("result_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_featured_public_schools"("result_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_order_pack_types"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_order_pack_types"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_orders_by_pack_type"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_orders_by_pack_type"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_orders_daily"("from_date" "date", "to_date" "date") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_orders_daily"("from_date" "date", "to_date" "date") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_pack_subtotal"("pack_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_pack_subtotal"("pack_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_payment_totals"("q" "text", "status_filter" "text", "from_ts" timestamp with time zone, "to_ts" timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_payment_totals"("q" "text", "status_filter" "text", "from_ts" timestamp with time zone, "to_ts" timestamp with time zone) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_public_cms_announcements"("p_location" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_public_cms_announcements"("p_location" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_public_cms_faqs"("p_page" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_public_cms_faqs"("p_page" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_public_cms_resources"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_public_cms_resources"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_public_cms_testimonials"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_public_cms_testimonials"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_public_featured_schools"("limit_count" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_public_featured_schools"("limit_count" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_public_nearby_schools"("user_lat" double precision, "user_lng" double precision, "result_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_public_nearby_schools"("user_lat" double precision, "user_lng" double precision, "result_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_public_school_pack"("school_slug" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_public_school_pack"("school_slug" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_public_school_visibility"("school_slugs" "text"[]) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_public_school_visibility"("school_slugs" "text"[]) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_revenue_total"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_revenue_total"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_schools_by_city"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_schools_by_city"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_schools_by_district"("target_district" "text", "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_schools_by_district"("target_district" "text", "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_schools_by_district"("target_district" "text", "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_schools_near_user"("user_lat" double precision, "user_lng" double precision, "radius_meters" double precision, "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_schools_near_user"("user_lat" double precision, "user_lng" double precision, "radius_meters" double precision, "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_schools_near_user"("user_lat" double precision, "user_lng" double precision, "radius_meters" double precision, "limit_count" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."grant_role"("target_user_id" "uuid", "role_slug" "text", "granted_by" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."grant_role"("target_user_id" "uuid", "role_slug" "text", "granted_by" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."has_permission"("p_key" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."has_permission"("p_key" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_staff"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_staff"() TO "service_role";



GRANT ALL ON FUNCTION "public"."items_set_search_vector"() TO "anon";
GRANT ALL ON FUNCTION "public"."items_set_search_vector"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."items_set_search_vector"() TO "service_role";



GRANT ALL ON FUNCTION "public"."maintain_master_products_search_vector"() TO "anon";
GRANT ALL ON FUNCTION "public"."maintain_master_products_search_vector"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."maintain_master_products_search_vector"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."maintain_orders_search_vector"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."maintain_orders_search_vector"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."maintain_quotation_item_totals"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."maintain_quotation_item_totals"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."maintain_quotations_search_vector"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."maintain_quotations_search_vector"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."maintain_school_packs_search_vector"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."maintain_school_packs_search_vector"() TO "service_role";



GRANT ALL ON FUNCTION "public"."master_products_search_vector_set"() TO "anon";
GRANT ALL ON FUNCTION "public"."master_products_search_vector_set"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."master_products_search_vector_set"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."next_quotation_number"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."next_quotation_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."packs_set_search_vector"() TO "anon";
GRANT ALL ON FUNCTION "public"."packs_set_search_vector"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."packs_set_search_vector"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."publish_school_pack"("p_pack_id" "uuid", "p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."publish_school_pack"("p_pack_id" "uuid", "p_user_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."recalculate_all_grade_pack_prices"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."recalculate_all_grade_pack_prices"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."recalculate_dashboard_summaries"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."recalculate_dashboard_summaries"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."recalculate_grade_pack_price"("p_pack_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."recalculate_grade_pack_price"("p_pack_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."recalculate_quotation_totals"("p_quotation_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."recalculate_quotation_totals"("p_quotation_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."recalculate_quotation_totals_trigger"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."recalculate_quotation_totals_trigger"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."record_order_payment_status"("p_order_reference" "text", "p_gateway_reference" "text", "p_status" "text", "p_amount" numeric, "p_currency" "text", "p_payload" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."record_order_payment_status"("p_order_reference" "text", "p_gateway_reference" "text", "p_status" "text", "p_amount" numeric, "p_currency" "text", "p_payload" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."refresh_admin_operational_summaries"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."refresh_admin_operational_summaries"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."refresh_all_dashboard_summaries"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."refresh_all_dashboard_summaries"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."revoke_role"("target_user_id" "uuid", "role_slug" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."revoke_role"("target_user_id" "uuid", "role_slug" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."run_admin_data_quality_audit"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."run_admin_data_quality_audit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."school_search_query"("input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."school_search_query"("input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."school_search_query"("input" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."schools_set_search_vector"() TO "anon";
GRANT ALL ON FUNCTION "public"."schools_set_search_vector"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."schools_set_search_vector"() TO "service_role";



GRANT ALL ON FUNCTION "public"."schools_set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."schools_set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."schools_set_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."search_public_schools"("search_query" "text", "grade_filter" "text", "phase_filter" "text", "region_filter" "text", "result_limit" integer, "result_offset" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."search_public_schools"("search_query" "text", "grade_filter" "text", "phase_filter" "text", "region_filter" "text", "result_limit" integer, "result_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_user_as_admin"("target_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_user_as_admin"("target_user_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_user_permission"("target_user_id" "uuid", "permission_key" "text", "granted" boolean, "granted_by" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_user_permission"("target_user_id" "uuid", "permission_key" "text", "granted" boolean, "granted_by" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."sync_school_status_fields"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."sync_school_status_fields"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_dashboard_summary_on_order"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_dashboard_summary_on_order"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."validate_pack_for_publication"("p_pack_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."validate_pack_for_publication"("p_pack_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."master_products" TO "anon";
GRANT ALL ON TABLE "public"."master_products" TO "authenticated";
GRANT ALL ON TABLE "public"."master_products" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."school_pack_items" TO "anon";
GRANT ALL ON TABLE "public"."school_pack_items" TO "authenticated";
GRANT ALL ON TABLE "public"."school_pack_items" TO "service_role";



GRANT ALL ON TABLE "public"."school_packs" TO "anon";
GRANT ALL ON TABLE "public"."school_packs" TO "authenticated";
GRANT ALL ON TABLE "public"."school_packs" TO "service_role";



GRANT ALL ON TABLE "public"."schools" TO "anon";
GRANT ALL ON TABLE "public"."schools" TO "authenticated";
GRANT ALL ON TABLE "public"."schools" TO "service_role";



GRANT ALL ON TABLE "public"."admin_data_quality_issues_view" TO "anon";
GRANT ALL ON TABLE "public"."admin_data_quality_issues_view" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_data_quality_issues_view" TO "service_role";



GRANT ALL ON TABLE "public"."admin_letter_templates" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."admin_letter_templates" TO "authenticated";



GRANT ALL ON TABLE "public"."admin_letters" TO "anon";
GRANT ALL ON TABLE "public"."admin_letters" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_letters" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."pexco_rates" TO "anon";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."pexco_rates" TO "authenticated";
GRANT ALL ON TABLE "public"."pexco_rates" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."canonical_pack_items_view" TO "anon";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."canonical_pack_items_view" TO "authenticated";
GRANT ALL ON TABLE "public"."canonical_pack_items_view" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."admin_pack_items_view" TO "anon";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."admin_pack_items_view" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_pack_items_view" TO "service_role";



GRANT ALL ON TABLE "public"."admin_product_margin_mv" TO "service_role";



GRANT ALL ON TABLE "public"."quotations" TO "anon";
GRANT ALL ON TABLE "public"."quotations" TO "authenticated";
GRANT ALL ON TABLE "public"."quotations" TO "service_role";



GRANT ALL ON TABLE "public"."admin_quote_pipeline_mv" TO "service_role";



GRANT ALL ON TABLE "public"."admin_school_pack_health_mv" TO "service_role";



GRANT ALL ON TABLE "public"."suppliers" TO "anon";
GRANT ALL ON TABLE "public"."suppliers" TO "authenticated";
GRANT ALL ON TABLE "public"."suppliers" TO "service_role";



GRANT ALL ON TABLE "public"."admin_supplier_demand_mv" TO "service_role";



GRANT ALL ON TABLE "public"."approvals" TO "anon";
GRANT ALL ON TABLE "public"."approvals" TO "authenticated";
GRANT ALL ON TABLE "public"."approvals" TO "service_role";



GRANT ALL ON TABLE "public"."assets" TO "anon";
GRANT ALL ON TABLE "public"."assets" TO "authenticated";
GRANT ALL ON TABLE "public"."assets" TO "service_role";



GRANT ALL ON TABLE "public"."assigned_forms" TO "anon";
GRANT ALL ON TABLE "public"."assigned_forms" TO "authenticated";
GRANT ALL ON TABLE "public"."assigned_forms" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."audit_logs_archive" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs_archive" TO "service_role";



GRANT ALL ON SEQUENCE "public"."audit_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."audit_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."audit_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."auth_otp_tokens" TO "anon";
GRANT ALL ON TABLE "public"."auth_otp_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."auth_otp_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."blog_posts" TO "anon";
GRANT ALL ON TABLE "public"."blog_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_posts" TO "service_role";



GRANT ALL ON TABLE "public"."brand_package_claims" TO "anon";
GRANT ALL ON TABLE "public"."brand_package_claims" TO "authenticated";
GRANT ALL ON TABLE "public"."brand_package_claims" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."cms_announcements" TO "anon";
GRANT ALL ON TABLE "public"."cms_announcements" TO "authenticated";
GRANT ALL ON TABLE "public"."cms_announcements" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."cms_faqs" TO "anon";
GRANT ALL ON TABLE "public"."cms_faqs" TO "authenticated";
GRANT ALL ON TABLE "public"."cms_faqs" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."cms_resources" TO "anon";
GRANT ALL ON TABLE "public"."cms_resources" TO "authenticated";
GRANT ALL ON TABLE "public"."cms_resources" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."cms_testimonials" TO "anon";
GRANT ALL ON TABLE "public"."cms_testimonials" TO "authenticated";
GRANT ALL ON TABLE "public"."cms_testimonials" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."dashboard_summaries" TO "anon";
GRANT ALL ON TABLE "public"."dashboard_summaries" TO "authenticated";
GRANT ALL ON TABLE "public"."dashboard_summaries" TO "service_role";



GRANT ALL ON TABLE "public"."faqs" TO "anon";
GRANT ALL ON TABLE "public"."faqs" TO "authenticated";
GRANT ALL ON TABLE "public"."faqs" TO "service_role";



GRANT ALL ON TABLE "public"."form_submissions" TO "anon";
GRANT ALL ON TABLE "public"."form_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."form_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."fulfilment_records" TO "anon";
GRANT ALL ON TABLE "public"."fulfilment_records" TO "authenticated";
GRANT ALL ON TABLE "public"."fulfilment_records" TO "service_role";



GRANT ALL ON TABLE "public"."learners" TO "anon";
GRANT ALL ON TABLE "public"."learners" TO "authenticated";
GRANT ALL ON TABLE "public"."learners" TO "service_role";



GRANT ALL ON TABLE "public"."legacy_write_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."legacy_write_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."legacy_write_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."operational_events" TO "anon";
GRANT ALL ON TABLE "public"."operational_events" TO "authenticated";
GRANT ALL ON TABLE "public"."operational_events" TO "service_role";



GRANT ALL ON TABLE "public"."operational_tasks" TO "anon";
GRANT ALL ON TABLE "public"."operational_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."operational_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."order_events" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."order_events_archive" TO "authenticated";
GRANT ALL ON TABLE "public"."order_events_archive" TO "service_role";



GRANT ALL ON TABLE "public"."order_line_summary_view" TO "anon";
GRANT ALL ON TABLE "public"."order_line_summary_view" TO "authenticated";
GRANT ALL ON TABLE "public"."order_line_summary_view" TO "service_role";



GRANT ALL ON TABLE "public"."order_product_allocations" TO "anon";
GRANT ALL ON TABLE "public"."order_product_allocations" TO "authenticated";
GRANT ALL ON TABLE "public"."order_product_allocations" TO "service_role";



GRANT ALL ON TABLE "public"."order_readiness_view" TO "anon";
GRANT ALL ON TABLE "public"."order_readiness_view" TO "authenticated";
GRANT ALL ON TABLE "public"."order_readiness_view" TO "service_role";



GRANT ALL ON TABLE "public"."pack_events" TO "service_role";



GRANT ALL ON TABLE "public"."pack_subtotals" TO "service_role";



GRANT ALL ON TABLE "public"."packing_records" TO "anon";
GRANT ALL ON TABLE "public"."packing_records" TO "authenticated";
GRANT ALL ON TABLE "public"."packing_records" TO "service_role";



GRANT ALL ON TABLE "public"."payment_events" TO "anon";
GRANT ALL ON TABLE "public"."payment_events" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_events" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";



GRANT ALL ON TABLE "public"."price_history" TO "anon";
GRANT ALL ON TABLE "public"."price_history" TO "authenticated";
GRANT ALL ON TABLE "public"."price_history" TO "service_role";



GRANT ALL ON TABLE "public"."pricing_rules" TO "anon";
GRANT ALL ON TABLE "public"."pricing_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."pricing_rules" TO "service_role";



GRANT ALL ON TABLE "public"."procurement_requirements" TO "anon";
GRANT ALL ON TABLE "public"."procurement_requirements" TO "authenticated";
GRANT ALL ON TABLE "public"."procurement_requirements" TO "service_role";



GRANT ALL ON TABLE "public"."procurement_command_view" TO "anon";
GRANT ALL ON TABLE "public"."procurement_command_view" TO "authenticated";
GRANT ALL ON TABLE "public"."procurement_command_view" TO "service_role";



GRANT ALL ON TABLE "public"."procurement_requirement_orders" TO "anon";
GRANT ALL ON TABLE "public"."procurement_requirement_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."procurement_requirement_orders" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."public_pack_items_view" TO "anon";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."public_pack_items_view" TO "authenticated";
GRANT ALL ON TABLE "public"."public_pack_items_view" TO "service_role";



GRANT ALL ON TABLE "public"."public_school_directory_view" TO "anon";
GRANT ALL ON TABLE "public"."public_school_directory_view" TO "authenticated";
GRANT ALL ON TABLE "public"."public_school_directory_view" TO "service_role";



GRANT ALL ON TABLE "public"."quotation_events" TO "service_role";



GRANT ALL ON TABLE "public"."quotation_items" TO "anon";
GRANT ALL ON TABLE "public"."quotation_items" TO "authenticated";
GRANT ALL ON TABLE "public"."quotation_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."quotation_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."quotation_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."quotation_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."seasons" TO "anon";
GRANT ALL ON TABLE "public"."seasons" TO "authenticated";
GRANT ALL ON TABLE "public"."seasons" TO "service_role";



GRANT ALL ON TABLE "public"."security_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."security_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."security_audit_logs" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."security_audit_logs_archive" TO "authenticated";
GRANT ALL ON TABLE "public"."security_audit_logs_archive" TO "service_role";



GRANT ALL ON TABLE "public"."system_settings" TO "anon";
GRANT ALL ON TABLE "public"."system_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."system_settings" TO "service_role";



GRANT ALL ON TABLE "public"."settings_effective_view" TO "anon";
GRANT ALL ON TABLE "public"."settings_effective_view" TO "authenticated";
GRANT ALL ON TABLE "public"."settings_effective_view" TO "service_role";



GRANT ALL ON TABLE "public"."substitutions" TO "anon";
GRANT ALL ON TABLE "public"."substitutions" TO "authenticated";
GRANT ALL ON TABLE "public"."substitutions" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_offers" TO "anon";
GRANT ALL ON TABLE "public"."supplier_offers" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_offers" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_purchase_items" TO "anon";
GRANT ALL ON TABLE "public"."supplier_purchase_items" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_purchase_items" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_purchase_orders" TO "anon";
GRANT ALL ON TABLE "public"."supplier_purchase_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_purchase_orders" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_quote_imports" TO "anon";
GRANT ALL ON TABLE "public"."supplier_quote_imports" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_quote_imports" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_receipts" TO "anon";
GRANT ALL ON TABLE "public"."supplier_receipts" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_receipts" TO "service_role";



GRANT ALL ON TABLE "public"."system_settings_audit" TO "anon";
GRANT ALL ON TABLE "public"."system_settings_audit" TO "authenticated";
GRANT ALL ON TABLE "public"."system_settings_audit" TO "service_role";



GRANT ALL ON TABLE "public"."task_comments" TO "anon";
GRANT ALL ON TABLE "public"."task_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."task_comments" TO "service_role";



GRANT ALL ON TABLE "public"."task_mentions" TO "anon";
GRANT ALL ON TABLE "public"."task_mentions" TO "authenticated";
GRANT ALL ON TABLE "public"."task_mentions" TO "service_role";



GRANT ALL ON TABLE "public"."testimonials" TO "anon";
GRANT ALL ON TABLE "public"."testimonials" TO "authenticated";
GRANT ALL ON TABLE "public"."testimonials" TO "service_role";



GRANT ALL ON TABLE "public"."user_permissions" TO "anon";
GRANT ALL ON TABLE "public"."user_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."website_content" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







