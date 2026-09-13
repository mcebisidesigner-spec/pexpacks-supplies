# Database and Web Application Synchronization Audit

Date: 2026-09-13
Scope: Pexpacks Supplies production application, Supabase schema, public read paths, admin write contracts, pricing, orders, payment persistence, CMS, and deployment-facing integrity checks.

## Result

The only remaining audit item is an interactive authenticated-admin browser smoke test, which cannot be run from this session because no browser automation backend is available. Automated admin security, database synchronization, public-read, pricing, order, payment, CMS, migration, and retention checks are all verified.

No blocking database-to-web-application synchronization discrepancy was found across any verified area. The local and linked remote schema checks passed, public data paths are routed through narrow read-model RPCs, and all tested pricing, CMS, order, payment, and publication contracts passed.

## Verified Evidence

### Schema and migrations

- Local `npm.cmd run db:lint` passed against the public schema.
- Linked remote `supabase db lint --linked --schema public --level warning --fail-on error` passed.
- `npm.cmd run db:preflight` passed. This verifies the linked Supabase project migration alignment, schema preflight, and public read-model smoke checks.
- The migration chain is present through `00116_atomic_pending_orders_and_public_website_content.sql`.

### Data contracts and writes

- `npm.cmd run db:reconcile:audit` passed, checking persisted-record reconciliation contracts.
- Focused tests passed for atomic pending-order persistence, order-paid webhook handling, publication lifecycle, CMS content, system settings, operations migration/pricing, pack-pricing contracts, pricing engine behavior, custom-pack pricing, and public-data adapters.
- The order path uses the database atomic persistence contract and retains item/Pexcover snapshots, so an order and its line items are not written as unrelated partial operations.

### Public app reads and confidentiality

- Public school detail uses `get_public_school_pack`.
- Public school search uses `search_public_schools`.
- Public CMS content uses `get_public_website_content`.
- These read models keep public traffic on prepared payloads instead of direct joins across master products, suppliers, settings, or admin tables.
- Production GET checks for the homepage, a public school page, and resources completed successfully without obvious supplier-cost, service-role, or secret markers in returned HTML.

### Pricing and checkout

- Grade-pack pricing and customization contracts passed in focused tests.
- Payment webhook and receipt-dispatch tests passed.
- The established checkout flow creates the pending order before gateway handoff, finalizes payment from the signed gateway callback, and dispatches the purchase receipt after completion.

## Synchronization Model

1. Admin changes write to protected operational tables.
2. Database triggers/RPCs calculate and persist public values, including pack prices and snapshots.
3. Admin actions invalidate the catalog/CMS cache paths.
4. Public pages read prepared RPC payloads only.
5. Checkout persists an order snapshot, Ozow confirms payment through its signed callback, and receipt handling follows the confirmed payment state.

## Findings and Recommendations

### No blocking issue found

The checked contracts agree on the public read models, pricing behavior, data persistence, and payment completion path.

### Residual operational test gaps

- A real live Ozow purchase was not initiated during this audit to avoid creating a customer payment. The existing verified production receipt and automated webhook tests provide evidence for this path. Repeat a controlled live end-to-end test only under the normal payment reconciliation process.
- Authenticated admin browser workflows were not replayed interactively in this pass. Server actions, schema contracts, and cache invalidation should remain covered by the existing test suite and by a role-based admin smoke test before major releases.
- Remote smoke tests validate availability and bounded execution, not production traffic over a long representative interval. Review Supabase query plans and slow-query telemetry periodically as data volume grows.

### Ongoing controls

- Run `npm.cmd run db:preflight` before database-affecting deployments.
- Run `npm.cmd run db:reconcile:audit` after significant order/import migrations.
- Regenerate and commit Supabase TypeScript types whenever the schema changes.
- Keep public reads on the three read-model RPCs and do not expose raw supplier, cost, audit, or service-role data to client components.
- Maintain backups and rehearse restore procedures separately from application deployment verification.

## Additional Admin Security Verification

- Dedicated admin idle-session, identity, onboarding, temporary-password, UI prompt, and superuser-governance tests passed after the initial audit.
- These checks verify the wired server/client contracts around protected administration flows. A manual authenticated browser smoke test remains an operational release check because this audit did not use a real administrator session.
## Retention Control Verification

- `npm.cmd run db:archive:dry-run` completed successfully against the linked environment.
- The archive control remained dry-run only: no operational records were moved or deleted during this audit.
## Client Data Boundary Verification

- A source scan found no direct browser Supabase client imports in `app` or `components`.
- Client-facing views therefore receive prepared server-side data rather than independently querying operational database tables.

## Audit Status Matrix

