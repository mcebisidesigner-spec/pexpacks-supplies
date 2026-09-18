# Pexpacks Platform Quality Gate & CI Pipeline Documentation

**Version:** 1.0  
**Effective Date:** September 2026  
**Status:** Active & Enforced

---

## 1. Overview & Objectives

The Pexpacks Platform employs a multi-tier automated Quality Gate to ensure zero regressions in customer-facing commerce journeys, strict administrative access control, database schema integrity, and full TypeScript type safety across the application lifecycle.

No code may be merged to `main` or deployed to production without passing all quality gate layers.

---

## 2. Multi-Layer Quality Gate Hierarchy

| Gate Level | Target Area | Tool / Command | Verification Criteria |
| :--- | :--- | :--- | :--- |
| **Layer 1: Type Safety** | Static TypeScript Types | `npx tsc --noEmit` | **0 errors**. Strict type safety grounded in database schema projections and component props. |
| **Layer 2: Database Governance** | Migration Continuity & Zero-Downtime DDL | `node scripts/verify-migration-governance.cjs` | All migrations sequentially numbered (`^\d{5}_[a-z0-9_]+\.sql$`), zero duplicate prefixes, zero sequence drift. |
| **Layer 3: Unit & Domain Suites** | Business Logic, Pricing & Invariants | `npx vitest run` | **100% pass rate** across all 70+ test suites (pricing formulas, pack calculations, webhooks, auth guards). |
| **Layer 4: Database Unit Testing** | Schema, RLS & Trigger Policies | `npm run test:db` (pgTAP) | Validates PK/FK invariants, RLS enablement, anonymous mutation barriers, and `SECURITY DEFINER` `search_path` locks. |
| **Layer 5: End-to-End Journeys** | Customer Path & Admin Security | `npm run test:e2e` (Playwright) | End-to-end customer discovery (`/schools`), converter (`/order`), and `/admin` redirect barriers. |
| **Layer 6: Production Build** | Next.js Compilation & Bundle Optimization | `npm run build` | Next.js production webpack bundle compiles cleanly with 0 fatal errors. |

---

## 3. Local Developer Commands

Developers and automated agents should execute the following commands before opening pull requests:

### 3.1 Fast Local Pre-Merge Check
```bash
npm run check:all
```
*Executes Gate 1 (TypeScript), Gate 2 (Database Governance), and Gate 3 (Vitest) sequentially in ~10 seconds with clean formatted logging.*

### 3.2 Individual Verification Commands
- **Lint & Format**: `npm run format:check` and `npm run lint`
- **Database Testing**: `npm run test:db`
- **E2E Testing**: `npm run test:e2e`
- **Database Smoke Preflight**: `npm run db:preflight`

---

## 4. Continuous Integration (GitHub Actions)

The platform CI workflow (`.github/workflows/ci.yml`) runs on every push and pull request to `main`:

1. **Job 1: `lint-and-build`**
   - Node 20 environment with npm cache.
   - Formatting check (`npm run format:check`).
   - Lint & Type check (`npm run lint`).
   - Database migration governance (`node scripts/verify-migration-governance.cjs`).
   - Image budget verification (`npm run check:images`).
   - Full Vitest test suite (`npm test`).
   - Production Next.js build (`npm run build`).
2. **Job 2: `security-audit`**
   - High-severity npm dependency vulnerability scan (`npm audit --audit-level=high`).
3. **Job 3: `e2e`**
   - Headless Chromium installation.
   - Next.js server launch and full Playwright test suite execution.

---

## 5. Failure Resolution Protocol

If any gate fails:
1. **Type errors**: Run `npx tsc --noEmit` locally to view file and line numbers. Check generated Supabase types in `lib/supabase/database.types.ts`.
2. **Migration governance errors**: Run `node scripts/verify-migration-governance.cjs`. Ensure migration files follow `00XXX_description.sql` convention without duplicate numbers.
3. **Vitest suite failures**: Run `npx vitest run tests/<specific-test>.test.ts` to debug isolated failures. Remember: **never alter business pricing formulas** (`pricing.ts`, `Pexcover`).
