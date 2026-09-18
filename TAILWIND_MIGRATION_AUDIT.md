# Pexpacks Supplies — Tailwind CSS v4 Migration Audit Report
**Document:** `TAILWIND_MIGRATION_AUDIT.md`  
**Author:** Principal Frontend Architect & Design Systems Engineer  
**Date:** September 2026  
**Status:** PHASE 0 DISCOVERY COMPLETE — PENDING APPROVAL FOR PHASE 1  
**Target Application:** `pexpacks-supplies`  

---

## 1. Executive Summary

### 1.1 Current Styling Architecture
`pexpacks-supplies` currently relies on a hybrid CSS architecture comprising:
1. **Central Design Tokens (`styles/tokens.css`):** 255 lines defining core CSS custom properties for the master brand palette (Navy `#1a2a40`, Keppel `#1a7a77`, Coral `#ff6f59`), system feedback tones, z-indices, spacing scales, border radii, and form control standards.
2. **Global Document Styles (`styles/globals.css`):** 346 lines containing basic resets, custom scrollbars, root focus indicators, accessibility classes (`.sr-only`, `.skip-link`), layout shell containers, and universal tooltip pseudo-element rules (`[data-tooltip]`).
3. **Legacy Page Styles (`styles/Page.module.css`):** 297 lines providing shared hero wrappers, typography kickers, and section scaffolding imported across 13 distinct customer pages.
4. **Scoped CSS Modules:** 77 component-specific `.module.css` stylesheets in the customer-facing application and 58 stylesheets in the `/admin` application.
5. **Back-Office Admin System (`styles/admin-dark.css` & `styles/db-tokens.css`):** 1,097 lines governing a dedicated dark-themed operations dashboard.
6. **Extensive Inline Styles (`style={{...}}`):** Over 616 individual occurrences across `.tsx` files, combining static layout helpers (e.g., flex gaps, widths) with dynamic runtime variables (e.g., progress bars, countdowns).

### 1.2 Quantitative Audit Metrics
An exhaustive scan of the repository reveals:
* **Total CSS Files:** **141 files**
* **Total CSS Volume:** **43,866 lines** (~868.8 KB unminified CSS)
* **Customer-Facing Application Scope:** **80 files / 23,584 lines** (53.8% of total volume)
* **Admin / Back-Office Application Scope:** **61 files / 20,282 lines** (46.2% of total volume)

### 1.3 Approximate Migration Complexity
* **Customer UI Primitives:** **Low to Moderate**. Highly reusable, well-structured contracts (`Button`, `Input`, `Select`, `Drawer`, `ConfirmModal`).
* **Customer Domain Components:** **Moderate**. Complex stateful features (`GradePackActions`, `GlobalPackTray`, `HeroSearch`, `AiListDropzone`) where styling must be decoupled from business logic and focus-trapping without modifying any event handlers or stores.
* **Customer Checkout & Order Pages:** **Moderate to High**. Multi-step financial and address forms (`app/checkout/Checkout.module.css` is 1,753 lines). Must be migrated with zero changes to calculations, HappyPay/Ozow handoffs, or validations.
* **Admin Operations Suite:** **High Volume / Strict Isolation**. 61 files totaling 20,282 lines. Must be strictly isolated behind the Admin Boundary as a distinct, subsequent phase.

### 1.4 Principal Migration Risks
1. **Desktop-First vs Mobile-First Paradigms:** The legacy stylesheets rely predominantly on desktop-first `@media (max-width: ...)` rules (over 45 instances of `max-width: 1024px`, 38 of `max-width: 768px`, 25 of `max-width: 480px`). Tailwind defaults to mobile-first (`min-width`). Direct, hasty inversion risks responsive regression. We will leverage Tailwind v4's native `max-*` variants (`max-lg:`, `max-md:`, `max-sm:`) during transition where required to guarantee 1:1 visual parity.
2. **Compound Primitive APIs:** Existing primitives like `Input.tsx` bundle labels, helpers, error text with `role="alert"`, and success validation icons. Naive replacement with raw headless shadcn primitives will break form contracts. Primitives will be classified and refactored styling-only.
3. **Satori / OpenGraph Image Generation:** Routes like `app/schools/[schoolSlug]/opengraph-image.tsx` and PDF generators use `@vercel/og` / `@react-pdf/renderer` which do not support external CSS classes. These MUST retain inline styles.
4. **Cascade Dependencies & Global Tooltip Overrides:** Universal attribute selectors (such as `[data-tooltip]` in `styles/globals.css`) must be preserved during early phases until tooltip primitives replace them cleanly.

### 1.5 Recommended Sequencing
1. **Phase 1 — Foundation:** Configure Tailwind CSS v4, establish PostCSS, define the `@theme` token bridge matching `tokens.css`, and install `cn()` / `clsx` / `cva` utilities.
2. **Phase 2 — UI Primitives:** Migrate foundational customer primitives (`Button`, `Input`, `Textarea`, `Card`, `ConfirmModal`, `Tooltip`, `Badge`, `Select`).
3. **Phase 3 — Shared Pexpacks Domain Components:** Migrate shared domain blocks (`ArticlePackCard`, `PackPreviewList`, `SchoolCard`, `GlobalPackTray`, `Header`, `Footer`, `ChatWidget`, `AiListDropzone`).
4. **Phase 4 — Customer Page Composition:** Migrate customer route wrappers (`/schools`, `/order`, `/cart/review`, `/checkout`, `/blog`, policy pages).
5. **Phase 5 — Admin Operations Suite (Post-Approval Boundary):** Controlled migration of `/admin` components and pages, keeping admin dark-mode tokens completely intact.

