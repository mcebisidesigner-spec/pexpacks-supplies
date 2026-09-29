# Pexpacks Admin/Public Database Synchronization Audit

**Audit date:** 2026-09-29  
**Scope:** `/admin` catalogue mutations and the public `pexpacks-supplies` school/pack experience  
**Method:** source tracing, read-only Supabase reconciliation, focused regression tests, and TypeScript validation

## Executive result

The admin and public application are using the same canonical catalogue model (`schools`, `school_packs`, `school_pack_items`, and `master_products`). School identity data and the existing payment, quotation, and testimonial records are structurally consistent.

There is one release-level data quality issue: the database currently marks **23,635 packs as visible**, but only **6 active pack-item rows** exist across the entire catalogue. As a result, **23,633 visible packs have no active items**. The public RPC returns those configured packs with empty item arrays, and the public grade-pack UI renders them as finalising / `R0,00` cards. This matches the supplied public screenshot for the Grade 1 and Grade 2 cards.

The default publication policy is now policy 1: incomplete packs remain drafts and are excluded from the public catalogue. The database migration demotes existing invalid public rows non-destructively by setting them to draft and hidden; it does not delete catalogue data.

## What was traced

### Admin writers

- `app/admin/packs/actions.ts` creates, edits, prices, duplicates, hides, and deletes packs.
- `app/admin/items/actions.ts` updates pack-item quantities and revalidates the catalogue.
- `lib/admin/packs.ts` and `lib/admin/items.ts` perform the canonical writes.
- Public catalogue changes flow through `lib/admin/catalog-revalidate.ts`.

### Public readers

- `app/schools/[schoolSlug]/page.tsx` uses a five-minute route revalidation window.
- `lib/school-utils.ts` loads `get_public_school_pack` and caches the school bundle under `school:bundle:<slug>`.
- `supabase/migrations/00086_harden_public_pricing_privacy.sql` defines the public RPC and reads `public_pack_items_view`.
- `lib/schools/school-grade-packs.ts` intentionally renders configured visible packs, including empty configured packs.

## Live reconciliation results

The read-only script is `scripts/db-reconciliation-audit.cjs`.

| Area | Result | Assessment |
| --- | ---: | --- |
| Schools | 3,342 total; 0 blank slugs; 0 duplicate slugs; 0 inactive/unpublished | Healthy |
| School packs | 23,635 total; 23,635 visible; 0 blank pack slugs; 0 duplicate pack slugs | Publication state needs review |
| Pack items | 6 total; 6 active | Critical catalogue coverage gap |
| Visible packs without active items | 23,633 | High severity |
| Visible packs with missing products | 0 | Healthy |
| Visible packs with non-public products | 0 | Healthy |
| Active items with invalid quantities | 0 | Healthy |
| Visible packs with zero price and items | 1 | Review this pack before launch |
| Duplicate school/grade keys | 2 Grade R keys | Requires data review |
| Payments | 4; required amount, gateway, status, currency, and timestamps present | Healthy |
| Quotations | 2; fee/discount precision checks passed | Healthy |
| Testimonials | 6; school context present | Healthy |

The duplicate grade keys are:

- `33a2d94a-9898-4a72-9479-6f98cf62da82:grade-r`
- `7a439f06-c9ca-4d84-b5b9-62c74d04b7ca:grade-r`

These are school-specific Grade R keys, not duplicate global slugs. They should be checked for duplicate pack rows per school before adding a uniqueness constraint.

## Findings

### P1 - visible empty packs are published as public catalogue content

The public RPC includes a pack when `publication_status = 'published'`, or when the legacy-compatible condition `publication_status IS NULL AND visible IS TRUE` is true. It does not require an active item to exist. The public grade builder then returns configured packs rather than replacing them with placeholders.

This creates a confusing public state: a parent can see a real grade card with no items and a zero price, even though the admin catalogue may not be ready for ordering.

**Implemented policy:** policy 1 is now enforced. Incomplete packs remain draft/finalising and are excluded from the public pack list. The admin publication guard, database triggers, and service-role preflight enforce the same readiness rules before a pack can become published/visible. Existing invalid public rows are demoted non-destructively by migration 00134; no catalogue rows are deleted.

### P1 - Redis could outlive Next.js invalidation

Before this audit, school bundles could remain in Redis for 24 hours. Admin mutations invalidate Next.js tags and paths, but a Redis hit occurs before the public RPC call, so path/tag invalidation alone could still serve stale school data.

Implemented in this worktree:

- `lib/cache/redisCloud.ts` now supports deleting a cache namespace by prefix.
- `lib/admin/catalog-revalidate.ts` clears `school:bundle:*` whenever catalogue data changes, including master-product changes that can affect multiple schools.
- `lib/school-utils.ts` reduces the Redis bundle TTL to 300 seconds, matching the public route/cache freshness contract.
- `app/admin/items/actions.ts` now revalidates after direct pack-item quantity updates.

