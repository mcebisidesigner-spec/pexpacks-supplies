-- Split overlapping manager/read RLS policies without changing authorization outcomes.
-- A combined SELECT policy preserves the previous permissive OR semantics; explicit
-- INSERT/UPDATE/DELETE policies preserve manager-only mutations.

-- CMS: content.manage implies reads and mutations; content.view remains read-only.
DROP POLICY IF EXISTS "CMS managers write announcements" ON public.cms_announcements;
DROP POLICY IF EXISTS "CMS viewers read announcements" ON public.cms_announcements;
CREATE POLICY "CMS announcement read access"
  ON public.cms_announcements FOR SELECT TO authenticated
  USING (public.has_permission('content.view') OR public.has_permission('content.manage'));
CREATE POLICY "CMS announcement insert access"
  ON public.cms_announcements FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('content.manage'));
CREATE POLICY "CMS announcement update access"
  ON public.cms_announcements FOR UPDATE TO authenticated
  USING (public.has_permission('content.manage'))
  WITH CHECK (public.has_permission('content.manage'));
CREATE POLICY "CMS announcement delete access"
  ON public.cms_announcements FOR DELETE TO authenticated
  USING (public.has_permission('content.manage'));

DROP POLICY IF EXISTS "CMS managers write FAQs" ON public.cms_faqs;
DROP POLICY IF EXISTS "CMS viewers read FAQs" ON public.cms_faqs;
CREATE POLICY "CMS FAQ read access"
  ON public.cms_faqs FOR SELECT TO authenticated
  USING (public.has_permission('content.view') OR public.has_permission('content.manage'));
CREATE POLICY "CMS FAQ insert access"
  ON public.cms_faqs FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('content.manage'));
CREATE POLICY "CMS FAQ update access"
  ON public.cms_faqs FOR UPDATE TO authenticated
  USING (public.has_permission('content.manage'))
  WITH CHECK (public.has_permission('content.manage'));
CREATE POLICY "CMS FAQ delete access"
  ON public.cms_faqs FOR DELETE TO authenticated
  USING (public.has_permission('content.manage'));

DROP POLICY IF EXISTS "CMS managers write resources" ON public.cms_resources;
DROP POLICY IF EXISTS "CMS viewers read resources" ON public.cms_resources;
CREATE POLICY "CMS resource read access"
  ON public.cms_resources FOR SELECT TO authenticated
  USING (public.has_permission('content.view') OR public.has_permission('content.manage'));
CREATE POLICY "CMS resource insert access"
  ON public.cms_resources FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('content.manage'));
CREATE POLICY "CMS resource update access"
  ON public.cms_resources FOR UPDATE TO authenticated
  USING (public.has_permission('content.manage'))
  WITH CHECK (public.has_permission('content.manage'));
CREATE POLICY "CMS resource delete access"
  ON public.cms_resources FOR DELETE TO authenticated
  USING (public.has_permission('content.manage'));

DROP POLICY IF EXISTS "CMS managers write testimonials" ON public.cms_testimonials;
DROP POLICY IF EXISTS "CMS viewers read testimonials" ON public.cms_testimonials;
CREATE POLICY "CMS testimonial read access"
  ON public.cms_testimonials FOR SELECT TO authenticated
  USING (public.has_permission('content.view') OR public.has_permission('content.manage'));
CREATE POLICY "CMS testimonial insert access"
  ON public.cms_testimonials FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('content.manage'));
CREATE POLICY "CMS testimonial update access"
  ON public.cms_testimonials FOR UPDATE TO authenticated
  USING (public.has_permission('content.manage'))
  WITH CHECK (public.has_permission('content.manage'));
CREATE POLICY "CMS testimonial delete access"
  ON public.cms_testimonials FOR DELETE TO authenticated
  USING (public.has_permission('content.manage'));

