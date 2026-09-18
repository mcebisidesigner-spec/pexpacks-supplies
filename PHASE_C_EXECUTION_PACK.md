# POST_TAILWIND_ADMIN_PLATFORM_AUDIT — PHASE C EXECUTION PACK

> Repo: E:\WORK-FOLDER\WEB-DESIGN-PROJECTS\pexpacks-supplies (Windows shell, PowerShell 5.1)
> Oracle: `npx tsc --noEmit` run IN `${repo}\pexpacks-supplies` (exit code `$LASTEXITCODE` is the ONLY trustworthy gate in this repo).
> Baseline declared green at Phase B2 gate (whole-project tsc = exit 0) — built from isolated reads + isolated writes only.

## 1. Verified ground truth (Phase A/B2 locked)
- TanStack v9 component: `components/admin/shared/TanStackProductsTable.tsx` — **named export** `TanStackProductsTable` (line 41),
  `export default` is NOT used. Import must be `import { TanStackProductsTable } ...` (named).
- Row type comes from `MasterProductRow` (imported at line 23 from `@/lib/admin/operations`).
- `createColumnHelper<any, MasterProductRow>()` at line 39; `accessorKey` strings: `sku` (70), `name` (76, product link cell w/ `getProductSlug`), `brand` (with `row.brand`), … remaining keys up to 40+ columns.
- Live view: `components/admin/views/MasterProductsPageView.tsx` — `TanStackProductsTable` render block: `data={initialData.products} total=… pageSize={params.pageSize} onRowClick={(row)=>router.push(...)} isLoading={isPending} onPageChange={(page)=>setParams({page: page}, true)}` plus category `AdminSelect` toolbar (view-owned, server-driven).
- Generated schema: `lib/supabase/types.ts` — `Database["public"]["Tables"]["master_products"]["Row"]` (snake_case: `sku,name,brand,category,availability,packaging,unit,current_selling_price,selling_price_override,latest_verified_cost,calculated_selling_price,active,requires_pexcover,pricing_status,visibility,peco_code,preferred_supplier_id,search_vector`, …).

## 2. PHASE C — GOAL
Derive the table's row type + column `accessorKey`s from the generated schema so the UI can't drift / SQL `SELECT` renames can't silently break Admin. **Primary: type the row.** (Full re-derivation of every accessorKey onto snake_case is OPTIONAL stretch; keep it small and green.)

## 3. STEP-BY-STEP EXECUTION (do in order; run the oracle after every edit)
1. **Read (isolated, small offset):** confirm current `TanStackProductsTableProps` interface + the `MasterProductRow` shape in `lib/admin/operations` before editing. If reads contradict each other for the same lines, STOP and re-run oracle; the channel lies on multi-call groups.
2. **Edit A — type Row (low risk):** in `lib/supabase/types.ts` (no change) add near component imports:
   `import type { Database } from "@/lib/supabase/types";`
   `type MasterProductsRow = Database["public"]["Tables"]["master_products"]["Row"];`
   Replace `MasterProductRow` usage bindings in the table *only if* its fields already align with generated Row keys; otherwise create a thin compatibility type (`Pick`/`Mapping`) so tsc stays green.
3. **Oracle:** `npx tsc --noEmit` → must be exit 0. If strict errors appear, they are REAL — fix them, don't mask.
4. **Optional Edit B — accessorKey alignment:** for renamed columns (e.g. `current_selling_price` vs any camelCase usage), adjust the accessor + `MasterProductRow` mapping, then re-run oracle.
5. **Write audit addendum** recording: which keys were derived, which stayed as compatibility mappings, exact tsc exit code.

## 4. HARD RULES (learned from B2 channel corruption)
- **Never batch read+edit in one assistant turn** when the target lines must be byte-exact.
- Verify edits with the REAL compiler in the correct working directory — never trust "Wrote file successfully" notifications.
- If an isolated read contradicts the compiler, BELIEVE THE COMPILER.
- Keep every query small; large offset/grep results have flaked in this repo.

## 5. Phase C DONE WHEN
`npx tsc --noEmit` exits 0 AND the table's row type is verifiably sourced from `Database["public"]["Tables"]["master_products"]["Row"]` (not a parallel hand-written interface), with derived/override fields documented.

— Execute Phase C with this pack in a clean session; every step gates on the tsc oracle in the project dir. —
