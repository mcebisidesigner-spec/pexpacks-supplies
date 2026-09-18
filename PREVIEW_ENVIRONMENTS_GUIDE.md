# Pexpacks Preview Environments & Sandbox Governance Guide

This document defines the architecture, isolation rules, and automated safeguards for Vercel Preview Deployments and Supabase Database Branching in the Pexpacks platform.

---

## 1. Overview & Architecture

Every pull request or feature branch deploys an isolated ephemeral preview environment combining:
1. **Vercel Preview Deployments**: Ephemeral frontend hosting matching git branch revisions.
2. **Supabase Database Branching**: Isolated PostgreSQL database instances branched from main schema with applied migrations.
3. **Synthetic Sandbox Seeding**: Safe mock catalogues, test schools, and demo orders (`supabase/seed.sql`) without real customer PII.
4. **Search Engine Protection**: Global `X-Robots-Tag: noindex, nofollow` header on all preview routes.

---

## 2. Production Protection & Non-Prod Safety Guards

To prevent catastrophic accidents (such as running test seeders or database wipes against production), the application provides runtime security guards in `@/lib/preview`:

```ts
import { assertNonProduction, isPreviewDeployment } from "@/lib/preview";

export async function runMockSeeder() {
  // Throws a fatal Error if current environment is production!
  assertNonProduction("runMockSeeder");

  // Proceed with mock data creation safely
}
```

### Environment Identification Hierarchy
- `VERCEL_ENV === "production"`: Live Production.
- `VERCEL_ENV === "preview"`: Ephemeral Preview Deployment.
- `VERCEL_ENV === "development"` or `NODE_ENV === "development"`: Local Development.
- `NODE_ENV === "test"`: Vitest Automated Test Suite.

---

## 3. SEO & Anti-Indexing Header Enforcement

In `next.config.ts`, preview deployments automatically receive an `X-Robots-Tag: noindex, nofollow` HTTP header on `/:path*` when `process.env.VERCEL_ENV === "preview"`.

This prevents ephemeral test URLs (e.g. `pexpacks-*-pexpacks.vercel.app`) from being indexed or ranking in Google search results.

---

## 4. Payment Gateway Sandbox Gating

Live payment processors (Ozow Live, PayFast Live) must NEVER execute in preview environments.

Preview testing requires:
```env
OZOW_IS_TEST=true
OZOW_TEST_MODE_APPROVED=true
```

Verified via preflight check:
```bash
npm run payment:sandbox:preflight
```

---

## 5. Verification Commands

Run preview verification checks locally or in CI:

```bash
# 1. Verify preview environment configuration & safety guards
npm run check:preview

# 2. Verify payment sandbox readiness
npm run payment:sandbox:preflight

# 3. Verify database schema preflight against Supabase
npm run db:preflight
```
