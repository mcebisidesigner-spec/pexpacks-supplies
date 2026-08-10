# Pexpacks Supplies — Performance Record

Living document for the performance & scalability engineering project. Each change below records a BEFORE/AFTER measurement so regressions are caught and budgets stay enforced.

- Stack: Next.js 16.2.6 (App Router), React 19.2.5, TypeScript, Supabase (PostgreSQL), Ozow payments, Upstash rate-limit/redis, zustand (client), jspdf (PDF generation), Resend.
- Data at baseline: 3,342 schools; 1,240+ products.

---

## 1. Baseline (BEFORE) — measured 2026-08-10

All timings on local production build (`next build` + `next start`, port 3105). First hit = cold (new process), later hits = warm.

### Route timings (first load, local)

| Route                                      | Status                | TTFB cold | TTFB warm | HTML size |
| ------------------------------------------ | --------------------- | --------- | --------- | --------- |
| `/` (home)                                 | 200                   | 306ms     | —         | ~123KB    |
| `/schools`                                 | 200                   | 3,268ms   | 2,552ms   | ~94KB     |
| `/schools/wit-deep-primary-school`         | 200                   | 229ms     | —         | ~113KB    |
| `/schools/wit-deep-primary-school/grade-1` | **308 → school page** | —         | —         | —         |
| `/faq`                                     | 200                   | 178ms     | —         | —         |
| `/blog`                                    | 200                   | 211ms     | —         | —         |
| `/track-order`                             | 200                   | 140ms     | —         | —         |
| `/api/schools/search?q=park&limit=8`       | 200                   | 2,842ms   | 2,717ms   | 3.2KB     |
| `/api/schools/search` (trending, empty q)  | 200                   | —         | 26ms      | —         |

Cold dominance: search API and `/schools` rebuild a search index on first hit (`lib/schools/SearchIndex.ts`) — ~2.7–3.3s. NOTE (2026-08-11): Next 16 runs the instrumentation register in the main process while route handlers run in a separate worker, so `instrumentation.ts` warm-up does NOT populate the request worker's cache — the first request per worker still builds once. The steady-state TTL-expiry stall (every 5 min) is eliminated by stale-while-revalidate (see H2).

### Static output (production build)

| Artifact                   | Size                                                      | Notes                                                              |
| -------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------ |
| Static HTML pages          | 297 pages, 30.2MB (avg 104KB)                             | School pages 154KB each; grade pages 0 (dynamic)                   |
| Client JS chunks           | 2,160KB across 59 files                                   | See largest below                                                  |
| CSS chunks                 | 404KB across 27 files                                     | Largest 114KB                                                      |
| `data/school-index.json`   | 3.80MB                                                    | 3,342 schools                                                      |
| `data/school-records.json` | 10.83MB                                                   | Full records (sitemap, page lookups)                               |
| Images (`public/images`)   | 1.19MB, 18 files (top-level)                              | Largest: `pexcover-img-01.webp` 145KB; 1.48MB / 44 files recursive |
| Fonts                      | 7× PexSans/PexSans Alt woff2, 38–44KB each (~287KB total) | `next/font/local`, self-hosted                                     |

### Largest client chunks

| Chunk              | Size  | Cause                                                                                  |
| ------------------ | ----- | -------------------------------------------------------------------------------------- |
| `0-ffyljgbmlek.js` | 409KB | jspdf — dynamic-imported by `components/packs/DownloadListLink.tsx:28` (OK: lazy)      |
| `0d5.30~-_rbwq.js` | 236KB | Supabase — static `createClient` in `components/layout/Header.tsx:12` (NOT OK: global) |
| `0l35comsgyljn.js` | 222KB | unknown shared chunk (verify)                                                          |
| `107vq_b-3xprk.js` | 193KB | unknown shared chunk (verify)                                                          |
| `0-esz.j.vq9et.js` | 154KB | unknown shared chunk (verify)                                                          |

### Component metrics

- 82 `"use client"` components; 89 `useEffect`; 155 `useState`; 11 `fetch(` in client components.

### Existing DB indexes (already present — do not duplicate)

