# Pexpacks Admin/Public Database Synchronization Audit

**Audit date:** 2026-09-29  
**Scope:** `/admin` catalogue mutations and the public `pexpacks-supplies` school/pack experience  
**Method:** source tracing, read-only Supabase reconciliation, migration validation, regression tests, TypeScript validation, and quality gates

## Executive result

The admin and public application use the same canonical catalogue model: `schools`, `school_packs`, `school_pack_items`, and `master_products`. School identity data and the payment, quotation, and testimonial records checked by the audit are structurally consistent.

The strict publication policy is active in both local and linked Supabase. Invalid packs are kept as admin drafts and excluded from the public catalogue. The latest linked audit reports **23,635 total packs, 1 published pack, 5 active pack items, and zero published packs violating the policy**.

The two earlier Grade R duplicate findings were draft copies: Actonville has an explicit `(Copy)` draft and A Re Thabeng has a `-2` draft. The reconciliation audit now treats duplicate public grade keys as release blockers while reporting draft duplicates as informational admin data.

## Synchronization paths

### Admin writers

- `app/admin/packs/actions.ts` creates, edits, prices, duplicates, hides, and publishes packs.
- `app/admin/items/actions.ts` updates pack-item quantities and revalidates the catalogue.
- `lib/admin/packs.ts` and `lib/admin/items.ts` perform canonical writes.
- `lib/admin/catalog-revalidate.ts` clears Redis school bundles and invalidates the canonical public routes.
- `supabase/migrations/00134_enforce_school_pack_publication_readiness.sql` enforces publication readiness in the database.
- `supabase/migrations/00135_public_catalogue_version_signal.sql` updates one public-safe version row whenever school, pack, item, or product data changes.

### Public readers

- `app/schools/[schoolSlug]/page.tsx` reads the cached public school bundle.
- `lib/school-utils.ts` loads `get_public_school_pack` and caches the bundle under `school:bundle:<slug>` for 300 seconds.
- `PublicSchoolCatalogueRefresh` subscribes to the school-specific catalogue version row and calls `router.refresh()` when an admin change is emitted.
- The version table exposes no catalogue data and is readable only for active, published schools.
- The obsolete `/schools/packs/<packSlug>` revalidation path was removed; `/schools/<schoolSlug>` is the canonical public route.

## Latest linked reconciliation

The read-only script is `scripts/db-reconciliation-audit.cjs`.

| Area | Result | Assessment |
| --- | ---: | --- |
| Schools | 3,342 total; 0 blank slugs; 0 duplicate slugs; 0 inactive/unpublished | Healthy |
| School packs | 23,635 total; 1 published; 0 blank pack slugs; 0 duplicate pack slugs | Healthy |
| Pack items | 5 total; 5 active | Healthy for published catalogue |
| Published packs without active items | 0 | Healthy |
| Published packs with missing products | 0 | Healthy |
| Published packs with non-public products | 0 | Healthy |
| Active items with invalid quantities | 0 | Healthy |
| Published packs with invalid prices | 0 | Healthy |
| Duplicate public school/grade keys | 0 | Healthy |
| Draft duplicate school/grade keys | 2 informational draft copies | Allowed in admin |
| Payments | 4; required amount, gateway, status, currency, and timestamps present | Healthy |
| Quotations | 2; fee/discount precision checks passed | Healthy |
| Testimonials | 6; school context present | Healthy |

## Implemented safeguards

- Publication requires an active, published school.
- A published pack requires at least one active item with a valid quantity.
- Active items must reference active, public products.
- Active items must have a positive effective selling price.
- The pack must have a positive price and `pricing_status = ready`.
- Database triggers prevent a published pack from becoming invalid.
- A partial unique index prevents duplicate public packs for the same school and normalized grade.
- Existing invalid public rows were demoted non-destructively to draft/hidden.
- Redis school bundle invalidation is namespace-aware and runs on catalogue mutations.
- The service-role publication preflight is included in `npm run check:all`.
- Open public school pages now have a scoped Supabase Realtime refresh signal.

## Verification completed

- Linked Supabase migration history matches the repository through `00135`.
- `supabase db push --linked --dry-run` reports the remote database is up to date.
- Linked publication readiness preflight passed.
- Linked read-only reconciliation passed with no public catalogue violations.
- Local Supabase migration `00135` applied successfully.
- Local database lint passed with no schema errors.
- `npx.cmd tsc --noEmit` passed.
- All 79 Vitest files passed: 387 tests passed.
- `npm run check:all` passed all six quality gates.
- The isolated production Webpack build passed previously with exit code 0.

## Remaining operational verification

The implementation is complete for the available local and linked environments. Two checks require infrastructure or credentials not available in this workspace:

1. Perform one authenticated staging browser journey: edit a pack in `/admin`, confirm the version signal changes, and verify the already-open public school page refreshes.
2. Run the planned 50-100 VU staging load test. The 1,000 VU test remains non-blocking and was not run because k6 and a staging environment are unavailable locally.
