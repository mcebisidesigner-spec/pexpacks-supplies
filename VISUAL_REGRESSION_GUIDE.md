# Pexpacks Visual Regression Engineering Guide

## 1. Overview & Architecture

Visual regression testing in Pexpacks prevents unintended UI regressions, CSS conflicts, token drift, and visual breaks across both customer-facing storefront pages and administrative backoffice interfaces.

The architecture relies on **Playwright Visual Comparisons** (`toHaveScreenshot`) with pixel-level diffing against deterministic baselines.

```
   ┌────────────────────────────────────────────────────────┐
   │             Pexpacks Design System Primitives          │
   │  Button · Badge · StatusBadge · AdminCard · Input ...  │
   └───────────────────────────┬────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
  Deterministic Preview Harness       Critical Application Views
  (/design-system-preview)            (/, /order, /schools, ...)
               │                               │
               ▼                               ▼
   Isolated Primitives Suite            Targeted View Suite
  (primitives.visual.spec.ts)         (views.visual.spec.ts)
               │                               │
               └───────────────┬───────────────┘
                               ▼
            Multi-Viewport Matrix Engine
         Desktop (1280px) · Tablet (768px) · Mobile (390px)
                               │
                               ▼
        Anti-Flakiness & Determinism Rules
        - Animations disabled
        - Volatile widgets masked (Chatbot, toasts, timestamps)
        - 5% sub-pixel rendering tolerance
                               │
                               ▼
                    Snapshot Baselines
              (e2e/visual/*-snapshots/)
```

---

## 2. Test Suites & Coverage

### A. Design System Primitives (`e2e/visual/primitives.visual.spec.ts`)
Executes against the dedicated, zero-database preview route:
`app/design-system-preview/page.tsx` (`/design-system-preview`).

| Primitives Group | Elements Covered | Viewports |
|---|---|---|
| **Buttons & Actions** | Storefront `Button` (primary, secondary, navy, white, outline, tertiary, disabled; sm, md, lg) + `AdminButton` (primary, secondary, outline, teal, danger, ghost, disabled) | Desktop (1280px), Tablet (768px), Mobile (390px) |
| **Badges & Statuses** | Canonical `Badge` (default, secondary, destructive, outline, accent, muted) + CVA `StatusBadge` (active, draft, archived, published, in/out/low stock) + `OrderStatusBadge` (draft, submitted, processing, packed, delivered, cancelled) | Desktop (1280px), Tablet (768px), Mobile (390px) |
| **Cards & Panels** | `AdminCard` (default, surface, interactive) + `AdminInfoPanel` (info, warning, success, danger) + `DbNotice` (success, warning, error) | Desktop (1280px), Tablet (768px), Mobile (390px) |
| **Forms & Controls** | `Input` (default, placeholder, filled, valid indicator, error message, disabled) + `Textarea` + `Select` (options dropdown) | Desktop (1280px), Tablet (768px), Mobile (390px) |
| **Loading Skeletons** | Canonical `Skeleton` (avatar circles, text bars, card rectangles) | Desktop (1280px), Tablet (768px), Mobile (390px) |

### B. Critical Route Views (`e2e/visual/views.visual.spec.ts`)
Executes against active storefront and security boundary pages:

| Route | Target / Landmark | Viewports | Volatile Content Masking |
|---|---|---|---|
| `/pex-console-secure` | Admin Login Portal (`#site-main`) | Desktop, Mobile | Dynamic tokens, cursor markers |
| `/order` | AI List Converter Dropzone (`#site-main`) | Desktop, Mobile | Assistant launcher, upload states |
| `/schools` | Schools Directory (`#site-main`) | Desktop, Mobile | Assistant launcher, live search stats |
| `/` | Storefront Homepage Above-The-Fold Hero | Desktop, Mobile | Floating assistant launcher |

---

## 3. Anti-Flakiness & Determinism Governance

To eliminate flaky test failures across local machines and CI runners, the following configurations are enforced in [`playwright.config.ts`](playwright.config.ts):

1. **Disabled CSS Animations:**
   ```ts
   expect: {
     toHaveScreenshot: {
       maxDiffPixelRatio: 0.05,
       animations: "disabled",
     },
   }
   ```
2. **Volatile Content Masking:**
   Dynamic elements such as the floating AI Chatbot (`[aria-label="Open Ask Pex Assistant"]`) or live timestamps are explicitly masked in screenshots via `mask: [locator]`.
3. **Controlled Worker Concurrency:**
   Local execution is capped at `workers: 2` to prevent CPU and port contention against Next.js on-demand compilation.
4. **Service Worker Neutralization:**
   All visual tests run `await blockServiceWorker(page)` in `beforeEach` to prevent localhost service worker registration/navigation loops.

---

## 4. Workflows & Commands

### Running Visual Regression Tests
To run visual comparisons against existing baselines:
```bash
npm run test:visual
```

### Updating / Generating Baselines
When design tokens, components, or layouts are **intentionally modified and approved**:
```bash
npm run test:visual:update
```
> [!IMPORTANT]
> Never run `npm run test:visual:update` to bypass a test failure. Always inspect the generated diff in the `test-results/` directory first to verify that the visual change matches intended product requirements.

### Inspecting Visual Diffs
If a test fails due to pixel divergence exceeding `maxDiffPixelRatio`:
1. Open the failure artifacts in `test-results/<test-name>/`.
2. Inspect:
   - `test-failed-1.png`: The actual screenshot captured during test execution.
   - `<snapshot-name>-diff.png`: The visual diff highlighting mismatched pixels in magenta.
   - `<snapshot-name>-expected.png`: The baseline reference image.

---

## 5. Verification Checklist

Before opening a pull request touching UI, styles, or Tailwind tokens:
- [ ] `npm run audit:design` passes with 0 token drift errors.
- [ ] `npm run test:visual` passes 23/23 tests with 0 visual regressions.
- [ ] `npx tsc --noEmit` passes with 0 errors.
- [ ] `npm run test` (Vitest test suite) passes 100%.
