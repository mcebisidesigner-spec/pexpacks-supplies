-- Prevent duplicate purchase receipts when gateway and database webhooks overlap.
-- A short-lived claim token gives exactly one worker responsibility for a receipt.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS receipt_email_processing_at timestamptz,
  ADD COLUMN IF NOT EXISTS receipt_email_claim_token uuid,
  ADD COLUMN IF NOT EXISTS receipt_email_last_error text;

CREATE OR REPLACE FUNCTION public.claim_order_receipt_delivery(p_order_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.complete_order_receipt_delivery(
  p_order_id uuid,
  p_claim_token uuid,
  p_sent boolean,
  p_error text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

REVOKE ALL ON FUNCTION public.claim_order_receipt_delivery(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_order_receipt_delivery(uuid, uuid, boolean, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_order_receipt_delivery(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_order_receipt_delivery(uuid, uuid, boolean, text) TO service_role;