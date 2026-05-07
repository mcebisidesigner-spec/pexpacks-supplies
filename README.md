# PexPacks Supplies

Convenience packs for school, home and office — built for busy South African families, schools and businesses.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
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

## Project Structure

```
app/              → Pages and routes (App Router)
components/       → Reusable UI, layout, marketing, order, school components
data/             → Static data (packs, schools, navigation, FAQs)
lib/              → Utilities (SEO, slugify, school search, currency)
public/           → Fonts, images, favicon
styles/           → Global CSS, design tokens, shared page styles
```

## Key Pages

| Route | Description |
|---|---|
| `/` | Homepage with hero search, trust badges, featured packs |
| `/school` | School stationery packs |
| `/office` | Office supply packs |
| `/copex` | Convenience packs (home essentials) |
| `/schools` | Find your school + grade packs |
| `/partner` | Partner with PexPacks |
| `/contact` | Contact form |
| `/order` | Order flow |

## License

Private — All rights reserved.
