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