---

## 2. Current Technology Inventory

| Technology | Detected Version | Notes / Constraints |
| :--- | :--- | :--- |
| **Framework** | Next.js `16.3.0` | App Router architecture, Standalone build output enabled in `next.config.ts`. |
| **Runtime / Library** | React `19.2.5` / React-DOM `19.2.5` | React 19 concurrent features, Actions, Server/Client components. |
| **Language** | TypeScript `5.9.3` | Strict mode enabled, `@/*` mapped to `./*`. |
| **Package Manager** | `npm` (with `package-lock.json`) | **Do not change** to yarn/pnpm/bun. Strict lockfile adherence. |
| **Existing Utilities** | `clsx` `2.1.1`, `lucide-react` `1.31.0`, `zod` `4.4.3`, `swr` `2.5.1`, `zustand` `5.0.14` | Core utilities already present in production bundle. |
| **Bundling & Compiling** | Next.js Webpack & Turbopack options | `next.config.ts` configures bundle analyzer and Sentry wrapper. |
| **Content Security Policy (CSP)** | Configured in `next.config.ts` | Allows `style-src 'self' 'unsafe-inline'` and `font-src 'self' data:`. Complies with Tailwind v4 runtime output. |
| **PostCSS** | Overridden to `8.5.26` in `package.json` | Requires `@tailwindcss/postcss` plugin for Tailwind v4 integration. |
| **Local Fonts** | `PexSans` & `PexSans Alt` | Loaded via `next/font/local` in `app/layout.tsx` exposing `--font-pexpacks-sans` and `--font-pexpacks-sans-alt`. |

---

## 3. Complete CSS Inventory

The codebase contains **141 styling files** structured across 6 architectural tiers:

```
styles/ (898 lines)
   ├── tokens.css (255 lines) — Master design tokens
   ├── globals.css (346 lines) — Global reset, scrollbar, [data-tooltip], site-shell
   └── Page.module.css (297 lines) — Shared page hero, kickers, layout wrappers

components/ui/ (1,595 lines — 14 files)
   ├── Button.module.css (176 lines)
   ├── Input.module.css (204 lines)
   ├── Card.module.css (32 lines)
   ├── Drawer.module.css (127 lines)
   ├── ConfirmModal.module.css (171 lines)
   ├── Tooltip.module.css (127 lines)
   ├── FloatingInput.module.css (135 lines)
   ├── FloatingTextarea.module.css (94 lines)
   ├── SearchHelperPill.module.css (118 lines)
   ├── QuantityStepper.module.css (40 lines)
   ├── Textarea.module.css (53 lines)
   ├── IconButton.module.css (56 lines)
   ├── IconCircle.module.css (34 lines)
   └── Container.module.css (16 lines)

components/layout/ & components/marketing/ & partnership/ (8,167 lines — 23 files)
   ├── Header.module.css (578 lines)
   ├── Footer.module.css (482 lines)
   ├── AnnouncementBar.module.css (30 lines)
   ├── HeaderAccountControls.module.css (213 lines)
   ├── HeroSearch.module.css (805 lines)
   ├── MarketingSections.module.css (563 lines)
   ├── FAQExperience.module.css (373 lines)
   ├── MarketingHome.module.css (331 lines)
   ├── RetailVsPexpacksSlider.module.css (299 lines)
   ├── RetailComparisonSlider.module.css (231 lines)
   ├── HeroBase.module.css (233 lines)
   ├── MarketingForms.module.css (200 lines)
   ├── ConciergeSection.module.css (168 lines)
   ├── MarketingCards.module.css (161 lines)
   ├── SchoolSearchWidget.module.css (156 lines)
   ├── SuperpowerSection.module.css (135 lines)
   ├── SchoolsTrustSection.module.css (75 lines)
   ├── AnimatedVehicle.module.css (67 lines)
   ├── HomepageStickyCta.module.css (63 lines)
   ├── CTASection.module.css (52 lines)
   ├── SectionHeader.module.css (28 lines)
   ├── Partnership.module.css (890 lines)
   └── LegalDocumentPage.module.css (365 lines)

components/ (Domain Features) (7,507 lines — 32 files)
   ├── GradePackActions / PackCustomiser.module.css (458 lines)
   ├── GlobalPackTray.module.css (615 lines)
   ├── AiListDropzone.module.css (496 lines)
   ├── BrowseAllSchools.module.css (296 lines)
   ├── ChatWidget.module.css (264 lines)
   ├── WhatsAppWidget.module.css (216 lines)
   ├── FaqAccordion.module.css (211 lines)
   ├── FeaturedSchools.module.css (182 lines)
   ├── DownloadListLink.module.css (147 lines)
   ├── ArticlePackCard.module.css (147 lines)
   ├── OrderSavedToast.module.css (114 lines)
   ├── HeaderOrderIcon.module.css (90 lines)
   ├── CompleteListTable.module.css (89 lines)
   ├── CompleteListModal.module.css (81 lines)
   ├── RecentlyViewedSchools.module.css (68 lines)
   ├── SchoolSearchPanel.module.css (67 lines)
   ├── PackPreviewList.module.css (63 lines)
   ├── ShareButtons.module.css (62 lines)
   ├── SchoolsBreadcrumbs.module.css (39 lines)
   ├── ViewCompleteListButton.module.css (37 lines)
   ├── Marquee.module.css (332 lines)
   ├── RatingStrip.module.css (24 lines)
   ├── ScrollReveal.module.css (23 lines)
   ├── FeaturedSchoolCard.module.css (20 lines)
   ├── GradeSelector.module.css (12 lines)
   ├── HappyPayBanner.module.css (115 lines)
   ├── HappyPaySteps.module.css (120 lines)
   ├── HappyPayLogo.module.css (42 lines)
   ├── PexcoverDrawerCard.module.css (74 lines)
   ├── TrendingNearYou.module.css (95 lines)
   ├── GradePackItemSelector.module.css (180 lines)
   └── CSVStationeryImporter.module.css (320 lines)

app/ (Customer Pages) (5,417 lines — 8 files)
   ├── app/checkout/Checkout.module.css (1,753 lines)
   ├── app/blog/Blog.module.css (882 lines)
   ├── app/order/OrderPage.module.css (461 lines)
   ├── app/happy-pay/HappyPayPage.module.css (407 lines)
   ├── app/cart/review/CartReview.module.css (375 lines)
   ├── app/schools/[schoolSlug]/SchoolDetailPage.module.css (285 lines)
   ├── app/checkout/happypay/HappyPayCheckout.module.css (273 lines)
   └── app/contact/ContactPage.module.css (230 lines)

Admin & Back-Office Suite (20,282 lines — 61 files)
   ├── styles/admin-dark.css (224 lines)
   ├── styles/db-tokens.css (851 lines)
   ├── app/admin/admin.module.css (2,246 lines)
   ├── app/admin/content/content.module.css (941 lines)
   ├── app/pex-console-secure/ConsolePage.module.css (331 lines)
   └── 56 component and route stylesheets in components/admin/ and app/admin/ (15,689 lines)
```

