-- Consolidate only the standard authenticated manager/read policy pairs.
-- Public, service-role, and archive-specific policies are deliberately excluded.
DO $$
DECLARE
  policy_spec record;
BEGIN
  FOR policy_spec IN
    SELECT *
    FROM (VALUES
      ('admin_letter_templates', 'Order editors manage letter templates', 'Order viewers read letter templates', 'has_permission(''orders.edit'')', 'has_permission(''orders.view'')'),
      ('approvals', 'Approval managers', 'Approval readers', 'has_permission(''approvals.manage'')', 'is_staff()'),
      ('assigned_forms', 'Role managers write assigned_forms', 'Staff read assigned_forms', 'has_permission(''forms.assign'')', 'is_staff()'),
      ('brands', 'Catalogue managers manage brands', 'Catalogue readers view brands', 'has_permission(''catalogue.manage'')', 'has_permission(''catalogue.view'')'),
      ('fulfilment_records', 'Fulfilment managers records', 'Fulfilment readers records', 'has_permission(''fulfilment.manage'')', 'has_permission(''fulfilment.view'')'),
      ('operational_tasks', 'Task managers', 'Task readers', 'has_permission(''tasks.manage'')', 'has_permission(''tasks.view'')'),
      ('order_product_allocations', 'Allocation managers', 'Allocation readers', 'has_permission(''procurement.manage'')', 'has_permission(''procurement.view'')'),
      ('packing_records', 'Fulfilment managers packing', 'Fulfilment readers packing', 'has_permission(''fulfilment.manage'')', 'has_permission(''fulfilment.view'')'),
      ('pricing_rules', 'Pricing managers', 'Pricing readers', 'has_permission(''pricing.manage'')', 'has_permission(''pricing.view'')'),
      ('procurement_requirement_orders', 'Procurement order managers', 'Procurement order readers', 'has_permission(''procurement.manage'')', 'has_permission(''procurement.view'')'),
      ('procurement_requirements', 'Procurement managers', 'Procurement readers', 'has_permission(''procurement.manage'')', 'has_permission(''procurement.view'')'),
      ('product_variants', 'Catalogue managers manage product variants', 'Catalogue readers view product variants', 'has_permission(''catalogue.manage'')', 'has_permission(''catalogue.view'')'),
      ('seasons', 'Staff manage seasons', 'Staff read seasons', 'has_permission(''settings.manage'')', 'is_staff()'),
      ('substitutions', 'Substitution managers', 'Substitution readers', 'has_permission(''fulfilment.manage'')', 'has_permission(''fulfilment.view'')'),
      ('supplier_offers', 'Supplier offer managers', 'Supplier offer readers', 'has_permission(''suppliers.manage'')', 'has_permission(''suppliers.view'')'),
      ('supplier_purchase_items', 'Purchase item managers', 'Purchase item readers', 'has_permission(''procurement.manage'')', 'has_permission(''procurement.view'')'),
      ('supplier_purchase_orders', 'Purchase order managers', 'Purchase order readers', 'has_permission(''procurement.manage'')', 'has_permission(''procurement.view'')'),
      ('supplier_quote_imports', 'Quote import managers', 'Quote import readers', 'has_permission(''suppliers.manage'')', 'has_permission(''suppliers.view'')'),
      ('supplier_receipts', 'Receipt managers', 'Receipt readers', 'has_permission(''procurement.manage'')', 'has_permission(''procurement.view'')'),
      ('suppliers', 'Supplier managers', 'Supplier readers', 'has_permission(''suppliers.manage'')', 'has_permission(''suppliers.view'')'),
      ('user_permissions', 'Role managers write user_permissions', 'Staff read user_permissions', 'has_permission(''users.edit'')', 'is_staff()'),
      ('user_roles', 'Role managers write user_roles', 'Staff read user_roles', 'has_permission(''users.edit'')', 'is_staff()')
    ) AS policies(table_name, manager_policy, reader_policy, manager_predicate, reader_predicate)
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_spec.manager_policy, policy_spec.table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_spec.reader_policy, policy_spec.table_name);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING ((%s) OR (%s))',
      policy_spec.table_name || ' read access', policy_spec.table_name,
      policy_spec.reader_predicate, policy_spec.manager_predicate
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (%s)',
      policy_spec.table_name || ' insert access', policy_spec.table_name,
      policy_spec.manager_predicate
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (%s) WITH CHECK (%s)',
      policy_spec.table_name || ' update access', policy_spec.table_name,
      policy_spec.manager_predicate, policy_spec.manager_predicate
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (%s)',
      policy_spec.table_name || ' delete access', policy_spec.table_name,
      policy_spec.manager_predicate
    );
  END LOOP;
END;
$$;
