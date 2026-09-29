# Pexpacks Web Application Audit

**Audit date:** 2026-09-28  
**Scope:** Next.js App Router application, public storefront, checkout, chat, admin console, API routes, Tailwind CSS setup, automated quality checks, and local production-build performance.

## Executive Summary

The first audit identified release-process gaps, a heavy school-directory payload, oversized images, and unverified concurrency behavior. The highest-impact application fixes have now been implemented and verified in a fresh production build.

Current status:

- The expanded five-gate quality check passes.
- The /schools initial payload is approximately 203 KB, reduced from approximately 1.83 MB.
- The image budget passes at 2,919 KB total with no file above 300 KB.
- The production Webpack build completes successfully.
- 1,000-user production capacity remains unverified and is tracked as a non-blocking enterprise-capacity test.
- Browser performance budgets now pass on 5 desktop and 15 mobile/tablet route checks.
- A staging-safe k6 profile and runbook now default to a 50-user pilot benchmark, support an optional 100-user rehearsal, and retain the 1,000-user ramp as an explicit non-blocking profile.

The report below keeps the original baseline evidence for traceability and clearly separates resolved findings from remaining work.

## Implementation Update

Implemented in the performance pass following this audit:

- Deferred the full 3,342-school directory from the initial /schools server render. It now loads through a cached, rate-limited, filtered and paginated /api/schools/directory endpoint only when the user opens the directory.
- Fixed render-time product ID generation and the session timer lint blocker.
- Expanded check:all to include ESLint, TypeScript, image-budget, and performance-configuration checks.
- Recompressed the nine oversized photographic assets and consolidated two byte-identical hero duplicates.

Post-change verification:

- npm.cmd run check:all: passed all 5 gates.
- npm.cmd run build:webpack: completed successfully.
- Image budget: 2,919 KB total, zero files over 300 KB.
- /schools: approximately 203 KB on the fresh production build, down from approximately 1.83 MB.
- /api/schools/directory: approximately 10.8 KB for the first 24-school page, 2.1 KB for a focused query, with server-side filtering and pagination.
- Web Vitals budgets: 20/20 Playwright checks passed across desktop, iPhone, Android and tablet profiles for TTFB, transfer size, LCP, CLS and INP thresholds.
- Added scripts/load-test.k6.js and docs/LOAD_TESTING.md; the 50-user pilot profile is ready for staging execution, while the 1,000-VU enterprise profile remains opt-in and neither was run against a live staging host in this local pass.
- Replaced repeated Pexcover active-state colours with shared Tailwind v4 tokens and removed malformed visible labels from the checkout card.

The remaining work is intentionally staged: the repository still has 93 non-blocking ESLint warnings and a broad formatting backlog. A 50-user pilot load test is the appropriate pre-announcement benchmark; the 1,000-user enterprise test remains non-blocking until production-like staging observability is available.

## Architecture Snapshot

- App Router surface: 105 page.tsx routes and 31 API route.ts handlers.
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Lucide, and shared cn() class composition.
- Backend integrations: Supabase-backed data access, server actions/API handlers, rate limiting, payment providers, email/WhatsApp hand-offs, and Vercel-oriented caching/security headers.
- Quality assets already present: Vitest regression tests, Playwright E2E/a11y/visual suites, image/performance/design audit scripts, database governance checks, and a standalone production build.
- Tailwind is active through the v4 PostCSS integration. There is no legacy tailwind.config.ts; the main unification opportunity is reducing repeated arbitrary values and inline styles through the existing CSS token layer and shared primitives.

## Findings

### P1 - Quality gate coverage (resolved)

The baseline audit found that check:all ran only TypeScript, migration/governance verification, and Vitest. That gap has been closed in scripts/quality-gate.cjs.

check:all now runs five gates:

- ESLint and TypeScript static safety.
- Database migration and governance verification.
- The full Vitest regression suite.
- The image budget check.
- The performance configuration audit.

Verification: all five gates pass. Formatting, browser E2E, accessibility, dependency audit, and staging load tests remain separate checks and should be surfaced as required CI status checks before production releases.

Status: resolved for the checks currently included in the quality gate. The remaining CI work is tracked under the responsive/accessibility and capacity findings below.

### P1 - School discovery payload (resolved)

Before optimization, /schools emitted approximately 1.83 MB of HTML and took approximately 2.0-2.6 seconds across warm local requests. The cause was the eager serialization of the full 3,342-school directory into the initial server-rendered tree.

The directory is now deferred behind /api/schools/directory. The fresh production build returned approximately 203 KB for /schools, while the first directory page is fetched only after the user opens it. The endpoint applies server-side query, region and letter filters, returns 24-school pages, and is cached and rate limited.