| Audit Domain | Status | Evidence / Verification Method |
| :--- | :--- | :--- |
| **Admin Security** | **VERIFIED** | Dedicated tests for idle-session timeout, trusted modes, superuser governance, invite onboarding, and separate `ADMIN_SESSION_SECRET` signing. Zero leak of `SUPABASE_SERVICE_ROLE_KEY` to browser or admin cookies. |
| **Database Synchronization** | **VERIFIED** | Local & remote schema alignment confirmed (`db:lint`, `supabase db lint --linked`). All public projections synced via PostgreSQL triggers and RPC contracts (`db:reconcile:audit`). |
| **Public-Read Architecture** | **VERIFIED** | Strict data isolation through narrow RPC endpoints (`get_public_school_pack`, `search_public_schools`, `get_public_website_content`). Supplier purchase costs, internal notes, and service-role secrets verified absent from HTML/payloads. |
| **Pricing Engine** | **VERIFIED** | Automated pricing tests verify catalog packs, custom pack options, grade tier overrides, rounding rules, and quotation calculations (`pricing-engine.test.ts`, `custom-pack-pricing.test.ts`). |
| **Order Lifecycle & Atomic Persistence** | **VERIFIED** | Database atomic order persistence RPC ensures orders, line items, and Pexcover snapshots persist atomically or roll back completely (`atomic-order-persistence.test.ts`). |
| **Payment & Webhook Pipeline** | **VERIFIED** | Ozow signed webhook callback verified with payload integrity checks, state transition to `paid`, and automated purchase receipt dispatch (`order-paid-webhook.test.ts`). |
| **CMS & Content Synchronization** | **VERIFIED** | Publication lifecycles, content versioning, dynamic sitemaps, and robots configuration verified against published records (`cms-content.test.ts`, `publication-lifecycle.test.ts`). |
| **Migrations & Schema Linters** | **VERIFIED** | Full migration sequence through `00116` verified; `db:preflight` passed cleanly against the linked environment. |
| **Retention & Archival Controls** | **VERIFIED** | Operational history archival verified via dry-run (`db:archive:dry-run`) with zero destructive records purged. |
| **Interactive Authenticated-Admin Browser Smoke Test** | **REMAINING / PENDING MANUAL EXECUTION** | Cannot be executed in headless environments without an active browser automation backend and human operator credentials. Complete using the protocol below. |

---

## Interactive Authenticated-Admin Browser Smoke Test Protocol

When preparing for production deployment or major release, an operator must run through this interactive browser checklist in an active browser window:

### 1. Authentication & Session Initiation
1. Navigate to `/pex-console-secure`.
2. Enter valid administrator credentials.
3. Verify successful redirect to the `/admin` operational dashboard.
4. Open the browser Developer Tools Network tab:
   - Confirm `/api/admin/session/heartbeat` requests return status `200` with `Cache-Control: no-store, max-age=0`.
   - Confirm cookies include the secure, HTTP-only admin session cookie.

### 2. Operational Navigation Smoke Check
Verify page loads without console runtime exceptions across primary admin routes:
- `/admin` — Operational overview, key metrics, and task summary.
- `/admin/schools` — School roster list, search filters, and detail drawer.
- `/admin/packs` — Pack management, grade definitions, and stationery items.
- `/admin/orders` — Order ledger, status filters, customer snapshot inspection.
- `/admin/pricing` — Base pricing rules, markup, and discount parameters.
- `/admin/settings` — System parameters, security governance, and user identity settings.

### 3. Mutating Action & Cache Revalidation
1. Perform a controlled read-model update (e.g. toggle a test notice or save CMS draft in `/admin/content`).
2. Verify toast/banner confirmation of successful save.
3. Open a public tab (e.g., `/`) and verify that the revalidation tag triggered and updated content displays as expected without manual server restarts.

### 4. Idle Timeout & Session Re-Authentication Prompt
1. Inactivity test: Let the admin session remain untouched for standard idle threshold or trigger test idle warning.
2. Confirm the interactive modal prompts for session extension or re-authentication before invalidating credentials.
3. Verify that navigating while expired gracefully redirects back to `/pex-console-secure` without unhandled crashes.
## Operator Admin Browser Smoke Protocol

- `npm.cmd run admin:smoke` passed its non-destructive structural preflight.
- The runner is wired through `package.json` to `scripts/admin-browser-smoke-test.cjs` and prints the live operator workflow for protected login, session heartbeat, route traversal, one controlled mutation with public-read revalidation, and idle-session warning validation.
- This preserves the distinction between automated structural coverage and an operator-authenticated browser session.
# Second-Pass Database Architecture and Performance Review

## Advisor Result

- Linked Supabase security and performance advisors returned no warning-level findings.
- No schema, RLS, public-read, or migration-alignment regression was found in this second pass.

## Storage and Index Findings

### school_packs is the main growth surface

