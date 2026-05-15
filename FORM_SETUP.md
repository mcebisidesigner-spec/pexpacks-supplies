# PexPacks Form Handler — Web3Forms Setup

## Overview

PexPacks uses **Web3Forms** as the official form handler for all website form submissions. All submissions are routed through a secure server-side Next.js API endpoint that injects the access key before forwarding to Web3Forms.

## Architecture

```
Browser Form → POST /api/forms/submit → Server validates & sanitises → Web3Forms API
```

- The Web3Forms access key is **never** exposed to the browser.
- All validation happens server-side using Zod schemas.
- Spam detection uses honeypot fields and link-count heuristics.

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `WEB3FORMS_ACCESS_KEY` | `.env.local` / deployment env | Web3Forms access key |
| `NEXT_PUBLIC_SITE_URL` | `.env.local` / deployment env | Public site URL |

### Security Rules

- **DO NOT** use `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`
- **DO NOT** expose the key in JSX, hidden inputs, or client components
- **DO NOT** commit `.env.local`
- The key is injected server-side only in `lib/forms/web3forms.ts`

## Local Development Setup

1. Copy `.env.example` to `.env.local`:
   ```
   cp .env.example .env.local
   ```
2. Add your Web3Forms access key to `.env.local`:
   ```
   WEB3FORMS_ACCESS_KEY=your-actual-key-here
   ```
3. Get your key at [https://web3forms.com](https://web3forms.com)
4. Run the dev server: `npm run dev`

## Production Deployment

Add `WEB3FORMS_ACCESS_KEY` as an environment variable in your deployment provider (Vercel, Netlify, etc).

## API Endpoint

**`POST /api/forms/submit`**

All forms submit JSON to this single endpoint. The `formType` field determines the type of enquiry.

### Supported Form Types

| formType | Used By |
|----------|---------|
| `contact` | Contact page, Add Your School |
| `school-partnership` | Partner With Schools page |
| `school-pack-enquiry` | Contact form (parent order) |
| `office-pack-enquiry` | Contact form (office pack) |
| `bulk-order` | Contact form (bulk order) |
| `custom-pack-enquiry` | Custom pack drawer |
| `full-pack-enquiry` | Full pack order |
| `track-order-interest` | Track Order page |

### Request Format

```json
{
  "formType": "contact",
  "fullName": "Jane Doe",
  "phone": "0780036048",
  "email": "jane@example.com",
  "message": "I need help with...",
  "consent": true
}
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Thank you. Your enquiry has been received."
}
```

### Validation Error (400)

```json
{
  "success": false,
  "message": "Please check the highlighted fields and try again.",
  "errors": {
    "phone": "Please enter a valid South African phone number."
  }
}
```

### Server Error (500)

```json
{
  "success": false,
  "message": "We could not submit your enquiry right now."
}
```

## Key Files

| File | Purpose |
|------|---------|
| `lib/forms/web3forms.ts` | Forwards to Web3Forms API (server-only) |
| `lib/forms/schema.ts` | Zod validation schemas |
| `lib/forms/sanitise.ts` | Input sanitisation & spam detection |
| `app/api/forms/submit/route.ts` | API Route Handler |
| `components/forms/PexpacksEnquiryForm.tsx` | Contact & Partner form UI |
| `components/forms/ContactForm.tsx` | Contact form wrapper |
| `components/forms/PartnerForm.tsx` | Partner form wrapper |
| `components/forms/AddSchoolForm.tsx` | Add Your School form |
| `components/forms/TrackOrderForm.tsx` | Track Order form |
| `components/order/OrderForm.tsx` | Order checkout form |
| `components/sections/AddMySchoolBanner.tsx` | School request banner |

## Adding a New Form

1. Create the client component in `components/forms/`
2. Use `fetch("/api/forms/submit", ...)` with JSON body
3. Include `formType` matching a value in `lib/forms/schema.ts`
4. Add the new formType to `formTypes` in `lib/forms/schema.ts` if needed
5. Add loading, success, and error states
6. Include a honeypot field (`companyWebsite`) if the form has public input

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Form handler is not configured" | `WEB3FORMS_ACCESS_KEY` is missing from env |
| Validation errors | Check `lib/forms/schema.ts` for field requirements |
| Spam silently accepted | Honeypot triggered — this is expected behaviour |
| 405 Method Not Allowed | Only POST is accepted |

## Previous Handler (Removed)

The previous form handler used **Nodemailer with Gmail SMTP**. It has been fully removed:
- `lib/forms/sendEmail.ts` — deleted
- `nodemailer` and `@types/nodemailer` — uninstalled
- `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `PEXPACKS_NOTIFICATION_EMAIL` — removed from `.env.example`

## Web3Forms Server-Side Note

Web3Forms free plan supports server-side submissions. No IP whitelisting or paid plan is required for the standard API endpoint. The access key is the only authentication needed.