Verification: the initial /schools payload is below the 300 KB acceptance target in the local production build.

Status: resolved. Initial page weight and directory-open payload are now bounded; load-more pagination keeps the full directory available without transferring the catalogue in one response.

### P1 - Image budget (resolved)

The baseline audit found nine photographic assets totalling approximately 9,500 KB. Those assets were recompressed in place, and two byte-identical hero duplicates were removed after references were consolidated.

Current verification:

- Total image weight: 2,919 KB against the 3,072 KB budget.
- Individual files above 300 KB: zero.
- The performance configuration audit passes.

Status: resolved for the current repository asset budget. Continue using responsive next/image sizes and reserve priority loading for the single above-the-fold hero.

### P1 - Capacity behavior needs a right-sized staging benchmark

A local concurrent burst against the production build produced these observations:

| Route | Burst | Result |
| --- | ---: | --- |
| `/` | 100 concurrent | 0 errors; p50 1,216 ms; p95 1,222 ms |
| `/` | 1,000 concurrent | first run: 668 errors; p95 3,740 ms; repeat: 1,000/1,000 HTTP 200 but 11.5 s wall time |
| `/api/schools/search?limit=3` | 100 concurrent | HTTP 429 responses from the configured limiter |
| `/api/schools/search?limit=3` | 1,000 concurrent | rejected by rate limiting in the burst |

The homepage result varied between runs, which indicates local saturation/warm-cache effects and reinforces that this is not a production capacity test. The school search route intentionally limits each client to 60 requests per 60 seconds (`app/api/schools/search/route.ts:18-36`). That is appropriate protection, but a realistic browser test must model one request per typing pause, caching, backoff, and many distinct client IPs.

**Action implemented:** scripts/load-test.k6.js now defaults to a 50-VU pilot profile, supports a bounded 50-100 VU rehearsal, and retains the 1,000-VU ramp behind `LOAD_TEST_PROFILE=enterprise`. docs/LOAD_TESTING.md documents launch thresholds, search rate-limit interpretation, Supabase/PgBouncer and Redis checks, checkout/payment handoff safeguards, Vercel cold-start metrics, and why mutating flows remain opt-in.

**Status:** the 50-VU pilot benchmark is the recommended pre-announcement gate and remains pending until staging is available. The 1,000-VU enterprise test is deliberately non-blocking for this pilot and remains pending for future capacity planning. Both require distributed runners and observability for p50/p95/p99, Supabase query time, connection pool usage, rate-limit latency, memory, CPU, cold starts and provider failures.

### P2 - Tailwind design-token adoption is incomplete

The design audit scanned 432 source files and found:

- 345 arbitrary hex-color occurrences across 128 unique values.
- 416 inline `style={{...}}` instances across 66 files.
- 1,678 arbitrary Tailwind utility expressions across 169 files.

The largest inline-style hotspots include `components/admin/settings/UserIdentityTab.tsx`, `components/security/MustChangePasswordModal.tsx`, `components/admin/letters/LetterEditor.tsx`, `components/admin/quotations/PexpacksDetailsView.tsx`, and `components/checkout/PexcoverDrawerCard.tsx`. The largest arbitrary-utility hotspots include `app/checkout/TrayCheckoutClient.tsx`, `app/cart/review/CartReviewClient.tsx`, `app/checkout/happypay/HappyPayCheckoutClient.tsx`, and `components/admin/packs/SchoolPacksView.tsx`.

**Impact:** repeated colours, spacing, and state styles are harder to audit and make responsive consistency more fragile.

**Action implemented for the first seven hotspots:** the Pexcover card, main checkout flow, uploaded-list cart review, admin school-packs view, admin product editor, shared master-products table and CMS content style map now use shared Tailwind utilities for their repeated colours, surfaces, radii, fonts, focus rings, error states, status badges and shadows. Admin tables use Lucide indicators instead of malformed visible characters, while intentional inline swatch geometry remains local to visual previews.

**Remaining action:** continue the same token migration through the remaining admin and catalogue hotspots, keeping arbitrary values only for genuine one-off geometry and using shared cn()/component primitives for repeated controls.

### P2 - Responsive and accessibility coverage (responsive coverage resolved)

Playwright now includes Desktop Chrome, iPhone Chromium emulation, Android Chromium emulation, and iPad Chromium emulation. The mobile and tablet projects run a dedicated responsive smoke suite so desktop-only navigation assumptions do not create false failures.

Verification: all 15 responsive smoke tests pass across the three narrow-device profiles. The accessibility suite also passes across iPhone, Android and tablet Chromium profiles: 21 tests total. The checks cover core route rendering, no horizontal overflow, critical/serious Axe violations, skip-link focusability and labelled authentication fields.

