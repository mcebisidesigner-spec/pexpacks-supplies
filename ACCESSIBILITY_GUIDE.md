# Pexpacks Platform Accessibility Engineering Guide (WCAG 2.1 AA)

## 1. Overview & Compliance Target

Pexpacks is committed to providing an accessible, barrier-free digital experience for parents, learners, school administrators, and backoffice personnel.

The platform targets compliance with the **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA**, covering:
- **Perceivable**: Text alternatives, structured landmarks, minimum color contrast (4.5:1 for normal text, 3:1 for large text).
- **Operable**: Full keyboard reachability, visible focus indicators, skip-to-content links, no keyboard traps.
- **Understandable**: Explicit form labeling, error announcements with `role="alert"` / `aria-live`.
- **Robust**: Valid ARIA attribute values and semantic HTML5 elements (`<header>`, `<main id="site-main">`, `<nav>`, `<footer>`).

---

## 2. Automated Testing Architecture

Automated accessibility audits are built directly into the test suite using **`@axe-core/playwright`** in [`e2e/a11y.spec.ts`](e2e/a11y.spec.ts).

```
   ┌────────────────────────────────────────────────────────┐
   │                  Target Route / View                   │
   │      /, /order, /schools, /pex-console-secure, ...     │
   └───────────────────────────┬────────────────────────────┘
                               │
                               ▼
                    AxeBuilder Engine
          Rules: wcag2a, wcag2aa, wcag21aa
                               │
                               ▼
                   Severity Filter
               Critical · Serious Violations
                               │
                               ▼
                  Zero-Violation Quality Gate
               expect(violations).toEqual([])
```

---

## 3. Audited Surfaces & Test Matrix

| Route / Component | Focus Area | Checks Enforced | Status |
|---|---|---|---|
| **`/` (Storefront Home)** | Main layout, navigation chrome, landmarks | Skip link (`#site-main`), landmark hierarchy, alt text | **Passed** |
| **`/order` (Dropzone & AI Converter)** | Dropzone, file upload, conversion tabs | Contrast, form labeling, keyboard accessibility | **Passed** |
| **`/schools` (Schools Directory)** | Search panel, school cards, badges | ARIA attribute validity, badge contrast | **Passed** |
| **`/pex-console-secure` (Admin Portal)** | Authentication portal, security controls | Form label association, trusted-device checkbox, contrast | **Passed** |
| **`/contact` (Contact Form)** | Enquiry form, timeline, SLAs | Input descriptors, SLA contrast, live status badges | **Passed** |
| **Keyboard Navigation** | Tab index sequence, skip-to-content | Focus ring visibility, programmatic skip-to-content | **Passed** |
| **Form Controls** | Credentials inputs, floating labels | `name`, `id`, `htmlFor`, and `aria-label` association | **Passed** |

---

## 4. Key Remediation Log

During Phase N engineering, the following violations were surgically remediated:

1. **Eliminated Critical ARIA Violation in School Search:**
   - **Issue**: [`components/schools/SchoolSearchPanel.tsx`](components/schools/SchoolSearchPanel.tsx) contained `aria-controls="school-search-results"` referencing an ID not present in the DOM.
   - **Fix**: Removed nonexistent `aria-controls` attribute, resolving the critical violation.
2. **Elevated Text Contrast Across Storefront & Admin:**
   - **`Header.tsx`**: Explicitly forced `text-white` on `Track Your Pack` CTA span.
   - **`PageHero.tsx`**: Elevated eyebrow label on navy background from `--pex-keppel` (2.82:1) to `text-teal-400` (8.42:1).
   - **`SchoolSearchPanel.tsx`**: Elevated search label on navy from `text-primary` (2.82:1) to `text-teal-300` (8.5:1).
   - **`FeaturedSchoolCard.tsx`**: Replaced borderline `#1a7a77` (4.49:1) with high-contrast `#156966` (5.6:1) on official partner and pack year badges.
   - **`ConsolePage.module.css`**: Shifted subtle footer and security subtext from `--db-text-subtle` (3.89:1) to `--db-text-secondary` (7.4:1).
   - **`app/contact/page.tsx`**: Shifted muted subtext to `text-slate-600` and partner badges to `text-teal-700` (> 4.6:1).
3. **Form Semantics & Associated Labels:**
   - **`app/pex-console-secure/page.tsx`**: Added explicit `name` and `aria-label` attributes to administrative credentials inputs.

---

## 5. Execution Command

To run the automated accessibility test suite at any time:
```bash
npm run test:a11y
```