---

## 4. Design Token Inventory

Extracted directly from `styles/tokens.css`, `styles/globals.css`, and active production component styles:

### 4.1 Master Color System

| Token Name | Legacy Value | Semantic Purpose | Target Tailwind v4 Token |
| :--- | :--- | :--- | :--- |
| `--pex-navy` | `#1a2a40` | Deep Navy Brand Foundation, Primary Headings, Inverted Surfaces | `--color-brand-navy: #1a2a40` / `bg-brand-navy`, `text-brand-navy` |
| `--pex-keppel` | `#1a7a77` | Signature Brand Teal, Primary Buttons, Active States, Focus Rings | `--color-brand-teal: #1a7a77` / `bg-brand-teal`, `text-brand-teal` |
| `--pex-keppel-dark` | `#156966` | Hover state for primary buttons and interactive teal elements | `--color-brand-teal-hover: #156966` |
| `--pex-coral` | `#ff6f59` | Vibrant Brand Accent Coral / Orange, CTA highlights, badges | `--color-brand-accent: #ff6f59` / `bg-brand-accent` |
| `--pex-coral-hover` | `#e85e4b` | Hover state for accent buttons | `--color-brand-accent-hover: #e85e4b` |
| `--pex-bg` | `#ffffff` | Pure White Surface, Card Backgrounds, Modal Bodies | `--color-surface: #ffffff` |
| `--pex-body-bg` | `#f8f9fa` | Off-white Document Background | `--color-background: #f8f9fa` |
| `--pex-bg-soft` | `#f4f5f7` | Soft Neutral Grey, Muted sections, pill backgrounds | `--color-surface-soft: #f4f5f7` |
| `--pex-text` | `#172326` | Deep Ink Primary Body Text | `--color-foreground: #172326` |
| `--pex-muted` | `#4d5a5d` | Slate Muted Text, Captions, Secondary metadata | `--color-muted-foreground: #4d5a5d` |
| `--pex-border` | `#e1e7ea` | Light Grey Divider, Card border, input outline | `--color-border: #e1e7ea` |
| `--pex-sme-amber` | `#f5a623` | Warning state, SME Accent, Star Ratings | `--color-warning: #f5a623` |
| `--pex-success` | `#2f855a` | Order Success, In Stock, Confirmed Items | `--color-success: #2f855a` |
| `--pex-error` | `#b91c1c` | Error alert, Form validation failure, Stock Warning | `--color-destructive: #b91c1c` |
| `--color-whatsapp` | `#25D366` | WhatsApp brand integration | `--color-whatsapp: #25D366` |
| `--color-whatsapp-dark` | `#128C7E` | WhatsApp hover state | `--color-whatsapp-dark: #128C7E` |

### 4.2 Typography Scale

| Token Name | Size | Line Height | Weight Scale | Font Family |
| :--- | :--- | :--- | :--- | :--- |
| `display` | `clamp(42px, 6.4vw, 76px)` | `0.98` | Bold / Heavy (800) | `var(--font-pexpacks-sans-alt)` (PexSans Alt) |
| `h1` | `clamp(32px, 5vw, 54px)` | `1.05` | Heavy (800) | `var(--font-pexpacks-sans-alt)` |
| `h2` | `clamp(24px, 3.5vw, 38px)` | `1.12` | Heavy (800) | `var(--font-pexpacks-sans-alt)` |
| `h3` | `clamp(20px, 2.8vw, 28px)` | `1.2` | SemiBold (600) / Heavy (800) | `var(--font-pexpacks-sans-alt)` |
| `text-2xl` | `clamp(1.5rem, 3vw, 2rem)` | `1.25` | 700 / 800 | `var(--font-pexpacks-sans)` |
| `text-xl` | `1.25rem (20px)` | `1.4` | 600 / 700 | `var(--font-pexpacks-sans)` |
| `text-lg` | `1.125rem (18px)` | `1.5` | 500 / 600 | `var(--font-pexpacks-sans)` |
| `text-base` | `1.000rem (16px)` | `1.6` | Regular (400) / Medium (500) | `var(--font-pexpacks-sans)` |
| `text-sm` | `0.875rem (14px)` | `1.5` | Regular (400) / SemiBold (600) | `var(--font-pexpacks-sans)` |
| `text-xs` | `0.750rem (12px)` | `1.4` | Medium (500) / SemiBold (600) | `var(--font-pexpacks-sans)` |
| `text-2xs` | `0.8125rem (13px)` | `1.3` | Medium (500) | `var(--font-pexpacks-sans)` |

