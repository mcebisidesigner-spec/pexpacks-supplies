# PexPacks

Convenience packs for school, home and office - built for busy South African families, schools and businesses.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** CSS Modules + design tokens
- **Fonts:** PexPacks Sans / PexPacks Sans Alt (custom WOFF2)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
npm run build
npm start
```

## Phase 1 Form Backend

The site submits contact, partnership and order enquiries to `POST /api/forms/submit`.

Full deployment notes are in [`docs/form-deployment.md`](docs/form-deployment.md).

Required production environment variables:

```text
RESEND_API_KEY=
PEXPACKS_NOTIFICATION_EMAIL=pexpacks@gmail.com
PEXPACKS_FROM_EMAIL=PexPacks <no-reply@pexpacks.co.za>

GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SHEETS_PRIVATE_KEY=
GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SHEETS_SHEET_NAME=Submissions

CAPTCHA_ENABLED=false
HCAPTCHA_SECRET_KEY=
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

NEXT_PUBLIC_SITE_URL=https://pexpacks.co.za
NODE_ENV=production
```

Resend setup:

1. Create a Resend API key.
2. Add `RESEND_API_KEY` to Vercel or the hosting environment.
3. Set `PEXPACKS_NOTIFICATION_EMAIL` to `pexpacks@gmail.com`.
4. Set `PEXPACKS_FROM_EMAIL` to a verified sender, for example `PexPacks <no-reply@pexpacks.co.za>`.

Google Sheets setup:

1. Create a Google Cloud service account with Google Sheets API enabled.
2. Create a spreadsheet with a sheet tab named `Submissions`.
3. Share the spreadsheet with the service account email.
4. Add `GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`, `GOOGLE_SHEETS_SPREADSHEET_ID` and `GOOGLE_SHEETS_SHEET_NAME` to the hosting environment.
5. Store private keys with escaped newlines (`\n`) if your host requires a single-line value.

Spam protection:

- A hidden `companyWebsite` honeypot blocks common bot submissions.
- Upstash Redis rate limiting is used when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are configured.
- hCaptcha is only enforced when `CAPTCHA_ENABLED=true`. Add `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` before enabling it.
- Do not add secret values with `NEXT_PUBLIC_`; those are exposed to the browser.

## Project Structure

```text
app/              -> Pages and routes (App Router)
components/       -> Reusable UI, layout, marketing, order, school components
data/             -> Static data (packs, schools, navigation, FAQs)
lib/              -> Utilities (SEO, slugify, school search, currency)
public/           -> Fonts, images, favicon
styles/           -> Global CSS, design tokens, shared page styles
```

## Key Pages

| Route | Description |
|---|---|
| `/` | Homepage with hero search, trust badges, featured packs |
| `/schools` | Find your school + grade packs |
| `/schools/[schoolSlug]` | School detail page |
| `/schools/[schoolSlug]/[gradeSlug]` | Grade pack detail page |
| `/office-packs` | Office supply packs |
| `/partner-with-schools` | Partner with PexPacks |
| `/contact` | Contact form |
| `/order` | Order flow |
| `/school`, `/office`, `/partner`, `/copex` | Legacy redirects |

## License

Private - All rights reserved.
