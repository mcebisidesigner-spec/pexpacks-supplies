-- Capture and safely tighten the remote-only payment/quotation contract drift.
-- This migration intentionally aborts rather than silently changing historical money values.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.payments
    WHERE amount IS NULL
       OR currency IS NULL OR btrim(currency) = ''
       OR payment_gateway IS NULL OR btrim(payment_gateway) = ''
       OR status IS NULL OR btrim(status) = ''
       OR created_at IS NULL
  ) THEN
    RAISE EXCEPTION
      'Cannot enforce payments integrity: complete the incomplete payment rows before retrying.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.quotations
    WHERE discount_amount IS DISTINCT FROM round(discount_amount, 2)
       OR delivery_fee IS DISTINCT FROM round(delivery_fee, 2)
  ) THEN
    RAISE EXCEPTION
      'Cannot narrow quotation monetary precision: normalize values with more than two decimal places first.';
  END IF;
END;
$$;

ALTER TABLE public.payments
  ALTER COLUMN amount TYPE numeric(12,2) USING amount::numeric(12,2),
  ALTER COLUMN amount SET NOT NULL,
  ALTER COLUMN currency SET DEFAULT 'ZAR',
  ALTER COLUMN currency SET NOT NULL,
  ALTER COLUMN payment_gateway SET DEFAULT 'ozow',
  ALTER COLUMN payment_gateway SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'Complete',
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN metadata SET DEFAULT '{}'::jsonb,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE public.quotations
  ALTER COLUMN discount_amount TYPE numeric(12,2) USING discount_amount::numeric(12,2),
  ALTER COLUMN delivery_fee TYPE numeric(12,2) USING delivery_fee::numeric(12,2);

COMMENT ON TABLE public.payments IS
  'Server-managed payment ledger. Payment completion is written only by service-role payment RPCs.';
