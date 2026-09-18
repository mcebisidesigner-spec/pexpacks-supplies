# Pexpacks Product & UX Refinement Guide

This document captures the design system refinements, responsive ergonomics, accessibility guarantees, and micro-interaction patterns hardened across the Pexpacks application.

---

## 1. Ergonomics & Touch Targets

Across mobile and tablet viewports, interactive elements are engineered to meet ergonomic touch-target standards:
- **Buttons (`components/ui/Button.tsx`)**:
  - Enforce `min-h-[48px]` on mobile devices for all button sizes (`sm`, `md`, `lg`), exceeding the 44px WCAG minimum.
  - Desktop sizes adapt to standard spatial density (`sm:min-h-[34px]`, `sm:min-h-[44px]`, `sm:min-h-[56px]`).
- **Inputs & Selects (`components/ui/Input.tsx`)**:
  - Enforce `min-h-[50px] sm:min-h-[54px]` with generous touch padding and smooth 4px focus rings.
- **Card Hit Areas (`components/schools/FeaturedSchoolCard.tsx`)**:
  - Entire card acts as a semantic anchor link (`<Link>`) with tactile `hover:-translate-y-1` and elevated drop shadows.

---

## 2. Micro-Interactions & Motion Design

1. **Button States**:
   - `hover:brightness-110 hover:-translate-y-0.5` with subtle elevation shadow expansion.
   - `active:scale-[0.99] active:translate-y-0 active:brightness-100` for tactile press feedback.
   - Reduced motion queries (`motion-reduce:hover:translate-y-0`, `motion-reduce:animate-none`) respect user accessibility preferences.
2. **Loading States**:
   - `loading` prop on `<Button>` automatically renders an accessible animated spinner (`border-t-transparent animate-spin`) with `aria-busy="true"`.
   - Loading skeletons (`[data-testid="visual-skeletons"]`) provide shimmer animations during async data fetches without layout shifts (CLS = 0).
3. **Form Error Feedback**:
   - Real-time field validation with `role="alert"`, `aria-invalid="true"`, and `aria-describedby` error messaging.

---

## 3. Design System Token Consistency

All components consume the canonical design system tokens defined in `styles/tokens.css`:
- **Pex Navy**: `var(--pex-navy)` (`#1a2a40`)
- **Pex Keppel**: `var(--pex-keppel)` (`#1a7a77` / `#219e9a`)
- **Pex Coral**: `var(--pex-coral)` (`#ff6f59`)
- **Background Soft**: `var(--pex-bg-soft)` (`#f7f9fa`)
- **Card Radius**: `var(--radius-card)` (`24px`)

### Governance Automation
Run token auditing:
```bash
npm run audit:design
```

---

## 4. Multi-Viewport Verification

Visual baselines and accessibility are locked across three canonical device viewports:
- **Mobile**: `390px × 844px` (iPhone 12/13/14)
- **Tablet**: `768px × 1024px` (iPad Portrait)
- **Desktop**: `1280px × 800px` (Modern Laptop/Desktop)

Execute full visual regression testing:
```bash
npm run test:visual
```

Execute automated accessibility audit:
```bash
npm run test:a11y
```
