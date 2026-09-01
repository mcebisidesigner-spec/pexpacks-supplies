-- Migration 00090: Harden Content CMS admin policies
-- ============================================================================
-- The app writes CMS content through server actions guarded by content.manage.
-- Mirror that boundary in RLS so a plain authenticated browser session cannot
-- write CMS tables directly.
-- ============================================================================

DROP POLICY IF EXISTS "Admin full CMS access" ON public.cms_announcements;
DROP POLICY IF EXISTS "Admin full FAQ access" ON public.cms_faqs;
DROP POLICY IF EXISTS "Admin full Testimonial access" ON public.cms_testimonials;
DROP POLICY IF EXISTS "Admin full Resource access" ON public.cms_resources;

DROP POLICY IF EXISTS "CMS managers write announcements" ON public.cms_announcements;
DROP POLICY IF EXISTS "CMS managers write FAQs" ON public.cms_faqs;
DROP POLICY IF EXISTS "CMS managers write testimonials" ON public.cms_testimonials;
DROP POLICY IF EXISTS "CMS managers write resources" ON public.cms_resources;

CREATE POLICY "CMS managers write announcements"
  ON public.cms_announcements
  FOR ALL
  TO authenticated
  USING (public.has_permission('content.manage'))
  WITH CHECK (public.has_permission('content.manage'));

CREATE POLICY "CMS managers write FAQs"
  ON public.cms_faqs
  FOR ALL
  TO authenticated
  USING (public.has_permission('content.manage'))
  WITH CHECK (public.has_permission('content.manage'));

CREATE POLICY "CMS managers write testimonials"
  ON public.cms_testimonials
  FOR ALL
  TO authenticated
  USING (public.has_permission('content.manage'))
  WITH CHECK (public.has_permission('content.manage'));

CREATE POLICY "CMS managers write resources"
  ON public.cms_resources
  FOR ALL
  TO authenticated
  USING (public.has_permission('content.manage'))
  WITH CHECK (public.has_permission('content.manage'));
