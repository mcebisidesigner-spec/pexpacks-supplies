# Pexpacks

Convenience packs for school, home and office - built for busy South African families, schools and businesses.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** CSS Modules + design tokens
- **Fonts:** Pexpacks Sans / Pexpacks Sans Alt (custom WOFF2)

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

## Form Backend

The site submits contact, partnership and order enquiries to internal endpoints under `POST /api/forms/*`.

The current handler validates and sanitises submissions, requires consent, blocks honeypot spam, rate-limits repeated requests, and sends clean payloads by SMTP through Nodemailer.

Required production environment variables:

```text
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=PexPacks Website
SMTP_TO_EMAIL=
NEXT_PUBLIC_SITE_URL=https://pexpacks.co.za
SITE_URL=https://pexpacks.co.za
NODE_ENV=production
```

SMTP setup:

1. Add real SMTP values to `.env.local` and production env.
2. Confirm the SMTP provider allows server-side sending from the deployment.
3. Configure SPF, DKIM, and DMARC for reliable delivery.

Spam protection:

- A hidden `companyWebsite` honeypot blocks common bot submissions.
- Consent is required before a form can submit.
- Do not add SMTP credentials with `NEXT_PUBLIC_`; those variables are exposed to the browser.

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

| Route                                      | Description                                             |
| ------------------------------------------ | ------------------------------------------------------- |
| `/`                                        | Homepage with hero search, trust badges, featured packs |
| `/schools`                                 | Find your school + grade packs                          |
| `/schools/[schoolSlug]`                    | School detail page                                      |
| `/schools/[schoolSlug]/[gradeSlug]`        | Grade pack detail page                                  |
| `/office`                                 | Office supply packs                                     |
| `/partner-with-schools`                    | Partner with Pexpacks                                   |
| `/contact`                                 | Contact form                                            |
| `/order`                                   | Order flow                                              |
| `/school`, `/office`, `/partner`, `/copex` | Legacy redirects                                        |

## License

Private - All rights reserved.
