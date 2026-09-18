# Pexpacks Supabase Database Governance & Zero-Downtime Migration Policy

**Version:** 1.0  
**Effective Date:** September 2026  
**Scope:** All PostgreSQL database migrations, schemas, RPCs, views, RLS policies, and data access operations in the Pexpacks platform.

---

## 1. Core Principles

The database is the single source of truth for all business logic, order contracts, product catalogs, pricing rules, and access control. To prevent data corruption, outages, lock-waits, and application downtime, all database operations must strictly comply with this governance framework.

1. **Zero-Downtime Safe Evolutions**: Production schema changes must execute safely alongside actively running web application instances.
2. **Expansion / Contraction (Two-Phase Deployments)**: Breaking changes (e.g. renaming columns, deleting tables, altering constraints) must follow a multi-phase deprecation cycle.
3. **Least Privilege & Row-Level Security (RLS)**: Public tables must have Row Level Security enabled. Unauthenticated access (`anon`) must only read non-sensitive public read models.
4. **Append-Only Migration History**: Never modify or reorder migrations that have already been applied to any remote or production environment.

---

## 2. Migration Numbering & Directory Conventions

All database migrations reside under:
```
supabase/migrations/
```

### 2.1 File Naming Specification
Every migration filename must strictly follow this pattern:
```
^\d{5}_[a-z0-9_]+\.sql$
```
- **Sequential 5-digit prefix**: Begins at `00001` and increments by 1 for each new migration (e.g., `00131_add_sample_index.sql`).
- **No collisions or gaps**: Duplicate prefixes or sequence omissions are prohibited.
- **Descriptive snake_case suffix**: Indicates the operational verb and target domain (e.g., `_create_quotations`, `_harden_cms_admin_policies`).

### 2.2 Canonical vs. Compatibility Tables
When creating or querying schema objects, always adhere to the current canonical data model:

| Domain | Canonical Table | Compatibility / Legacy Table (Read/Trigger Only) |
| :--- | :--- | :--- |
| **Catalog Products** | `master_products` | `stationery_items` |
| **School Packs** | `school_packs`, `school_pack_items` | `stationery_packs`, legacy items |
| **Orders & Commerce** | `orders`, `order_items` | `orders.items` (JSONB legacy) |
| **Configuration** | `system_settings` | `app_settings` |

---

## 3. Safe Zero-Downtime DDL Rules

### 3.1 Adding Columns
- **Nullable or with DEFAULT**: When adding a column to an existing table, always provide a `DEFAULT` or keep it nullable:
  ```sql
  -- SAFE:
  ALTER TABLE master_products ADD COLUMN brand_id UUID REFERENCES brands(id) DEFAULT NULL;
  
  -- UNSAFE (Will lock and fail on non-empty tables):
  ALTER TABLE master_products ADD COLUMN brand_id UUID NOT NULL;
  ```

### 3.2 Renaming or Removing Columns (Expand / Contract)
Directly renaming or dropping a column breaks active application containers running previous code. Follow the three-phase cycle:
1. **Phase 1 (Expand)**: Add the new column as nullable or with a default. Add a database trigger or application dual-write to populate both columns.
2. **Phase 2 (Migrate Code)**: Deploy code updating all queries to read from and write to the new column.
3. **Phase 3 (Contract)**: After verifying old columns are no longer accessed, drop redundant triggers, deprecate, and eventually drop the legacy column.

### 3.3 Index Creation
- For high-traffic or large tables (`orders`, `order_items`, `master_products`, `school_packs`), avoid blocking writes during index generation.
- Use conditional creation: `CREATE INDEX IF NOT EXISTS`.

### 3.4 RLS Policy Modifications
- Always perform atomic replacements to prevent transient exposure or access denial:
  ```sql
  DROP POLICY IF EXISTS "admin_manage_master_products" ON master_products;
  CREATE POLICY "admin_manage_master_products"
    ON master_products
    FOR ALL
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());
  ```

### 3.5 SECURITY DEFINER Functions
- Functions created with `SECURITY DEFINER` run with the permissions of the database owner.
- Always explicitly pin the search path to prevent privilege escalation attacks:
  ```sql
  CREATE OR REPLACE FUNCTION get_public_school_directory()
  RETURNS JSONB
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
  AS $$
  BEGIN
    ...
  END;
  $$;
  ```

---

## 4. Automated Verification & Preflight Checks

Before any deployment, the CI pipeline and preflight checks automatically run:
1. **`scripts/verify-migration-governance.cjs`**: Enforces sequential numbering, zero sequence drift, and checks for prohibited unannotated destructive DDL.
2. **`scripts/db-schema-preflight.cjs`**: Validates remote Supabase migration state against local migration history.
3. **`tests/database-migration-governance.test.ts`**: Vitest automated verification ensuring ongoing compliance across all branches.
