# Pexpacks Paystack Payment Integration

## Overview

The Pexpacks Supplies checkout uses Paystack as its payment gateway. When a user completes
the checkout form, the API creates a pending order in Supabase, initializes a Paystack
transaction, and redirects the user to Paystack's secure checkout page. After successful
payment, Paystack sends a webhook that updates the order status to `paid`.

## Architecture

```
User → /schools/[slug]/[gradeSlug] → "Buy Full Pack" → /checkout
                                                           │
                                                           ▼
                                                    /api/checkout
                                                           │
                                              ┌────────────┼────────────┐
                                              ▼            ▼            ▼
                                        Supabase:     Paystack:    Returns
                                        insert        initialize   checkoutUrl
                                        order         transaction     │
                                        (pending_                     │
                                         payment)                     │
                                                                      ▼
                                                              Redirect to
                                                              Paystack
                                                                  │
                                                                  ▼
                                                          User pays on
                                                          Paystack
                                                              │
                                                              ▼
                                                     Paystack webhook
                                                     /api/webhooks/
                                                       paystack
                                                          │
                                                          ▼
                                                    Verify HMAC-SHA512
                                                    signature
                                                          │
                                                          ▼
                                                    Mark order as
                                                    "paid" in
                                                    Supabase
                                                          │
                                                          ▼
                                              Redirect to /checkout/success
```

## Route Map

| Route | Method | Purpose |
|---|---|---|
| `/checkout` | GET | Checkout page with form |
| `/checkout/success` | GET | Payment success confirmation |
| `/checkout/cancelled` | GET | Payment cancelled/failed |
| `/api/checkout` | POST | Create order + init Paystack |
| `/api/webhooks/paystack` | POST | Paystack payment notification |
| `/api/orders/status` | GET | Poll order status from success page |

## Required Environment Variables

```bash
# Paystack
PAYSTACK_SECRET_KEY=sk_live_...         # Secret key from Paystack dashboard

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=              # Required for webhook order updates

# Site
NEXT_PUBLIC_SITE_URL=https://pexpacks.co.za
```

## Paystack Dashboard Configuration

1. **Webhook URL:**
   `https://pexpacks.co.za/api/webhooks/paystack`

2. **Callback URL** (configured per transaction):
   `https://pexpacks.co.za/checkout/success?ref={order_reference}`

## Database Schema

The `orders` table was extended with these columns:

| Column | Type | Purpose |
|---|---|---|
| `paid_at` | `timestamptz` | When payment was confirmed |
| `payment_gateway` | `text` | Always `paystack` |
| `gateway_reference` | `text` | Paystack transaction reference |
| `metadata` | `jsonb` | Extra Paystack metadata |

Default `status` changed from `pending` to `pending_payment`.

## Security

- **Webhook signatures**: HMAC-SHA512 verified using `PAYSTACK_SECRET_KEY`
- **Amount validation**: Server verifies Paystack amount matches order total
- **No secret exposure**: `PAYSTACK_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` never
  reach the client bundle
- **Idempotent webhooks**: Already-paid orders are not double-updated
- **Server-side pricing**: Checkout API resolves pack price server-side; client-submitted
  prices are not trusted without verification

## Order Statuses

| Status | Description |
|---|---|
| `pending_payment` | Created, awaiting Paystack confirmation |
| `paid` | Payment verified via webhook |
| `payment_failed` | Payment declined or failed |
| `cancelled` | User cancelled at Paystack |
| `refunded` | Refund issued |

## Testing

1. Start dev server: `npm run dev`
2. Visit `/schools/[slug]/[gradeSlug]` for a school
3. Click "Buy Full Pack" — should redirect to `/checkout`
4. Fill in buyer and learner details
5. Click "Pay Securely"
6. On Paystack test page, use card `4084 0840 8408 4084`, any future date, any CVV
7. After payment, you should be redirected to `/checkout/success?ref=PEX-...`
8. Verify in Supabase: order status changed to `paid`

## File Reference

| File | Purpose |
|---|---|
| `app/checkout/page.tsx` | Checkout page (server component) |
| `app/checkout/CheckoutForm.tsx` | Client form with validation + submission |
| `app/checkout/Checkout.module.css` | Checkout page styles |
| `app/checkout/success/page.tsx` | Payment success page |
| `app/checkout/cancelled/page.tsx` | Payment cancelled page |
| `app/api/checkout/route.ts` | Create order + init Paystack |
| `app/api/webhooks/paystack/route.ts` | Paystack webhook receiver |
| `app/api/orders/status/route.ts` | Order status check endpoint |
| `lib/paystack.ts` | Paystack API client + signature verification |
| `lib/orders.ts` | Order CRUD operations |
| `lib/validation/checkout.ts` | Form validation |
| `lib/supabase/admin.ts` | Service-role Supabase client for webhooks |
| `types/orders.ts` | Shared TypeScript types |