This fix is pending deployment. After deployment, verify an admin item/price change by opening the public school route in a fresh request and confirming the changed value is returned.

### P2 - public pages do not live-update in an already-open browser tab

No public `postgres_changes` subscription was found for school packs. Admin components call `router.refresh()` after mutations, but a parent viewing an already-open public page will not receive a push update. The current behavior is cache-based: new navigation/request data is refreshed within the five-minute contract.

This is acceptable if documented as eventual consistency. If immediate updates are required, add a narrowly scoped Supabase Realtime subscription or a short SWR refresh for the active school route. Do not add a global realtime channel for the full 23k-pack catalogue.

### P2 - duplicate grade rows need cleanup before enforcing uniqueness

The audit found two school-specific Grade R duplicate keys. Confirm whether these are separate seasons, duplicate pack rows, or an intended variation. Once cleaned up, enforce uniqueness at the correct business scope, for example `(school_id, season_id, normalized_grade)` or the equivalent canonical columns.

### P3 - secondary revalidation path should be reviewed

`lib/admin/catalog-revalidate.ts` invalidates `/schools/packs/<packSlug>` in addition to the school route. The canonical public page is `/schools/<schoolSlug>`. Confirm whether the pack path is still used; if it is dead, remove the path invalidation to reduce confusion. If it is a supported route, add a route test so it cannot silently drift.

## Publication policy implementation

Migration 00134_enforce_school_pack_publication_readiness.sql implements the default policy end to end:

- publish_school_pack now requires an active, published school.
- A pack must contain at least one active item with an integer quantity of at least one.
- Every active item must reference an active, public product.
- Every active item must have a positive effective selling price.
- The pack must have a positive price and pricing_status = ready.
- Existing invalid published/visible packs are demoted to draft/hidden without deleting rows.
- Database triggers reject later changes that would make a published pack invalid.
- A scoped partial unique index prevents two public packs for the same school and normalized grade key.
- assert_public_catalogue_ready() is available to the service role for CI and deployment preflight.

The admin create, edit, single-toggle, and school-bulk publication paths now call the guarded publish RPC. A failed readiness check leaves the pack as a draft and returns the reason to the admin UI.

The CI command is npm run db:publication:preflight, and it is included in npm run check:all as the public-catalogue readiness gate.

## Deployment note

The migration history mismatch has been reconciled. Remote migration `20260928024514` was identified as the timestamped deployment of `00133_create_school_websites.sql`. Using `supabase migration repair --linked`, `20260928024514` was marked reverted and `00133` was marked applied to match the canonical 5-digit repository naming convention.

`supabase db push --linked --dry-run` now passes cleanly and confirms only `00134_enforce_school_pack_publication_readiness.sql` is pending.

Docker Desktop and the local Supabase database are healthy. All migrations 00001 through 00134 are applied locally; db lint reported no schema errors and all 79 test suites pass.
## Latency and concurrency notes

The public read path is designed as a cached lookup followed by one Supabase RPC on a cache miss. This is efficient for normal parent traffic. The new Redis prefix invalidation uses a bounded scan and batched deletes and is asynchronous, so it should not block the admin response. It should still be instrumented with duration and deleted-key counts if catalogue writes become frequent.

A 1,000-user load test was not executed locally because a staging environment and k6 are unavailable. A realistic pre-launch test should start with 50-100 concurrent users and measure:

- Supabase pooled connection use and query latency.
- Redis hit/miss and invalidation duration.
- Public school route p95 response time.
- Checkout/payment handoff error rate.
- Vercel cold-start behavior.

## Verification completed

- `node --check scripts/db-reconciliation-audit.cjs` passed.
- Live read-only `node scripts/db-reconciliation-audit.cjs` completed successfully.
- Focused publication/reconciliation/cache tests passed: 3 files, 9 tests.
- `npx.cmd tsc --noEmit` passed after the audit changes.
- Local migration history includes 00133 and 00134.
- npm run db:lint passed with no schema errors.
- npm run db:publication:preflight passed against the local database.
- npm run check:all passed all 6 quality gates locally.
- The isolated production Webpack build passed with exit code 0 after compiling, generating 121 pages, and collecting traces.
## Recommended rollout order

1. Confirm which packs are intentionally public for the active school year.
2. Correct publication/readiness state in a reviewed migration or admin bulk action.
3. Deploy the cache invalidation fix and verify an edit-to-public refresh journey.
4. Resolve the two duplicate Grade R records and add the correct scoped uniqueness rule.
5. Resolve the linked migration-history mismatch, apply migration 00134, and run the publication preflight.
6. Verify an admin publish failure and a valid publish in staging.
7. Run the 50-100 VU staging test, then schedule a 1,000 VU test only when traffic and infrastructure justify it.