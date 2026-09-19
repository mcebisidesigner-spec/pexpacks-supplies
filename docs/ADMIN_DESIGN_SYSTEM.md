# Pexpacks Admin Design System

## Overview & Architecture

The **Pexpacks Admin Design System** provides a unified, tokenized, and accessible component layer for all `/admin/*` views. It builds upon Tailwind CSS v4, semantic CSS variables prefixed with `--db-*`, and standardized compound layout patterns.

Every admin page must conform to these primitives to ensure visual harmony, strict responsiveness, keyboard accessibility, and predictable interaction patterns.

---

## 1. Token Architecture

The design system is powered by semantic tokens defined in `app/globals.css` and scoped admin variables:

| Token Category | Variable Name | Role / Usage |
| :--- | :--- | :--- |
| **Surfaces** | `--db-surface` (`#0c1322`) | Primary card and container backgrounds |
| | `--db-surface-inner` (`#090e17`) | Inset wells, inputs, table header backgrounds |
| | `--db-surface-hover` | Interactive row/button hover states |
| **Borders** | `--db-border` (`#1e293b`) | Standard card and separator borders |
| | `--db-border-muted` | Subtle dividers |
| | `--db-border-strong` | Active, focused, or highlighted borders |
| **Typography** | `--db-text-primary` (`#f8fafc`) | Headings, primary labels, main cell text |
| | `--db-text-secondary` (`#94a3b8`) | Secondary descriptions, subtext |
| | `--db-text-muted` (`#64748b`) | Minor hints, timestamps |
| | `--db-text-subtle` (`#475569`) | Placeholder text, shortcut keys |
| **Accents** | `--db-brand` (`#10b981`) | Emerald primary brand action color |
| | `--db-brand-glow` | Focus ring and elevation accents |
| | `--db-danger-subtle` / `--db-danger-text` | Rose destructive accents and alerts |
| | `--db-warning-subtle` / `--db-warning-text` | Amber warnings and status indicators |
| | `--db-info-subtle` / `--db-info-text` | Blue informative callouts |

---

## 2. Layout & Page Envelope Primitives

### `AdminShell`
- **Location:** `components/admin/AdminShell.tsx`
- **Role:** High-level platform shell providing sidebar navigation, top header, authentication state, and main viewport scroll wrapper.

### `AdminPage`
- **Location:** `components/admin/ui/AdminPage.tsx`
- **Usage:** Root container inside each admin route view.
- **Props:**
  - `fullWidth?: boolean`: Defaults to `false` (`max-w-7xl mx-auto`). When `true`, spans full container width for wide TanStack data tables.
  - `className?: string`: Additional styling overrides.

```tsx
import { AdminPage } from "@/components/admin/ui";

export function ProductsPageView() {
  return (
    <AdminPage fullWidth>
      {/* Page content */}
    </AdminPage>
  );
}
```

### `AdminPageHeader`
- **Location:** `components/admin/AdminPageHeader.tsx`
- **Usage:** Standardized title bar with badges, subtitle, breadcrumbs, and primary action slot.

### Split Layouts: `AdminSplitLayout`, `AdminMainColumn`, `AdminSideColumn`
- **Usage:** Master-detail and form editing views (e.g. Quotation Builder, School Pack Editor).
- **Responsive:** Stacks vertically on mobile/tablet, switches to side-by-side on desktop (`lg:grid-cols-[minmax(0,1fr)_340px]`). `AdminSideColumn` supports `sticky` positioning.

---

## 3. Data & Interaction Primitives

### `AdminToolbar`
- **Location:** `components/admin/ui/AdminToolbar.tsx`
- **Usage:** Bar containing search input, filter chips, batch action dropdowns, and create/export actions.
- **Props:** `left?: ReactNode`, `right?: ReactNode`, `children?: ReactNode`.

```tsx
<AdminToolbar
  left={<AdminSearch value={search} onChange={setSearch} placeholder="Search products..." />}
  right={
    <AdminButton variant="primary" icon={<Plus size={16} />} onClick={handleCreate}>
      New Product
    </AdminButton>
  }
/>
```

### `AdminSearch`
- **Location:** `components/admin/ui/AdminSearch.tsx`
- **Features:**
  - Debounced input with clear button (`X`).
  - Keyboard shortcut: pressing `/` outside inputs automatically focuses the search bar.
  - Built-in loading spinner (`isLoading?: boolean`).
  - Full ARIA labelling and screen-reader accessibility.