### 4.3 Spacing & Layout Matrix

* **Base Micro-steps:**
  * `--space-1`: `4px` (`gap-1`, `p-1`)
  * `--space-2`: `8px` (`gap-2`, `p-2`)
  * `--space-3`: `12px` (`gap-3`, `p-3`)
  * `--space-4`: `16px` (`gap-4`, `p-4`)
  * `--space-5`: `24px` (`gap-6`, `p-6`)
  * `--space-6`: `32px` (`gap-8`, `p-8`)
* **Responsive Gutters (Inline padding for `.container`):**
  * Mobile: `clamp(16px, 4vw, 24px)`
  * Tablet: `clamp(24px, 5vw, 40px)`
  * Desktop: `clamp(40px, 5vw, 64px)`
* **Layout Max Width:** `1280px` (`max-w-7xl` or custom `--layout-max-width`)
* **Header Heights:** Mobile `70px`, Desktop `88px`
* **Section Padding Y:** Mobile `56px`, Tablet `72px`, Desktop `96px`
* **Touch Target Minimum:** `48px` (`min-h-[48px]`)

### 4.4 Radii & Elevations (Shadows)

* **Radii Scale:**
  * `pill`: `999px` (`rounded-full`) — Used on buttons, search pill helpers, badges
  * `card-lg`: `30px` (`rounded-[30px]`) — Used on primary feature cards
  * `card`: `24px` (`rounded-[24px]`) — Standard product, school, pack cards
  * `image`: `20px` (`rounded-[20px]`) — Embedded media, pack hero previews
  * `card-compact` / `field`: `18px` (`rounded-[18px]`) — Form inputs, dropdowns
  * `md`: `16px` (`rounded-2xl`) — Modal inner containers
  * `sm`: `12px` (`rounded-xl`) — Tooltip bubbles, secondary controls
  * `xs`: `8px` (`rounded-lg`) — Small notification badges, table items
* **Shadow Scale:**
  * `card`: `0 12px 32px rgba(26, 42, 64, 0.05)`
  * `card-hover`: `0 20px 48px rgba(26, 42, 64, 0.12)`
  * `pill`: `0 9px 18px rgba(26, 42, 64, 0.22)`
  * `drawer`: `-24px 0 60px rgba(15, 37, 55, 0.22)`
  * `dropdown`: `0 18px 42px rgba(15, 35, 58, 0.14)`

### 4.5 Responsive Breakpoint Matrix

The existing codebase contains explicit media queries across 14 breakpoints. Below is the mapping matrix to ensure zero visual regression:

| Breakpoint | Existing Usage Frequency | Tailwind Equivalent | Strategy |
| :--- | :--- | :--- | :--- |
| **`480px`** | 25 files | Custom token / `max-[480px]:` | Preserve for small phone card stacks and button full-width behavior. |
| **`640px`** | 14 files | `sm` (`640px`) | Standard Tailwind match. |
| **`768px`** | 38 files | `md` (`768px`) | Standard Tailwind match. (Critical breakpoint for mobile nav & grid collapse). |
| **`860px`** | 6 files | `max-[860px]:` | Specific tablet layout switch in marketing grids and split forms. |
| **`1024px`** | 45 files | `lg` (`1024px`) | Primary desktop transition (Header desktop menu, sidebar collapse). |
| **`1100px`** | 10 files | `max-[1100px]:` | Kanban columns and multi-learner checkout tray wrap points. |
| **`1280px`** | 4 files | `xl` (`1280px`) | Container max width lock. |

---

## 5. CSS Duplication Analysis

1. **Card Scaffolding Duplication:**  
   `components/ui/Card.module.css` (32 lines) is imported by `FeaturedSchoolCard.tsx`, `ArticlePackCard.tsx`, `PexcoverDrawerCard.tsx`, and `AdminCard.tsx`. In addition, 14 other stylesheets independently duplicate `.card { background: var(--pex-bg); border-radius: 24px; border: 1px solid ...; box-shadow: ...; }`.  
   *Remediation:* Establish `components/ui/card.tsx` as a standard primitive with CVA variants.
2. **Form Control Envelopes:**  
   `Input.module.css` (204 lines), `FloatingInput.module.css` (135 lines), `FloatingTextarea.module.css` (94 lines), and `MarketingForms.module.css` (200 lines) redefine the same focus rings, floating label transitions, error states, and touch-target paddings.  
   *Remediation:* Consolidate form field primitives under `components/ui/input.tsx`, `components/ui/textarea.tsx`, and `components/ui/form-field.tsx`.
3. **Modal & Drawer Overlays:**  
   `Drawer.module.css`, `ConfirmModal.module.css`, `CompleteListModal.module.css`, `SchoolOverviewModal.module.css`, and `TaskDrawer.module.css` duplicate backdrop blur, dark navy overlay (`rgba(15, 37, 55, 0.52)`), flex positioning, and entrance transitions.  
   *Remediation:* Unify overlay primitives via shadcn `Dialog` / `Sheet` / custom Tailwind wrapper without touching internal focus traps.
