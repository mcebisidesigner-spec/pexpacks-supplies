# Database Security and Performance Audit

Date: 2026-09-10
Scope: Supabase schema, RLS and grants, public read paths, application data adapters, and live database statistics.

## Verified controls

- Row-Level Security is enabled on every local `public` table.
- No local `SECURITY DEFINER` function lacks an explicit `search_path`.
- Storefront reads use slim, server-side public RPCs. The public pack RPC excludes supplier cost, item cost, margin, pricing status, and raw Pexcover rate fields.
- CMS, school, and directory responses are cached for 300 seconds and invalidated after admin writes.
- Public pack and school search plans have no critical sequential scans. Remote execution measurements during this audit were 8.6-19.1 ms for `search_public_schools` and 9.1-53.4 ms for `get_public_school_pack`.
- Public order tracking is server-side, rate limited, proof-gated, returns a sanitized payload, and is `private, no-store`.

## Applied Hardening

- Deployed `00105_least_privilege_event_and_content_access.sql` to remote Supabase.
- Deployed `00106_school_packs_autovacuum_tuning.sql`, applying conservative per-table autovacuum thresholds to prevent further `school_packs` bloat without a table rewrite.
- `admin_letter_templates` now separates read (`orders.view`) from create, update, and delete (`orders.edit`) access. The previous unrestricted authenticated policy was removed.
- `order_events`, `pack_events`, and `quotation_events` are server-only. Their rows include actor emails and JSON payloads and are not required by a public flow.
- `00108_revoke_direct_sensitive_access.sql` revokes direct `anon` and `authenticated` SQL grants on pricing, catalogue, order, supplier, payment, audit, and admin-report relations. Internal trigger functions and legacy public-directory functions are not callable through PostgREST.
- Deployed `00107_create_brands_and_product_variants.sql` with RLS tied to `catalogue.view` and `catalogue.manage`; it does not expose product-variant cost or supplier data to anonymous clients.
- Verified remote grants after `00108`: sensitive relations have no direct `anon` or `authenticated` table grants, while internal maintenance and legacy directory functions remain service-role only.
- Raw `website_content` is server-only. The public web application uses the allow-listed CMS reader rather than direct table access.
- Letter save, delete, email send, and template mutation actions now require `orders.edit`; listing and search remain `orders.view`.
- Remote migration history is aligned with the repository through `00108`. Migration `00104` was marked applied because its table already existed on remote; `00105` independently recreated its restrictive policies before deployment.

## Performance Observations

- Remote public RPCs are query-efficient. Total client timing was 255-579 ms, so the remaining latency is predominantly API and network overhead. Keep Vercel and Supabase in compatible regions and retain the existing short server cache.
- `school_packs` is the largest relation at about 87 MB for 23,635 rows, including 48 MB of indexes. Remote bloat reporting estimates 26 MB of table waste.
- Several remote `school_packs` indexes overlap and show no usage since statistics collection. Do not drop them only from a usage counter: capture production query plans and monitor for a full traffic cycle first. Then remove only demonstrably redundant non-constraint indexes and run `REINDEX INDEX CONCURRENTLY` during a maintenance window.
- No blocked or long-running remote queries were present during this audit.

## Remaining Risks and Required Follow-up

1. A schema-only remote recovery snapshot is tracked at `supabase/schema-snapshots/remote-public-2026-09-10.sql`, with its SHA-256 manifest. It protects recovery while the older remote-only delta is converted into small reviewed migrations. The snapshot is reference-only: do not replay it against a live database.
2. In the Supabase dashboard, verify production-only controls that cannot be enforced by SQL migrations: leaked-password protection, MFA for admin accounts, password requirements, production SMTP, and project/network access restrictions. Disable self-service sign-up unless public customer accounts explicitly require it.
3. Schedule remote index and bloat maintenance after a backup and a production query-plan review. This is operational work, not a deploy-time migration.

## Ongoing Checks

Run `npm.cmd run db:preflight` before every remote deployment; it verifies migration parity, the recovery snapshot checksum, and public read-path performance. Run `npm.cmd run db:lint` before deployment, and review Supabase query/index statistics periodically. Keep all public pages on server-side RPC adapters; do not expose service-role credentials or direct raw-table reads to browser components.