# Database and Web-App Synchronization Audit

**Date:** 12 September 2026  
**Scope:** Remote Supabase schema and data reconciliation, public read models, admin mutation cache behaviour, checkout/payment persistence, Pexcover, CMS, fulfilment, and automated application contracts.

## Executive Result

The database and application are connected through the intended Supabase service boundary. The remote migration history matches the repository through `00115_order_item_pexcover_snapshot.sql`; the schema recovery snapshot checksum and reconciliation audit passed. Public school and CMS reads are prepared, cached server-side payloads, and checkout recalculates customer totals from authoritative database data before an order is created.

No customer prices, supplier costs, or admin-only data were found in the public school-pack read contract. Two implementation improvements and two verification gaps remain below.

## Verified Evidence

| Area | Result | Evidence |
| --- | --- | --- |
| Schema version | Pass | `supabase migration list` shows matching local and remote history through migration `00115`. |
| Schema recovery | Pass | `npm.cmd run db:preflight` verified the recovery snapshot checksum and aligned migration history. |
| Public read performance | Pass | `get_public_school_pack` database execution: 7.3 ms; `search_public_schools`: 6.7 ms. End-to-end smoke requests were about 294-298 ms, indicating network/API latency rather than slow SQL. |
| Data consistency | Pass | 3,342 schools; no blank or duplicate slugs. Two quotations had no money precision/value problems. Six testimonials all retained school context. |
| Application contracts | Pass | `npm.cmd test`: 43 test files and 235 tests passed. TypeScript validation, admin-session-secret preflight, image budget, and whitespace checks also passed. |
| Public school data | Pass | `get_public_school_pack` and `search_public_schools` RPCs drive primary read paths. Server cache uses five-minute revalidation and admin catalog writes use `revalidateCatalog()`. |
| Pricing and Pexcover | Pass | Server checkout reloads the authoritative pack, recalculates the selected-item subtotal, applies the stored margin, then applies fixed packaging, assembly, and freight. Pexcover uses authoritative eligible-item flags and active rates; customer selection is opt-in. |
| Payment finalization | Pass by code inspection | Ozow webhook validates its hash and site code. `complete_order_payment` locks the order row, validates amount/currency, deduplicates gateway events, creates payment/procurement/fulfilment records, and records audit/operational events in one transaction. |
| CMS | Pass | Public FAQ, testimonial, announcement, and resource paths use slim RPCs with cached server reads. CMS write actions invalidate their matching tags and routes. |
| Access control | Pass by existing audit coverage | Public database paths are protected by RLS and security-definer functions have explicit `search_path`; payment completion is executable only by `service_role`. |

## Findings

### 1. Medium: Pending order and item snapshots are not one database transaction

`createPendingOrder` and `createMultiPackOrder` insert the `orders` record, then separately insert `order_items` snapshots. They attempt to delete the order if the snapshot insert fails, but a network interruption or failed compensating delete could still leave a pending order without line snapshots.

**Impact:** a rare partial failure could create an incomplete pending order, which would later have no procurement/fulfilment line items.

**Recommendation:** replace the two client-side writes with a restricted `service_role` RPC that inserts the order, snapshots, and metadata in one PostgreSQL transaction. Add an automated failure-path test that proves no orphan order remains.

### 2. Low: Website content uses a direct server-side table read

`getWebsiteContent()` reads only `key,value` from `website_content` via the server-side admin client. It is not browser-exposed and does not expose supplier or pricing fields, but it is the remaining public CMS path not using a narrow public RPC.

**Recommendation:** add `get_public_website_content()` returning only allowlisted public keys and approved value fields. Keep the current cache tag and use the RPC only in the public reader.

## Verification Gaps

1. **Local database lint was not run.** `npm.cmd run db:lint` could not connect to local PostgreSQL at `127.0.0.1:54322`. Start Docker and `supabase start`, then run the lint command. This is an environment limitation, not a reported schema defect.
2. **A real payment lifecycle cannot be data-verified yet.** The reconciliation audit found zero rows in `payments`. No live or artificial charge was made during this audit. Run one controlled Ozow sandbox purchase, then verify the linked `orders`, `payments`, `payment_events`, `order_items`, procurement, fulfilment, audit log, and buyer receipt.
3. **Customer-facing browser interaction was covered by unit/integration contracts, not a full live gateway session.** Validate the sandbox return page, webhook, receipt delivery, and order tracking using a non-production test address.

## Recommended Follow-up Order

1. Implement atomic pending-order plus snapshot creation.
2. Start the local Supabase stack and run `npm.cmd run db:lint`.
3. Run a controlled sandbox purchase and record a repeatable evidence checklist.
4. Add `get_public_website_content()` and remove the direct table read from the public CMS adapter.
5. Monitor p95 public RPC request duration separately from database execution time. Current SQL is fast; the remaining roughly 290 ms is transport, Supabase API, cold-start, or application overhead.
6. Continue planned `school_packs` bloat maintenance only after backup and production query-plan capture; use concurrent reindexing and remove indexes only when plans prove them redundant.

## Conclusion

The core synchronization model is sound: admin writes persist to Supabase, database functions calculate and lock commercial outcomes, public pages consume small prepared reads, and cache tags invalidate public output after changes. The remaining work is resilience and operational proof, not a broad schema redesign.
## Implementation Update: 12 September 2026

The two code findings above are resolved by migration 00116_atomic_pending_orders_and_public_website_content.sql.

- Pending orders and their immutable item snapshots now persist through one service-role PostgreSQL function. The order and snapshots are committed together or rolled back together.
- Public website content now reads through get_public_website_content, an allowlisted service-role RPC. The direct public-adapter table read has been removed.
- The public website-content RPC is included in the database smoke test. Full validation after deployment passed: 44 test files, 237 tests, migration history through 00116, reconciliation audit, and security preflight.

The remaining items are operational verification only: start the local Supabase stack for database linting, run a controlled Ozow sandbox payment, and continue planned production bloat maintenance after a backup and query-plan review.
## Local Verification Update: 12 September 2026

Docker Engine 29.7.2 and the local Supabase stack were started successfully. The command npm.cmd run db:lint completed against local PostgreSQL with no schema errors. The remaining unperformed verification is a controlled Ozow sandbox purchase, which should be run with a test payment method and test recipient before production payment acceptance is enabled.
## RPC Integration Update: 12 September 2026

After a local Supabase database reset rebuilt migrations through 00116, the local RPC contract check passed. get_public_website_content returned five seeded public rows. create_pending_order_with_snapshots created one synthetic local order and one matching immutable order_items snapshot. The synthetic order was then deleted through the local database owner; verification confirmed zero remaining orders and snapshots for that test identifier.
## Payment Sandbox Readiness Update: 12 September 2026

A payment:sandbox:preflight command now validates the required Ozow, Resend, Supabase, and public-app settings without printing secret values or sending a payment. It also refuses to proceed unless OZOW_IS_TEST is exactly true. The local configuration correctly failed this test-mode gate, so no gateway call was made. The signed order-paid webhook regression test passed. Configure dedicated Ozow test credentials and OZOW_IS_TEST=true in a Preview environment before running the controlled checkout test.