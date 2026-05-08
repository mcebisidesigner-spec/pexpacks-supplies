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

The current handler uses Nodemailer with Gmail SMTP. It validates and sanitises submissions, requires consent, blocks honeypot spam, and emails the PexPacks notification inbox.

Required production environment variables:

```text
GMAIL_USER=pexpacks@gmail.com
GMAIL_APP_PASSWORD=
PEXPACKS_NOTIFICATION_EMAIL=pexpacks@gmail.com

NEXT_PUBLIC_SITE_URL=https://pexpacks.co.za
NODE_ENV=production
```

Gmail SMTP setup:

1. Enable 2-Step Verification on the Gmail account.
2. Create a Gmail app password.
3. Set `GMAIL_USER` to the Gmail address.
4. Set `GMAIL_APP_PASSWORD` to the app password.
5. Set `PEXPACKS_NOTIFICATION_EMAIL` to the inbox that should receive enquiries.

Spam protection:

- A hidden `companyWebsite` honeypot blocks common bot submissions.
- Consent is required before a form can submit.
- Do not add Gmail passwords or app passwords with `NEXT_PUBLIC_`; those are exposed to the browser.

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