Remaining gap: critical customer-journey suites are not yet asserted across narrow devices. Web Vitals and transfer-size budgets are now enforced across desktop, iPhone, Android and tablet profiles.

Action: add mobile/tablet coverage for the school-to-pack, upload-to-cart and checkout journeys. The Playwright Web Vitals collector and thresholds are now in place; a staging Lighthouse run can be added later for field-data correlation.

### P2 - ESLint warning debt remains

The two baseline ESLint errors have been fixed: render-time Date.now() product IDs were replaced with stable draft IDs, and the session timer binding is now const.

Full ESLint now passes with zero errors and 93 non-blocking warnings. The remaining warnings include unused imports/variables, explicit any, missing hook dependencies, and missing PDF image alt text.

Action: burn down warnings by category, prioritising hook dependency correctness, accessibility warnings, and type safety in admin/data-table code. Keep warnings visible in CI while preventing new warnings from being introduced.

### P2 - Geolocation policy conflicts with the product's location-assisted search

`next.config.ts:173-176` currently sends `Permissions-Policy: camera=(), microphone=(), geolocation=()`. The school search route supports coordinates and edge-location headers (`app/api/schools/search/route.ts:42-79`), while the product experience has previously described location as improving search accuracy.

**Action:** confirm the intended privacy decision. If browser geolocation is a supported feature, change the policy to the approved origin and request location only after a clear user action with a useful explanation. If edge-only location is intended, remove the browser-location UX promise and keep the restrictive header.

### P3 - Formatting and generated/admin surface consistency

Prettier currently reports 565 files. The scan also found one active CSS module import and substantial inline styling in security/admin components. This is not an immediate runtime failure, but it increases review noise and makes visual regressions harder to isolate.

**Action:** agree on the formatting boundary, then apply Prettier in a dedicated mechanical commit. Follow with focused design-token refactors rather than combining formatting and behavioral changes. Keep generated files and data files explicitly scoped if they should not be formatted.

## What Passed

- Production Webpack build completed during this audit cycle.
- TypeScript check passed through `npm.cmd run check:all`.
- Migration/governance verification passed.
- Vitest passed: 77 files, 378 tests.
- Production dependency audit passed with 0 vulnerabilities.
- Core route smoke checks returned HTTP 200 for `/`, `/schools`, `/order`, `/pexcover`, `/checkout`, `/blog`, and `/contact`.
- Responsive smoke suite passed: 15 tests across iPhone, Android, and tablet Chromium emulation.
- Web Vitals and transfer budgets passed: 5 desktop checks plus 15 iPhone, Android and tablet checks.
- The standalone Playwright server now copies public/, .next/static and local ignored environment configuration into the build output for representative local production verification.
- Next.js already has useful baseline settings: standalone output, compression, optimized package imports, AVIF/WebP image formats, security headers, and static-asset cache headers (`next.config.ts:26-56`, `next.config.ts:161-308`).

## Recommended Delivery Sequence

1. Extend the existing mobile/tablet profiles to the critical school-to-pack, upload-to-cart and checkout journeys.
2. Run the prepared 50-VU pilot profile against production-like staging with distributed runners, observability and seeded test data; use the 1,000-VU profile later for capacity planning.
3. Continue consolidating Tailwind tokens through the highest-volume checkout and admin arbitrary-colour and inline-style hotspots.
4. Resolve the geolocation policy decision and document the privacy/UX contract.
5. Burn down the remaining ESLint warning categories and establish a controlled formatting cleanup.

## Acceptance Targets

These should be measured on a production-like staging deployment, not only localhost:

- Warm and cold mobile 4G LCP under 2.5 seconds; route TTFB under 500 ms for cached public pages.
- Initial HTML/RSC payload for `/schools` under 300 KB where practical, with incremental data loading for the result tray.
- p95 response under 800 ms for cached public GET requests at the agreed 50-VU pilot profile; repeat at 100 VUs for a campaign rehearsal when needed.
- Error rate below 1% under the full mixed traffic scenario, excluding intentionally rate-limited abuse traffic.
- INP below 200 ms and CLS below 0.1 on core customer routes.
- No ESLint errors, no image-budget violations, and all mandatory checks represented in CI status.

## Audit Limitations

The concurrency test was a local burst against one Node process and did not emulate authenticated browser sessions, separate IPs, CDN caching, Supabase connection pooling, payment providers, email, WhatsApp, or Vercel infrastructure. It is therefore a useful baseline and failure probe, not evidence of production capacity. A 50-VU staging benchmark is the practical pilot gate; the 1,000-VU enterprise test remains a later capacity-planning exercise with production-like observability.
