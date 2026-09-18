# Pexpacks Supplies — Legacy CSS Removal Log
**Document:** `LEGACY_CSS_REMOVAL_LOG.md`  
**Purpose:** Evidence-based tracking of every retired CSS declaration, module, and stylesheet.  

---

## Removal Log Table

| Date / Batch | CSS File | Selectors / Blocks Removed | Replacement Token / Utility / Component | Components Verified | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *Phase 1* | *None* | *None (Coexistence Foundation)* | *Tailwind v4 @theme bridge established* | *Full build & baseline* | *Active* |
| Batch 2.1 | `components/ui/Card.module.css` | Entire file (.card, .default, .soft, .interactive, .paddingCompact, .paddingSpacious) | `components/ui/card.tsx` (shadcn Card + CVA variants) | Verified zero active imports in TSX | **Deleted** (39 lines) |
| Batch 2.2 | `components/ui/Button.module.css` | Entire file (206 lines: .button, .primary, .secondary, .tertiary, .navy, .white, .outline, .sm, .md, .lg, .spinner, .iconCircle, media queries) | `components/ui/Button.tsx` (CVA buttonVariants + mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (206 lines) |
| Batch 2.3 | `components/ui/Input.module.css` & `Textarea.module.css` | Entire files (234 lines in Input.module.css, 62 lines in Textarea.module.css: wrappers, labels, helpers, inputs, textareas, select, options, focus rings, error states) | `components/ui/Input.tsx`, `Textarea.tsx`, `Select.tsx` (mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (296 lines) |
| Batch 2.4 | `components/ui/ConfirmModal.module.css` & `Drawer.module.css` | Entire files (195 lines in ConfirmModal.module.css, 146 lines in Drawer.module.css: overlays, modals, drawers, header/footer sticky bars, focus traps, animations) | `components/ui/ConfirmModal.tsx`, `Drawer.tsx` (mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (341 lines) |
| Batch 2.5 | `Container.module.css`, `SearchHelperPill.module.css`, `Tooltip.module.css`, `QuantityStepper.module.css`, `IconButton.module.css`, `IconCircle.module.css`, `FloatingInput.module.css`, `FloatingTextarea.module.css` | Entire files (713 lines across 8 files: containers, pill dismiss animation, tooltip bubbles, floating labels, orphaned controls) | `Container.tsx`, `SearchHelperPill.tsx`, `Tooltip.tsx`, `FloatingInput.tsx`, `FloatingTextarea.tsx` (mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (713 lines) |
| Batch 3.1 | `AnnouncementBar.module.css`, `Header.module.css`, `HeaderAccountControls.module.css`, `HeaderOrderIcon.module.css`, `Footer.module.css` | Entire files (2,243 lines across 5 files: storefront announcement banner, desktop/mobile header navigation and menus, account and backpack popover controls, multi-column footer) | `AnnouncementBar.tsx`, `Header.tsx`, `HeaderScrollWrapper.tsx`, `HeaderActiveLink.tsx`, `HeaderMenu.tsx`, `MobileMenu.tsx`, `HeaderAccountControls.tsx`, `HeaderOrderIcon.tsx`, `Footer.tsx`, `FooterNav.tsx`, `FooterHappyPayLink.tsx` (mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (2,243 lines) |
| Batch 3.2 | `ArticlePackCard.module.css`, `PackPreviewList.module.css`, `FeaturedSchoolCard.module.css`, `FeaturedSchools.module.css` | Entire files (474 lines across 4 files: pack card layout, item preview list with count badge, school card with price anchor and partner pill, popular schools banner grid) | `ArticlePackCard.tsx`, `PackPreviewList.tsx`, `FeaturedSchoolCard.tsx`, `FeaturedSchoolsBanner.tsx` (mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (474 lines) |
| Batch 3.3 | `WhatsAppWidget.module.css`, `ChatWidget.module.css` | Entire files (795 lines across 2 files: floating WhatsApp trigger, chat drawer modal, animated typing bubble, message stream, footer collision observer) | `WhatsAppWidget.tsx`, `ChatWidget.tsx` (mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (795 lines) |
| Batch 3.4 | `SectionHeader.module.css`, `RetailComparisonSlider.module.css`, `HeroSearch.module.css` | Entire files (1,212 lines across 3 files: section typography, interactive comparison slider with vehicle sync, mobile-first school search with fixed overlay) | `SectionHeader.tsx`, `RetailComparisonSlider.tsx`, `HeroSearch.tsx` (mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (1,212 lines) |
| Batch 3.5 | `GlobalPackTray.module.css` | Entire file (707 lines: mobile full-screen / desktop drawer overlay, popIn card animation, learner input, Pexcover drawer card wrapper, sticky order total footer, school choice branch) | `GlobalPackTray.tsx`, `PackTrayItem.tsx`, `PackTrayFooter.tsx` (mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (707 lines) |
| Batch 3.6 | `AiListDropzone.module.css` | Entire file (559 lines: upload/paste tabs, drag-and-drop zone, camera/browse triggers, animated laser scanner, stepper indicators, success modal) | `AiListDropzone.tsx` (mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (559 lines) |
| Batch 4.1 | `SuperpowerSection.module.css` & `ConciergeSection.module.css` | Entire files (156 lines in SuperpowerSection.module.css, 192 lines in ConciergeSection.module.css: 3-column benefit cards, bespoke list concierge panel, root homepage hero, brand marquee, parent proof) | `SuperpowerSection.tsx`, `ConciergeSection.tsx`, `app/page.tsx` (mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (348 lines) |
| Batch 4.2 | `BrowseAllSchools.module.css`, `SchoolsTrustSection.module.css`, `RecentlyViewedSchools.module.css`, `SchoolSearchPanel.module.css` | Entire files (338 lines in BrowseAllSchools, 87 lines in SchoolsTrustSection, 79 lines in RecentlyViewedSchools, 77 lines in SchoolSearchPanel: directory listing, trust cards, recent visits drawer, paginated school finder) | `BrowseAllSchools.tsx`, `SchoolsTrustSection.tsx`, `RecentlyViewedSchools.tsx`, `SchoolSearchPanel.tsx`, `PageHero.tsx`, `SchoolsHowItWorks.tsx`, `app/schools/page.tsx` (mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (581 lines) |
| Batch 4.3 | `SchoolDetailPage.module.css` & `GradeSelector.module.css` | Entire files (334 lines in SchoolDetailPage.module.css, 13 lines in GradeSelector.module.css: school hero summary card, unpartnered card, Pexcover promo banner, 3-column grade cards) | `GradeSelector.tsx`, `app/schools/[schoolSlug]/page.tsx` (mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (347 lines) |
| Batch 4.4 | `app/order/OrderPage.module.css` | Entire file (544 lines: school grade pack selection, pack item list, pack customizer, order review step) | `app/order/page.tsx`, `OrderForm.tsx` (mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (544 lines) |
| Batch 4.5 | `app/cart/review/CartReview.module.css` | Entire file (430 lines: review order table, pack breakdown, delivery selection, pricing sidebar) | `app/cart/review/page.tsx`, `CartReviewClient.tsx` (mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (430 lines) |
| Batch 4.6 | `app/checkout/Checkout.module.css` | Entire file (2,032 lines: full checkout flow, Ozow instant EFT, shipping form, card fields, order summary, order success confirmation) | `app/checkout/page.tsx`, `TrayCheckoutClient.tsx`, `app/checkout/success/page.tsx` (mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (2,032 lines) |
| Batch 4.7 | `app/checkout/happypay/HappyPayCheckout.module.css` | Entire file (320 lines: BNPL instalment schedule, split payment breakdowns, mobile checkout container) | `HappyPayCheckoutClient.tsx`, `app/checkout/happypay/page.tsx` (mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (320 lines) |
| Batch 4.8 | `app/blog/Blog.module.css` | Entire file (1,028 lines: blog index, category filter, search, article card, newsletter subscription, article content styling) | `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `BlogFilter.tsx`, `SubscribeForm.tsx` (mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (1,028 lines) |
| Batch 4.9 | `LegalDocumentPage.module.css`, `ContactPage.module.css`, `HappyPayPage.module.css` | Entire files (1,180 lines across 3 files: 452 lines in LegalDocumentPage, 263 lines in ContactPage, 465 lines in HappyPayPage: all 12 policy routes, floating TOC, contact channels, SLA cards, live support badge, BNPL split schedules, benefit cards, security cards) | `LegalDocumentPage.tsx`, `app/contact/page.tsx`, `app/happy-pay/page.tsx` (mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (1,180 lines) |
| Batch 4.10 | `styles/Page.module.css` | Entire file (297 lines: legacy page hero, not found actions, kicker typography, loading skeleton hero/grid, formStack, packCard/formCard) | `PageLoadingSkeleton.tsx`, `not-found.tsx`, `offline/page.tsx`, `error.tsx`, `TrackOrderForm.tsx` (mobile-first Tailwind v4) | 66 test files passed (304/304 tests) | **Deleted** (297 lines) |
| Batch 5.1 | `components/admin/ui/*.module.css` (14 files: `AdminButton`, `AdminCard`, `AdminInput`, `AdminSelect`, `AdminDropdown`, `AdminDialog`, `AdminPageHeader`, `StatusBadge`, `QuickMetricsGrid`, `StickyFormBar`, `DbTooltip`, `PhysicalEyeToggle`, `WarningBannerModal`, `AdminDesignSystem`) | Entire files (2,277 lines across 14 files: admin button variants & sizes, card/metric cards, inputs & floating controls, searchable select & dropdown, alert/confirm dialogs, page headers, status badges, metrics sparklines, sticky action bar, dynamic tooltip host, animated physical eye switches, admin page containers) | `AdminButton.tsx`, `AdminCard.tsx`, `AdminInput.tsx`, `AdminSelect.tsx`, `AdminDropdown.tsx`, `AdminDialogContext.tsx`, `AdminPageHeader.tsx`, `StatusBadge.tsx`, `QuickMetricsGrid.tsx`, `StickyFormBar.tsx`, `DbTooltip.tsx`, `PhysicalEyeToggle.tsx`, `WarningBannerModal.tsx`, `AdminDesignSystem.tsx` (mobile-first Tailwind v4 + CVA) | 66 test files passed (304/304 tests) | **Deleted** (2,277 lines) |

---

## Phase 2 Milestone: UI Primitives Complete
**Total UI Primitives Legacy CSS Deleted:** 14 files, 1,595 lines of CSS eliminated.
**Directory Status:** `components/ui/` now contains **0 CSS files** and is 100% powered by mobile-first Tailwind v4 + CVA / class utilities.

---

## Phase 3 Milestone: Shared Domain Components Complete
**Total Shared Domain Legacy CSS Deleted:** 16 files, 5,990 lines of CSS eliminated.
- **Batch 3.1 Site Chrome:** 5 files, 2,243 lines (`AnnouncementBar.module.css`, `Header.module.css`, `HeaderAccountControls.module.css`, `HeaderOrderIcon.module.css`, `Footer.module.css`)
- **Batch 3.2 Pack Discovery:** 4 files, 474 lines (`ArticlePackCard.module.css`, `PackPreviewList.module.css`, `FeaturedSchoolCard.module.css`, `FeaturedSchools.module.css`)
- **Batch 3.3 AI Chat & Support:** 2 files, 795 lines (`WhatsAppWidget.module.css`, `ChatWidget.module.css`)
- **Batch 3.4 Interactive Marketing:** 3 files, 1,212 lines (`SectionHeader.module.css`, `RetailComparisonSlider.module.css`, `HeroSearch.module.css`)
- **Batch 3.5 Pack Tray Cart Drawer:** 1 file, 707 lines (`GlobalPackTray.module.css`)
- **Batch 3.6 AI List Converter:** 1 file, 559 lines (`AiListDropzone.module.css`)

---

## Phase 4 Milestone: Customer Route Composition Complete
**Total Customer Routes Legacy CSS Deleted:** 17 files, 7,107 lines of CSS eliminated.
- **Batch 4.1 Root Homepage (`app/page.tsx`):** 2 files, 348 lines deleted (`SuperpowerSection.module.css`, `ConciergeSection.module.css`).
- **Batch 4.2 Schools Directory (`app/schools/page.tsx`):** 4 files, 581 lines deleted (`BrowseAllSchools.module.css`, `SchoolsTrustSection.module.css`, `RecentlyViewedSchools.module.css`, `SchoolSearchPanel.module.css`).
- **Batch 4.3 School Detail (`app/schools/[schoolSlug]/page.tsx`):** 2 files, 347 lines deleted (`SchoolDetailPage.module.css`, `GradeSelector.module.css`).
- **Batch 4.4 Order Flow (`app/order/page.tsx`, `app/order/OrderForm.tsx`):** 1 file, 544 lines deleted (`OrderPage.module.css`).
- **Batch 4.5 Cart Review (`app/cart/review/page.tsx`, `CartReviewClient.tsx`):** 1 file, 430 lines deleted (`CartReview.module.css`).
- **Batch 4.6 Checkout Flow (`app/checkout/page.tsx`, `TrayCheckoutClient.tsx`, `app/checkout/success/page.tsx`):** 1 file, 2,032 lines deleted (`Checkout.module.css`).
- **Batch 4.7 HappyPay Checkout (`app/checkout/happypay/page.tsx`, `HappyPayCheckoutClient.tsx`):** 1 file, 320 lines deleted (`HappyPayCheckout.module.css`).
- **Batch 4.8 Blog & Resources (`app/blog/page.tsx`, `app/blog/[slug]/page.tsx`):** 1 file, 1,028 lines deleted (`Blog.module.css`).
- **Batch 4.9 Static & Legal Pages (`LegalDocumentPage.tsx`, `/contact`, `/happy-pay`, 12 policy routes):** 3 files, 1,180 lines deleted (`LegalDocumentPage.module.css`, `ContactPage.module.css`, `HappyPayPage.module.css`).
- **Batch 4.10 Page Scaffolding Retirement (`styles/Page.module.css`):** 1 file, 297 lines deleted (`styles/Page.module.css`).

---

## Phase 5 Milestone: Admin Operations Suite (In Progress)
- **Batch 5.1 Admin UI Primitives:** 14 files, 2,277 lines deleted (`components/admin/ui/` now contains **0 CSS files**).
- **Batch 5.2 Admin Shell, Navigation & Shared DataTable:** 6 files, 1,590 lines deleted (`AdminShell.module.css`, `DateField.module.css`, `DeviceActivityPrompt.module.css`, `DataTable.module.css`, `DataTablePagination.module.css`, `DataTableToolbar.module.css`).
- **Batch 5.3 Operations Dashboard & Health Views:** 1 file, 662 lines deleted (`DashboardClient.module.css`).
- **Batch 5.4 Orders, Fulfilment & Procurement:** 4 files, 509 lines deleted (`orders.module.css`, `order-badge.module.css`, `RefundButton.module.css`, `ProcurementPageView.module.css`).

**Grand Total CSS Eliminated to date:** 72 files, **19,730 lines of legacy CSS deleted**.