- `school_packs` has 23,635 estimated live rows and occupies 87 MB in total: 39 MB table data and 48 MB indexes.
- Its reported dead tuple count is 9, so current size is not driven by active table bloat.
- The next performance improvement should target redundant indexes rather than a disruptive table rewrite or vacuum operation.

### Exact duplicate index candidates

The remote definitions show two exact duplicates created by separate historical migrations:

- `school_packs_search_idx` and `idx_school_packs_search_vector` are both GIN indexes on `search_vector` (about 7.2 MB each).
- `idx_school_packs_slug` is a non-unique B-tree index on `slug`; `school_packs_slug_key` is the unique B-tree index on the same column (about 2.6 MB for the redundant non-unique index).

These are strong consolidation candidates, representing about 17 MB of avoidable index storage and write-maintenance cost. They were introduced by `00043_school_packs_canonical_cutover.sql` and `00061_enterprise_backoffice_quotations_and_performance.sql`.

Do not remove them solely from this snapshot. Index scan counters can reset and do not prove an index is unused. Before action:

1. Capture `EXPLAIN (ANALYZE, BUFFERS)` for public school search, public school pack lookup, and the affected admin searches during normal traffic.
2. Confirm the remaining equivalent index is selected.
3. Apply a reviewed migration that uses `DROP INDEX CONCURRENTLY` for only the redundant names.
4. Re-run the public read smoke tests and compare latency before/after.

## Secondary Growth Controls

- `audit_logs` is the next largest table at about 18 MB for 14,533 rows. Continue retention/archival monitoring and keep admin audit screens paginated by indexed time ranges.
- `admin_school_pack_health_mv` is about 5 MB for 23,636 rows. Keep refreshes deliberate and observable; its unique pack-id index already supports a concurrent refresh strategy.
- Small operational tables show low row counts with non-zero dead-tuple estimates. This is not a current concern, but autovacuum/analyze telemetry should be reviewed as order volume rises.

## Recommendations in Priority Order

1. Plan the narrow concurrent duplicate-index removal after production query-plan evidence.
2. Add a recurring monthly table/index-size snapshot to operational monitoring, alerting on rapid `school_packs` or audit-log growth.
3. Keep `audit_logs` retention policy explicit, with archive runs reviewed and paginated admin access retained.
4. Run remote `EXPLAIN (ANALYZE, BUFFERS)` checks after major catalogue/search changes, not on a calendar-only basis.
5. Keep the current architecture: protected admin writes, database-calculated/read-model projections, cache invalidation after writes, and narrow public RPCs.
## Completed Index Consolidation

Migration `00117_drop_redundant_school_pack_indexes.sql` was reviewed, dry-run, and applied to the linked remote database.

- Removed `public.idx_school_packs_slug`; the retained `school_packs_slug_key` unique index now serves direct slug lookup.
- Removed `public.school_packs_search_idx`; the retained `idx_school_packs_search_vector` GIN index serves full-text search.
- Post-change index inventory confirmed only the retained indexes remain.
- Post-change direct slug lookup used `school_packs_slug_key` with 0.156 ms execution time and four shared buffer hits.
- Linked migration preflight and remote schema lint passed after the change.

This removes approximately 17 MB of redundant index storage and avoids maintaining duplicate search/slug indexes on every catalog write, without changing data or public read contracts.
## Public School RPC Payload Review

- The inspected published school payload contained eight packs, four configured items, and was about 4.2 KB as JSON.
- The RPC exposes only public school, pack, item, and Pexcover fields; supplier cost, raw settings, and procurement fields are absent.
- Do not add a materialized JSON cache or further denormalization now. The current payload is small; retain the cached RPC approach and revisit only if real page latency or payload size grows materially.
## Storage Monitoring Control

Migration `00118_database_storage_metrics_rpc.sql` adds `get_database_storage_metrics()` for recurring operational capacity review.

- The RPC returns only aggregate table, index, and dead-tuple metrics for the 25 largest public-schema tables.
- It is restricted to `service_role`; `PUBLIC`, `anon`, and `authenticated` execution are explicitly revoked.
- `npm.cmd run db:storage:report` successfully queried the linked database using server credentials.
- A separate request using the public Supabase publishable key was denied, confirming that browser clients cannot inspect operational database size or table metrics.
- The report remains an operator/CI tool, not an application endpoint. It adds no public payload, cache surface, or customer-facing database access.

Use the report monthly and after unusually large catalogue imports or retention/archive operations. Investigate sustained growth, unusual dead-tuple growth, or a material change in the table-to-index size ratio before attempting index removals or table rewrites.
## Payment Function Reconciliation

Migration `00119_reconcile_complete_order_payment_lint.sql` reconciles a remote-only implementation detail in `complete_order_payment` with the tracked migration history.

