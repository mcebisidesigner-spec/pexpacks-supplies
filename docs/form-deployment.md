# PexPacks Form Backend Deployment

## Overview

The PexPacks form backend runs at `POST /api/forms/submit` using a Next.js App Router route handler with `runtime = "nodejs"`. It validates submissions, blocks honeypot spam, rate-limits with Upstash Redis when configured, optionally verifies hCaptcha, sends Resend email notifications, and appends valid submissions to Google Sheets.

## Environment Variables

Add these to Vercel or the production host:

```text
RESEND_API_KEY=
PEXPACKS_NOTIFICATION_EMAIL=pexpacks@gmail.com
PEXPACKS_FROM_EMAIL=

GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SHEETS_PRIVATE_KEY=
GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SHEETS_SHEET_NAME=Submissions

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

CAPTCHA_ENABLED=false
HCAPTCHA_SECRET_KEY=
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=

NEXT_PUBLIC_SITE_URL=https://pexpacks.co.za
NODE_ENV=production
```

Never prefix secrets with `NEXT_PUBLIC_`.

## Resend Setup

1. Create or log in to the Resend account.
2. Verify the sending domain or sender address for `pexpacks.co.za`.
3. Create a Resend API key and store it as `RESEND_API_KEY`.
4. Set `PEXPACKS_NOTIFICATION_EMAIL=pexpacks@gmail.com`.
5. Set `PEXPACKS_FROM_EMAIL` to a verified sender such as `PexPacks <no-reply@pexpacks.co.za>`.
6. Submit a live test form and confirm the notification email arrives.

The email includes HTML and plain text content, the submission ID, timestamp, form type, contact details, optional school/business fields, consent, page URL, user agent, and hashed IP reference.

## Google Sheets Setup

1. Create a Google Cloud service account.
2. Enable the Google Sheets API for the project.
3. Create a spreadsheet and add a tab named `Submissions`.
4. Add the columns in this exact order:

```text
submissionId
submittedAt
formType
fullName
phone
email
preferredContactMethod
schoolName
grade
learnerName
businessName
orderQuantity
packType
suburb
city
province
message
consent
pageUrl
userAgent
status
source
```

5. Share the Google Sheet with the service account email.
6. Store the service account email as `GOOGLE_SHEETS_CLIENT_EMAIL`.
7. Store the private key as `GOOGLE_SHEETS_PRIVATE_KEY`; if the host stores it on one line, keep escaped newline characters as `\n`.
8. Store the spreadsheet ID as `GOOGLE_SHEETS_SPREADSHEET_ID`.

Consent is stored as `TRUE` in the consent column, and the server-side `submittedAt` timestamp is the consent timestamp.

## Spam Protection

- Honeypot: frontend forms include `companyWebsite`; if filled, the backend returns generic success and does not send or save.
- Rate limiting: Upstash Redis is used when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are configured. The current limit is 5 submissions per 10 minutes per hashed IP.
- hCaptcha: only enforced when `CAPTCHA_ENABLED=true`. Add `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` so the frontend can generate a token, and keep `HCAPTCHA_SECRET_KEY` server-only. The backend verifies tokens server-side with hCaptcha `siteverify`.

If Upstash is not configured, rate limiting fails open. Configure it before paid marketing or high-traffic launch.

## POPIA-Aware Wording

Frontend forms include:

```text
I agree that PexPacks may use my information to contact me about this enquiry, prepare my stationery pack request, and provide related support.
```

Privacy notice:

```text
We only use your details to respond to your enquiry and manage your stationery pack request.
```

The form collects only fields needed to respond to stationery pack, office pack, partnership, and contact enquiries.

## Local Testing

Run:

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run dev
```

Manual cases:

- valid contact enquiry
- valid school pack enquiry
- valid office pack enquiry
- valid bulk order enquiry
- missing full name
- missing phone
- invalid email
- missing consent
- filled `companyWebsite` honeypot
- message containing `<script>`
- missing Resend config
- missing Google Sheets config
- hCaptcha enabled with invalid or missing token

Without Resend or Google Sheets credentials, valid submissions should return the friendly failure message because no integration can accept the submission. Honeypot submissions should return success without integrations.

## Production Deployment

1. Commit the code changes without committing `.env`.
2. Add all production environment variables in Vercel.
3. Build command: `npm run build`.
4. The API route uses Node runtime; do not force it to Edge.
5. Deploy to the production domain.
6. Submit a real test enquiry.
7. Confirm email arrives at `pexpacks@gmail.com`.
8. Confirm a Google Sheet row is created.
9. Confirm no secrets appear in browser devtools.
10. Confirm production logs do not print full personal details.

## Troubleshooting

Resend email not sending:

- Check `RESEND_API_KEY`.
- Check verified sender/domain.
- Check `PEXPACKS_FROM_EMAIL`.
- Check server logs for `resend_error` or `email_exception`.

Google Sheets not saving:

- Check `GOOGLE_SHEETS_SPREADSHEET_ID`.
- Check `GOOGLE_SHEETS_SHEET_NAME`.
- Confirm the service account email has sheet access.
- Check private key newline formatting.
- Check server logs for `google_sheets_error`.

Rate limiting not working:

- Check `UPSTASH_REDIS_REST_URL`.
- Check `UPSTASH_REDIS_REST_TOKEN`.
- Confirm the route receives `x-forwarded-for` on the host.

CAPTCHA not working:

- Check `CAPTCHA_ENABLED`.
- Check `HCAPTCHA_SECRET_KEY`.
- Check `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`.
- Confirm the frontend sends `captchaToken` before enabling CAPTCHA.

Consent validation failing:

- Confirm the frontend checkbox sends `consent=true`.
- Confirm the API receives a POST JSON payload.