4. **Desktop-First Media Query Inversion:**  
   Almost all 77 customer CSS modules write default styling for desktop, then append `@media (max-width: 1024px)` and `@media (max-width: 768px)`. Converting directly to mobile-first will consolidate duplicate desktop override blocks.

---

## 6. Component Inventory & Classification

Components are classified into 4 strategic categories:
* **Category A: Styling-Only Migration** (Pure presentational components, straightforward CSS module to Tailwind translation).
* **Category B: Safe shadcn Replacement Candidate** (Standard headless UI pattern with identical event contracts).
* **Category C: Behaviour-Sensitive (Preserve Implementation, Migrate Styles Only)** (Custom event hooks, focus traps, stores, or analytics wiring that must NOT be rewritten).
* **Category D: High-Risk / Protected Business Flow** (Financial checkout, pricing math, Supabase mutations, AI parsing).

| Component | Path | Classification | Strategy |
| :--- | :--- | :--- | :--- |
| `Button` | `components/ui/Button.tsx` | **Category C** | **Preserve implementation.** Polymorphic (`href` -> `Link`, otherwise `<button>`), `iconCircle`, `loading` spinner. Convert styles using CVA + Tailwind. |
| `Input` | `components/ui/Input.tsx` | **Category C** | **Preserve implementation.** Compound input containing label, helper, error `role="alert"`, and `showValid` SVG. Migrate internal styles to Tailwind. |
| `Select` | `components/ui/Select.tsx` | **Category C** | **Preserve implementation.** Custom keyboard listbox with form reset integration and hidden inputs for POST data. Do not replace with Radix Portal select. |
| `ConfirmModal` | `components/ui/ConfirmModal.tsx` | **Category B** | Can use shadcn `AlertDialog` wrapper or translate existing JSX to Tailwind. |
| `Drawer` | `components/ui/Drawer.tsx` | **Category C** | **Preserve implementation.** Tied to `useDialogFocusTrap`. Migrate styling to Tailwind classes. |
| `Tooltip` | `components/ui/Tooltip.tsx` | **Category A** | Pure presentational popup. Migrate to Tailwind utilities. |
| `Card` | `components/ui/Card.module.css` | **Category B** | Introduce new standard `components/ui/card.tsx` with CVA variants. |
| `Container` | `components/ui/Container.tsx` | **Category A** | Migrate to `max-w-7xl mx-auto px-4 md:px-8 lg:px-12`. |
| `ArticlePackCard` | `components/packs/ArticlePackCard.tsx` | **Category A** | Presentational card. Translate CSS module classes to Tailwind. |
| `GradePackActions` | `components/packs/GradePackActions.tsx` | **Category D** | **PROTECTED BUSINESS FLOW.** 625 lines of pack customization, pricing recalculation, `usePackTrayStore`. Only edit `className`. |
| `GlobalPackTray` | `components/order/GlobalPackTray.tsx` | **Category D** | **PROTECTED BUSINESS FLOW.** Cart drawer, visibility verification, total calculations. Styling migration only. |
| `AiListDropzone` | `components/AiListDropzone.tsx` | **Category D** | **PROTECTED BUSINESS FLOW.** HEIC conversion, OCR submission, animated step simulation. Styling migration only. |
| `TrayCheckoutClient` | `app/checkout/TrayCheckoutClient.tsx` | **Category D** | **PROTECTED BUSINESS FLOW.** 1,252 lines. Ozow handoff, HappyPay redirect, multi-learner address validation. Visual migration only. |
| `ChatWidget` | `components/chat/ChatWidget.tsx` | **Category C** | AI stream handling, message bubbles, persistent avatar. Migrate `ChatWidget.module.css` to Tailwind. |
| `WhatsAppWidget` | `components/shared/WhatsAppWidget.tsx` | **Category A** | Floating badge. Translate `WhatsAppWidget.module.css` to Tailwind. |
| `Header` / `Footer` | `components/layout/Header.tsx`, `Footer.tsx` | **Category C** | Scroll listening, mobile menu toggling. Migrate styling to Tailwind. |

---

## 7. shadcn/ui Candidate Analysis

| Primitive Candidate | Current Implementation | Possible shadcn Component | Behaviour Risk | Migration Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Card** | Headless CSS module `Card.module.css` | `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter` | **None** | **Adopt shadcn Card pattern.** Establish `components/ui/card.tsx` with Pexpacks border radii (`24px`, `30px`) and token-based shadows. |
| **Badge** | `StatusBadge.tsx` & inline badge pills | `Badge` (with CVA variants) | **None** | **Adopt shadcn Badge.** Add Pexpacks semantic variants (`brand`, `navy`, `teal`, `coral`, `success`, `warning`, `destructive`). |
| **Button** | `components/ui/Button.tsx` (91 lines) | `Button` | **HIGH** | **DO NOT REPLACE CODE CONTRACT.** Current component supports `href` polymorphism, `loading` spinner, and `iconDirection`. Retain `Button.tsx` and refactor styling to CVA + Tailwind. |
| **Input / Textarea** | `Input.tsx`, `Textarea.tsx` | `Input`, `Textarea` | **HIGH** | **DO NOT REPLACE CODE CONTRACT.** Existing components are compound form controls with integrated labels, helpers, and accessibility alerts. Retain contracts and style with Tailwind. |
| **Dialog / Modal** | `ConfirmModal.tsx` | `AlertDialog` (Radix) | **Low** | **Safe shadcn replacement or Tailwind restyling.** Current component is lightweight (106 lines). Retain API props for zero regression. |
| **Drawer / Sheet** | `Drawer.tsx`, `GlobalPackTray.tsx` | `Sheet` (Radix) | **MEDIUM-HIGH** | **DO NOT REPLACE CODE CONTRACT.** Existing drawer relies on custom focus trapping and DOM containment verified across mobile devices. Restyle existing markup with Tailwind. |
| **Tooltip** | Pure CSS `[data-tooltip]` + `Tooltip.tsx` | `Tooltip` (Radix) | **Low** | Keep existing CSS attribute tooltip in `globals.css` for backward compatibility while introducing shadcn `Tooltip` for new components. |
| **Sonner (Toast)** | Custom `OrderSavedToast.tsx` | `Sonner` (`sonner`) | **Low** | Install Sonner as recommended. Introduce alongside existing toast before phasing out custom CSS. |

