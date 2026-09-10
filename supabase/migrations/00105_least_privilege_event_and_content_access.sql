-- Database audit: server-only operational events and least-privilege CMS documents.
BEGIN;

-- Event payloads include actor emails and JSON operational detail. They are written
-- and read through server-side admin code, never by browser clients.
DROP POLICY IF EXISTS order_events_read ON public.order_events;
DROP POLICY IF EXISTS order_events_insert ON public.order_events;
DROP POLICY IF EXISTS pack_events_read ON public.pack_events;
DROP POLICY IF EXISTS pack_events_insert ON public.pack_events;
DROP POLICY IF EXISTS quotation_events_read ON public.quotation_events;
DROP POLICY IF EXISTS quotation_events_insert ON public.quotation_events;

REVOKE ALL ON TABLE public.order_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.pack_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.quotation_events FROM anon, authenticated;

-- Website content is rendered through the server-side allow-listed CMS reader.
-- Do not leave a direct table policy that could expose future non-public keys.
DROP POLICY IF EXISTS "Public read website_content" ON public.website_content;
REVOKE ALL ON TABLE public.website_content FROM anon, authenticated;

-- The remote table pre-dates this migration, so recreate its role policies
-- explicitly instead of relying on an earlier migration having run there.
DROP POLICY IF EXISTS "Authenticated staff full access letter templates" ON public.admin_letter_templates;
DROP POLICY IF EXISTS "Order viewers read letter templates" ON public.admin_letter_templates;
DROP POLICY IF EXISTS "Order editors manage letter templates" ON public.admin_letter_templates;

REVOKE ALL ON TABLE public.admin_letter_templates FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_letter_templates TO authenticated;

CREATE POLICY "Order viewers read letter templates"
  ON public.admin_letter_templates
  FOR SELECT
  TO authenticated
  USING (public.has_permission('orders.view'));

CREATE POLICY "Order editors manage letter templates"
  ON public.admin_letter_templates
  FOR ALL
  TO authenticated
  USING (public.has_permission('orders.edit'))
  WITH CHECK (public.has_permission('orders.edit'));

COMMIT;