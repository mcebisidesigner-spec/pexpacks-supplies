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

The site submits contact, partnership and order enquiries to `POST /api/forms/submit`.

The current handler validates and sanitises submissions, requires consent, blocks honeypot spam, rate-limits repeated requests, and forwards clean payloads to Web3Forms from the server.

Required production environment variables:

```text
WEB3FORMS_ACCESS_KEY=
NEXT_PUBLIC_SITE_URL=https://pexpacks.co.za
SITE_URL=https://pexpacks.co.za
NODE_ENV=production
```

Web3Forms setup:

1. Add the real `WEB3FORMS_ACCESS_KEY` to `.env.local` and production env.
2. Confirm the Web3Forms plan supports server-side API submissions from the deployment.
3. If required by Web3Forms, whitelist the production server/deployment IP.

Spam protection:

- A hidden `companyWebsite` honeypot blocks common bot submissions.
- Consent is required before a form can submit.
- Do not add the Web3Forms access key with `NEXT_PUBLIC_`; those variables are exposed to the browser.

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
| `/office-packs`                            | Office supply packs                                     |
| `/partner-with-schools`                    | Partner with Pexpacks                                   |
| `/contact`                                 | Contact form                                            |
| `/order`                                   | Order flow                                              |
| `/school`, `/office`, `/partner`, `/copex` | Legacy redirects                                        |

## License

Private - All rights reserved.