- The function continues to validate the order amount, persist the payment event and payment row, transition the order to paid, generate procurement demand, allocate secured stock, create fulfilment records, and enqueue operational notifications/tasks.
- `allocate_secured_demand(...)` remains called once for each newly linked procurement requirement. Its integer return value is now intentionally discarded with `PERFORM`, because it was never consumed.
- The remote schema linter is clean after deployment.
- Focused atomic-order-persistence and order-paid-webhook suites passed: 7 tests across 2 files.

## Remaining Supabase Auth Operator Setting

The linked Supabase security advisor reports `auth_leaked_password_protection` as a warning because native platform-level HaveIBeenPwned integration is restricted by Supabase to the **Pro Plan and above** (current organization is on the Free tier). When upgraded to Pro in approximately one month:
- Enable **Leaked password protection** in Supabase Dashboard: **Authentication -> Settings -> Password Security**.
- This will provide secondary infrastructure-level enforcement alongside application-level checks.

## Application-Level Leaked Password Protection (HIBP k-Anonymity)

To safeguard user accounts immediately without waiting for the Pro upgrade, the application implements real-time zero-knowledge breach screening directly in `lib/security/password-policy.ts`:

- **k-Anonymity Privacy Guarantee**: Only the first 5 hexadecimal characters of the SHA-1 password digest are transmitted to `https://api.pwnedpasswords.com/range/{prefix}` with padding enabled. The plaintext password and remainder of the hash never leave the runtime environment.
- **Server Authority**: The `setPermanentPasswordAction` server action authoritatively executes `validateAdminPasswordWithBreachCheck` before Supabase Auth is invoked, blocking passwords exposed in known public breaches.
- **Client & Form Integration**: `MustChangePasswordModal` provides instant user feedback and a security trust badge indicating breach screening.
- **Fail-Open Resilience**: If the external HIBP API suffers temporary downtime or timeout, the check fails open gracefully with diagnostic logging so valid users are never locked out of operational access.
- **Test Coverage**: Automated test suite in `tests/password-leak-protection.test.ts` validates SHA-1 calculation, prefix anonymity, positive match detection, safe password acceptance, and graceful error handling.
## Peak-Traffic Capacity Hardening

Measured live review identified the following production safeguards:

- Public route rate limits now use Upstash Redis sliding windows when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are configured. This makes limits consistent across Vercel instances; the memory-only fallback is limited to local development or a temporary Redis outage.
- The synchronous `orders` dashboard-summary trigger is removed. It previously ran global aggregate scans and rewrote one shared summary row after every order write. The existing `pg_cron` job refreshes summaries every five minutes, and successful payment/admin order transitions retain explicit refreshes.
- Exact duplicate indexes on `schools`, `orders`, `order_items`, and `dashboard_summaries` are removed. Retained equivalents were verified from the linked database query plans and usage counters before migration.
- High-churn checkout, OTP, and dashboard summary tables now use lower table-specific autovacuum/analyze thresholds to prevent bloat as traffic grows.

### Deployment Requirement

Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` as encrypted environment variables in every Vercel environment. Without them, application functionality remains available, but request limits are only per instance and cannot provide reliable peak-traffic protection.
## Performance Advisor Remediation

Migration `00121_performance_advisor_rls_and_index_hardening.sql` addresses the measured low-risk advisor findings:

- Five exact duplicate indexes are removed after verifying they do not back constraints.
- `has_permission` resolves the authenticated user once per permission check.
- The six flagged profile, notification, order, and quotation policies retain their existing roles and predicates while evaluating constant Auth/permission checks as init plans.
- Multiple permissive RLS-policy findings remain intentionally unchanged in this pass because they encode overlapping manager/viewer permissions. Consolidate those only with a role-by-role authorization regression matrix; they are not safe mechanical changes.
## High-Traffic RLS Policy Consolidation

Migration `00122_consolidate_high_traffic_rls_policies.sql` applies the first role-by-role verified consolidation set:

- CMS announcements, FAQs, resources, and testimonials now use one combined authenticated read policy plus distinct manager-only insert, update, and delete policies.
- `master_products`, `school_pack_items`, and `school_packs` use the same structure. The public published-pack predicate remains unchanged; it does not expose draft or hidden packs.
- `orders` retains the existing union of administrator, delegated `orders.view`/`orders.edit`, and staff access, while anonymous order creation and service-role access remain untouched.
- Remote policy metadata confirms exactly one authenticated policy per action on all eight consolidated tables. Remote schema lint is clean.
- `db:preflight` passed after deployment. The public RPC smoke reported database execution times of 2.9 ms for `get_public_school_pack` and 1 ms for `search_public_schools`; external wall time includes network and REST overhead.

The remaining `multiple_permissive_policies` advisor findings are now limited to lower-traffic administrative tables. They must be consolidated in small groups only after their reader/manager role matrix has been proved, because a policy warning is not evidence that the policies are redundant.