---

## 8. Dynamic Style & Runtime Audit

### 8.1 Finite Database Status Tones
In `lib/admin/status.ts`, over 60 database statuses map to 7 finite tones (`emerald`, `amber`, `red`, `blue`, `teal`, `slate`, `purple`).
* **Existing Pattern:** `styles[selectedTone]` dynamically looks up `.emerald`, `.blue`, etc.
* **Tailwind Translation Standard:** Static dictionary mapping. **Never** construct dynamic class strings like `bg-${tone}-500`.
```typescript
export const STATUS_TONE_STYLES: Record<StatusTone, string> = {
  emerald: "bg-[var(--db-success-subtle)] text-[var(--db-success-text)] border-[var(--db-success-border)]",
  amber: "bg-[var(--db-warning-subtle)] text-[var(--db-warning-text)] border-[var(--db-warning-border)]",
  red: "bg-[var(--db-danger-subtle)] text-[var(--db-danger-text)] border-[var(--db-danger-border)]",
  blue: "bg-[var(--db-info-subtle)] text-[var(--db-info-text)] border-[var(--db-info-border)]",
  teal: "bg-[var(--db-teal-subtle)] text-[var(--db-teal-text)] border-[var(--db-teal-border)]",
  slate: "bg-[var(--db-neutral-subtle)] text-[var(--db-neutral-text)] border-[var(--db-neutral-border)]",
  purple: "bg-[var(--db-purple-subtle)] text-[var(--db-purple-text)] border-[var(--db-purple-border)]",
};
```

### 8.2 School Dynamic Branding (`--school-accent`)
* When arbitrary brand colors arrive from Supabase (e.g., `school.primaryColor`), apply via scoped CSS variable:
```tsx
<div
  style={{ "--school-accent": school.primaryColor } as React.CSSProperties}
  className="bg-[var(--school-accent)] text-white"
/>
```

### 8.3 Satori / OpenGraph Image Generation (Strict Exemption)
* `app/schools/[schoolSlug]/opengraph-image.tsx` and `app/api/admin/letters/[id]/pdf/route.tsx` execute in Vercel OG / Satori environments that evaluate direct React inline style objects (`style={{ display: "flex", ... }}`).
* **Policy:** These files are strictly exempted from Tailwind migration.

---

## 9. Proposed Target Architecture

Tailwind CSS v4 will be deployed using its modern **CSS-first architecture**, eliminating legacy `tailwind.config.js` in favor of `@theme` directives in the global stylesheet.

```
globals.css
    ├── @import "tailwindcss";
    ├── @theme {
    │     /* Pexpacks Design Tokens (Colors, Radii, Shadows, Breakpoints) */
    │   }
    ├── shadcn theme bridge (--background, --foreground, --primary, etc.)
    ├── Global Reset & Scrollbars (preserved)
    └── Global Accessibility Rules (.sr-only, .skip-link, [data-tooltip])
           ↓
    lib/utils.ts (cn helper combining clsx + tailwind-merge)
           ↓
    components/ui/ (Reusable UI Primitives: Button, Card, Input, Badge, Dialog)
           ↓
    components/ (Shared Domain Components: ArticlePackCard, GlobalPackTray, ChatWidget)
           ↓
    app/ (Page Composition: Zero page-specific CSS files)
```

### 9.1 CSS-First `@theme` Token Bridge
```css
@import "tailwindcss";

@theme {
  --color-brand-navy: #1a2a40;
  --color-brand-teal: #1a7a77;
  --color-brand-teal-hover: #156966;
  --color-brand-accent: #ff6f59;
  --color-brand-accent-hover: #e85e4b;
  --color-surface-soft: #f4f5f7;

  --font-heading: var(--font-pexpacks-sans-alt), Arial, sans-serif;
  --font-body: var(--font-pexpacks-sans), Arial, sans-serif;

  --radius-card-lg: 30px;
  --radius-card: 24px;
  --radius-field: 18px;
  --radius-md: 16px;
  --radius-sm: 12px;

  --shadow-card: 0 12px 32px rgba(26, 42, 64, 0.05);
  --shadow-card-hover: 0 20px 48px rgba(26, 42, 64, 0.12);
  --shadow-drawer: -24px 0 60px rgba(15, 37, 55, 0.22);
}
```

---

## 10. Proposed File & Directory Structure

