# Pexpacks Platform Design-System & Tailwind Governance

**Document:** `DESIGN_SYSTEM_GOVERNANCE.md`  
**Date:** September 2026  
**Status:** Governed & Active  
**Authority:** Principal Full-Stack Architect & Design Systems Lead  

---

## 1. Governance Objectives

Tailwind CSS v4 and shadcn/ui serve as the **authoritative styling and primitive architecture** for the Pexpacks platform. This document establishes binding governance standards to:
1. Prevent design-system drift and rogue style reintroduction.
2. Maintain a single canonical class composition and variant system.
3. Classify arbitrary values and establish token migration paths.
4. Provide automated audit tooling for local development and CI release gates.

---

## 2. The Authoritative Styling Hierarchy

Every component and view in the Pexpacks application must adhere to this unified styling hierarchy:

```text
Pexpacks Semantic Tokens (CSS Variables: --pex-*)
       ↓
Tailwind v4 @theme (styles/globals.css)
       ↓
shadcn/ui Semantic Variables (--color-*)
       ↓
shadcn / Pexpacks Primitives (components/ui/*, components/admin/ui/*)
       ↓
CVA Semantic Variants (class-variance-authority)
       ↓
Canonical cn() Utility (lib/utils.ts)
       ↓
Tailwind Utility Output
```

### Composition Rules
1. **Never import `clsx` or `tailwind-merge` directly** in application components or routes. All class composition must pass through `import { cn } from "@/lib/utils"`.
2. **Never create duplicate `cn()` utilities** or alternative merge functions.
3. **Never interpolate dynamic Tailwind classes** (e.g. ``bg-${color}-500``). Always use static lookup maps or CVA variants.
4. **Never fight the cascade with `!important`** (`!bg-red-500`) unless explicitly resolving third-party widget isolation.

---

## 3. Automated Governance Audit Tool

An automated, repeatable design-system governance audit script is installed at [`scripts/design-system-audit.cjs`](file:///e:/WORK-FOLDER/WEB-DESIGN-PROJECTS/pexpacks-supplies/scripts/design-system-audit.cjs) and executable via:

```bash
npm run audit:design
```

### What It Verifies:
- **Class Composition Gate:** Scans all 400+ TSX/TS files for direct `clsx` or `tailwind-merge` imports. Fails immediately if any file bypasses `cn()`.
- **Arbitrary Hex Values:** Scans for `[#...]` arbitrary values and categorises them.
- **Static Inline Styles:** Scans for `style={{` occurrences.
- **Legacy CSS Modules:** Reports remaining `.module.css` imports.

---

## 4. Arbitrary Value Classification & Token Migration

A full repository audit identified 360 arbitrary hex occurrences across 82 unique values. The repeated values are classified below:

| Value | Count | Classification | Recommended Standard / Action |
|---|---|---|---|
| `#1a2a40` | 58 | **Duplicate of Navy Token** | Migrate to `text-[var(--pex-navy)]` or `bg-brand-navy` |
| `#00dfb6` | 41 | **Admin Accent Teal** | Candidate for `--db-accent-teal` in `styles/db-tokens.css` |
| `#219e9a` | 31 | **Duplicate of Keppel Token** | Migrate to `text-[var(--pex-keppel)]` or `text-primary` |
| `#1a7a77` | 31 | **Duplicate of Keppel Dark** | Migrate to `text-[var(--pex-keppel-hover)]` |
| `#ff6f59` | 20 | **Duplicate of Coral Token** | Migrate to `bg-[var(--pex-coral)]` or `bg-accent` |
| `#040812` | 16 | **Admin Surface Background** | Retain as `--db-surface-ground` token in Admin design system |
| `#070d18` | 10 | **Admin Surface Panel** | Retain as `--db-surface-inner` token in Admin design system |
| `#128c7e` / `#25d366` | 12 | **Legitimate Third-Party** | Allowed for official WhatsApp branding in `WhatsAppWidget.tsx` |

### Rule on Arbitrary Values:
- **Legitimate One-Offs:** Permitted for precise SVG geometric clip-paths, third-party brand integration (WhatsApp, Happy Pay, Ozow), or isolated visual illustrations.
- **Repeated Semantic Values:** Prohibited. Any color, shadow, or radius appearing $\ge 3$ times across different files must be extracted into `@theme` in [`styles/globals.css`](file:///e:/WORK-FOLDER/WEB-DESIGN-PROJECTS/pexpacks-supplies/styles/globals.css) or [`styles/db-tokens.css`](file:///e:/WORK-FOLDER/WEB-DESIGN-PROJECTS/pexpacks-supplies/styles/db-tokens.css).

---

## 5. Legacy CSS Module Guard

56 files currently retain `.module.css` imports from earlier development phases.

### Phase-Out Protocol:
1. **No New CSS Modules:** Creating new `*.module.css`, `page.css`, or one-off stylesheet files is strictly prohibited.
2. **Refactor on Touch:** When a legacy component containing a `.module.css` file is touched for UX or feature improvements (e.g. during Phase T), it must be converted to Tailwind utilities and the CSS module deleted.
3. **No Breaking Mass-Deletions:** CSS modules that govern complex animations (e.g. `Marquee.module.css`, `AnimatedVehicle.module.css`) must be ported only with dedicated visual validation.

---

## 6. Static Inline Style Policy

Inline styles (`style={{ ... }}`) are restricted to:
1. **Dynamic Runtime Dimensions:** E.g., user-defined slider positions, dynamic height calculations from JavaScript bounding boxes.
2. **CSS Custom Property Injection:** E.g., passing `--delay`, `--progress`, or dynamic data values to CSS.
3. **Static Layout Styles Prohibited:** Static properties such as `style={{ display: "flex", margin: "10px" }}` are prohibited and must use Tailwind utility classes.

---

## 7. Variant Governance (CVA Standard)

When defining visual variants for reusable primitives:
1. **Semantic Names:** Use semantic keys (`primary`, `secondary`, `outline`, `ghost`, `destructive`, `success`, `warning`). Prohibit arbitrary names like `blue2`, `adminRed`, `buttonNew`.
2. **Default Variants Required:** Every CVA schema must specify `defaultVariants`.
3. **Type Export:** Every variant component must export its derived type using `VariantProps<typeof ...Variants>`.
4. **Pass-Through Composition:** Component root elements must merge the CVA output with incoming `className` via `cn(variants({ variant, size }), className)`.
