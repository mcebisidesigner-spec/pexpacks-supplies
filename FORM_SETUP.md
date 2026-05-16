# PexPacks Form Handler - Web3Forms Setup

## Overview

PexPacks submits website enquiries through a single Next.js API route:

```text
Browser form -> POST /api/forms/submit -> server validation/sanitising -> Web3Forms API
```

The Web3Forms access key is injected only on the server. Do not expose it in JSX, hidden inputs, client components, or any `NEXT_PUBLIC_` variable.

## Important Web3Forms Plan Note

This project uses server-side Web3Forms forwarding from `lib/forms/web3forms.ts`. Web3Forms currently documents server-side API usage as requiring a paid plan plus server IP whitelisting. Confirm that the production deployment is allowed/whitelisted in Web3Forms before relying on live submissions.

If that is not available, the alternative is a direct browser-side Web3Forms integration, but that intentionally exposes the Web3Forms access key to the browser and should be treated as a different security tradeoff.

## Environment Variables

| Variable               | Where                         | Purpose                                        |
| ---------------------- | ----------------------------- | ---------------------------------------------- |
| `WEB3FORMS_ACCESS_KEY` | `.env.local` / deployment env | Web3Forms access key used by the server route  |
| `NEXT_PUBLIC_SITE_URL` | `.env.local` / deployment env | Public site URL used for origin checks         |
| `SITE_URL`             | deployment env, optional      | Non-public fallback site URL for origin checks |

## Local Development Setup

1. Copy `.env.example` to `.env.local`.
2. Add the real Web3Forms key:

```text
WEB3FORMS_ACCESS_KEY=your-actual-key-here
```

3. Run `npm run dev`.

## API Endpoint

`POST /api/forms/submit`

All public forms submit JSON to this endpoint. The route:

- verifies same-origin requests when an `Origin` header is present
- rate-limits repeated submissions by client address
- silently accepts honeypot spam without forwarding it
- validates and sanitises data with Zod
- recalculates supported order totals server-side
- forwards the cleaned payload to Web3Forms
- sets lowercase `email` / `replyto` for Web3Forms reply-to support when an email is available

## Supported Form Types

| formType               | Used By                                         |
| ---------------------- | ----------------------------------------------- |
| `contact`              | Contact page and Add Your School flows          |
| `school-partnership`   | Partner With Schools page                       |
| `school-pack-enquiry`  | Parent order/contact and standard pack checkout |
| `office-pack-enquiry`  | Office pack contact form                        |
| `bulk-order`           | Bulk order contact form                         |
| `custom-pack-enquiry`  | Custom school pack checkout                     |
| `full-pack-enquiry`    | Full school pack checkout                       |
| `track-order-interest` | Track Order page                                |

## Required Fields

All submissions need consent, a valid `formType`, a `fullName`, a message, and at least one valid contact method (`phone`, `email`, or `contactDetail`). Phone numbers must be valid South African numbers when provided.

Additional form-specific checks:

- `packType: "add-school"` requires `schoolName`, `city`, and `grade`.
- `school-partnership` requires either `businessName` or `schoolName`.
- `office-pack-enquiry` and `bulk-order` require `businessName`.
- `full-pack-enquiry` and `custom-pack-enquiry` require school and grade information.

## File Uploads

File uploads are not implemented in the current server route. Web3Forms attachments are a Pro feature and require a multipart form submission flow. Do not add visible upload controls unless the API route and Web3Forms plan are updated to support attachments end to end.

## Key Files

| File                                        | Purpose                                          |
| ------------------------------------------- | ------------------------------------------------ |
| `app/api/forms/submit/route.ts`             | Next.js API route handler                        |
| `lib/forms/schema.ts`                       | Zod validation and form-specific requirements    |
| `lib/forms/sanitise.ts`                     | Input sanitising and spam checks                 |
| `lib/forms/contact.ts`                      | Shared phone/email helpers for client and server |
| `lib/forms/web3forms.ts`                    | Server-side Web3Forms forwarding                 |
| `components/forms/PexpacksEnquiryForm.tsx`  | Contact and partnership form UI                  |
| `components/forms/AddSchoolForm.tsx`        | Add Your School form                             |
| `components/forms/TrackOrderForm.tsx`       | Track Order form                                 |
| `components/order/OrderForm.tsx`            | Order checkout form                              |
| `components/sections/AddMySchoolBanner.tsx` | Homepage school request banner                   |

## Troubleshooting

| Issue                            | Check                                                                 |
| -------------------------------- | --------------------------------------------------------------------- |
| `Form handler is not configured` | `WEB3FORMS_ACCESS_KEY` is missing from env                            |
| Web3Forms rejects submissions    | Confirm server-side usage is enabled and deployment IP is whitelisted |
| Validation errors                | Check `lib/forms/schema.ts` and the client payload                    |
| Spam silently succeeds           | Honeypot triggered; this is expected                                  |
| 405 Method Not Allowed           | Only POST is accepted                                                 |