### `AdminFilterBar` & `AdminFilterChip`
- **Location:** `components/admin/ui/AdminFilterBar.tsx`
- **Usage:** Horizontal wrapping chip bar displaying active query filters with quick removal and "Clear all" action.

### `AdminEmptyState`
- **Location:** `components/admin/ui/AdminEmptyState.tsx`
- **Usage:** Reusable empty state for empty tables, search with no matches, or unconfigured entities.
- **Props:** `icon`, `title`, `description`, `action`, `secondaryAction`, `dashed?: boolean`.

```tsx
<AdminEmptyState
  icon={<PackageSearch size={28} />}
  title="No products found"
  description="Try adjusting your search criteria or create a new master product."
  action={
    <AdminButton variant="primary" size="sm" onClick={handleReset}>
      Reset Filters
    </AdminButton>
  }
/>
```

### `AdminLoadingState` & `AdminTableSkeleton`
- **Location:** `components/admin/ui/AdminLoadingState.tsx`
- **Usage:**
  - `AdminLoadingState`: Centered spinner with descriptive text for async panel queries.
  - `AdminTableSkeleton`: Skeleton loader matching TanStack table header and row heights with animated pulse waves.
  - `AdminCardSkeleton`: Metric card skeleton placeholder.

### `AdminErrorState`
- **Location:** `components/admin/ui/AdminErrorState.tsx`
- **Usage:** User-friendly error display for failed queries or mutation errors with a "Try Again" action and collapsible error message.

### `AdminConfirmDialog`
- **Location:** `components/admin/ui/AdminConfirmDialog.tsx`
- **Standard (Master Prompt Section 19):**
  - Explicit warning consequence explaining non-reversible data operations.
  - Danger styling with prominent red confirmation button.
  - Optional `confirmPhrase`: for high-impact actions (e.g. deleting an entire school or purging quotation templates), the user must type the exact item name or `"DELETE"` to unlock the confirm button.
  - Automatic focus trapping, Escape dismiss, and loading state during async execution.

```tsx
<AdminConfirmDialog
  isOpen={isDeleteOpen}
  onClose={() => setIsDeleteOpen(false)}
  onConfirm={handleDeleteProduct}
  title="Delete Master Product"
  description="This product will be permanently removed. Any school packs containing this item will retain historical records but won't be able to re-order it."
  confirmLabel="Delete Product"
  confirmPhrase={product.sku}
  isDestructive
/>
```

### `AdminInfoPanel`
- **Location:** `components/admin/ui/AdminInfoPanel.tsx`
- **Usage:** Contextual alert and callout banners with 5 semantic tones: `info`, `warning`, `success`, `danger`, `neutral`.
- **Supports:** Custom icon, action button, and dismissible close button.

---

## 4. UI Primitives Quick Reference

| Component | Path | Description |
| :--- | :--- | :--- |
| `AdminButton` | `components/admin/ui/AdminButton.tsx` | Variants: `primary`, `secondary`, `outline`, `teal`, `danger`, `ghost`, `icon`. Sizes: `sm`, `md`, `lg`. |
| `AdminInput` | `components/admin/ui/AdminInput.tsx` | Standardized dark input with focus ring. |
| `AdminSelect` | `components/admin/ui/AdminSelect.tsx` | Form select dropdown with dark palette. |
| `StatusBadge` | `components/admin/ui/StatusBadge.tsx` | Pill status badges with color-coded dot and semantic tones. |
| `AdminCard` | `components/admin/ui/AdminCard.tsx` | Surface cards and interactive card containers. |
| `MetricCard` | `components/admin/ui/AdminCard.tsx` | Key figure metric cards with icon tone badges. |
| `QuickMetricsGrid` | `components/admin/ui/QuickMetricsGrid.tsx` | Responsive 1-4 column grid for metric cards. |

---

## 5. Governance & Prohibited Patterns

1. **No CSS Modules in new admin views:** All admin styling must use Tailwind classes and semantic design system components.
2. **Never omit destructive action confirmation:** Any deletion, status revocation, or irreversible bulk operation must trigger `AdminConfirmDialog` or `WarningBannerModal`.
3. **No hardcoded raw colors:** Never use arbitrary hardcoded hex codes like `#112233` inline. Always use semantic design system classes or `--db-*` tokens.
4. **Preserve business logic:** Never modify pricing calculations, discount logic, Pexcover formulas, payment webhooks, or database schemas when restyling or refactoring admin components.
