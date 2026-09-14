# Pexpacks Supplies

Convenience school, home and office packs — built for busy South African families, schools and businesses.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19). Webpack is the default dev/build bundler; Turbopack is available via `npm run dev:turbo`.
- **Language:** TypeScript (strict)
- **Styling:** CSS Modules + design tokens (Teal / Navy / Coral)
- **Database:** Supabase (Postgres) with RLS + service-role admin client
- **Payments:** Ozow (with HappyPay BNPL) — signed webhook + reconciliation cron
- **Email:** Resend (purchase receipts, transactional mail)
- **AI:** Google Gemini (`gemini-2.5-flash`) for the School List Converter
- **Rate limiting:** Upstash Redis (distributed)
- **Observability:** Sentry (server + client + edge), Vercel Analytics + Speed Insights
- **Quality:** ESLint, Prettier, Vitest (unit), Playwright + axe (E2E accessibility)

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run db:link              # ensure Supabase CLI is linked
npm run dev                  # webpack dev server on :3000
```

Run database migrations against your Supabase project:

```bash
supabase db push
```

## Environment Variables

See [`.env.example`](./.env.example) for the full list. Key groups:

| Group | Variables |
| ----- | --------- |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL` |
| Admin auth | `ADMIN_SESSION_SECRET` (HMAC for signed admin session gate) |
| Payments | `OZOW_SITE_CODE`, `OZOW_PRIVATE_KEY`, `OZOW_API_KEY`, `OZOW_IS_TEST` (`false`, or omit for live) |
| Email | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_REPLY_TO_EMAIL` |
| AI | `GEMINI_API_KEY` (+ `GOOGLE_GENERATIVE_AI_API_KEY` / `GOOGLE_AI_API_KEY` fallbacks) |
| Rate limiting | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| Cron | `CRON_SECRET` (required by `/api/cron/reconciliation`) |
| Sentry | `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` |
| Webhooks | `SUPABASE_WEBHOOK_SECRET` |
| Site | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_PEXPACKS_WHATSAPP_NUMBER` |

> Legacy `SMTP_*` variables remain in `.env.example` for backwards compatibility but the current transactional email path uses Resend.

## Scripts

| Script | Purpose |
| ------ | ------- |
| `npm run dev` | Dev server (webpack) |
| `npm run dev:turbo` | Dev server (Turbopack — experimental) |
| `npm run build` | Production build (webpack) |
| `npm run lint` | ESLint + `tsc --noEmit` |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E + axe accessibility (`npm run build` first, or run against a live server) |
| `npm run check:images` | Static image budget check |
| `npm run db:preflight` | Link + schema preflight + DB performance smoke |
| `npm run db:smoke` | DB performance smoke test |
| `npm run db:security:advisors` | DB security advisor report |
| `npm run db:reconcile:audit` | Data reconciliation audit |
| `npm run format` / `format:check` | Prettier write / check |

## AI School List Converter

The `/order` flow lets parents upload a photo/PDF (JPG, PNG, WEBP, HEIC, PDF) or paste a stationery list:

1. **Client** `components/AiListDropzone.tsx` validates size, transcodes HEIC/HEIF to JPEG locally (`heic2any`), then POSTs `multipart/form-data` to `/api/ai-convert-list`.
2. **Server** `app/api/ai-convert-list/route.ts` rate-limits, parses with Gemini `gemini-2.5-flash` (structured JSON output), and matches lines against the product catalog via the `match_stationery_product` RPC (trigram similarity).
3. **Draft cart** is persisted to `draft_carts` (non-sensitive line items only — no learner/source documents retained) with a 24-hour `expires_at`. A nightly cron (`/api/cron/reconciliation`, `CRON_SECRET` protected) prunes expired drafts via `prune_expired_draft_carts()`.
4. **Review** `app/cart/review` displays matched items, book-cover (Pexcover) upsell, then hands off to the checkout tray via the zustand store.

Funnel events (conversion started / succeeded / failed / review opened / item edited / proceed) are reported to Vercel Analytics.

## Payments & Reconciliation

- Checkout creates an order and redirects to Ozow/HappyPay.
- `POST /api/ozow/webhook` verifies the HMAC signature (`timingSafeEqual`), site code and test-mode consistency, then atomically marks the order paid in `complete_order_payment`. Replays are idempotent (`alreadyPaid`). Failures and security anomalies are reported to Sentry.
- `POST /api/cron/reconciliation` (Vercel Cron, `CRON_SECRET`) reconciles payment callbacks and prunes expired draft carts.

## Error Monitoring (Sentry)

Sentry is initialised for server (`sentry.server.config.ts`), Edge (`sentry.edge.config.ts`) and client (`sentry.client.config.ts`), wired via `instrumentation.ts` and `withSentryConfig` in `next.config.ts`. `app/error.tsx` and `app/global-error.tsx` capture exceptions. Set `SENTRY_ORG` / `SENTRY_PROJECT` (plus an auth token via `SENTRY_AUTH_TOKEN`) to upload source maps during builds.

## Database & Migrations

Migrations live in `supabase/migrations/`. Notable recent ones:

- `00125` / `00126` — `draft_carts` (non-sensitive, RLS service-role only) + `match_stationery_product` matcher RPC.
- `00128` — seed of the core stationery catalog used by the AI matcher.
- `00129` — `prune_expired_draft_carts()` RPC for the nightly cron.

Apply with `supabase db push`; schema drift checks run via `npm run db:preflight`.

## CI/CD

`.github/workflows/ci.yml` runs on push/PR to `main`:

- **Lint, Format & Build:** Prettier check, ESLint + type-check, image budget, Vitest, production build.
- **Security Audit:** `npm audit --audit-level=high`.
- **Playwright E2E & Accessibility:** installs Chromium, builds, runs `e2e/` specs (smoke, order flow, axe scans of `/` and `/order`).

## Project Structure

```text
app/              -> Routes (App Router): api/, admin/, cart/, checkout, order, schools, ...
components/       -> Reusable UI, marketing, order, school, admin components
data/             -> Static datasets (schools, packs, navigation)
lib/              -> Utilities: analytics, cms, email, orders, ozow, schools, security, supabase
store/            -> zustand stores (pack tray)
scripts/          -> Maintenance / preflight / reconciliation scripts
styles/           -> Global CSS, design tokens
e2e/              -> Playwright specs (+ axe)
supabase/migrations/ -> Database migrations
```

## License

Private — all rights reserved.