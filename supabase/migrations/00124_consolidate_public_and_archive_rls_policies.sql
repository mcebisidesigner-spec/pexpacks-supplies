-- Consolidate the final exceptional read-policy pairs while retaining public predicates.

-- Published posts stay publicly readable. Staff/content viewers retain draft visibility;
-- only staff/content editors can create or change posts.
DROP POLICY IF EXISTS "Public read access for published blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Staff full access for blog_posts" ON public.blog_posts;
CREATE POLICY "Blog post read access"
  ON public.blog_posts FOR SELECT TO anon, authenticated
  USING (
    published = true
    OR (SELECT public.is_staff())
    OR (SELECT public.has_permission('content.view'))
  );
CREATE POLICY "Blog post insert access"
  ON public.blog_posts FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT public.is_staff())
    OR (SELECT public.has_permission('content.edit'))
  );
CREATE POLICY "Blog post update access"
  ON public.blog_posts FOR UPDATE TO authenticated
  USING (
    (SELECT public.is_staff())
    OR (SELECT public.has_permission('content.view'))
  )
  WITH CHECK (
    (SELECT public.is_staff())
    OR (SELECT public.has_permission('content.edit'))
  );
CREATE POLICY "Blog post delete access"
  ON public.blog_posts FOR DELETE TO authenticated
  USING (
    (SELECT public.is_staff())
    OR (SELECT public.has_permission('content.view'))
  );

-- Archived events remain readable to either audit or order viewers; writes stay service-role only.
DROP POLICY IF EXISTS "Audit viewers read archived order events" ON public.order_events_archive;
DROP POLICY IF EXISTS "Order viewers read archived order events" ON public.order_events_archive;
CREATE POLICY "Archived order event read access"
  ON public.order_events_archive FOR SELECT TO authenticated
  USING (
    (SELECT public.has_permission('audit.view'))
    OR (SELECT public.has_permission('orders.view'))
  );

-- Only explicitly public and non-sensitive settings are exposed to browser roles.
-- Settings managers retain full management access; service-role policy remains unchanged.
DROP POLICY IF EXISTS "Public read for public system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Staff manage system settings" ON public.system_settings;
CREATE POLICY "System setting read access"
  ON public.system_settings FOR SELECT TO anon, authenticated
  USING (
    (is_public = true AND is_sensitive = false)
    OR (SELECT public.has_permission('settings.manage'))
  );
CREATE POLICY "System setting insert access"
  ON public.system_settings FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.has_permission('settings.manage')));
CREATE POLICY "System setting update access"
  ON public.system_settings FOR UPDATE TO authenticated
  USING ((SELECT public.has_permission('settings.manage')))
  WITH CHECK ((SELECT public.has_permission('settings.manage')));
CREATE POLICY "System setting delete access"
  ON public.system_settings FOR DELETE TO authenticated
  USING ((SELECT public.has_permission('settings.manage')));