Schools: `schools_slug_unique`, `idx_schools_slug`, `idx_schools_status`, `schools_city_idx`, `schools_province_idx`, `schools_featured_idx`, `idx_schools_name` (lower), `idx_schools_grades` (GIN), `schools_search_idx` (GIN search*vector), `idx_schools_location`.
Packs/items: `idx_stationery_packs_school`, `idx_stationery_items_pack`, `idx_stationery_packs_featured`, `idx_stationery_packs_school_visible`, `idx_stationery_items_pack_visible`, `stationery_packs_search_idx` (GIN), `stationery_items_search_idx` (GIN).
Orders: `idx_orders_status`, `idx_orders_buyer_email`, `idx_orders_paid_at`, `idx_orders_pack_type`, `idx_orders_created_status`, `idx_orders_created_pack_type`, `idx_orders_created_school`.
Content/other: `idx_testimonials_visible_sort`, `idx_faqs_visible_sort`, `idx_website_content_updated`, `idx_assets_folder`, `idx_assets_created`, `idx_audit_logs*\*`; rate limiting is file-persisted (`lib/security/requestGuards.ts`).

---

## 2. Findings (prioritized)

### CRITICAL

- **C1 — Duplicate-order risk.** `app/api/checkout/route.ts:222` creates+commits the order row BEFORE initiating Ozow at `:244`. No idempotency key; `orderReference` is freshly generated per attempt (`lib/orders.ts`). Double-click guarded client-side, but retries / multi-tab / duplicate callback are not. Fix: unique constraint on order reference or a request idempotency key + advisory lock.
- **C2 — Two near-identical checkout endpoints.** `app/api/checkout/route.ts` and `app/api/ozow/checkout/route.ts` duplicate ~120 lines (validation, order creation, Ozow call) with SEPARATE rate-limit buckets (5/10min each) — an attacker gets 10 attempts. Consolidate into one handler; keep the second as a thin alias or remove after verifying client routes.
- **C3 — Grade URLs 308 to the school page.** `next.config.ts` redirect `/schools/:schoolSlug/:gradeSlug → /schools/:schoolSlug` (added 2026-05-28, `febf313`) predates and now overrides the grade route (initial commit). Every grade-level URL — including statically generated grade pages (2300 generated in build) — is unreachable; grade metadata/breadcrumbs in `app/schools/[schoolSlug]/[gradeSlug]/page.tsx:57,84` point at dead URLs. Confirm intent; if grade pages are product, REMOVE the redirect. (Redirects match before routes in Next.js.)

### HIGH

- **H1 — 236KB Supabase chunk in the global client bundle (RESOLVED 2026-08-11).** `Header.tsx` now dynamic-imports `@/lib/supabase/client` inside the admin-only effect; the only remaining static import is admin-only `components/admin/AdminShell.tsx:9`. No longer shipped on public pages.
- **H2 — 3s cold search + `/schools` (PARTLY RESOLVED 2026-08-11).** First-hit index build (`SearchIndex.ts` LRU rebuild) costs ~2.7–3.3s. The recurring every-5-min TTL stall is eliminated: `getSearchIndex()`/`getSearchableSchools()` now use stale-while-revalidate (`lib/schools/schoolSearchData.ts`) — expired caches are served instantly while a deduped background refresh rebuilds (keeps serving the old cache on failure). Measured: warm search 26–40ms, warm `/schools` 87ms. Remaining: cold first request per worker still pays ~2.8s because Next 16 runs instrumentation in the main process, not the request worker; next step is a build-time static search index.
- **H3 — 1,965KB `pex-stationery-box.webp`.** Largest image; resize/re-encode (target <300KB) and prefer `next/image` with `sizes`/AVIF. 20 files / 3.68MB total in `public/images` should be re-encoded.
- **H4 — 154KB HTML per school page.** Partly inlined next/font + large components; consider streaming/layout reduction and verifying CSS sharing.

### MEDIUM

- **M1 — 404KB CSS total (largest 114KB).** Audit for unused CSS, split critical vs deferred.
- **M2 — `middleware.ts` deprecated convention (RESOLVED 2026-08-11).** Root file renamed to `proxy.ts` (Next 16 convention; build now reports `ƒ Proxy (Middleware)`). Zero behavior change.
- **M3 — Sitemap builds from 10.83MB `school-records.json`** on every request path touched; confirm ISR/caching.
- **M4 — Deprecated `next/image` remotePatterns / CSP entries to prune** (already partly fixed in `6321653`).

### LOW

- **L1 — jspdf 409KB is lazy-loaded (OK)** — keep dynamic import; optionally swap to lighter PDF lib.
- **L2 — File-based rate limiting** (disk reads/writes per request) — revisit on serverless deploy; fine for Node host.