```
pexpacks-supplies/
├── components.json                  # Official shadcn configuration (Tailwind v4 CSS variables mode)
├── lib/
│   └── utils.ts                     # Canonical cn() helper (clsx + tailwind-merge)
├── styles/
│   ├── globals.css                  # Consolidated master stylesheet with Tailwind v4 & @theme
│   ├── tokens.css                   # Coexists during migration, progressively unified into @theme
│   ├── admin-dark.css               # Preserved for /admin boundary
│   └── db-tokens.css                # Preserved for /admin boundary
├── components/
│   ├── ui/                          # Reusable UI Primitives (CVA + Tailwind)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   └── tooltip.tsx
│   ├── layout/                      # Header, Footer, SiteChrome
│   ├── marketing/                   # HeroSearch, TrustSections, Sliders
│   ├── packs/                       # ArticlePackCard, GradePackActions
│   └── order/                       # GlobalPackTray, PackTrayItem
└── app/                             # Routes (Page composition using Tailwind utilities)
```

---

## 11. Route Migration Matrix

### Customer-Facing Routes (Scope for Phases 2–4)

| Route / Page | Existing CSS Files | Key Components | Complexity / Risk | Phase / Batch |
| :--- | :--- | :--- | :--- | :--- |
| **Root Homepage** (`/`) | `HeroSearch.module.css`, `MarketingHome.module.css`, `MarketingSections.module.css`, `FAQExperience.module.css`, `SiteChrome.module.css` | `HeroSearch`, `MarketingHome`, `SchoolsTrustSection`, `FaqAccordion` | Moderate | Phase 4, Batch 1 |
| **Schools Directory** (`/schools`) | `BrowseAllSchools.module.css`, `FeaturedSchools.module.css`, `Page.module.css` | `BrowseAllSchools`, `FeaturedSchoolCard`, `SchoolSearchPanel` | Low-Moderate | Phase 4, Batch 2 |
| **School Detail** (`/schools/[slug]`) | `SchoolDetailPage.module.css`, `GradePackActions.module.css`, `PackPreviewList.module.css` | `GradePackActions`, `GradeSelector`, `SchoolLogoPlaceholder` | **High (Calculations)** | Phase 4, Batch 3 |
| **Order / AI Converter** (`/order`) | `OrderPage.module.css`, `AiListDropzone.module.css` | `AiListDropzone`, `Button` | **High (OCR & Handoff)** | Phase 4, Batch 4 |
| **Cart Review** (`/cart/review`) | `CartReview.module.css`, `GlobalPackTray.module.css` | `PackTrayItem`, `GlobalPackTray` | **High (Quantities & Totals)** | Phase 4, Batch 5 |
| **Checkout Flow** (`/checkout`) | `Checkout.module.css` (1,753 lines) | `TrayCheckoutClient`, `Input`, `Textarea`, `Button` | **CRITICAL (Payments & DB)** | Phase 4, Batch 6 |
| **HappyPay Checkout** (`/checkout/happypay`) | `HappyPayCheckout.module.css` | HappyPay summary client | Moderate | Phase 4, Batch 7 |
| **Blog & Resources** (`/blog`, `/blog/[slug]`) | `Blog.module.css` (882 lines) | Article reader, cards | Low | Phase 4, Batch 8 |
| **Static & Policy Pages** (`/contact`, `/faq`, `/terms`, `/privacy-policy`, etc.) | `ContactPage.module.css`, `LegalDocumentPage.module.css`, `Page.module.css` | `ContactForm`, `LegalDocumentPage` | Low | Phase 4, Batch 9 |

---

## 12. Admin Boundary Separation Scope

As mandated in Section 25 of the specification:
* **Customer Application Scope:** 80 CSS files, 23,584 lines. Customer-facing procurement, checkout, school pack discovery, and marketing.
* **Admin Application Scope:** 61 CSS files, 20,282 lines. Back-office dashboard, RBAC roles, inventory catalog, margin calculations, supplier receiving, and audit logs.
* **Shared Dependencies:** Minimal (`Button.tsx`, `Input.tsx`, `StatusBadge.tsx`). Admin relies predominantly on dedicated `AdminButton.tsx`, `AdminInput.tsx`, `AdminShell.tsx`, and `AdminCard.tsx`.
* **Sequencing Directive:**  
  **The customer-facing application will be migrated completely in Phases 1 through 4.**  
  `/admin` styling will remain completely untouched until customer migration is validated and approved. Under no circumstances will admin product management, pricing, or database operations be modified.

---

## 13. Protected Functional Boundaries

The following files and directories determine **what the application does** and are strictly protected against intentional functional modification during styling migration:

1. **Pricing & Margins:**
   - `lib/pricing/` (all pricing models, pack price calculation, margin formulas)
   - `lib/pricing/pexcover.ts` (Pexcover calculation and thresholds)
   - `app/api/packs/custom-total/route.ts`
2. **Checkout & Payments:**
   - `app/api/checkout/route.ts`
   - `app/api/ozow/checkout/route.ts`, `app/api/ozow/webhook/route.ts`
   - `app/checkout/TrayCheckoutClient.tsx` (validation, payment submission, and redirection logic)
3. **Cart & Pack Tray Store:**
   - `store/usePackTrayStore.ts` (Zustand store, local persistence, learner state)
   - `lib/order/calculateTrayTotal.ts`, `lib/order/createTrayPack.ts`
4. **AI List Converter Engine:**
   - `app/api/ai-convert-list/route.ts`
   - OCR prompt formatting, product matching algorithm, draft cart generation
5. **Supabase Database & Auth:**
   - `lib/supabase/` (client creation, server auth, cookie handling)
   - Database schemas, stored procedures, RPC functions, migrations
6. **Admin Business Logic:**
   - `lib/admin/rbac.ts`, `lib/admin/navigation.ts`, `app/api/admin/**`

---

## 14. Expected Legacy CSS Removal

