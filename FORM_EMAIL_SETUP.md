# PexPacks Form Email Setup

## Overview

Web3Forms has been removed. PexPacks now submits website forms to internal Next.js App Router endpoints under `app/api/forms/*`. Those route handlers validate the payload server-side and send notification emails through Nodemailer using generic SMTP credentials.

```text
Frontend form -> internal Next.js endpoint -> validation -> Nodemailer SMTP -> JSON response
```

Nodemailer requires a Node.js server runtime. This project is not configured with `output: "export"`, so internal API route handlers can run in the current Next.js deployment shape.

## Environment Variables

Create `.env.local` for local development and add the same values to production deployment secrets:

```text
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=orders@pexpacks.co.za
SMTP_PASS=your_smtp_password
SMTP_FROM_EMAIL=website@pexpacks.co.za
SMTP_FROM_NAME=PexPacks Website
SMTP_TO_EMAIL=info@pexpacks.co.za
SMTP_REPLY_TO_EMAIL=info@pexpacks.co.za

SMTP_CONTACT_TO_EMAIL=
SMTP_ORDERS_TO_EMAIL=
SMTP_QUOTES_TO_EMAIL=
SMTP_PARTNERSHIPS_TO_EMAIL=
SMTP_OFFICE_PACKS_TO_EMAIL=

NEXT_PUBLIC_SITE_URL=https://pexpacks.co.za
SITE_URL=https://pexpacks.co.za
```

Do not prefix SMTP values with `NEXT_PUBLIC_`. Client-side variables are exposed to the browser.

## Endpoints

| Endpoint                             | Used for                                                               |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `POST /api/forms/contact`            | General contact, add-school requests, track-order requests             |
| `POST /api/forms/order`              | School pack, full pack, custom pack, and standard pack order enquiries |
| `POST /api/forms/office-pack`        | Office pack enquiries                                                  |
| `POST /api/forms/school-partnership` | School partnership enquiries                                           |
| `POST /api/forms/quote`              | Bulk order and quote-style enquiries                                   |

All endpoints return:

```json
{
  "success": true,
  "message": "Thank you. Your message has been sent successfully."
}
```

Validation errors return a generic message plus an `errors` object. SMTP failures return a generic user-facing error without exposing provider details or credentials.

## Local Testing

1. Add real SMTP values to `.env.local`.
2. Run `npm run dev`.
3. Submit each public form:
   - Contact form
   - Order checkout form
   - Office pack enquiry path
   - School partnership form
   - Add Your School form
   - Track Order form
4. Confirm the UI shows success only after the SMTP send succeeds.
5. Confirm the email reaches the expected inbox.

## Troubleshooting

| Issue                                      | Check                                                                                    |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `We could not send your message right now` | Missing/incorrect SMTP env values, blocked SMTP port, or provider authentication failure |
| SMTP authentication fails                  | Confirm username, password/app password, MFA requirements, and provider SMTP settings    |
| Mail lands in spam                         | Configure SPF, DKIM, and DMARC for the sending domain                                    |
| Validation errors                          | Confirm required fields and field lengths in `lib/forms/validation.ts`                   |
| Honeypot submissions appear successful     | Expected behavior; they are not emailed                                                  |

## Adding A New Form

1. Pick the closest endpoint or add a new App Router route under `app/api/forms`.
2. Add validation rules in `lib/forms/validation.ts`.
3. Add or adjust fields in `lib/email/templates.ts`.
4. Submit from the client using `fetch()` to the internal endpoint.
5. Keep SMTP secrets server-only.

## Future Storage Note

The form route handler is structured so a future Supabase insert can happen before `sendPexPacksEmail`. Do not add Supabase dependencies until form persistence is explicitly required.
