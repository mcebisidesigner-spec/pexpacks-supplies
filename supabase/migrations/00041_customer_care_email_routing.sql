-- Route public customer inquiries through the canonical care mailbox.
-- This forward migration preserves historical migrations while updating
-- already-provisioned environments that still hold legacy support-email data.

DO $$
BEGIN
  IF to_regclass('public.system_settings') IS NOT NULL THEN
    INSERT INTO public.system_settings (
      key,
      category,
      value,
      value_type,
      scope,
      description,
      is_sensitive,
      is_public,
      requires_approval
    )
    VALUES (
      'business.support_email',
      'business',
      '"care@pexpacks.co.za"'::jsonb,
      'email',
      'global',
      'Primary public customer service email address',
      false,
      true,
      false
    )
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value,
          value_type = EXCLUDED.value_type,
          description = EXCLUDED.description,
          is_public = EXCLUDED.is_public,
          updated_at = now(),
          version = system_settings.version + 1;
  END IF;

  IF to_regclass('public.website_content') IS NOT NULL THEN
    UPDATE public.website_content
      SET value = jsonb_set(
        COALESCE(value, '{}'::jsonb),
        '{support_email}',
        '"care@pexpacks.co.za"'::jsonb,
        true
      ),
      updated_at = now()
    WHERE key = 'company_info';
  END IF;
END $$;