Upon completion of the phased customer migration:
* **Phase 2 (Primitives):** 14 files / 1,595 lines removed (`Button.module.css`, `Input.module.css`, `Card.module.css`, etc.).
* **Phase 3 (Shared Components):** 32 files / 7,507 lines removed (`GlobalPackTray.module.css`, `PackCustomiser.module.css`, `AiListDropzone.module.css`, etc.).
* **Phase 4 (Pages & Marketing):** 31 files / 13,584 lines removed (`Checkout.module.css`, `Blog.module.css`, `HeroSearch.module.css`, `Page.module.css`, etc.).
* **Total Customer CSS Eliminated:** **77 CSS modules + 1 shared Page stylesheet = 78 files / ~22,686 lines removed.**
* **Retained CSS:** `globals.css` (streamlined to <100 lines for Tailwind import, @theme, font variables, and core accessibility rules).

---

## 15. Technical Risks & Mitigation Strategies

| Risk Factor | Likelihood | Impact | Concrete Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Desktop-First CSS Module Inversion** | High | Medium | Many CSS modules define desktop rules and override mobile with `max-width`. When migrating, test at 320px, 375px, 768px, and 1024px. Use Tailwind v4 `max-*` variants where needed during conversion to prevent layout drift. |
| **Radix Select / Form Reset Incompatibility** | High | High | Existing `Select.tsx` integrates with native form resets and synthetic events. **Do not replace with Radix Select.** Migrate existing markup to Tailwind classes. |
| **Focus Trapping Regressions in Drawers** | Medium | High | `Drawer.tsx` and `GradePackActions.tsx` use `useDialogFocusTrap`. Keep DOM hierarchy and focus refs intact while altering only `className`. |
| **Content Security Policy (CSP) Violations** | Low | High | `next.config.ts` enforces `style-src 'self' 'unsafe-inline'`. Tailwind v4 compiles to static CSS in production build, ensuring strict CSP compliance. |
| **Pre-existing Test Failures** | Low | Low | Run baseline test suites (`npm run lint`, `npm test`, `npm run build`) before touching files. Document any pre-existing issues and ensure zero new errors are introduced. |

---

## 16. Phased Implementation Plan

### Phase 1 — Foundation (Zero Visual Change)
* Install `@tailwindcss/postcss` and `tailwindcss` (v4).
* Configure `postcss.config.mjs`.
* Update `styles/globals.css` with `@import "tailwindcss";` and `@theme` matching `tokens.css`.
* Add `clsx`, `tailwind-merge`, and `class-variance-authority` (CVA).
* Verify `npm run dev`, `npm run build`, and `npm run lint`. Ensure zero visual deviation on existing site.

### Phase 2 — UI Primitives (1 Batch Per Primitive)
* **Batch 2.1:** `components/ui/card.tsx` (Establish shadcn Card primitive; migrate `Card.module.css`).
* **Batch 2.2:** `components/ui/button.tsx` (Refactor `Button.tsx` styling to CVA + Tailwind; retire `Button.module.css`).
* **Batch 2.3:** `components/ui/input.tsx` & `textarea.tsx` (Refactor compound inputs to Tailwind; retire `Input.module.css`).
* **Batch 2.4:** `components/ui/ConfirmModal.tsx` & `Drawer.tsx` (Migrate modal/drawer styling to Tailwind).
* **Batch 2.5:** `SearchHelperPill.tsx`, `QuantityStepper.module.css`, `Tooltip.tsx`.

### Phase 3 — Shared Pexpacks Domain Components
* **Batch 3.1:** Site Chrome (`Header.tsx`, `Footer.tsx`, `AnnouncementBar.tsx`).
* **Batch 3.2:** Pack Discovery (`ArticlePackCard.tsx`, `PackPreviewList.tsx`, `FeaturedSchoolCard.tsx`).
* **Batch 3.3:** AI Chat & Support (`ChatWidget.tsx`, `WhatsAppWidget.tsx`).
* **Batch 3.4:** Interactive Marketing Widgets (`HeroSearch.tsx`, `RetailComparisonSlider.tsx`).
* **Batch 3.5:** Pack Tray Cart Drawer (`GlobalPackTray.tsx`, `PackTrayItem.tsx`, `PackTrayFooter.tsx`).
* **Batch 3.6:** AI List Converter (`AiListDropzone.tsx`).

### Phase 4 — Route Composition (1 Route Per Batch)
* **Batch 4.1:** Homepage (`app/page.tsx`).
* **Batch 4.2:** Schools Directory (`app/schools/page.tsx`).
* **Batch 4.3:** School Detail & Grade Packs (`app/schools/[schoolSlug]/page.tsx`).
* **Batch 4.4:** Order Flow (`app/order/page.tsx`).
* **Batch 4.5:** Cart Review (`app/cart/review/page.tsx`).
* **Batch 4.6:** Checkout Page (`app/checkout/page.tsx`, `TrayCheckoutClient.tsx`).
* **Batch 4.7:** HappyPay Checkout (`app/checkout/happypay/page.tsx`).
* **Batch 4.8:** Blog & Resources (`app/blog/page.tsx`, `app/blog/[slug]/page.tsx`).
* **Batch 4.9:** Policy & Legal Pages (`/contact`, `/faq`, `/terms`, `/privacy-policy`, etc.).
* **Batch 4.10:** Retire `styles/Page.module.css` and prune obsolete CSS rules.

### Phase 5 — Admin Operations Suite (Post-Approval Boundary)
* Controlled subsequent phase for `/admin` under separate approval.

---

AUDIT COMPLETE.

No production migration changes have been implemented.

Awaiting approval to begin Phase 1.
