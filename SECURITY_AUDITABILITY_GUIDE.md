# Pexpacks Security, Permissions & Auditability Guide

This document specifies the security controls, Row-Level Security (RLS) policies, server action boundary validations, privileged audit trails, and zero-leak logging implemented across the Pexpacks platform.

---

## 1. Zero-Trust Database & Row-Level Security (RLS)

All public tables in Supabase have Row-Level Security explicitly enabled. Direct table mutations by anonymous or untrusted clients are prohibited at the database engine level.

### Policy Invariants
1. **Public Read-Only Relations**:
   - `schools`, `school_packs`, `school_pack_items`, `brands`, `website_content` allow `SELECT` for published/listed records.
   - `INSERT`, `UPDATE`, and `DELETE` are completely revoked for `anon` and `authenticated` non-staff roles.
2. **Order & Customer Isolation**:
   - Customers may only query orders matching their verified session ID or guest payment reference.
   - Order mutation is restricted to internal PostgreSQL trigger functions and service-role procedures.
3. **Sensitive Audit & Event Logs**:
   - `audit_logs`, `security_audit_logs`, `order_events`, `pack_events`, and `quotation_events` have `REVOKE ALL` from browser clients (`anon`, `authenticated`).
   - Mutations are strictly handled via `SECURITY DEFINER` procedures with locked `search_path = public, pg_temp`.

---

## 2. pgTAP Regression Test Suite

Database integrity and policy rules are continuously verified using pgTAP in `supabase/tests/`:

| Test File | Verification Focus |
| :--- | :--- |
| **`00001_schema_invariants.sql`** | Validates primary keys, foreign key constraints, column data types, and index presence on all core commerce tables. |
| **`00002_rls_policies.sql`** | Verifies `row_security_active()` across all public tables, tests anonymous mutation rejections (`throws_ok`), and validates role enforcement. |
| **`00003_functions_and_triggers.sql`** | Audits stored procedures for `prosecdef = true` and `search_path` locks to prevent privilege escalation or search_path poisoning. |

Execute locally:
```bash
npm run test:db
```

---

## 3. Server Action Boundaries & RBAC Enforcement

All state-mutating actions executed from client components pass through multi-layer verification:

1. **Authentication & Role Verification**:
   ```ts
   import { requireAdmin } from "@/lib/admin/rbac";

   export async function updateSupplierPriceAction(data: unknown) {
     // Enforces valid session and specific granular permission
     const session = await requireAdmin({ permission: "suppliers.manage" });
     // ...
   }
   ```
2. **Runtime Contract Validation (`zod`)**:
   - All server action inputs are parsed with strict Zod schemas rejecting extra fields.
3. **Origin & CSRF Guard**:
   - High-risk endpoints check `Origin` and `Referer` headers against allowed domain whitelists (`requestGuards.ts`).

---

## 4. Privileged Operational Audit Logging

Operational mutations in the admin dashboard are logged to the tamper-resistant `audit_logs` table:

```ts
import { writeAuditLog } from "@/lib/admin/rbac";

await writeAuditLog({
  action: "suppliers.update_cost",
  entityType: "supplier_product",
  entityId: "item_12345",
  summary: "Updated bulk purchase cost to R45.00",
  details: { previousCost: 40.0, newCost: 45.0 },
  actorId: session.user.id,
  actorName: session.user.email,
  ip: clientIp,
  userAgent: userAgent,
});
```

### Zero-Leak Audit Sanitization
- `writeAuditLog` and `logSecurityEvent` filter all metadata through `sanitizePayload`.
- Any password, access token, Bearer string, or credit card value passed in `details` or `metadata` is automatically replaced with `[REDACTED]` prior to SQL insert.

### Superuser Alerting on Critical Actions
If a non-superuser performs high-risk operations (e.g., `suppliers.manage`, `payments.refund`, `system.restore`, role elevation), automated instant alert emails are dispatched to `pexpacks@gmail.com`.

---

## 5. Security Preflight Commands

```bash
# 1. Verify admin session secret entropy & configuration
npm run security:preflight

# 2. Verify distributed rate limiter connectivity & capacity
npm run capacity:preflight

# 3. Run least-privilege database policy checks
npx vitest run tests/least-privilege-database-audit.test.ts
```