-- Catalogue: catalogue.manage retains write access and catalogue.view remains read-only.
DROP POLICY IF EXISTS "Catalogue managers" ON public.master_products;
DROP POLICY IF EXISTS "Catalogue readers" ON public.master_products;
CREATE POLICY "Catalogue product read access"
  ON public.master_products FOR SELECT TO authenticated
  USING (public.has_permission('catalogue.view') OR public.has_permission('catalogue.manage'));
CREATE POLICY "Catalogue product insert access"
  ON public.master_products FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('catalogue.manage'));
CREATE POLICY "Catalogue product update access"
  ON public.master_products FOR UPDATE TO authenticated
  USING (public.has_permission('catalogue.manage'))
  WITH CHECK (public.has_permission('catalogue.manage'));
CREATE POLICY "Catalogue product delete access"
  ON public.master_products FOR DELETE TO authenticated
  USING (public.has_permission('catalogue.manage'));

-- Pack items: packs.edit retains write access and packs.view remains read-only.
DROP POLICY IF EXISTS "Pack item managers" ON public.school_pack_items;
DROP POLICY IF EXISTS "Pack item readers" ON public.school_pack_items;
CREATE POLICY "Pack item read access"
  ON public.school_pack_items FOR SELECT TO authenticated
  USING (public.has_permission('packs.view') OR public.has_permission('packs.edit'));
CREATE POLICY "Pack item insert access"
  ON public.school_pack_items FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('packs.edit'));
CREATE POLICY "Pack item update access"
  ON public.school_pack_items FOR UPDATE TO authenticated
  USING (public.has_permission('packs.edit'))
  WITH CHECK (public.has_permission('packs.edit'));
CREATE POLICY "Pack item delete access"
  ON public.school_pack_items FOR DELETE TO authenticated
  USING (public.has_permission('packs.edit'));

-- School packs: public published read contract is retained alongside staff read/write.
DROP POLICY IF EXISTS "Public read school_packs" ON public.school_packs;
DROP POLICY IF EXISTS "Staff read school_packs" ON public.school_packs;
DROP POLICY IF EXISTS "Staff write school_packs" ON public.school_packs;
CREATE POLICY "School pack read access"
  ON public.school_packs FOR SELECT TO anon, authenticated
  USING (
    (visible IS TRUE AND ((publication_status)::text = 'published' OR publication_status IS NULL))
    OR public.has_permission('packs.view')
    OR public.has_permission('packs.edit')
  );
CREATE POLICY "School pack insert access"
  ON public.school_packs FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('packs.edit'));
CREATE POLICY "School pack update access"
  ON public.school_packs FOR UPDATE TO authenticated
  USING (public.has_permission('packs.edit'))
  WITH CHECK (public.has_permission('packs.edit'));
CREATE POLICY "School pack delete access"
  ON public.school_packs FOR DELETE TO authenticated
  USING (public.has_permission('packs.edit'));

-- Orders: retain the current union of admin, delegated orders, and staff access.
DROP POLICY IF EXISTS "Admin full access for orders" ON public.orders;
DROP POLICY IF EXISTS "Staff have full access to orders" ON public.orders;
CREATE POLICY "Orders read access"
  ON public.orders FOR SELECT TO authenticated
  USING (
    ((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (SELECT public.has_permission('orders.view'))
    OR (SELECT public.is_staff())
  );
CREATE POLICY "Orders insert access"
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK (
    ((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (SELECT public.has_permission('orders.edit'))
    OR (SELECT public.is_staff())
  );
CREATE POLICY "Orders update access"
  ON public.orders FOR UPDATE TO authenticated
  USING (
    ((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (SELECT public.has_permission('orders.view'))
    OR (SELECT public.is_staff())
  )
  WITH CHECK (
    ((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (SELECT public.has_permission('orders.edit'))
    OR (SELECT public.is_staff())
  );
CREATE POLICY "Orders delete access"
  ON public.orders FOR DELETE TO authenticated
  USING (
    ((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (SELECT public.has_permission('orders.view'))
    OR (SELECT public.is_staff())
  );