---

## 3. Plan (phases 3–27)

Order = impact / risk:

1. **P0 — Fix duplicate orders (C1):** idempotency key + unique constraint; regression test double-submit.
2. **P0 — Resolve grade 308 (C3):** confirm with product; remove redirect if grade pages are live.
3. **P1 — Consolidate checkout endpoints (C2):** single handler, unified rate limit (still 5/10min total).
4. **P1 — Server boundary for Supabase (H1):** DONE (2026-08-11) — Header dynamic-imports supabase; only admin `AdminShell` statically imports it.
5. **P2 — Warm search index (H2):** PARTLY DONE (2026-08-11) — SWR kills the 5-min-TTL stall (warm search 26–40ms). Open: cold first request per worker (~2.8s) — build-time static index.
6. **P2 — Image budget (H3):** DONE (2026-08-10) — dead assets removed; largest 145KB; CI size guard `npm run check:images` added to workflow.
7. **P2 — CSS cleanup (M1) + proxy migration (M2).**
8. **P3 — DB index additions** (additive migration only): profile cold queries (`explain analyze`) for search/orders/school pages; add missing indexes; never drop existing.
9. **P3 — Capacity plan:** document limits (Upstash rate limits, Supabase connections, build size), re-measure full suite.
10. Every change: build + typecheck + relevant test; record AFTER vs BEFORE in §1/§2.

### Progress (implementation log)

| Item                                | Status            | Notes                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C3 — remove grade 308 redirect      | Done (2026-08-10) | `next.config.ts`: dropped `/schools/:schoolSlug/:gradeSlug → /schools/:schoolSlug`; grade route now reachable.                                                                                                                                                                                                                                                                                             |
| C1 — order idempotency              | Done (2026-08-10) | `supabase/migrations/00015_order_idempotency.sql` adds `orders.idempotency_key` + partial unique index; `lib/orders.ts` (`createPendingOrder`, `createMultiPackOrder`) write it and throw on insert error; `getOrderByIdempotencyKey` lookup; client `crypto.randomUUID()` per submit in `TrayCheckoutClient.tsx`, `CheckoutForm.tsx`, `HappyPayCheckoutClient.tsx`; API returns `reused: true` on replay. |
| C2 — consolidate checkout endpoints | Done (2026-08-10) | Shared handler `lib/checkout/trayCheckout.ts` (`handleTrayCheckout` + `TrayCheckoutError` + `trayErrorResponse`); `app/api/checkout/route.ts` tray branch and `app/api/ozow/checkout/route.ts` delegate to it; both use one rate-limit bucket (`keyPrefix: "checkout"`, 5/10min total).                                                                                                                    |
| H3 — image budget                   | Done (2026-08-10) | Deleted unused `pex-stationery-box.webp` (1,965KB) + `pex-stationery-checklist.webp` (594KB); added `scripts/check-image-budget.cjs` (`npm run check:images`, env `IMAGE_MAX_KB`/`IMAGE_TOTAL_KB`/`IMAGE_DIR`) and a CI step; largest image now 145KB, total 1.19MB top-level.                                                                                                                             |
| H1 — Supabase bundle                | Done (2026-08-11) | `Header.tsx` dynamic-imports `@/lib/supabase/client` (admin-only); verified no static import on public pages.                                                                                                                                                                                                                                                                                              |
| H2 — search index SWR               | Done (2026-08-11) | `lib/schools/schoolSearchData.ts`: stale-while-revalidate for `getSearchableSchools`/`getSearchIndex` — expired caches served instantly, deduped background refresh, stale kept on failure. Warm search 26–40ms, warm `/schools` 87ms. Cold first request per worker still ~2.8s (instrumentation runs outside the request worker in Next 16).                                                             |
| M2 — proxy convention               | Done (2026-08-11) | `git mv middleware.ts proxy.ts`, export renamed to `proxy`; build reports `ƒ Proxy (Middleware)`.                                                                                                                                                                                                                                                                                                          |

---

## 4. Budgets (proposed targets)

- Largest client chunk (non-lazy): ≤ 200KB gz.
- Cold search API: ≤ 400ms after H2.
- School page HTML: ≤ 100KB.
- Largest image on page: ≤ 300KB.
- Full build: < 120s; static pages count recorded per release.
