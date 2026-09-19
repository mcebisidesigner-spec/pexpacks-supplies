# Phase K — UI Architecture, shadcn/ui & Class Composition Audit

**Document:** `PHASE_K_UI_ARCHITECTURE_AUDIT.md`  
**Date:** September 2026  
**Status:** Precondition Audit Completed  
**Authority:** Principal Full-Stack Architect & Design Systems Lead  
**Scope:** Pexpacks Platform Core UI, Styling Architecture, Primitives, and Runtime Boundaries

---

## 1. Executive Summary

Following the completion of the Tailwind CSS v4 migration, Admin platform modernisation (Phases A–J), and TanStack Table unification, this audit establishes the baseline for **Phase K (Core UI Architecture Hardening)**.

The objective is to solidify Tailwind CSS v4, shadcn/ui, `clsx`, `tailwind-merge`, and `class-variance-authority` (CVA) into a disciplined, measurable, and unified class-composition system, while establishing approved runtime validation and form architectures.

---

## 2. Current Class Composition Architecture

- **Canonical Helper Location:** [`lib/utils.ts`](file:///e:/WORK-FOLDER/WEB-DESIGN-PROJECTS/pexpacks-supplies/lib/utils.ts)
- **Current Implementation:**
  ```typescript
  import { clsx, type ClassValue } from "clsx";
  import { twMerge } from "tailwind-merge";

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```
- **Evaluation:** The canonical `cn()` implementation correctly resolves conflicting Tailwind utilities through `twMerge(clsx(inputs))`. It satisfies the project standard.

---

## 3. Duplicate Class Utilities

- **Global Audit Result:** There is **only one** definition of `function cn()` across the entire repository (in `lib/utils.ts`).
- **Direct Sub-Utility Imports (Bypassing `cn`):**
  - **`tailwind-merge`:** 1 file (`lib/utils.ts`). No scattered external imports.
  - **`clsx`:** **15 files** currently bypass `cn()` and import `clsx` directly:
    1. `app/order/OrderForm.tsx`
    2. `components/policy/LegalDocumentPage.tsx`
    3. `components/shared/ScrollReveal.tsx`
    4. `components/shared/FaqAccordion.tsx`
    5. `app/checkout/happypay/HappyPayCheckoutClient.tsx`
    6. `components/marketing/FAQExperience.tsx`
    7. `components/order/OrderSavedToast.tsx`
    8. `app/checkout/TrayCheckoutClient.tsx`
    9. `components/marketing/HomepageStickyCta.tsx`
    10. `components/marketing/SchoolSearchWidget.tsx`
    11. `app/blog/BlogFilter.tsx`
    12. `app/admin/content/page.tsx`
    13. `components/checkout/PexcoverDrawerCard.tsx`
    14. `components/bnpl/HappyPayBanner.tsx`
    15. `components/admin/ui/Form.tsx`

---

## 4. `clsx`, `tailwind-merge`, and `cn()` Status

| Package / Utility | Version in `package.json` | Status | Role in Pexpacks Architecture |
| :--- | :--- | :--- | :--- |
| **`clsx`** | `^2.1.1` | **Installed & Healthy** | Conditional & array class parsing inside `cn()`. |
| **`tailwind-merge`** | `^3.7.0` | **Installed & Healthy** | Tailwind utility conflict resolution inside `cn()`. |
| **`cn()`** | Local (`@/lib/utils`) | **Authoritative** | Single public class-composition gateway for all components. |
| **Standalone `cn` package** | None | **Not Present** | The project correctly avoids the standalone npm `cn` package. |

---

## 5. Class Variance Authority (CVA) Status

- **Version in `package.json`:** `class-variance-authority ^0.7.1` (installed and active).
- **Current Usage Inventory:**
  1. [`components/ui/Button.tsx`](file:///e:/WORK-FOLDER/WEB-DESIGN-PROJECTS/pexpacks-supplies/components/ui/Button.tsx): `buttonVariants = cva(...)` (primary, secondary, tertiary, navy, white, outline | sm, md, lg).
  2. [`components/ui/card.tsx`](file:///e:/WORK-FOLDER/WEB-DESIGN-PROJECTS/pexpacks-supplies/components/ui/card.tsx): `cardVariants = cva(...)` (default, soft, interactive, outline | default, compact, spacious, none).
  3. [`components/admin/ui/AdminButton.tsx`](file:///e:/WORK-FOLDER/WEB-DESIGN-PROJECTS/pexpacks-supplies/components/admin/ui/AdminButton.tsx): `adminButtonVariants = cva(...)` (primary, secondary, destructive, ghost, outline, subtle | sm, md, lg).
- **Missing CVA on Key Variant-Bearing Components:**
  - `StatusBadge.tsx`: Uses an unmanaged record dictionary (`toneStyles`) rather than typed CVA variants.
  - `AdminCard.tsx`: Uses manual string concatenation for variants.
  - `AdminInfoPanel.tsx`: Uses conditional object checks instead of CVA.
  - `Input.tsx` / `AdminInput.tsx`: Error states and sizes use inline ternary branches instead of CVA.

---

## 6. shadcn/ui Component Inventory & Configuration Status

### 6.1 Configuration (`components.json`)
- **Schema:** `https://ui.shadcn.com/schema.json`
- **Style:** `new-york`
- **Tailwind Version:** v4 (CSS file at `styles/globals.css`, config path unset/blank).
- **Aliases:** Properly mapped (`@/components`, `@/lib/utils`, `@/components/ui`, `@/lib`, `@/hooks`).
- **Base Color:** `slate`
- **CSS Variables:** `true`
- **Icon Library:** `lucide`

### 6.2 Component Inventory (`components/ui/`)
| Component | Classification | CVA | Notes |
| :--- | :--- | :--- | :--- |
| `Button.tsx` | **Used** | Yes | Established variant API with button/anchor polymorph. |
| `card.tsx` | **Used** | Yes | Full card compound primitives (Title, Content, etc.). |
| `Input.tsx` | **Used** | No | Standard forwardRef input with search/icon support. |
| `Textarea.tsx` | **Used** | No | Standard forwardRef textarea. |
| `Select.tsx` | **Customised** | No | Searchable mobile drawer select primitive. |
| `Drawer.tsx` | **Customised** | No | Native dialog/drawer overlay with swipe animation. |
| `Tooltip.tsx` | **Customised** | No | Accessible hover/focus tooltip primitive. |
| `ConfirmModal.tsx` | **Customised** | No | Modal dialog for destructive/critical confirmations. |
| `FloatingInput.tsx` | **Customised** | No | Floating label animated text field. |
| `FloatingTextarea.tsx` | **Customised** | No | Floating label animated multiline field. |
| `PageLoadingSkeleton.tsx`| **Used** | No | Loading skeleton primitive. |
| `SearchHelperPill.tsx` | **Used** | No | Search suggestion pill trigger. |
| `ItemIcon.tsx` | **Used** | No | Domain-specific stationery item icon dispatcher. |
| `Logo.tsx` | **Used** | No | SVG brand mark. |
| `JsonLd.tsx` | **Used** | No | Structured schema markup injector. |
| `Container.tsx` | **Used** | No | Page width constraint wrapper. |
| `icons.tsx` | **Used** | No | Custom SVGs (`PackageIcon`, `TrackPackIcon`, `WalletIcon`). |

---

## 7. Tailwind Token Alignment & Theme Inconsistencies

- **Authoritative Hierarchy:**
  ```text
  styles/tokens.css (Pexpacks Design Tokens)
          ↓
  styles/globals.css (@theme mapping)
          ↓
  shadcn CSS semantic variables (--color-primary, --color-secondary, etc.)
          ↓
  shadcn & domain components
  ```
- **Findings:**
  - `styles/globals.css` lines 19–38 accurately map shadcn semantic variables (`--color-background`, `--color-foreground`, `--color-card`, `--color-primary`, `--color-destructive`, etc.) directly to `--pex-*` semantic variables.
  - **Inconsistency:** 43 legacy `.module.css` files remain across marketing, BNPL, packs, and schools that bypass the `@theme` definitions and consume static values or redundant custom variables.

---

## 8. Duplicate UI Primitives & Systems

1. **Toast System:**
   - `sonner ^2.0.8` is installed in `package.json`.
   - However, `components/order/OrderSavedToast.tsx` uses custom CSS module logic (`OrderSavedToast.module.css`), and `components/admin/ui/DbNotice.tsx` uses a custom banner system.
   - **Recommendation:** Standardise toasts around Sonner without removing `DbNotice` for sticky admin banners.
2. **Buttons:**
   - `components/ui/Button.tsx` (storefront/customer-facing) vs. `components/admin/ui/AdminButton.tsx` (admin backoffice).
   - Both serve distinct domain purposes (admin compact density vs. customer touch-friendly pill buttons), and both now use CVA.
3. **Cards:**
   - `components/ui/card.tsx` (shadcn CVA) vs. `components/admin/ui/AdminCard.tsx` (admin dark card).

---

## 9. Runtime Validation & Zod Candidates

Following `docs/ARCHITECTURE_ASSESSMENT_RHF_ZOD_QUERY.md`:
- **Current Zod Status:** `zod ^4.4.3` is installed and used selectively.
- **Approved Boundaries for Zod Validation (Phase K4):**
  1. `lib/schemas/product.schema.ts`: Product create/update server actions in `/admin/products`.
  2. `lib/schemas/school.schema.ts`: School onboarding & settings forms in `/admin/schools`.
  3. `lib/schemas/supplier.schema.ts`: Supplier creation & cost parsing in `/admin/suppliers`.
  4. `lib/schemas/quotation.schema.ts`: Official letter & quotation generation payloads.
  5. `lib/schemas/cart.schema.ts`: AI draft cart and checkout session payload validation.

---

## 10. React Hook Form (RHF) Candidates

- **Current Status:** `react-hook-form` is **not installed**. Forms utilize native React 19 `useActionState` and `FormData`.
- **Approved RHF Candidate:**
  - `QuotationBuilderForm.tsx` / `LetterEditor.tsx`: Complex dynamic nested arrays, line-item quantity multipliers, and live calculation.
- **Explicit Directive:** Retain React 19 `useActionState` for standard single-entity CRUD forms (e.g. `AssetUploadForm`, `BlogForm`, `ItemForm`, `SettingsForm`). Do not rewrite simple forms to RHF.

---

## 11. TanStack Query Candidates

- **Current Status:** Not installed (`swr ^2.5.1` is used).
- **Approved Query Candidates:**
  - Evaluated as **unnecessary for current read-heavy RSC workflows**.
  - Server Components + `revalidatePath()` handle data loading with zero client JavaScript footprint.
  - SWR remains sufficient for client-side search indexing and session polling.
  - No broad TanStack Query installation is recommended for Phase K.

---

## 12. Dependency Changes Required

| Package | Action | Justification |
| :--- | :--- | :--- |
| `clsx` | **Retain (`^2.1.1`)** | Core dependency for `cn()`. |
| `tailwind-merge` | **Retain (`^3.7.0`)** | Core dependency for `cn()`. |
| `class-variance-authority` | **Retain (`^0.7.1`)** | Core dependency for typed component variants. |
| `react-hook-form` | **Install conditionally in K4** | Only for approved complex dynamic multi-item forms. |
| `@hookform/resolvers` | **Install conditionally in K4** | Zod resolver bridge for RHF. |
| `@tanstack/react-query` | **Do Not Install** | Not justified by current RSC architecture. |
| Standalone `cn` | **Do Not Install** | Local `lib/utils.ts` is canonical. |

---

## 13. Risk Assessment

| Risk Area | Severity | Mitigation Strategy |
| :--- | :--- | :--- |
| `clsx` consolidation breaking custom classes | **Low** | `cn()` wraps `twMerge(clsx(inputs))` which is a superset of `clsx()`. |
| CVA variant refactoring affecting props | **Low** | Maintain existing variant props (`primary`, `secondary`, `outline`, etc.) with explicit default variants. |
| Zod validation rejecting valid edge-case data | **Medium** | Safe parsing (`safeParse`) with defensive error serialization; test against existing automated suites. |
| CSS module migration drift | **Low** | Run Playwright E2E and visual checks after each module migration. |

---

## 14. Exact Implementation Batches

```text
Batch K1: Class Composition Hardening
  ├── Replace 15 direct "clsx" imports with canonical "cn" from "@/lib/utils"
  └── Add lint guard to prevent future direct clsx/tailwind-merge imports

Batch K2: CVA Expansion & Variant Standardization
  ├── Refactor StatusBadge.tsx to use CVA (emerald, teal, blue, amber, red, slate, purple)
  ├── Refactor AdminCard.tsx and AdminInfoPanel.tsx to CVA
  └── Verify TypeScript safety and variant autocomplete

Batch K3: shadcn/ui Foundation Solidification
  ├── Standardize Badge primitive under components/ui/badge.tsx with CVA
  ├── Audit and align components.json metadata
  └── Document shadcn primitive usage standards

Batch K4: Approved Runtime Validation & Forms
  ├── Create centralized domain schemas in lib/schemas/ (product, supplier, school)
  ├── Integrate Zod safeParse in admin Server Actions
  └── Install react-hook-form and @hookform/resolvers for QuotationBuilderForm only
```

---

**PHASE K AUDIT COMPLETE. No package, component, styling, business-logic or database changes have been implemented. Awaiting approval to begin Phase K1 — Class Composition & shadcn/ui Architecture Hardening.**
